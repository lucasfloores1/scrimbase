/**
 * Catálogo de Valorant. Los valores coinciden EXACTAMENTE con los enums del backend
 * (src/common/enums/valorant-map.enum.ts y valorant-agent.enum.ts): si no coinciden,
 * el backend rechaza el POST con 400.
 *
 * Las imágenes salen de la API pública valorant-api.com (CDN media.valorant-api.com).
 * Si una imagen no carga, el componente MapImage cae en un degradado propio.
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

/** uuid de valorant-api.com por mapa. */
const MAP_UUID: Record<ValorantMap, string> = {
  Ascent: "7eaecc1b-4337-bbf6-6ab9-04b8f06b3319",
  Bind: "2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba",
  Breeze: "2fb9a4fd-47b8-4e7d-a969-74b4046ebd53",
  Fracture: "b529448b-4d60-346e-e89e-00a4c527a405",
  Haven: "2bee0dc9-4ffe-519b-1cbd-7fbe763a6047",
  Icebox: "e2ad5c54-4114-a870-9641-8ea21279579a",
  Lotus: "2fe4ed3a-450a-948b-6d6b-e89a78e680a9",
  Pearl: "fd267378-4d1d-484f-ff52-77821ed10dc2",
  Split: "d960549e-485c-e861-8d71-aa9d1aed12a2",
  Sunset: "92584fbe-486a-b1b2-9faa-39b0f486b498",
  Abyss: "224b0a95-48b9-f703-1bd8-67aca101a61f",
  Corrode: "1c18ab1f-420d-0d8b-71d0-77ad3c439115",
};

const MEDIA = "https://media.valorant-api.com/maps";

/** Foto ancha del mapa (banners, hero). */
export function mapSplash(map: string) {
  const uuid = MAP_UUID[map as ValorantMap];
  return uuid ? `${MEDIA}/${uuid}/splash.png` : null;
}

/** Vista cenital del mapa (minimapa) — ideal para strats y miniaturas. */
export function mapMinimap(map: string) {
  const uuid = MAP_UUID[map as ValorantMap];
  return uuid ? `${MEDIA}/${uuid}/displayicon.png` : null;
}

/** Franja horizontal del selector de mapas del juego. */
export function mapListIcon(map: string) {
  const uuid = MAP_UUID[map as ValorantMap];
  return uuid ? `${MEDIA}/${uuid}/listviewicon.png` : null;
}

// ---------------------------------------------------------------- agentes

export const AGENT_ROLES = ["Duelista", "Iniciador", "Controlador", "Centinela"] as const;
export type AgentRole = (typeof AGENT_ROLES)[number];

/** Mismo orden y grafía que ValorantAgent en el backend (sin UNKNOWN). */
export const VALORANT_AGENTS: ReadonlyArray<{ name: string; role: AgentRole }> = [
  { name: "Astra", role: "Controlador" },
  { name: "Breach", role: "Iniciador" },
  { name: "Brimstone", role: "Controlador" },
  { name: "Chamber", role: "Centinela" },
  { name: "Clove", role: "Controlador" },
  { name: "Cypher", role: "Centinela" },
  { name: "Deadlock", role: "Centinela" },
  { name: "Fade", role: "Iniciador" },
  { name: "Gekko", role: "Iniciador" },
  { name: "Harbor", role: "Controlador" },
  { name: "Iso", role: "Duelista" },
  { name: "Jett", role: "Duelista" },
  { name: "KAY/O", role: "Iniciador" },
  { name: "Killjoy", role: "Centinela" },
  { name: "Miks", role: "Duelista" },
  { name: "Neon", role: "Duelista" },
  { name: "Omen", role: "Controlador" },
  { name: "Phoenix", role: "Duelista" },
  { name: "Raze", role: "Duelista" },
  { name: "Reyna", role: "Duelista" },
  { name: "Sage", role: "Centinela" },
  { name: "Skye", role: "Iniciador" },
  { name: "Sova", role: "Iniciador" },
  { name: "Tejo", role: "Iniciador" },
  { name: "Veto", role: "Iniciador" },
  { name: "Viper", role: "Controlador" },
  { name: "Vyse", role: "Centinela" },
  { name: "Waylay", role: "Duelista" },
  { name: "Yoru", role: "Duelista" },
];

export const AGENT_NAMES = VALORANT_AGENTS.map((a) => a.name);

/** Valor que usa el backend cuando la IA no pudo identificar al agente. */
export const UNKNOWN_AGENT = "UNKNOWN";

const ROLE_BY_AGENT = new Map(VALORANT_AGENTS.map((a) => [a.name, a.role]));
export function agentRole(name: string): AgentRole | null {
  return ROLE_BY_AGENT.get(name) ?? null;
}

/** Agentes agrupados por rol, para los selectores. */
export const AGENTS_BY_ROLE = AGENT_ROLES.map((role) => ({
  role,
  agents: VALORANT_AGENTS.filter((a) => a.role === role).map((a) => a.name),
}));

// ------------------------------------------------------- tipos y lados

export const SCRIM_TYPES = [
  { value: "SCRIM", label: "Scrim" },
  { value: "PREMIER", label: "Premier" },
  { value: "TOURNAMENT", label: "Torneo" },
] as const;

export const SIDES = [
  { value: "ATTACK", label: "Ataque" },
  { value: "DEFENSE", label: "Defensa" },
] as const;

export const OUTCOMES = [
  { value: "WIN", label: "Victoria" },
  { value: "LOSS", label: "Derrota" },
  { value: "DRAW", label: "Empate" },
] as const;
