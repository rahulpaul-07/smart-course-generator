import type { LessonContentBlock } from '../../types';

export default function ListBlock({ block }: { block: LessonContentBlock & { style?: string; items: string[] } }) {
  const Tag = block.style === 'numbered' ? 'ol' : 'ul';

  return (
    <Tag
      className={`my-6 space-y-3 pl-6 text-foreground/90 ${
        block.style === 'numbered'
          ? 'list-decimal marker:text-indigo-400 marker:font-semibold'
          : 'list-disc marker:text-indigo-400'
      }`}
    >
      {block.items.map((item: string, index: number) => (
        <li key={index} className="pl-2 leading-7">
          {item}
        </li>
      ))}
    </Tag>
  );
}
