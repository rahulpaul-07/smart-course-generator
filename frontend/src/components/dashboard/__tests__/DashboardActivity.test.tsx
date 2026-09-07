import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { DashboardActivity } from '../DashboardActivity';

function renderActivity(recentActivity: Parameters<typeof DashboardActivity>[0]['recentActivity']) {
  return render(
    <MemoryRouter>
      <DashboardActivity recentActivity={recentActivity} />
    </MemoryRouter>
  );
}

describe('DashboardActivity', () => {
  it('shows each entry its own age, not a hardcoded "Just now"', () => {
    const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();
    renderActivity([
      { type: 'Course', title: 'Intro to JSON', timestamp: hoursAgo(2), url: '/course/1' },
      { type: 'Roadmap Generated', title: 'Backend path', timestamp: hoursAgo(50), url: '/roadmaps' },
    ]);

    expect(screen.getByText(/2h ago/)).toBeInTheDocument();
    expect(screen.getByText(/2d ago/)).toBeInTheDocument();
    expect(screen.queryByText(/Just now/i)).not.toBeInTheDocument();
  });

  it('links each entry to its own destination', () => {
    renderActivity([
      { type: 'Course', title: 'Intro to JSON', timestamp: new Date().toISOString(), url: '/course/1' },
    ]);

    expect(screen.getByRole('link', { name: /Intro to JSON/ })).toHaveAttribute('href', '/course/1');
  });

  it('says so plainly when there is nothing to show', () => {
    renderActivity([]);
    expect(screen.getByText(/Nothing yet/)).toBeInTheDocument();
  });
});
