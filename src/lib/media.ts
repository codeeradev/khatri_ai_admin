export type UploadedMedia = {
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
};

type ApiResponse<T> = { success: boolean; data?: T; error?: string };

export function apiBaseUrl() {
  const baseUrl = process.env.KHATRI_AI_API_URL?.replace(/\/$/, "");
  if (!baseUrl) throw new Error("KHATRI_AI_API_URL must be configured.");
  return baseUrl;
}

export async function forwardMediaUpload(formData: FormData): Promise<UploadedMedia> {
  const apiSecret = process.env.ADMIN_API_SECRET;
  if (!apiSecret) throw new Error("ADMIN_API_SECRET must be configured.");

  const response = await fetch(`${apiBaseUrl()}/api/admin/media/upload`, {
    method: "POST",
    body: formData,
    cache: "no-store",
    headers: { "x-admin-api-key": apiSecret },
  });
  const payload = await response.json().catch(() => null) as ApiResponse<UploadedMedia> | null;
  if (!response.ok || !payload?.success || !payload.data) {
    throw new Error(payload?.error || `Image upload failed (${response.status}).`);
  }
  return payload.data;
}
