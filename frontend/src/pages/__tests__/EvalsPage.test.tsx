import { render, screen, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EvalsPage from '../EvalsPage';
import { evalsService, type EvalReport } from '../../services/evalsService';

vi.mock('../../services/evalsService', () => ({
  evalsService: { get: vi.fn() },
}));

const mockGet = vi.mocked(evalsService.get);

function reportWith(overrides: Partial<Extract<EvalReport, { available: true }>> = {}) {
  return {
    available: true as const,
    generatedAt: '2026-07-12T23:35:38.328Z',
    mode: 'mock' as const,
    modeLabel: 'mock (no AI keys)',
    note: null,
    rows: [
      {
        id: 'json-basics',
        prompt: 'Create a course that teaches JSON fundamentals',
        expectedSubtopics: ['syntax', 'parsing'],
        structure: 1,
        coverage: null,
        faithfulness: null,
      },
    ],
    aggregate: { structure: 1, coverage: null, faithfulness: null },
    gates: { structure: 0.9, faithfulness: null },
    raw: '# Eval Scorecard',
    ...overrides,
  };
}

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <EvalsPage />
    </QueryClientProvider>
  );
}

describe('EvalsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders an unmeasured metric as n/a, never as a zero score', async () => {
    mockGet.mockResolvedValue([reportWith(), null]);
    renderPage();

    const row = await screen.findByRole('row', { name: /json-basics/ });
    expect(within(row).getByText('100%')).toBeInTheDocument();
    expect(within(row).getAllByText('n/a')).toHaveLength(2);
    expect(within(row).queryByText('0%')).not.toBeInTheDocument();
  });

  it('distinguishes a real zero from an unmeasured metric', async () => {
    mockGet.mockResolvedValue([
      reportWith({
        mode: 'live',
        rows: [
          {
            id: 'http-methods',
            prompt: 'Create a course on HTTP methods',
            expectedSubtopics: [],
            structure: 1,
            coverage: 0,
            faithfulness: null,
          },
        ],
        aggregate: { structure: 1, coverage: 0, faithfulness: null },
      }),
      null,
    ]);
    renderPage();

    const row = await screen.findByRole('row', { name: /http-methods/ });
    expect(within(row).getByText('0%')).toBeInTheDocument();
    expect(within(row).getAllByText('n/a')).toHaveLength(1);
  });

  it('explains how to generate a scorecard when none is on disk', async () => {
    mockGet.mockResolvedValue([
      { available: false, reason: 'not-found', gates: { structure: 0.9, faithfulness: null } },
      null,
    ]);
    renderPage();

    const panel = (await screen.findByText(/No scorecard on disk/)).closest('div') as HTMLElement;
    expect(within(panel).getByText(/could not find evals\/report\.md/i)).toBeInTheDocument();
    expect(within(panel).getByText(/npm run eval/)).toBeInTheDocument();
  });
});
