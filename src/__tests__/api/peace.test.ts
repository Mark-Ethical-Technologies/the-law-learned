/**
 * Smoke tests for /api/peace route.
 *
 * Supabase auth, peace_sessions table, and the Anthropic SDK are all mocked.
 * We verify:
 * - GET/POST return 401 when not authenticated
 * - POST returns 400 when message is missing
 * - POST stores messages and returns sessionId + message
 * - Phase transitions: engage → closure when [READY FOR CLOSURE] appears
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

  class MockNextRequest {
    private _body: unknown;
    private _url: string;
    readonly headers: Map<string, string>;

    constructor(body: unknown, url = 'https://fairworkhelp.app/api/peace') {
      this._body = body;
      this._url = url;
    }

    get url() {
      return this._url;
    }

    async json() {
      return this._body;
    }
  }

  return { NextRequest: MockNextRequest, NextResponse: MockNextResponse };
});

const mockMessagesCreate = jest.fn();
jest.mock('@anthropic-ai/sdk', () => {
  const MockAnthropic = jest.fn().mockImplementation(() => ({
    messages: { create: mockMessagesCreate },
  }));
  return { default: MockAnthropic };
});

// Supabase mock — we wire getUser and the table builder per test
let mockUser: { id: string; email?: string } | null = null;

const mockSingle = jest.fn();
const mockUpdate = jest.fn().mockReturnThis();
const mockEq = jest.fn().mockReturnThis();
const mockInsert = jest.fn().mockReturnThis();
const mockSelect = jest.fn().mockReturnThis();
const mockOrder = jest.fn().mockReturnThis();
const mockLimit = jest.fn().mockReturnThis();

// single() is what actually resolves — we'll override per test
mockSingle.mockResolvedValue({ data: null });

const mockFrom = jest.fn().mockReturnValue({
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  eq: mockEq,
  single: mockSingle,
  order: mockOrder,
  limit: mockLimit,
});

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn().mockImplementation(async () => ({
    auth: {
      getUser: jest.fn().mockImplementation(async () => ({
        data: { user: mockUser },
      })),
    },
    from: mockFrom,
  })),
}));

import { POST, GET } from '@/app/api/peace/route';

// ---------- helpers ----------
function makeRequest(body: unknown, url?: string) {
  const { NextRequest } = jest.requireMock('next/server') as {
    NextRequest: new (body: unknown, url?: string) => { json(): Promise<unknown>; url: string };
  };
  return new NextRequest(body, url);
}

// ---------- tests ----------

describe('/api/peace', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = null; // default: unauthenticated

    // Reset chainable mock returns each test
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      eq: mockEq,
      single: mockSingle,
      order: mockOrder,
      limit: mockLimit,
    });
    mockSelect.mockReturnThis();
    mockInsert.mockReturnThis();
    mockUpdate.mockReturnThis();
    mockEq.mockReturnThis();
    mockOrder.mockReturnThis();
    mockLimit.mockReturnThis();
    mockSingle.mockResolvedValue({ data: null });
  });

  // ---- Authentication guard ----

  describe('GET', () => {
    it('returns 401 when not authenticated', async () => {
      const req = makeRequest({}, 'https://fairworkhelp.app/api/peace');
      const res = await GET(req as never);
      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.error).toMatch(/unauthoris/i);
    });

    it('returns session list when authenticated', async () => {
      mockUser = { id: 'user-1' };
      // The final .limit() call resolves with data
      mockLimit.mockResolvedValueOnce({
        data: [{ id: 'sess-1', phase: 'engage', title: null }],
      });

      const req = makeRequest({}, 'https://fairworkhelp.app/api/peace');
      const res = await GET(req as never);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body)).toBe(true);
    });
  });

  describe('POST', () => {
    it('returns 401 when not authenticated', async () => {
      const req = makeRequest({ message: 'hello' });
      const res = await POST(req as never);
      expect(res.status).toBe(401);
    });

    it('returns 400 when message is missing', async () => {
      mockUser = { id: 'user-1' };
      const req = makeRequest({});
      const res = await POST(req as never);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/missing message/i);
    });

    it('returns 400 when message is empty string', async () => {
      mockUser = { id: 'user-1' };
      const req = makeRequest({ message: '' });
      const res = await POST(req as never);
      expect(res.status).toBe(400);
    });

    it('creates a new session and returns sessionId + message', async () => {
      mockUser = { id: 'user-2' };

      // No existing session
      mockSingle.mockResolvedValueOnce({ data: null });

      // Insert new session returns a session object
      mockSingle.mockResolvedValueOnce({
        data: { id: 'new-sess-1', messages: [], phase: 'engage' },
      });

      // Anthropic response
      mockMessagesCreate.mockResolvedValueOnce({
        content: [{ type: 'text', text: 'Welcome. Tell me what happened.' }],
      });

      // Update after appending messages (no return value needed)
      mockEq.mockResolvedValueOnce({ data: null });

      const req = makeRequest({ message: 'I think I am being underpaid.' });
      const res = await POST(req as never);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('sessionId', 'new-sess-1');
      expect(body).toHaveProperty('message');
      expect(typeof body.message).toBe('string');
    });

    it('transitions phase from engage to closure when [READY FOR CLOSURE] appears', async () => {
      mockUser = { id: 'user-3' };

      // Return existing session in engage phase
      mockSingle.mockResolvedValueOnce({
        data: { id: 'sess-engage', messages: [], phase: 'engage' },
      });

      // Anthropic returns the closure trigger
      mockMessagesCreate.mockResolvedValueOnce({
        content: [
          {
            type: 'text',
            text: 'I think I have everything I need. [READY FOR CLOSURE] Let me summarise.',
          },
        ],
      });

      const req = makeRequest({ sessionId: 'sess-engage', message: 'That is all I can remember.' });
      const res = await POST(req as never);
      expect(res.status).toBe(200);
      const body = await res.json();
      // Phase must have transitioned
      expect(body.phase).toBe('closure');
      // The sentinel tag must be stripped from the returned message
      expect(body.message).not.toContain('[READY FOR CLOSURE]');
    });

    it('strips [READY FOR CLOSURE] from the message returned to the client', async () => {
      mockUser = { id: 'user-4' };

      mockSingle.mockResolvedValueOnce({
        data: { id: 'sess-2', messages: [], phase: 'account' },
      });

      mockMessagesCreate.mockResolvedValueOnce({
        content: [{ type: 'text', text: '[READY FOR CLOSURE]Great, let us close.' }],
      });

      const req = makeRequest({ sessionId: 'sess-2', message: 'Done.' });
      const res = await POST(req as never);
      const body = await res.json();
      expect(body.message).not.toContain('[READY FOR CLOSURE]');
    });
  });
});
