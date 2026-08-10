"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/session";
import { settingsApiRequest, type ChatbotSettings } from "@/lib/settings";

export type SettingsActionResult = { success: boolean; error?: string };

export async function updateChatbotSettingsAction(
  settings: ChatbotSettings,
): Promise<SettingsActionResult> {
  await requireAdmin();
  try {
    await settingsApiRequest({ method: "PUT", body: JSON.stringify(settings) });
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Settings update failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Settings update failed.",
    };
  }
}
