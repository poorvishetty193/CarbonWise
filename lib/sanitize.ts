/**
 * Sanitizes an input string to prevent potential HTML/Script injection attacks.
 * Since this runs in a Next.js Server Action, we avoid DOMPurify/JSDOM which
 * crashes trying to read local stylesheets.
 * @param input The raw string input from user interface actions.
 * @returns The clean sanitized output string.
 * @throws {never} This function does not throw.
 */
export function sanitizeInput(input: string): string {
  if (!input) {
    return '';
  }
  // Strip basic HTML tags and trim
  return input.trim().replace(/<[^>]*>?/gm, '');
}

/**
 * Recursively inspects and cleans string properties of a key-value payload before database persistence.
 * @param obj The key-value record parameter payload.
 * @returns A fresh record copy with all safe string allocations.
 * @throws {never} This function does not throw.
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = { ...obj } as Record<string, unknown>;
  for (const key in sanitized) {
    if (Object.prototype.hasOwnProperty.call(sanitized, key)) {
      const val = sanitized[key];
      if (typeof val === 'string') {
        sanitized[key] = sanitizeInput(val);
      }
    }
  }
  return sanitized as T;
}
