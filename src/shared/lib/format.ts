import type { MatchSide, ScrimOutcome, ScrimType } from "@/shared/types/dto";

export function formatDate(iso?: string | null, style: "short" | "medium" = "medium") {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("es-AR", { dateStyle: style }).format(d);
}

export function formatRelative(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const diff = d.getTime() - Date.now();
  const hours = Math.round(diff / 3_600_000);
  const days = Math.round(diff / 86_400_000);
  const rtf = new Intl.RelativeTimeFormat("es-AR", { numeric: "auto" });
  if (Math.abs(hours) < 1) return "recién";
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  if (Math.abs(days) < 30) return rtf.format(days, "day");
  return formatDate(iso, "short");
}

/** El backend manda los winrate en 0–100. */
export function clampPercent(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

export function formatPercent(value: number | null | undefined, digits = 0) {
  return `${clampPercent(value).toFixed(digits)}%`;
}

export function ratio(part: number, total: number) {
  return total > 0 ? (part / total) * 100 : 0;
}

export function formatSigned(n: number) {
  if (!Number.isFinite(n)) return "0";
  return n > 0 ? `+${n}` : String(n);
}

export function outcomeLabel(outcome: ScrimOutcome) {
  return outcome === "WIN" ? "Victoria" : outcome === "LOSS" ? "Derrota" : "Empate";
}
export function outcomeShort(outcome: ScrimOutcome) {
  return outcome === "WIN" ? "V" : outcome === "LOSS" ? "D" : "E";
}
export function outcomeFromRounds(team: number, enemy: number): ScrimOutcome {
  return team > enemy ? "WIN" : team < enemy ? "LOSS" : "DRAW";
}
export function scrimTypeLabel(type: ScrimType | string) {
  if (type === "SCRIM") return "Scrim";
  if (type === "PREMIER") return "Premier";
  if (type === "TOURNAMENT") return "Torneo";
  return String(type);
}
export function sideLabel(side: MatchSide) {
  return side === "ATTACK" ? "Ataque" : "Defensa";
}

export function errorMessage(err: unknown, fallback = "Ocurrió un error inesperado.") {
  if (!err) return fallback;
  if (typeof err === "object" && err !== null && "response" in err) {
    const data = (err as { response?: { data?: { error?: { message?: string; details?: string[] } | string; message?: string } } })
      .response?.data;
    if (typeof data?.error === "string") return data.error;
    if (data?.error && typeof data.error === "object") {
      if (data.error.details?.length) return data.error.details[0];
      if (data.error.message) return data.error.message;
    }
    if (data?.message) return data.message;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export function initials(value?: string | null) {
  if (!value) return "?";
  const clean = value.split("@")[0].replace(/[^a-zA-Z0-9]/g, " ").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (!parts.length) return value.slice(0, 2).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
