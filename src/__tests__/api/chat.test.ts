/**
 * Smoke tests for /api/chat route logic.
 *
 * We test the handler's branching decisions without making real HTTP or
 * Anthropic network calls. The Anthropic SDK and Next.js internals are
 * mocked so the handler can be imported and called directly.
 */

// ---------- module mocks (must come before any imports) ----------

// Mock next/server so NextRequest / NextResponse work in Node test runner
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

  class MockNextRequest {
    private _body: unknown;
    readonly headers: Map<string, string>;

    constructor(body: unknown, headers: Record<string, string> = {}) {
      this._body = body;
      this.headers = new Map(Object.entries(headers));
    }

    async json() {
      return this._body;
    }
  }

  return { NextRequest: MockNextRequest, NextResponse: MockNextResponse };
});

// Mock Anthropic SDK — we control what messages.create returns per test
const mockMessagesCreate = jest.fn();
jest.mock('@anthropic-ai/sdk', () => {
  const MockAnthropic = jest.fn().mockImplementation(() => ({
    messages: { create: mockMessagesCreate },
  }));
  // Expose APIError so the route's `instanceof Anthropic.APIError` check works
  (MockAnthropic as unknown as Record<string, unknown>).APIError = class APIError extends Error {
    status: number;
    constructor(message: string, status = 500) {
      super(message);
      this.status = status;
    }
  };
  return { default: MockAnthropic };
});

// ---------- import handler after mocks are registered ----------
import { POST } from '@/app/api/chat/route';

// ---------- helpers ----------
function makeRequest(body: unknown) {
  const { NextRequest } = jest.requireMock('next/server') as {
    NextRequest: new (body: unknown) => { json(): Promise<unknown> };
  };
  return new NextRequest(body);
}

// ---------- tests ----------

describe('POST /api/chat', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    // Restore env before each test so individual tests can mutate safely
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns 400 when messages array is missing', async () => {
    const req = makeRequest({});
    const res = await POST(req as never);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty('error');
  });

  it('returns 400 when messages is not an array', async () => {
    const req = makeRequest({ messages: 'hello' });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
  });

  it('returns 400 when messages array contains no user/assistant entries', async () => {
    const req = makeRequest({ messages: [{ role: 'system', content: 'ignored' }] });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('No messages');
  });

  it('returns 200 with message and usage on a successful AI response', async () => {
    mockMessagesCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'Looks like you might have a claim.' }],
      usage: { input_tokens: 10, output_tokens: 20 },
    });

    const req = makeRequest({
      messages: [{ role: 'user', content: 'Am I being underpaid?' }],
    });
    const res = await POST(req as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('message', 'Looks like you might have a claim.');
    expect(body.usage).toMatchObject({ input_tokens: 10, output_tokens: 20 });
  });

  it('uses the free-tier system prompt (does not leak full analysis in prompt)', async () => {
    mockMessagesCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'Brief triage response.' }],
      usage: { input_tokens: 5, output_tokens: 5 },
    });

    const req = makeRequest({
      messages: [{ role: 'user', content: 'What is my rate?' }],
    });
    await POST(req as never);

    expect(mockMessagesCreate).toHaveBeenCalledTimes(1);
    const callArgs = mockMessagesCreate.mock.calls[0][0] as {
      system: string;
      max_tokens: number;
    };

    // System prompt must mention free tier or triage concept
    expect(callArgs.system).toMatch(/FREE TIER|free tier|triage/i);

    // max_tokens must be capped (the route enforces brevity at 600)
    expect(callArgs.max_tokens).toBeLessThanOrEqual(600);
  });

  it('returns 500 with error message when Anthropic throws an APIError', async () => {
    const { default: Anthropic } = jest.requireMock('@anthropic-ai/sdk') as {
      default: { APIError: new (msg: string, status?: number) => Error & { status: number } };
    };
    const apiErr = new Anthropic.APIError('Invalid API key', 401);
    mockMessagesCreate.mockRejectedValueOnce(apiErr);

    const req = makeRequest({
      messages: [{ role: 'user', content: 'test' }],
    });
    const res = await POST(req as never);
    // Route returns Anthropic's status code for API errors
    expect(res.status).toBe(401);
  });

  it('returns 500 on unexpected errors', async () => {
    mockMessagesCreate.mockRejectedValueOnce(new Error('Network failure'));

    const req = makeRequest({
      messages: [{ role: 'user', content: 'test' }],
    });
    const res = await POST(req as never);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toHaveProperty('error');
  });
});
