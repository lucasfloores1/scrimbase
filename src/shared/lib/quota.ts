import type { QuotaDto } from "@/shared/types/dto";

/** "en 6 h", "en 12 min" — cuánto falta para que el cupo vuelva a cero. */
export function timeUntil(iso?: string | null) {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  if (!Number.isFinite(ms)) return null;
  if (ms <= 0) return "en instantes";
  const mins = Math.round(ms / 60_000);
  if (mins < 60) return `en ${mins} min`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `en ${hours} h`;
  const days = Math.round(hours / 24);
  return `en ${days} ${days === 1 ? "día" : "días"}`;
}

export function periodLabel(period: QuotaDto["period"]) {
  return period === "DAY" ? "hoy" : "este mes";
}

/** "1 de 1 scrim hoy" */
export function quotaSummary(quota: QuotaDto) {
  if (quota.limit === null) return "Scrims ilimitadas";
  const unit = quota.limit === 1 ? "scrim" : "scrims";
  return `${quota.used} de ${quota.limit} ${unit} ${periodLabel(quota.period)}`;
}
