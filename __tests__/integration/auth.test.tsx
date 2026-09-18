import { trackEvent } from '../../src/utils/analytics';

jest.mock('../../src/lib/auth', () => ({
  signIn: jest.fn().mockResolvedValue({}),
  signUp: jest.fn().mockResolvedValue({}),
  signOut: jest.fn().mockResolvedValue({}),
  getCurrentUser: jest.fn().mockResolvedValue(null),
}));

jest.mock('../../src/lib/supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null }),
      maybeSingle: jest.fn().mockResolvedValue({ data: null }),
      insert: jest.fn().mockResolvedValue({ data: null }),
      update: jest.fn().mockReturnThis(),
      is: jest.fn().mockResolvedValue({ data: null }),
    })),
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
    })),
    removeChannel: jest.fn(),
  },
}));

describe('auth analytics integration', () => {
  it('tracks signup event', () => {
    const events = trackEvent('signup', { username: 'poet' });
    expect(events).toBeUndefined();
  });

  it('tracks login event', () => {
    trackEvent('login');
    const queue = require('../../src/utils/analytics').flushAnalytics();
    expect(queue.some((e: { event: string }) => e.event === 'login')).toBe(true);
  });
});
