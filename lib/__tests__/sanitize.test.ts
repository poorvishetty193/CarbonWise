import { describe, it, expect } from 'vitest';
import { sanitizeObject } from '../sanitize';

describe('sanitizeObject', () => {
  it('returns the same primitive values unchanged', () => {
    const input = { uid: 'abc123', amount: 42, category: 'transport' };
    const result = sanitizeObject(input);
    expect(result.uid).toBe('abc123');
    expect(result.amount).toBe(42);
    expect(result.category).toBe('transport');
  });

  it('strips HTML tags from string values', () => {
    const input = { name: '<script>alert("xss")</script>Hello' };
    const result = sanitizeObject(input);
    expect(result.name).not.toContain('<script>');
    expect(result.name).toContain('Hello');
  });

  it('preserves non-string values (numbers, booleans)', () => {
    const input = { count: 5, active: true };
    const result = sanitizeObject(input);
    expect(result.count).toBe(5);
    expect(result.active).toBe(true);
  });

  it('handles empty strings', () => {
    const input = { label: '' };
    const result = sanitizeObject(input);
    expect(result.label).toBe('');
  });

  it('handles nested-looking string injection', () => {
    const input = { comment: '<img src="x" onerror="evil()">' };
    const result = sanitizeObject(input);
    expect(result.comment).not.toContain('onerror');
  });
});
