import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import InterviewPrepPage from '../InterviewPrepPage';
import { MemoryRouter } from 'react-router-dom';

// Mock API and specific sub-components to isolate the test to just the tab container
vi.mock('../../utils/api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
    post: vi.fn(),
    delete: vi.fn()
  }
}));

// Mock sub-components
vi.mock('../InterviewPrepPage', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../InterviewPrepPage')>();
  return {
    ...actual,
    MCQSection: () => <div data-testid="mcq-section">MCQ Content</div>,
    TheorySection: () => <div data-testid="theory-section">Theory Content</div>,
    CodingSection: () => <div data-testid="coding-section">Coding Content</div>,
    MockSection: () => <div data-testid="mock-section">Mock Content</div>,
  };
});

describe('InterviewPrepPage WAI-ARIA Tabs', () => {
  beforeEach(() => {
    sessionStorage.clear();
    // Simulate an active prep so the tabs render
    sessionStorage.setItem('interview_active_prep', JSON.stringify({
      _id: '123',
      status: 'pending',
      mcqs: [],
      theoryQuestions: [],
      codingQuestions: [],
      mockChat: []
    }));
  });

  const renderComponent = () => render(
    <MemoryRouter>
      <InterviewPrepPage />
    </MemoryRouter>
  );

  it('1. should switch tabs on click', async () => {
    renderComponent();
    await waitFor(() => expect(screen.getAllByRole('tablist').length).toBeGreaterThan(0));

    const tabs = screen.getAllByRole('tab').slice(0, 3);
    expect(tabs).toHaveLength(3);

    // By default MCQ should be selected
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false');

    // Click Theory
    fireEvent.click(tabs[1]);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'false');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
  });

  it('2. should verify aria-selected behavior', async () => {
    renderComponent();
    await waitFor(() => expect(screen.getAllByRole('tablist').length).toBeGreaterThan(0));
    
    const mcqTab = screen.getAllByRole('tab', { name: /MCQs/i })[0];
    expect(mcqTab).toHaveAttribute('aria-selected', 'true');
    expect(mcqTab).toHaveAttribute('tabIndex', '0'); // Active tab gets tabIndex 0
    
    const theoryTab = screen.getAllByRole('tab', { name: /Theory/i })[0];
    expect(theoryTab).toHaveAttribute('aria-selected', 'false');
    expect(theoryTab).toHaveAttribute('tabIndex', '-1'); // Inactive tab gets -1
  });

  it('3. should navigate with Arrow Right', async () => {
    renderComponent();
    await waitFor(() => expect(screen.getAllByRole('tablist').length).toBeGreaterThan(0));

    const tablist = screen.getAllByRole('tablist')[0];
    
    // Focus first tab list
    fireEvent.keyDown(tablist, { key: 'ArrowRight' });
    
    const theoryTab = screen.getAllByRole('tab', { name: /Theory/i })[0];
    expect(theoryTab).toHaveAttribute('aria-selected', 'true');
  });

  it('4. should navigate with Arrow Left', async () => {
    renderComponent();
    await waitFor(() => expect(screen.getAllByRole('tablist').length).toBeGreaterThan(0));

    const tablist = screen.getAllByRole('tablist')[0];
    
    // Start at index 0 (MCQ). Arrow left should wrap to last tab (Coding).
    fireEvent.keyDown(tablist, { key: 'ArrowLeft' });
    
    const codingTab = screen.getAllByRole('tab', { name: /Coding/i })[0];
    expect(codingTab).toHaveAttribute('aria-selected', 'true');
  });

  it('5. should navigate with Home key', async () => {
    renderComponent();
    await waitFor(() => expect(screen.getAllByRole('tablist').length).toBeGreaterThan(0));

    const tabs = screen.getAllByRole('tab').slice(0, 3);
    fireEvent.click(tabs[2]); // Go to coding tab
    expect(tabs[2]).toHaveAttribute('aria-selected', 'true');

    const tablist = screen.getAllByRole('tablist')[0];
    fireEvent.keyDown(tablist, { key: 'Home' });
    
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true'); // Back to MCQ
  });

  it('6. should navigate with End key', async () => {
    renderComponent();
    await waitFor(() => expect(screen.getAllByRole('tablist').length).toBeGreaterThan(0));

    const tabs = screen.getAllByRole('tab').slice(0, 3);
    const tablist = screen.getAllByRole('tablist')[0];
    fireEvent.keyDown(tablist, { key: 'End' });
    
    expect(tabs[2]).toHaveAttribute('aria-selected', 'true'); // Goes to Coding
  });
});
