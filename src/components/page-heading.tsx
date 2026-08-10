type PageHeadingProps = {
  title: string;
  description: string;
};

export function PageHeading({ title, description }: PageHeadingProps) {
  return (
    <header className="border-b border-slate-200 bg-white px-5 py-6 sm:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h1>
      <p className="mt-1.5 text-sm text-slate-500">{description}</p>
    </header>
  );
}
