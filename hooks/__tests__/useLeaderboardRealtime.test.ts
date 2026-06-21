vi.mock('../../lib/firebase/client', () => ({ auth: {}, db: {} }));
import { vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLeaderboardRealtime } from '../useLeaderboardRealtime';
import * as Repositories from '../../lib/firebase/repositories';

vi.mock('@/lib/firebase/repositories', () => ({
  subscribeToWeeklyLeaderboard: vi.fn(),
}));

describe('useLeaderboardRealtime', () => {
  let mockSubscribe: vi.Mock;

  beforeEach(() => {
    mockSubscribe = vi.fn().mockReturnValue(vi.fn());
    (Repositories as any).subscribeToWeeklyLeaderboard = mockSubscribe;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('handles happy path', () => {
    const { result } = renderHook(() => useLeaderboardRealtime('2026-W25'));

    act(() => {
      const onData = mockSubscribe.mock.calls[0][1];
      onData([{ uid: '1', displayName: 'A', rank: 1, weeklyKgSaved: 10 }]);
    });

    expect(result.current.entries.length).toBe(1);
    expect(result.current.entries[0].uid).toBe('1');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles loading state', () => {
    const { result } = renderHook(() => useLeaderboardRealtime('2026-W25'));
    expect(result.current.isLoading).toBe(true);
  });

  it('handles error state', () => {
    const { result } = renderHook(() => useLeaderboardRealtime('2026-W25'));

    act(() => {
      const onError = mockSubscribe.mock.calls[0][2];
      onError(new Error('Firebase error'));
    });

    expect(result.current.error).toBe('Could not load leaderboard.');
    expect(result.current.isLoading).toBe(false);
  });

  it('handles unmount cleanup', () => {
    const unsub = vi.fn();
    mockSubscribe.mockReturnValue(unsub);

    const { unmount } = renderHook(() => useLeaderboardRealtime('2026-W25'));
    unmount();

    expect(unsub).toHaveBeenCalled();
  });
});