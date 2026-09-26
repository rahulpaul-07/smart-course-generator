import { describe, expect, it } from 'vitest';
import type { AiStatus, ProviderStatus } from '@/services/aiStatusService';
import { routerLabel, routerTone, summarizeRouter } from '../routerStatus';

function provider(configured: boolean, breaker: ProviderStatus['breaker']['status'] = 'closed'): ProviderStatus {
  return {
    position: 0,
    provider: 'gemini',
    model: 'm',
    envVar: 'GEMINI_API_KEY',
    configured,
    keyCount: configured ? 1 : 0,
    breaker: { status: breaker, failures: 0, threshold: 3, openedAt: null, retryInMs: 0 },
    window: { success: 0, failure: 0, total: 0, successRate: null, avgLatencyMs: null },
  };
}

function status(providers: ProviderStatus[]): AiStatus {
  return {
    windowHours: 1,
    generatedAt: new Date().toISOString(),
    anyProviderConfigured: providers.some((p) => p.configured),
    providers,
    recent: [],
    summary: { requests: 0, failovers: 0 },
  };
}

describe('router status indicator', () => {
  it('reports every configured provider available as healthy', () => {
    const summary = summarizeRouter(status([provider(true), provider(true), provider(false)]));
    expect(summary).toEqual({ state: 'live', available: 2, configured: 2 });
    expect(routerLabel(summary)).toBe('2 of 2 AI providers available');
    expect(routerTone(summary)).toBe('bg-emerald-400');
  });

  it('counts providers with an open breaker as unavailable', () => {
    const summary = summarizeRouter(status([provider(true, 'open'), provider(true)]));
    expect(routerLabel(summary)).toBe('1 of 2 AI providers available');
    expect(routerTone(summary)).toBe('bg-amber-400');
  });

  it('is red when every configured provider is down', () => {
    expect(routerTone(summarizeRouter(status([provider(true, 'open')])))).toBe('bg-red-500');
  });

  it('says so plainly when running in mock mode', () => {
    const summary = summarizeRouter(status([provider(false)]));
    expect(summary.state).toBe('mock');
    expect(routerLabel(summary)).toMatch(/mock mode/);
  });

  it('never claims health when the status request failed', () => {
    const summary = summarizeRouter(null);
    expect(routerLabel(summary)).toBe('Router status');
    expect(routerTone(summary)).toBe('bg-muted-foreground');
  });
});
