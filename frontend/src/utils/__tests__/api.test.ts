import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const toastError = vi.fn();
vi.mock('react-hot-toast', () => ({ default: { error: toastError, success: vi.fn() } }));

const axiosPost = vi.fn();
vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>();
  const instance = actual.default.create();
  return { default: Object.assign(actual.default, { post: axiosPost, create: () => instance }) };
});

const { authFetch, default: api, WAKE_RETRY_DELAYS_MS } = await import('../api');
// The mock above keeps only axios's default export, which carries these too.
const { AxiosError, AxiosHeaders } = (await import('axios')).default;

const response = (status: number, headers: Record<string, string> = {}) =>
  new Response('{}', { status, headers });
const asleep = () => response(429, { 'x-render-routing': 'hibernate-rate-limited' });

describe('authFetch', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    localStorage.clear();
    fetchMock.mockReset();
    axiosPost.mockReset();
    toastError.mockReset();
  });
  afterEach(() => vi.unstubAllGlobals());

  // Bug: the SSE endpoints used raw fetch() and never refreshed, so once the
  // 30-minute access token lapsed, "Generate lesson" failed with an auth error.
  it('refreshes once on 401 and replays with the new token', async () => {
    localStorage.setItem('token', 'stale');
    fetchMock.mockResolvedValueOnce(response(401)).mockResolvedValueOnce(response(200));
    axiosPost.mockResolvedValueOnce({ data: { token: 'fresh' } });

    const res = await authFetch('/courses/x/chat', { method: 'POST', body: '{}' });

    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const retryHeaders = fetchMock.mock.calls[1][1].headers as Record<string, string>;
    expect(retryHeaders.Authorization).toBe('Bearer fresh');
    expect(localStorage.getItem('token')).toBe('fresh');
  });

  it('shares a single refresh between concurrent 401s', async () => {
    localStorage.setItem('token', 'stale');
    fetchMock.mockResolvedValueOnce(response(401)).mockResolvedValueOnce(response(401)).mockResolvedValue(response(200));
    axiosPost.mockResolvedValue({ data: { token: 'fresh' } });

    await Promise.all([authFetch('/a'), authFetch('/b')]);
    expect(axiosPost).toHaveBeenCalledTimes(1);
  });

  // Bug: anonymous visitors saw "Your session has expired" on the landing page.
  it('only announces expiry when there was a session', async () => {
    fetchMock.mockResolvedValue(response(401));
    axiosPost.mockRejectedValue(new Error('no refresh cookie'));

    await authFetch('/auth/me');
    expect(toastError).not.toHaveBeenCalled();

    localStorage.setItem('token', 'stale');
    await authFetch('/auth/me');
    expect(toastError).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('token')).toBeNull();
  });

  // Bug: a sleeping free-tier API answered through the Vercel rewrite with 429
  // and `X-Render-Routing: hibernate-rate-limited`, and the request just failed.
  it('waits for a sleeping server to wake and replays the request', async () => {
    vi.useFakeTimers();
    try {
      fetchMock.mockResolvedValueOnce(asleep()).mockResolvedValueOnce(response(200));
      const pending = authFetch('/courses/x/chat', { method: 'POST', body: '{}' });
      await vi.advanceTimersByTimeAsync(WAKE_RETRY_DELAYS_MS[0]);
      expect((await pending).status).toBe(200);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not replay the API\'s own 429', async () => {
    fetchMock.mockResolvedValueOnce(response(429));
    expect((await authFetch('/auth/login')).status).toBe(429);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('axios client while the server wakes', () => {
  type Reply = { status: number; headers?: Record<string, string> };
  let replies: Reply[];
  let calls: number;

  beforeEach(() => {
    replies = [];
    calls = 0;
    toastError.mockReset();
    localStorage.clear();
    api.defaults.adapter = async (config) => {
      calls += 1;
      const reply = replies.shift() ?? { status: 200 };
      const res = {
        data: {}, status: reply.status, statusText: String(reply.status),
        headers: new AxiosHeaders(reply.headers ?? {}), config,
      };
      if (reply.status >= 400) throw new AxiosError('failed', 'ERR_BAD_RESPONSE', config, null, res);
      return res;
    };
    vi.useFakeTimers();
  });
  afterEach(() => vi.useRealTimers());

  it('replays a request that hit the hibernating instance, without a rate-limit toast', async () => {
    replies = [{ status: 429, headers: { 'x-render-routing': 'hibernate-rate-limited' } }, { status: 200 }];
    const pending = api.get('/auth/config');
    await vi.advanceTimersByTimeAsync(WAKE_RETRY_DELAYS_MS[0]);
    expect((await pending).status).toBe(200);
    expect(calls).toBe(2);
    expect(toastError).not.toHaveBeenCalled();
  });

  it('gives up after about a minute and says the server is waking', async () => {
    replies = WAKE_RETRY_DELAYS_MS.concat(0).map(() => (
      { status: 429, headers: { 'x-render-routing': 'hibernate-rate-limited' } }));
    const pending = api.get('/auth/config').catch((e) => e);
    await vi.advanceTimersByTimeAsync(WAKE_RETRY_DELAYS_MS.reduce((a, b) => a + b, 0));
    const error = await pending;
    expect(error.response.status).toBe(429);
    expect(calls).toBe(WAKE_RETRY_DELAYS_MS.length + 1);
    expect(toastError).toHaveBeenCalledWith('The demo server is still waking up. Please try again in a minute.');
  });

  it('still reports the API\'s own rate limit at once', async () => {
    replies = [{ status: 429 }];
    await api.get('/courses').catch(() => undefined);
    expect(calls).toBe(1);
    expect(toastError).toHaveBeenCalledWith('Rate limit exceeded. Please wait a moment and try again.');
  });
});
