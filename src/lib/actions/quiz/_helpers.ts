/**
 * Shared Helpers fuer Quiz Server Actions.
 */

/**
 * Parses a DB JSONB field that may be:
 * - already a parsed object/array (Drizzle auto-parsed JSON)
 * - a JSON string (single-encoded)
 * - a doubly-escaped JSON string (seed format: '"[\"a\",\"b\"]"')
 */
export function parseJsonField(value: unknown): unknown {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return value;
  try {
    const first = JSON.parse(value);
    if (typeof first === "string") {
      return JSON.parse(first);
    }
    return first;
  } catch {
    return value;
  }
}
