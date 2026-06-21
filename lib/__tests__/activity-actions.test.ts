import { vi, describe, it, expect, beforeEach } from 'vitest';

const { mockDocGet, mockUpdate, mockSet, getActivitiesList, setActivitiesList } = vi.hoisted(() => {
  let list: Record<string, unknown>[] = [];
  return {
    mockDocGet: vi.fn(),
    mockUpdate: vi.fn(),
    mockSet: vi.fn(),
    getActivitiesList: () => list,
    setActivitiesList: (newList: Record<string, unknown>[]) => {
      list = newList;
    }
  };
});

// Mock Next.js cache revalidation to run safely in Vitest
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock adminDb & adminAuth via lazy getters
vi.mock('../../lib/firebase/admin', () => {
  const mDocRef = {
    get: mockDocGet,
    update: mockUpdate,
    set: mockSet,
    collection: vi.fn().mockImplementation(() => mCollectionRef),
  };

  const mCollectionRef = {
    doc: vi.fn().mockReturnValue(mDocRef),
    where: vi.fn().mockImplementation(() => ({
      where: vi.fn().mockImplementation(() => ({
        get: vi.fn().mockImplementation(async () => {
          return {
            forEach: (cb: (doc: Record<string, unknown>) => void) => {
              getActivitiesList().forEach(cb);
            }
          };
        })
      }))
    }))
  };

  const mCollection = vi.fn().mockReturnValue(mCollectionRef);

  const mRunTransaction = vi.fn(async (cb) => {
    return cb({
      get: mockDocGet,
      update: mockUpdate,
      set: mockSet,
    });
  });

  const mDb = {
    collection: mCollection,
    runTransaction: mRunTransaction,
  };

  return {
    getAdminDb: () => mDb,
    getAdminAuth: () => ({
      createSessionCookie: vi.fn(),
    }),
  };
});

import { logActivity } from '../../app/actions/activity';

describe('logActivity server action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setActivitiesList([]);
  });

  it('calculates carbon emissions, saves activity, and awards first_log badge', async () => {
    // Mock user profile document in Firestore
    mockDocGet.mockResolvedValue({
      exists: true,
      data: () => ({
        badges: [],
        streakDays: 0,
        totalKgSaved: 10,
        weeklyBudgetKg: 150,
      })
    });

    const result = await logActivity({
      uid: 'user-123',
      category: 'transport',
      subcategory: 'gasoline_car',
      amount: 10,
    });

    expect(result.success).toBe(true);
    expect(result.emissions).toBe(1.70); // 10km * 0.170

    // Verify activity record is saved
    expect(mockSet).toHaveBeenCalled();

    // Verify badges and streak are updated in the profile
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        badges: expect.arrayContaining(['first_log']),
        streakDays: 1,
        totalKgSaved: 11.70, // 10 + 1.70
      })
    );
  });

  it('increments streak if user logged yesterday', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    mockDocGet.mockResolvedValue({
      exists: true,
      data: () => ({
        badges: ['first_log'],
        streakDays: 2,
        lastLoggedDate: yesterdayStr,
        totalKgSaved: 5,
        weeklyBudgetKg: 150,
      })
    });

    await logActivity({
      uid: 'user-123',
      category: 'food',
      subcategory: 'vegan_meal',
      amount: 1,
    });

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        streakDays: 3,
        badges: expect.arrayContaining(['first_log', 'streak_3']),
      })
    );
  });

  it('resets streak to 1 if streak is broken', async () => {
    mockDocGet.mockResolvedValue({
      exists: true,
      data: () => ({
        badges: ['first_log'],
        streakDays: 4,
        lastLoggedDate: '2020-01-01', // long broken
        totalKgSaved: 10,
        weeklyBudgetKg: 150,
      })
    });

    await logActivity({
      uid: 'user-123',
      category: 'food',
      subcategory: 'vegan_meal',
      amount: 1,
    });

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        streakDays: 1,
      })
    );
  });

  it('awards meatless_monday badge when logging a vegetarian/vegan meal', async () => {
    mockDocGet.mockResolvedValue({
      exists: true,
      data: () => ({
        badges: ['first_log'],
        streakDays: 1,
        totalKgSaved: 10,
        weeklyBudgetKg: 150,
      })
    });

    await logActivity({
      uid: 'user-123',
      category: 'food',
      subcategory: 'vegetarian_meal',
      amount: 1,
    });

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        badges: expect.arrayContaining(['first_log', 'meatless_monday']),
      })
    );
  });

  it('awards transit_star badge when zero private vehicle transport logged in week and at least one public transport log', async () => {
    // Populate week's logged activities with only public transit (no gasoline/ev)
    setActivitiesList([
      {
        data: () => ({
          category: 'transport',
          subcategory: 'bus',
          valueKg: 1.0,
          loggedAt: new Date().toISOString()
        })
      }
    ]);

    mockDocGet.mockResolvedValue({
      exists: true,
      data: () => ({
        badges: ['first_log'],
        streakDays: 1,
        totalKgSaved: 10,
        weeklyBudgetKg: 150,
      })
    });

    await logActivity({
      uid: 'user-123',
      category: 'transport',
      subcategory: 'rail',
      amount: 5,
    });

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        badges: expect.arrayContaining(['first_log', 'transit_star']),
      })
    );
  });
});
