export type KnowledgeStatus = "uploaded" | "processing" | "indexed" | "failed";

export type KnowledgeDocument = {
  _id: string;
  title: string;
  category: string;
  language: "en" | "hi" | "pa" | "hinglish" | "auto";
  description: string;
  enabled: boolean;
  status: KnowledgeStatus;
  indexingError: string;
  originalName: string;
  storageName: string;
  mimeType: string;
  size: number;
  qdrantDocumentId: string;
  chunks: number;
  totalText: number;
  indexedAt?: string;
  createdAt: string;
  updatedAt: string;
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

async function readApiResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null) as ApiResponse<T> | null;
  if (!response.ok || !payload?.success) {
    throw new Error(payload?.error || `Knowledge API request failed (${response.status}).`);
  }
  return payload.data as T;
}

export async function knowledgeApiRequest<T>(path = "", init: RequestInit = {}): Promise<T> {
  const { baseUrl, apiSecret } = apiConfiguration();

  const response = await fetch(`${baseUrl}/api/admin/knowledge${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "x-admin-api-key": apiSecret,
      ...init.headers,
    },
  });

  return readApiResponse<T>(response);
}

export async function forwardKnowledgeUpload(formData: FormData) {
  const { baseUrl, apiSecret } = apiConfiguration();
  const response = await fetch(`${baseUrl}/api/admin/knowledge/upload`, {
    method: "POST",
    body: formData,
    cache: "no-store",
    headers: { "x-admin-api-key": apiSecret },
  });
  return readApiResponse<KnowledgeDocument>(response);
}

export function getKnowledgeDocuments() {
  return knowledgeApiRequest<KnowledgeDocument[]>();
}
