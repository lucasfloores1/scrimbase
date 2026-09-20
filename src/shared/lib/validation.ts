/** "Nombre#TAG", como lo muestra el juego. Misma regla que el backend: tag de 3 a 5 caracteres. */
export function isRiotId(value: string) {
  const [name, tag, ...rest] = value.trim().split("#");
  if (rest.length > 0 || !name?.trim() || !tag?.trim()) return false;
  return tag.length >= 3 && tag.length <= 5;
}

/** Mismas reglas que CreateTeamDto: nombre 3–30, tag 3–5. */
export const TEAM_NAME = { min: 3, max: 30 } as const;
export const TEAM_TAG = { min: 3, max: 5 } as const;
