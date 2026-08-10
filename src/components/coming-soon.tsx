import { Construction } from "lucide-react";

type ComingSoonProps = {
  name: string;
};

export function ComingSoon({ name }: ComingSoonProps) {
  return (
    <div className="flex min-h-[420px] items-center justify-center p-5 sm:p-8">
      <div className="w-full max-w-lg rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <Construction aria-hidden="true" className="size-6" />
        </div>
        <h2 className="mt-5 text-lg font-semibold text-slate-950">{name} management</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          This section is ready for the next implementation phase. No chatbot data or behavior has been changed.
        </p>
      </div>
    </div>
  );
}
