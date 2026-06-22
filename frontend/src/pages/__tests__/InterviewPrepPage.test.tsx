import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  const actual = await importOriginal();
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
    await waitFor(() => expect(screen.getByRole('tablist')).toBeInTheDocument());

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(4);

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
    await waitFor(() => expect(screen.getByRole('tablist')).toBeInTheDocument());
    
    const mcqTab = screen.getByRole('tab', { name: /MCQs/i });
    expect(mcqTab).toHaveAttribute('aria-selected', 'true');
    expect(mcqTab).toHaveAttribute('tabIndex', '0'); // Active tab gets tabIndex 0
    
    const theoryTab = screen.getByRole('tab', { name: /Theory/i });
    expect(theoryTab).toHaveAttribute('aria-selected', 'false');
    expect(theoryTab).toHaveAttribute('tabIndex', '-1'); // Inactive tab gets -1
  });

  it('3. should navigate with Arrow Right', async () => {
    renderComponent();
    await waitFor(() => expect(screen.getByRole('tablist')).toBeInTheDocument());

    const tablist = screen.getByRole('tablist');
    
    // Focus first tab list
    fireEvent.keyDown(tablist, { key: 'ArrowRight' });
    
    const theoryTab = screen.getByRole('tab', { name: /Theory/i });
    expect(theoryTab).toHaveAttribute('aria-selected', 'true');
  });

  it('4. should navigate with Arrow Left', async () => {
    renderComponent();
    await waitFor(() => expect(screen.getByRole('tablist')).toBeInTheDocument());

    const tablist = screen.getByRole('tablist');
    
    // Start at index 0 (MCQ). Arrow left should wrap to last tab (Mock).
    fireEvent.keyDown(tablist, { key: 'ArrowLeft' });
    
    const mockTab = screen.getByRole('tab', { name: /Mock/i });
    expect(mockTab).toHaveAttribute('aria-selected', 'true');
  });

  it('5. should navigate with Home key', async () => {
    renderComponent();
    await waitFor(() => expect(screen.getByRole('tablist')).toBeInTheDocument());

    const tabs = screen.getAllByRole('tab');
    fireEvent.click(tabs[2]); // Go to coding tab
    expect(tabs[2]).toHaveAttribute('aria-selected', 'true');

    const tablist = screen.getByRole('tablist');
    fireEvent.keyDown(tablist, { key: 'Home' });
    
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true'); // Back to MCQ
  });

  it('6. should navigate with End key', async () => {
    renderComponent();
    await waitFor(() => expect(screen.getByRole('tablist')).toBeInTheDocument());

    const tabs = screen.getAllByRole('tab');
    const tablist = screen.getByRole('tablist');
    fireEvent.keyDown(tablist, { key: 'End' });
    
    expect(tabs[3]).toHaveAttribute('aria-selected', 'true'); // Goes to Mock
  });
});
