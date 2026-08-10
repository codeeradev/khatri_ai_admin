export type GreetingResponses = {
  en: string;
  hi: string;
  pa: string;
  hinglish: string;
};

export type Greeting = {
  _id: string;
  name: string;
  triggers: string[];
  responses: GreetingResponses;
  showMenu: boolean;
  enabled: boolean;
  priority: number;
  createdAt?: string;
  updatedAt?: string;
};

export type GreetingInput = Omit<Greeting, "_id" | "createdAt" | "updatedAt">;

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

function apiConfiguration() {
  const baseUrl = process.env.KHATRI_AI_API_URL?.replace(/\/$/, "");
  const apiSecret = process.env.ADMIN_API_SECRET;

  if (!baseUrl || !apiSecret) {
    throw new Error("KHATRI_AI_API_URL and ADMIN_API_SECRET must be configured.");
  }

  return { baseUrl, apiSecret };
}

export async function greetingApiRequest<T>(
  path = "",
  init: RequestInit = {},
): Promise<T> {
  const { baseUrl, apiSecret } = apiConfiguration();
  const response = await fetch(`${baseUrl}/api/admin/greetings${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "x-admin-api-key": apiSecret,
      ...init.headers,
    },
  });

  const payload = await response.json().catch(() => null) as ApiResponse<T> | null;
  if (!response.ok || !payload?.success) {
    throw new Error(payload?.error || `Greeting API request failed (${response.status}).`);
  }

  return payload.data as T;
}

export function getGreetings() {
  return greetingApiRequest<Greeting[]>();
}
