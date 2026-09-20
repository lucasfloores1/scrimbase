import type { ScrimDto } from "@/shared/types/dto";

/**
 * Métricas de EQUIPO derivadas del historial de scrims.
 * A propósito no hay nada individual acá: Scrimbase mira al roster como unidad.
 */

export type MapRow = {
  map: string;
  matches: number;
  wins: number;
  losses: number;
  draws: number;
  roundDiff: number;
  winrate: number;
};

export type OpponentRow = {
  name: string;
  matches: number;
  wins: number;
  losses: number;
  draws: number;
  roundDiff: number;
  winrate: number;
};

export function sortByDateDesc(list: ScrimDto[]) {
  return [...list].sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
}

export function mapBreakdown(list: ScrimDto[]): MapRow[] {
  const byMap = new Map<string, MapRow>();
  for (const s of list) {
    const r = byMap.get(s.map) ?? { map: s.map, matches: 0, wins: 0, losses: 0, draws: 0, roundDiff: 0, winrate: 0 };
    r.matches++;
    if (s.outcome === "WIN") r.wins++;
    else if (s.outcome === "LOSS") r.losses++;
    else r.draws++;
    r.roundDiff += s.teamRounds - s.enemyRounds;
    byMap.set(s.map, r);
  }
  return [...byMap.values()]
    .map((r) => ({ ...r, winrate: (r.wins / r.matches) * 100 }))
    .sort((a, b) => b.matches - a.matches || b.winrate - a.winrate);
}

export function opponentBreakdown(list: ScrimDto[]): OpponentRow[] {
  const byOpponent = new Map<string, OpponentRow>();
  for (const s of list) {
    const key = (s.opponentName ?? "").trim() || "Sin rival";
    const r = byOpponent.get(key) ?? { name: key, matches: 0, wins: 0, losses: 0, draws: 0, roundDiff: 0, winrate: 0 };
    r.matches++;
    if (s.outcome === "WIN") r.wins++;
    else if (s.outcome === "LOSS") r.losses++;
    else r.draws++;
    r.roundDiff += s.teamRounds - s.enemyRounds;
    byOpponent.set(key, r);
  }
  return [...byOpponent.values()]
    .map((r) => ({ ...r, winrate: (r.wins / r.matches) * 100 }))
    .sort((a, b) => b.matches - a.matches || a.winrate - b.winrate);
}

/** Racha actual: positiva = victorias seguidas, negativa = derrotas seguidas. */
export function currentStreak(sortedDesc: ScrimDto[]) {
  let n = 0;
  let kind: "WIN" | "LOSS" | null = null;
  for (const s of sortedDesc) {
    if (s.outcome === "DRAW") break;
    if (kind === null) kind = s.outcome;
    if (s.outcome !== kind) break;
    n++;
  }
  return kind === "LOSS" ? -n : n;
}

/** Porcentaje de rondas ganadas sobre el total jugado — cuán apretadas son las partidas. */
export function roundsWonPct(list: ScrimDto[]) {
  let team = 0;
  let all = 0;
  for (const s of list) {
    team += s.teamRounds;
    all += s.teamRounds + s.enemyRounds;
  }
  return all === 0 ? 0 : (team / all) * 100;
}

/** Agentes rivales más frecuentes: qué nos toca enfrentar seguido. */
export function enemyAgentFrequency(list: ScrimDto[], top = 6) {
  const count = new Map<string, number>();
  for (const s of list) {
    for (const a of s.enemyComposition ?? []) {
      if (!a || a === "UNKNOWN") continue;
      count.set(a, (count.get(a) ?? 0) + 1);
    }
  }
  const total = list.length || 1;
  return [...count.entries()]
    .map(([agent, matches]) => ({ agent, matches, pickRate: (matches / total) * 100 }))
    .sort((a, b) => b.matches - a.matches)
    .slice(0, top);
}

/** Diferencia de rondas partida a partida, en orden cronológico. */
export function roundDiffSeries(sortedDesc: ScrimDto[], limit = 15) {
  return [...sortedDesc]
    .reverse()
    .slice(-limit)
    .map((s) => s.teamRounds - s.enemyRounds);
}
