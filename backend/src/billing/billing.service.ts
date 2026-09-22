import { BadRequestException, HttpException, HttpStatus, Inject, Injectable, NotFoundException, type LoggerService } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";

import { Scrim } from "src/scrims/schemas/scrim.schema";
import { BillingCycle } from "./enums/billing-cycle.enum";
import { CheckoutStatus } from "./enums/checkout-status.enum";
import { SubscriptionStatus } from "./enums/subscription-status.enum";
import { TeamPlan } from "./enums/team-plan.enum";
import { BillingCheckout } from "./schemas/billing-checkout.schema";
import { TeamSubscription } from "./schemas/team-subscription.schema";

type PriceConfig = { amount: number; months: number };

@Injectable()
export class BillingService {
    constructor(
        @InjectModel(TeamSubscription.name) private readonly subscriptionModel: Model<TeamSubscription>,
        @InjectModel(BillingCheckout.name) private readonly checkoutModel: Model<BillingCheckout>,
        @InjectModel(Scrim.name) private readonly scrimModel: Model<Scrim>,
        private readonly config: ConfigService,
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
    ) {}

    async getSubscription(teamId: string) {
        const teamObjectId = new Types.ObjectId(teamId);

        let sub = await this.subscriptionModel.findOne({ teamId: teamObjectId }).exec();

        if (!sub) {
            sub = await this.subscriptionModel.create({
                teamId: teamObjectId,
                plan: TeamPlan.FREE,
                status: SubscriptionStatus.ACTIVE,
            });
        }

        // El plan pago se cae solo cuando vence el periodo, sin necesidad de un cron
        if (sub.plan === TeamPlan.PRO && sub.currentPeriodEnd && sub.currentPeriodEnd.getTime() <= Date.now()) {
            sub.plan = TeamPlan.FREE;
            sub.status = SubscriptionStatus.EXPIRED;
            sub.cycle = undefined;
            sub.cancelAtPeriodEnd = false;
            await sub.save();

            this.logger.log(`Subscription expired teamId=${teamId}`, "BillingService");
        }

        return sub;
    }

    async getStatus(teamId: string) {
        const sub = await this.getSubscription(teamId);
        const isPro = sub.plan === TeamPlan.PRO;

        const day = this.dayWindow();
        const scrimsToday = await this.countScrims(teamId, day.start, day.end);

        const periodStart = sub.currentPeriodStart ?? this.monthStart();
        const scrimsThisPeriod = await this.countScrims(teamId, periodStart, new Date());

        const dailyLimit = isPro ? null : this.freeScrimsPerDay();
        const remainingToday = dailyLimit === null ? null : Math.max(0, dailyLimit - scrimsToday);

        return {
            plan: sub.plan,
            status: sub.status,
            cycle: sub.cycle ?? null,
            provider: sub.provider ?? null,
            currentPeriodEnd: sub.currentPeriodEnd ?? null,
            cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
            usage: {
                scrimsToday,
                scrimsThisPeriod,
                dailyLimit,
                remainingToday,
                resetsAt: day.end,
            },
            canUploadScrim: remainingToday === null || remainingToday > 0,
            prices: this.listPrices(),
        };
    }

    async assertCanCreateScrim(teamId: string) {
        const sub = await this.getSubscription(teamId);
        if (sub.plan === TeamPlan.PRO) return;

        const dailyLimit = this.freeScrimsPerDay();
        const day = this.dayWindow();
        const scrimsToday = await this.countScrims(teamId, day.start, day.end);

        if (scrimsToday < dailyLimit) return;

        this.logger.warn(`Scrim quota exceeded teamId=${teamId} used=${scrimsToday}/${dailyLimit}`, "BillingService");

        throw new HttpException(
            {
                message: `El plan Free permite ${dailyLimit} scrim por dia. Pasate a PRO para subir sin limite.`,
                error: "SCRIM_QUOTA_EXCEEDED",
                usage: {
                    scrimsToday,
                    dailyLimit,
                    remainingToday: 0,
                    resetsAt: day.end,
                },
            },
            HttpStatus.PAYMENT_REQUIRED,
        );
    }

    async createCheckout(teamId: string, userId: string, cycle: BillingCycle) {
        const price = this.priceFor(cycle);
        const sub = await this.getSubscription(teamId);

        if (sub.plan === TeamPlan.PRO && !sub.cancelAtPeriodEnd) {
            throw new BadRequestException("El equipo ya tiene una suscripcion PRO activa");
        }

        const provider = this.config.get<string>("billing.provider") ?? "mock";
        const ttl = this.config.get<number>("billing.checkoutTtlMinutes") ?? 30;

        const checkout = await this.checkoutModel.create({
            teamId: new Types.ObjectId(teamId),
            userId: new Types.ObjectId(userId),
            cycle,
            amount: price.amount,
            currency: this.currency(),
            provider,
            status: CheckoutStatus.PENDING,
            expiresAt: new Date(Date.now() + ttl * 60 * 1000),
        });

        const checkoutId = checkout._id.toString();
        const baseUrl = this.config.get<string>("billing.checkoutBaseUrl");

        this.logger.log(`Checkout created teamId=${teamId} cycle=${cycle} amount=${price.amount}`, "BillingService");

        return {
            checkoutId,
            provider,
            cycle,
            amount: checkout.amount,
            currency: checkout.currency,
            months: price.months,
            status: checkout.status,
            expiresAt: checkout.expiresAt,
            checkoutUrl: `${baseUrl}/${checkoutId}`,
        };
    }

    async getCheckout(teamId: string, checkoutId: string) {
        const checkout = await this.findCheckout(teamId, checkoutId);

        if (checkout.status === CheckoutStatus.PENDING && checkout.expiresAt.getTime() <= Date.now()) {
            checkout.status = CheckoutStatus.EXPIRED;
            await checkout.save();
        }

        return {
            checkoutId: checkout._id.toString(),
            provider: checkout.provider,
            cycle: checkout.cycle,
            amount: checkout.amount,
            currency: checkout.currency,
            months: this.priceFor(checkout.cycle).months,
            status: checkout.status,
            expiresAt: checkout.expiresAt,
        };
    }

    /**
     * Con un proveedor real esto lo dispara el webhook del pago aprobado.
     * Con el provider mock lo llama el front desde la pantalla de checkout.
     */
    async confirmCheckout(teamId: string, userId: string, checkoutId: string) {
        const checkout = await this.findCheckout(teamId, checkoutId);

        if (checkout.status === CheckoutStatus.PAID) return this.getStatus(teamId);

        if (checkout.status === CheckoutStatus.EXPIRED || checkout.expiresAt.getTime() <= Date.now()) {
            checkout.status = CheckoutStatus.EXPIRED;
            await checkout.save();
            throw new BadRequestException("El checkout expiro");
        }

        const sub = await this.getSubscription(teamId);
        const months = this.priceFor(checkout.cycle).months;
        const now = new Date();

        // Si ya era PRO el periodo nuevo se encola al final del vigente
        const base = sub.plan === TeamPlan.PRO && sub.currentPeriodEnd && sub.currentPeriodEnd > now
            ? sub.currentPeriodEnd
            : now;

        sub.plan = TeamPlan.PRO;
        sub.status = SubscriptionStatus.ACTIVE;
        sub.cycle = checkout.cycle;
        sub.currentPeriodStart = now;
        sub.currentPeriodEnd = this.addMonths(base, months);
        sub.cancelAtPeriodEnd = false;
        sub.provider = checkout.provider;
        sub.externalId = checkout._id.toString();
        sub.activatedBy = new Types.ObjectId(userId);
        await sub.save();

        checkout.status = CheckoutStatus.PAID;
        checkout.paidAt = now;
        await checkout.save();

        this.logger.log(
            `Subscription activated teamId=${teamId} cycle=${checkout.cycle} until=${sub.currentPeriodEnd?.toISOString()}`,
            "BillingService",
        );

        return this.getStatus(teamId);
    }

    async cancel(teamId: string) {
        const sub = await this.getSubscription(teamId);

        if (sub.plan !== TeamPlan.PRO) {
            throw new BadRequestException("El equipo no tiene una suscripcion activa");
        }

        sub.cancelAtPeriodEnd = true;
        sub.status = SubscriptionStatus.CANCELED;
        await sub.save();

        this.logger.log(`Subscription canceled teamId=${teamId}`, "BillingService");

        return this.getStatus(teamId);
    }

    async resume(teamId: string) {
        const sub = await this.getSubscription(teamId);

        if (sub.plan !== TeamPlan.PRO || !sub.cancelAtPeriodEnd) {
            throw new BadRequestException("No hay una cancelacion pendiente para reactivar");
        }

        sub.cancelAtPeriodEnd = false;
        sub.status = SubscriptionStatus.ACTIVE;
        await sub.save();

        return this.getStatus(teamId);
    }

    listPrices() {
        const currency = this.currency();
        const monthly = this.priceFor(BillingCycle.MONTHLY);

        return Object.values(BillingCycle).map((cycle) => {
            const price = this.priceFor(cycle);
            const fullPrice = monthly.amount * price.months;
            const savings = fullPrice > 0 ? Math.round(((fullPrice - price.amount) / fullPrice) * 100) : 0;

            return {
                cycle,
                amount: price.amount,
                months: price.months,
                currency,
                pricePerMonth: Math.round((price.amount / price.months) * 100) / 100,
                savingsPercent: savings > 0 ? savings : 0,
            };
        });
    }

    private async findCheckout(teamId: string, checkoutId: string) {
        if (!Types.ObjectId.isValid(checkoutId)) throw new NotFoundException("Checkout not found");

        const checkout = await this.checkoutModel
            .findOne({ _id: new Types.ObjectId(checkoutId), teamId: new Types.ObjectId(teamId) })
            .exec();

        if (!checkout) throw new NotFoundException("Checkout not found");

        return checkout;
    }

    private priceFor(cycle: BillingCycle): PriceConfig {
        const prices = this.config.get<Record<string, PriceConfig>>("billing.prices");
        const price = prices?.[cycle];

        if (!price) throw new BadRequestException(`Ciclo de facturacion invalido: ${cycle}`);

        return price;
    }

    private currency() {
        return this.config.get<string>("billing.currency") ?? "USD";
    }

    private freeScrimsPerDay() {
        return this.config.get<number>("billing.freeScrimsPerDay") ?? 1;
    }

    private countScrims(teamId: string, from: Date, to: Date) {
        return this.scrimModel
            .countDocuments({
                teamId: new Types.ObjectId(teamId),
                createdAt: { $gte: from, $lt: to },
            })
            .exec();
    }

    private addMonths(date: Date, months: number) {
        const next = new Date(date.getTime());
        next.setMonth(next.getMonth() + months);
        return next;
    }

    /** Ventana del dia local del equipo, para que la cuota corte a medianoche real y no a medianoche UTC */
    private dayWindow(now = new Date()) {
        const offset = this.timezoneOffset();
        const shifted = new Date(now.getTime() + offset * 60 * 1000);

        const startUtc = Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate());
        const start = new Date(startUtc - offset * 60 * 1000);

        return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
    }

    private monthStart(now = new Date()) {
        const offset = this.timezoneOffset();
        const shifted = new Date(now.getTime() + offset * 60 * 1000);

        const startUtc = Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), 1);
        return new Date(startUtc - offset * 60 * 1000);
    }

    private timezoneOffset() {
        const offset = this.config.get<number>("billing.timezoneOffsetMinutes");
        return typeof offset === "number" ? offset : -180;
    }
}
