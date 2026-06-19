import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes an input string to prevent potential HTML/Script injection attacks.
 * @param input The raw string input from user interface actions.
 * @returns The clean sanitized output string.
 */
export function sanitizeInput(input: string): string {
  if (!input) {
    return '';
  }
  return DOMPurify.sanitize(input.trim());
}

/**
 * Recursively inspects and cleans string properties of a key-value payload before database persistence.
 * @param obj The key-value record parameter payload.
 * @returns A fresh record copy with all safe string allocations.
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };
  for (const key in sanitized) {
    if (Object.prototype.hasOwnProperty.call(sanitized, key)) {
      const val = sanitized[key];
      if (typeof val === 'string') {
        sanitized[key] = sanitizeInput(val) as any;
      }
    }
  }
  return sanitized;
}
