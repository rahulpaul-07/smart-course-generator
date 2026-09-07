import api from '../utils/api';
import { handleApi } from './apiHelper';

export type BreakerStatus = 'closed' | 'degraded' | 'half-open' | 'open' | 'unconfigured';

export interface BreakerState {
  status: BreakerStatus;
  failures: number;
  threshold: number;
  openedAt: string | null;
  retryInMs: number;
}

export interface ProviderWindow {
  success: number;
  failure: number;
  total: number;
  successRate: number | null;
  avgLatencyMs: number | null;
}

export interface ProviderStatus {
  position: number;
  provider: string;
  model: string;
  envVar: string;
  configured: boolean;
  keyCount: number;
  breaker: BreakerState;
  window: ProviderWindow;
}

export interface TelemetryEvent {
  _id: string;
  provider: string;
  model: string;
  endpoint: string;
  status: 'success' | 'failure';
  reason: string | null;
  latencyMs: number | null;
  attempt: number;
  timestamp: string;
}

export interface AiStatus {
  windowHours: number;
  generatedAt: string;
  anyProviderConfigured: boolean;
  providers: ProviderStatus[];
  recent: TelemetryEvent[];
  summary: { requests: number; failovers: number };
}

export const aiStatusService = {
  get: (hours = 24) =>
    handleApi<AiStatus>(api.get('/ai/status', { params: { hours } }), {
      showErrorToast: false,
    }),
};
