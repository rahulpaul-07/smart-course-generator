import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { LessonContentBlock } from '../../types';

// List items come from the AI as markdown strings (e.g. "**JSX**: a syntax
// extension..."), so they need the same inline markdown parsing paragraph
// text gets via MemoizedMarkdown/ReactMarkdown. Rendering `item` as a raw
// string here left literal "**" asterisks visible in generated lessons.
// `p` is unwrapped to a fragment since block-level <p> isn't valid inside <li>.
function ListItemText({ text }: { text: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <>{children}</>,
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

export default function ListBlock({ block }: { block: LessonContentBlock & { style?: string; items: string[] } }) {
  const Tag = block.style === 'numbered' ? 'ol' : 'ul';

  return (
    <Tag
      className={`my-6 space-y-3 pl-6 text-foreground/90 ${
        block.style === 'numbered'
          ? 'list-decimal marker:text-primary marker:font-semibold'
          : 'list-disc marker:text-primary'
      }`}
    >
      {block.items.map((item: string, index: number) => (
        <li key={index} className="pl-2 leading-7 [&_strong]:text-foreground [&_strong]:font-bold [&_code]:text-primary [&_code]:bg-primary/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:font-mono [&_code]:text-[0.9em]">
          <ListItemText text={item} />
        </li>
      ))}
    </Tag>
  );
}
