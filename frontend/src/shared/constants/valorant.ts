/**
 * Keep in sync with backend `common/enums/valorant-*.enum.ts`.
 * When Riot adds a map/agent, update both sides.
 */

export const VALORANT_MAPS = [
  "Ascent",
  "Bind",
  "Breeze",
  "Fracture",
  "Haven",
  "Icebox",
  "Lotus",
  "Pearl",
  "Split",
  "Sunset",
  "Abyss",
  "Corrode",
] as const;

export type ValorantMap = (typeof VALORANT_MAPS)[number];

export const VALORANT_AGENTS = [
  "Astra",
  "Breach",
  "Brimstone",
  "Chamber",
  "Clove",
  "Cypher",
  "Deadlock",
  "Fade",
  "Gekko",
  "Harbor",
  "Iso",
  "Jett",
  "KAY/O",
  "Killjoy",
  "Miks",
  "Neon",
  "Omen",
  "Phoenix",
  "Raze",
  "Reyna",
  "Sage",
  "Skye",
  "Sova",
  "Tejo",
  "Veto",
  "Viper",
  "Vyse",
  "Waylay",
  "Yoru",
] as const;

export type ValorantAgent = (typeof VALORANT_AGENTS)[number];

/** Includes OCR/AI fallback */
export type ValorantAgentOrUnknown = ValorantAgent | "UNKNOWN";

export const VALORANT_AGENTS_WITH_UNKNOWN: ValorantAgentOrUnknown[] = [
  ...VALORANT_AGENTS,
  "UNKNOWN",
];
