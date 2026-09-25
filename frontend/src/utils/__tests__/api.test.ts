import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const toastError = vi.fn();
vi.mock('react-hot-toast', () => ({ default: { error: toastError, success: vi.fn() } }));

const axiosPost = vi.fn();
vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>();
  const instance = actual.default.create();
  return { default: Object.assign(actual.default, { post: axiosPost, create: () => instance }) };
});

const { authFetch } = await import('../api');

const response = (status: number) => new Response('{}', { status });

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
});
