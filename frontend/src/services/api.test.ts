import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';
import toast from 'react-hot-toast';

vi.mock('react-hot-toast', () => ({
  default: {
    loading: vi.fn(() => 'toast-1'),
    dismiss: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    custom: vi.fn(),
  },
}));

// Import AFTER mocks. api.ts's warmApi() fires once at import; the post spy
// below targets the exported axios *instance* (what the wrapper actually calls).
const { isInfraFailure, getApiErrorMessage, postWithColdStartRetry } = await import('./api');
const api = (await import('./api')).default;

const infraError = (over: Record<string, unknown> = {}): unknown => {
  const e = new Error('timeout');
  Object.assign(e, { isAxiosError: true, code: 'ECONNABORTED', config: {} }, over);
  return e;
};

const serverError = (status: number, data: unknown = { message: 'x' }): unknown => {
  const e = new Error('server');
  Object.assign(e, { isAxiosError: true, code: null, config: {}, response: { status, data } });
  return e;
};

describe('isInfraFailure', () => {
  it('treats client timeout as infra failure', () => {
    expect(isInfraFailure(infraError())).toBe(true);
  });
  it('treats missing response (network drop) as infra failure', () => {
    expect(isInfraFailure(infraError({ code: null }))).toBe(true);
  });
  it('treats 502/503/504 as infra failures', () => {
    expect(isInfraFailure(serverError(502))).toBe(true);
    expect(isInfraFailure(serverError(503))).toBe(true);
    expect(isInfraFailure(serverError(504))).toBe(true);
  });
  it('never treats real server responses as infra failures', () => {
    expect(isInfraFailure(serverError(401))).toBe(false);
    expect(isInfraFailure(serverError(409))).toBe(false);
    expect(isInfraFailure(serverError(400))).toBe(false);
    expect(isInfraFailure(serverError(500))).toBe(false);
  });
});

describe('getApiErrorMessage', () => {
  it('surfaces backend envelope message', () => {
    expect(getApiErrorMessage(serverError(401, { message: 'Invalid email or password' })))
      .toBe('Invalid email or password');
  });
  it('rejects HTML error pages and oversized payloads', () => {
    expect(getApiErrorMessage(serverError(502, '<!DOCTYPE html><html><body>nginx</body></html>')))
      .not.toContain('html');
    expect(getApiErrorMessage(serverError(400, { message: 'y'.repeat(301) })))
      .not.toBe('y'.repeat(301));
  });
  it('maps infra states to friendly messages', () => {
    expect(getApiErrorMessage(serverError(502, { message: null }))).toMatch(/restarting|unavailable/i);
    expect(getApiErrorMessage(infraError())).toMatch(/took too long|waking/i);
    expect(getApiErrorMessage(infraError({ code: null, response: undefined }))).toMatch(/cannot reach/i);
  });
  it('falls back cleanly for unknown errors', () => {
    expect(getApiErrorMessage(new Error('boom'))).toMatch(/went wrong/i);
  });
});

describe('postWithColdStartRetry', () => {
  let postSpy: MockInstance<typeof api.post>;

  beforeEach(() => {
    vi.useFakeTimers();
    postSpy = vi.spyOn(api, 'post');
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('succeeds after transient timeouts without surfacing errors', async () => {
    postSpy
      .mockRejectedValueOnce(infraError())
      .mockRejectedValueOnce(infraError())
      .mockResolvedValueOnce({ data: { data: { id: 1 } } });

    const promise = postWithColdStartRetry<{ data: { id: number } }>('/auth/login', {});
    // 2 failed attempts + 2 retry pauses advance the clock without exhausting budget
    await vi.advanceTimersByTimeAsync(10_000);
    const result = await promise;

    expect(result.data.data.id).toBe(1);
    expect(postSpy).toHaveBeenCalledTimes(3);
    expect(toast.loading).toHaveBeenCalled();
    expect(toast.dismiss).toHaveBeenCalled();
  });

  it('fails fast on real auth errors (never retried)', async () => {
    postSpy.mockRejectedValue(serverError(401, { message: 'Invalid email or password' }));

    await expect(postWithColdStartRetry('/auth/login', {})).rejects.toMatchObject({ response: { status: 401 } });
    expect(postSpy).toHaveBeenCalledTimes(1);
  });

  it('gives up after the retry budget and throws the last error', async () => {
    postSpy.mockRejectedValue(infraError());

    const promise = postWithColdStartRetry('/auth/login', {}, { budgetMs: 10_000 });
    // Attach the rejection expectation BEFORE advancing — the rejection fires
    // during the timer advance (instant stub failures → ~2s per retry cycle).
    const expectation = expect(promise).rejects.toMatchObject({ code: 'ECONNABORTED' });
    await vi.advanceTimersByTimeAsync(30_000);
    await expectation;
    const finalCount = postSpy.mock.calls.length;
    // Once the budget is exhausted the loop has stopped — the count is frozen.
    await vi.advanceTimersByTimeAsync(60_000);
    expect(postSpy.mock.calls.length).toBe(finalCount);
  });

  it('does not show the wake toast for sub-grace failures', async () => {
    // Success on the very first attempt → no time elapses → no toast
    postSpy.mockResolvedValueOnce({ data: { data: { id: 2 } } });
    const result = await postWithColdStartRetry<{ data: { id: number } }>('/auth/login', {});
    expect(result.data.data.id).toBe(2);
    expect(toast.loading).not.toHaveBeenCalled();
  });
});
