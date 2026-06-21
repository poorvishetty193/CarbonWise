import { describe, it, expect } from 'vitest';
import { isRateLimited } from '../rate-limit';

describe('rate-limit utility', () => {
  it('allows requests under the limit and blocks the 11th request', () => {
    const key = 'test-client-ip';

    // First 10 requests should be allowed (isRateLimited returns false)
    for (let i = 0; i < 10; i++) {
      expect(isRateLimited(key, 10, 60000)).toBe(false);
    }

    // 11th request should be blocked (isRateLimited returns true)
    expect(isRateLimited(key, 10, 60000)).toBe(true);
  });
});
