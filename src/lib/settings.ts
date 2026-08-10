export type ChatbotSettings = {
  appName: string;
  assistantName: string;
  shortDescription: string;
  logo: string;
  favicon: string;
  assistantAvatar: string;
  welcomeHeading: string;
};

type ApiResponse<T> = { success: boolean; data?: T; error?: string };

function apiConfiguration() {
  const baseUrl = process.env.KHATRI_AI_API_URL?.replace(/\/$/, "");
  const apiSecret = process.env.ADMIN_API_SECRET;
  if (!baseUrl || !apiSecret) {
    throw new Error("KHATRI_AI_API_URL and ADMIN_API_SECRET must be configured.");
  }
  return { baseUrl, apiSecret };
}

export async function settingsApiRequest(
  init: RequestInit = {},
): Promise<ChatbotSettings> {
  const { baseUrl, apiSecret } = apiConfiguration();
  const response = await fetch(`${baseUrl}/api/admin/settings`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "x-admin-api-key": apiSecret,
      ...init.headers,
    },
  });
  const payload = await response.json().catch(() => null) as ApiResponse<ChatbotSettings> | null;
  if (!response.ok || !payload?.success || !payload.data) {
    throw new Error(payload?.error || `Settings API request failed (${response.status}).`);
  }
  return payload.data;
}

export function getChatbotSettings() {
  return settingsApiRequest();
}
