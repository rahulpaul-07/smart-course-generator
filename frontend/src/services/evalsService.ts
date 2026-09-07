import api from '../utils/api';
import { handleApi } from './apiHelper';

/**
 * Scores are fractions in 0..1, or `null` when the metric was not measured at
 * all -- which is the normal case for coverage and faithfulness in mock mode.
 * `null` and `0` must stay distinguishable all the way to the UI.
 */
export interface EvalRow {
  id: string;
  prompt: string | null;
  expectedSubtopics: string[];
  structure: number | null;
  coverage: number | null;
  faithfulness: number | null;
}

export interface EvalAggregate {
  structure: number | null;
  coverage: number | null;
  faithfulness: number | null;
}

export interface EvalGates {
  structure: number;
  faithfulness: number | null;
}

export interface EvalReportAvailable {
  available: true;
  generatedAt: string | null;
  mode: 'mock' | 'live';
  modeLabel: string | null;
  note: string | null;
  rows: EvalRow[];
  aggregate: EvalAggregate;
  gates: EvalGates;
  raw: string;
}

export interface EvalReportMissing {
  available: false;
  reason: 'not-found' | 'unreadable';
  gates: EvalGates;
}

export type EvalReport = EvalReportAvailable | EvalReportMissing;

export const evalsService = {
  get: () => handleApi<EvalReport>(api.get('/evals/report'), { showErrorToast: false }),
};
