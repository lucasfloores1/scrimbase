export function normalizeRiotId(input: string) {
  return input.trim().toLocaleLowerCase();
}

export function parseRiotId(input: string) {
    const trimmed = input.trim();
    const parts = trimmed.split('#');
    if (parts.length !== 2) return null;

    const [gameName, tagLine] = parts;
    if (!gameName || !tagLine) return null

    //Tag rules
    if (!gameName?.trim()) return null;
    if (!tagLine?.trim()) return null;
    if(tagLine.length < 3 || tagLine.length > 5 ) return null

    return {
        riotId: trimmed,
        riotIdNormalized : normalizeRiotId(trimmed)
    }
}