vi.mock('../../lib/firebase/client', () => ({ auth: {}, db: {} }));
import { vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCarbonPulse } from '../useCarbonPulse';
import * as Repositories from '../../lib/firebase/repositories';

vi.mock('@/lib/firebase/repositories', () => ({
  subscribeToActivities: vi.fn(),
  subscribeToUserProfile: vi.fn(),
}));

describe('useCarbonPulse', () => {
  let mockSubscribeActivities: vi.Mock;
  let mockSubscribeProfile: vi.Mock;

  beforeEach(() => {
    mockSubscribeActivities = vi.fn().mockReturnValue(vi.fn());
    mockSubscribeProfile = vi.fn().mockReturnValue(vi.fn());
    (Repositories as any).subscribeToActivities = mockSubscribeActivities;
    (Repositories as any).subscribeToUserProfile = mockSubscribeProfile;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('handles happy path', () => {
    const { result } = renderHook(() => useCarbonPulse('uid123'));
    
    act(() => {
      const onActivities = mockSubscribeActivities.mock.calls[0][2];
      onActivities([{ loggedAt: new Date().toISOString(), valueKg: 10 }]);
      
      const onProfile = mockSubscribeProfile.mock.calls[0][1];
      onProfile({ weeklyBudgetKg: 140 });
    });

    expect(result.current.todayKg).toBe(10);
    expect(result.current.weeklyBudget).toBe(140);
    expect(result.current.ratio).toBe(0.5); // 10 / (140/7 = 20)
    expect(result.current.status).toBe('under');
    expect(result.current.isLoading).toBe(false);
  });

  it('handles loading state', () => {
    const { result } = renderHook(() => useCarbonPulse('uid123'));
    expect(result.current.isLoading).toBe(true);
  });

  it('handles error state', () => {
    const { result } = renderHook(() => useCarbonPulse('uid123'));
    
    act(() => {
      const onErrorActivities = mockSubscribeActivities.mock.calls[0][3];
      onErrorActivities(new Error('Activity error'));
      
      const onErrorProfile = mockSubscribeProfile.mock.calls[0][2];
      onErrorProfile(new Error('Profile error'));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.todayKg).toBe(0);
  });

  it('handles unmount cleanup', () => {
    const unsubActivities = vi.fn();
    const unsubProfile = vi.fn();
    mockSubscribeActivities.mockReturnValue(unsubActivities);
    mockSubscribeProfile.mockReturnValue(unsubProfile);

    const { unmount } = renderHook(() => useCarbonPulse('uid123'));
    unmount();

    expect(unsubActivities).toHaveBeenCalled();
    expect(unsubProfile).toHaveBeenCalled();
  });
});