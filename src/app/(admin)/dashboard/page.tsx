import type { Metadata } from "next";
import { BookOpenText, Menu, MessageSquareText, MessagesSquare } from "lucide-react";

import { PageHeading } from "@/components/page-heading";

export const metadata: Metadata = {
  title: "Dashboard",
};

const stats = [
  { label: "Greeting languages", value: "4", note: "Configured in chatbot", icon: MessageSquareText },
  { label: "Menu items", value: "—", note: "Managed dynamically", icon: Menu },
  { label: "Knowledge documents", value: "—", note: "Data connection pending", icon: BookOpenText },
  { label: "Chat sessions", value: "—", note: "Data connection pending", icon: MessagesSquare },
];

export default function DashboardPage() {
  return (
    <>
      <PageHeading
        description="A quick overview of your Khatri AI Assistant."
        title="Dashboard"
      />
      <div className="p-5 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <article
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                key={stat.label}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                    <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                      {stat.value}
                    </p>
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <Icon aria-hidden="true" className="size-5" />
                  </div>
                </div>
                <p className="mt-4 text-xs text-slate-400">{stat.note}</p>
              </article>
            );
          })}
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-950">System status</h2>
          <div className="mt-5 flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <span className="size-2 rounded-full bg-emerald-500" />
            Admin panel is configured and protected.
          </div>
        </section>
      </div>
    </>
  );
}
