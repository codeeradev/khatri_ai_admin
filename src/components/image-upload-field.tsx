"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { ImageIcon, LoaderCircle, Trash2, UploadCloud } from "lucide-react";

type ImageUploadFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onNotice?: (notice: { type: "success" | "error"; text: string }) => void;
  accept?: string;
  helpText?: string;
};

function canPreview(value: string) {
  return /^(https?:\/\/|\/{1,2}|data:image\/)/i.test(value.trim()) ||
    /\.(png|jpe?g|webp|gif|ico)(\?.*)?$/i.test(value.trim());
}

export function ImageUploadField({
  label,
  value,
  onChange,
  onNotice,
  accept = "image/jpeg,image/png,image/webp,image/gif",
  helpText = "JPG, PNG, WebP, or GIF up to 5MB.",
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      onNotice?.({ type: "error", text: "Image is too large. Maximum size is 5MB." });
      event.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await fetch("/api/admin/media/upload", { method: "POST", body: formData });
      const payload = await response.json().catch(() => null) as {
        success?: boolean;
        data?: { url?: string };
        error?: string;
      } | null;
      if (!response.ok || !payload?.success || !payload.data?.url) {
        throw new Error(payload?.error || "Could not upload image.");
      }
      onChange(payload.data.url);
      onNotice?.({ type: "success", text: `${label} uploaded. Save your changes to publish it.` });
    } catch (error) {
      onNotice?.({ type: "error", text: error instanceof Error ? error.message : "Could not upload image." });
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-slate-700">{label}</span>
      <div className="flex min-h-24 items-center gap-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white text-2xl text-slate-400">
          {value && canPreview(value) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={`${label} preview`} className="size-full object-contain" src={value} />
          ) : value ? <span>{value}</span> : <ImageIcon aria-hidden="true" className="size-6" />}
        </div>
        <div className="min-w-0 flex-1">
          <input
            accept={accept}
            className="sr-only"
            disabled={uploading}
            onChange={upload}
            ref={inputRef}
            type="file"
          />
          <div className="flex flex-wrap gap-2">
            <button
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-950 px-3 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              type="button"
            >
              {uploading ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <UploadCloud aria-hidden="true" className="size-4" />}
              {uploading ? "Uploading…" : value ? "Replace image" : "Upload image"}
            </button>
            {value ? (
              <button
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-200 px-3 text-xs font-medium text-red-600 hover:bg-red-50"
                disabled={uploading}
                onClick={() => onChange("")}
                type="button"
              >
                <Trash2 aria-hidden="true" className="size-3.5" />
                Remove
              </button>
            ) : null}
          </div>
          <p className="mt-2 text-xs text-slate-400">{helpText}</p>
        </div>
      </div>
    </div>
  );
}
