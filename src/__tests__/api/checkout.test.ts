/**
 * Smoke tests for /api/checkout route.
 *
 * Stripe SDK and Supabase are mocked. We verify the key branching paths:
 * - Missing STRIPE_SECRET_KEY → 503
 * - Missing priceId or mode → 400
 * - Successful session creation → 200 with { url }
 */

// ---------- module mocks ----------

jest.mock('next/server', () => {
  class MockNextResponse {
    readonly body: unknown;
    readonly status: number;

    constructor(body: unknown, init?: { status?: number }) {
      this.body = body;
      this.status = init?.status ?? 200;
    }

    static json(data: unknown, init?: { status?: number }) {
      return new MockNextResponse(data, init);
    }

    async json() {
      return this.body;
    }
  }

  return { NextResponse: MockNextResponse };
});

const mockSessionsCreate = jest.fn();
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: { create: mockSessionsCreate },
    },
  }));
});

// Supabase: default to "no user" (anonymous checkout is fine)
const mockGetUser = jest.fn().mockResolvedValue({ data: { user: null } });
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
  }),
}));

import { POST } from '@/app/api/checkout/route';

// ---------- helpers ----------
function makeRequest(body: unknown, headers: Record<string, string> = {}) {
  return {
    json: async () => body,
    headers: { get: (key: string) => headers[key] ?? null },
  } as unknown as Request;
}

// ---------- tests ----------

describe('POST /api/checkout', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, STRIPE_SECRET_KEY: 'sk_test_fake' };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns 503 when STRIPE_SECRET_KEY is not set', async () => {
    delete process.env.STRIPE_SECRET_KEY;
    const req = makeRequest({ priceId: 'price_123', mode: 'payment' });
    const res = await POST(req);
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toMatch(/not configured/i);
  });

  it('returns 400 when priceId is missing', async () => {
    const req = makeRequest({ mode: 'payment' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/priceId|mode/i);
  });

  it('returns 400 when mode is missing', async () => {
    const req = makeRequest({ priceId: 'price_123' });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when both priceId and mode are missing', async () => {
    const req = makeRequest({});
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 200 with url on successful session creation', async () => {
    mockSessionsCreate.mockResolvedValueOnce({
      url: 'https://checkout.stripe.com/pay/cs_test_abc123',
    });

    const req = makeRequest(
      { priceId: 'price_abc', mode: 'payment' },
      { origin: 'https://fairworkhelp.app' },
    );
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('url', 'https://checkout.stripe.com/pay/cs_test_abc123');
  });

  it('passes line_items with the supplied priceId to Stripe', async () => {
    mockSessionsCreate.mockResolvedValueOnce({ url: 'https://checkout.stripe.com/x' });

    const req = makeRequest({ priceId: 'price_matter_pack', mode: 'payment' });
    await POST(req);

    expect(mockSessionsCreate).toHaveBeenCalledTimes(1);
    const callArgs = mockSessionsCreate.mock.calls[0][0] as {
      line_items: Array<{ price: string; quantity: number }>;
      mode: string;
    };
    expect(callArgs.line_items).toEqual([{ price: 'price_matter_pack', quantity: 1 }]);
    expect(callArgs.mode).toBe('payment');
  });

  it('returns 500 when Stripe throws an unexpected error', async () => {
    mockSessionsCreate.mockRejectedValueOnce(new Error('Stripe network error'));

    const req = makeRequest({ priceId: 'price_abc', mode: 'subscription' });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });

  it('pre-fills customer email when user is authenticated', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { email: 'worker@example.com' } },
    });
    mockSessionsCreate.mockResolvedValueOnce({ url: 'https://checkout.stripe.com/y' });

    const req = makeRequest({ priceId: 'price_abc', mode: 'payment' });
    await POST(req);

    const callArgs = mockSessionsCreate.mock.calls[0][0] as {
      customer_email?: string;
    };
    expect(callArgs.customer_email).toBe('worker@example.com');
  });
});
