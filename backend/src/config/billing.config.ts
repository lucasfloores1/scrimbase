import { registerAs } from "@nestjs/config";

function num(value: string | undefined, fallback: number) {
    if (value === undefined || value === "") return fallback;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

export default registerAs("billing", () => ({
    provider: process.env.BILLING_PROVIDER || "mock",
    currency: process.env.BILLING_CURRENCY || "USD",
    freeScrimsPerDay: num(process.env.BILLING_FREE_SCRIMS_PER_DAY, 1),
    checkoutTtlMinutes: num(process.env.BILLING_CHECKOUT_TTL_MINUTES, 30),
    // Buenos Aires por defecto: la cuota diaria se corta a medianoche local, no UTC
    timezoneOffsetMinutes: num(process.env.BILLING_TZ_OFFSET_MINUTES, -180),
    checkoutBaseUrl: process.env.BILLING_CHECKOUT_BASE_URL || "http://localhost:5173/app/billing/checkout",
    prices: {
        MONTHLY: { amount: num(process.env.BILLING_PRICE_MONTHLY, 7), months: 1 },
        SEMIANNUAL: { amount: num(process.env.BILLING_PRICE_SEMIANNUAL, 38), months: 6 },
        ANNUAL: { amount: num(process.env.BILLING_PRICE_ANNUAL, 70), months: 12 },
    },
}));
