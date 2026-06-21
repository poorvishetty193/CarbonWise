vi.mock('../../lib/firebase/client', () => ({ auth: {}, db: {} }));
import { vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useActivityFormState } from '../useActivityFormState';

// Mock dependencies
vi.mock('@/lib/firebase/repositories', () => ({}));
vi.mock('../../lib/carbon-calculator', () => ({
  calculateEmissions: vi.fn().mockReturnValue(10.5),
}));

describe('useActivityFormState', () => {
  it('handles happy path submission', async () => {
    const mockLogAction = vi.fn().mockResolvedValue({ success: true, emissions: 10.5 });
    const mockOnSuccess = vi.fn();

    const { result } = renderHook(() => useActivityFormState());

    act(() => {
      result.current.handleFieldChange(5, 'ev_car');
    });

    expect(result.current.amount).toBe(5);
    expect(result.current.subcategory).toBe('ev_car');

    const fakeEvent = { preventDefault: vi.fn() } as any;

    await act(async () => {
      await result.current.handleSubmit(fakeEvent, mockLogAction, 'uid123', mockOnSuccess);
    });

    expect(mockLogAction).toHaveBeenCalledWith({
      uid: 'uid123',
      category: 'transport',
      subcategory: 'ev_car',
      amount: 5
    });
    expect(mockOnSuccess).toHaveBeenCalledWith(10.5);
    expect(result.current.amount).toBe(0); // reset
    expect(result.current.error).toBe('');
  });

  it('handles loading state (isSubmitting)', async () => {
    let resolveAction: any;
    const mockLogAction = vi.fn().mockImplementation(() => new Promise(res => { resolveAction = res; }));
    const { result } = renderHook(() => useActivityFormState());

    act(() => {
      result.current.handleFieldChange(5, 'ev_car');
    });

    const fakeEvent = { preventDefault: vi.fn() } as any;
    
    let promise: any;
    act(() => {
      promise = result.current.handleSubmit(fakeEvent, mockLogAction, 'uid123');
    });

    expect(result.current.isSubmitting).toBe(true);

    await act(async () => {
      resolveAction({ success: true, emissions: 10.5 });
      await promise;
    });

    expect(result.current.isSubmitting).toBe(false);
  });

  it('handles error state', async () => {
    const mockLogAction = vi.fn().mockRejectedValue(new Error('DB Error'));
    const { result } = renderHook(() => useActivityFormState());

    act(() => {
      result.current.handleFieldChange(5, 'ev_car');
    });

    const fakeEvent = { preventDefault: vi.fn() } as any;

    await act(async () => {
      await result.current.handleSubmit(fakeEvent, mockLogAction, 'uid123');
    });

    expect(result.current.error).toBe('An unexpected error occurred.');
    expect(result.current.isSubmitting).toBe(false);
  });

  it('handles unmount cleanup (not strictly needed here but following requirement)', () => {
    const { unmount } = renderHook(() => useActivityFormState());
    unmount();
    // form state is simple, no external subscriptions to clean up.
  });
});