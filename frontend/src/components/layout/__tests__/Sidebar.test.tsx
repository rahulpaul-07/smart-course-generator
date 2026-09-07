import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
import { LayoutProvider } from '@/contexts/LayoutContext';
import { navGroups, navItems, accountNavItems } from '../navItems';

function renderSidebar() {
  return render(
    <MemoryRouter initialEntries={['/interview-prep']}>
      <LayoutProvider>
        <Sidebar />
      </LayoutProvider>
    </MemoryRouter>
  );
}

describe('Sidebar navigation', () => {
  it('renders every nav item, including the last group', () => {
    renderSidebar();

    for (const item of [...navItems, ...accountNavItems]) {
      expect(screen.getByRole('link', { name: item.name })).toHaveAttribute('href', item.href);
    }
  });

  it('never renders a group heading without links beneath it', () => {
    const { container } = renderSidebar();

    const headings = Array.from(container.querySelectorAll('.eyebrow'));
    expect(headings.length).toBeGreaterThan(0);

    for (const heading of headings) {
      const section = heading.parentElement as HTMLElement;
      expect(within(section).getAllByRole('link').length).toBeGreaterThan(0);
    }
  });

  it('renders a heading for each group that has items', () => {
    const { container } = renderSidebar();

    const headingText = Array.from(container.querySelectorAll('.eyebrow')).map((el) => el.textContent?.trim());
    for (const group of navGroups) {
      const hasItems = navItems.some((item) => item.group === group.key);
      expect(headingText.includes(group.label)).toBe(hasItems);
    }
  });
});
