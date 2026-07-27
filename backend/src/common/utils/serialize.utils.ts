/**
 * Helpers for class-transformer @Transform when normalizing API responses.
 * Accepts both mongoose docs (_id) and already-mapped plains (id).
 */

export function toIdString(obj: Record<string, unknown> | null | undefined): string | undefined {
  if (!obj) return undefined;
  const value = obj.id ?? obj._id;
  if (value == null) return undefined;
  return typeof value === "string" ? value : String(value);
}

export function toRefId(value: unknown): string | undefined {
  if (value == null) return undefined;
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const ref = value as Record<string, unknown>;
    if (ref._id != null) return String(ref._id);
    if (ref.id != null) return String(ref.id);
    if (typeof (value as { toString?: () => string }).toString === "function") {
      const asString = (value as { toString: () => string }).toString();
      if (asString && asString !== "[object Object]") return asString;
    }
  }
  return String(value);
}

export function toIsoDate(value: unknown): string | undefined {
  if (value == null) return undefined;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return String(value);
}
