import type { Metadata } from "next";

import { GreetingsManager } from "@/components/greetings-manager";
import { PageHeading } from "@/components/page-heading";
import { requireAdmin } from "@/lib/auth/session";
import { getGreetings, type Greeting } from "@/lib/greetings";

export const metadata: Metadata = { title: "Greetings" };

export default async function GreetingsPage() {
  await requireAdmin();

  let greetings: Greeting[] = [];
  let loadError: string | undefined;

  try {
    greetings = await getGreetings();
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Could not load greetings.";
  }

  return (
    <>
      <PageHeading description="Manage greeting and static response copy." title="Greetings" />
      <GreetingsManager
        initialGreetings={greetings}
        key={greetings.map((greeting) => `${greeting._id}:${greeting.updatedAt}`).join("|")}
        loadError={loadError}
      />
    </>
  );
}
