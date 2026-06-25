import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LessonRenderer from '../LessonRenderer';

describe('LessonRenderer Markdown & Content Handling', () => {
  const mockContent = [
    { type: 'heading', level: 2, text: 'Title' },
    { type: 'text', text: 'https://averyveryveryveryveryveryverylongurl.com' },
    { type: 'code', code: 'console.log("hello")', language: 'js' },
    { type: 'text', text: '# Markdown Heading\n\nSome paragraph text.' }
  ];

  it('1. should render headings correctly', () => {
    render(<LessonRenderer content={mockContent} />);
    const heading = screen.getByText('Title');
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H2');
  });

  it('2. should render URLs as text or links based on markdown', () => {
    const { container } = render(<LessonRenderer content={mockContent} />);
    // The markdown parses the long string. It should be in the document.
    expect(screen.getByText(/averyveryveryveryveryveryverylongurl/)).toBeInTheDocument();
    
    // Check overflow-wrap-anywhere class to ensure long content is handled correctly
    const markdownContainers = container.querySelectorAll('.overflow-wrap-anywhere');
    expect(markdownContainers.length).toBeGreaterThan(0);
  });

  it('3. should render code blocks', () => {
    const { container } = render(<LessonRenderer content={mockContent} />);
    // Our CodeSnippet component renders the code block, which splits tokens into multiple spans
    expect(container.textContent).toMatch(/console\.log\("hello"\)/);
  });

  it('4. should not fail rendering when given empty content without streaming', () => {
    render(<LessonRenderer content={[]} />);
    expect(screen.getByText(/Generate the lesson to begin learning/i)).toBeInTheDocument();
  });

  it('5. should handle long markdown content without crashing', () => {
    const veryLongString = 'A'.repeat(5000);
    const longContent = [{ type: 'text', text: veryLongString }];
    
    const { container } = render(<LessonRenderer content={longContent} />);
    expect(screen.getByText(veryLongString)).toBeInTheDocument();
    
    // Ensure the container has break-words applied
    const div = container.querySelector('.break-words');
    expect(div).toBeInTheDocument();
  });
});
