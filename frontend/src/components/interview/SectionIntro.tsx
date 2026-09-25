/** Heading for one section of an interview session. */
export function SectionIntro({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-2">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
