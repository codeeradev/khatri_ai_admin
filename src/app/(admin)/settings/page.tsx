import type { Metadata } from "next";

import { PageHeading } from "@/components/page-heading";
import { SettingsManager } from "@/components/settings-manager";
import { requireAdmin } from "@/lib/auth/session";
import { getChatbotSettings, type ChatbotSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Settings" };

const defaults: ChatbotSettings = {
  appName: "Khatri AI",
  assistantName: "Khatri AI Assistant",
  shortDescription: "Choose a topic or ask a Khatri-community question.",
  logo: "",
  favicon: "",
  assistantAvatar: "🙏",
  welcomeHeading: "Welcome to Khatri AI Assistant",
};

export default async function SettingsPage() {
  await requireAdmin();
  let settings = defaults;
  let loadError: string | undefined;

  try {
    settings = await getChatbotSettings();
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Could not load settings.";
  }

  return (
    <>
      <PageHeading description="Configure admin and service preferences." title="Settings" />
      <SettingsManager initialSettings={settings} loadError={loadError} />
    </>
  );
}
