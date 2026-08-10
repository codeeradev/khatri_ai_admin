"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BookOpenText,
  FileText,
  LoaderCircle,
  Plus,
  RefreshCw,
  RotateCw,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

import {
  deleteKnowledgeDocumentAction,
  reindexKnowledgeDocumentAction,
  toggleKnowledgeDocumentAction,
} from "@/app/actions/knowledge";
import type { KnowledgeDocument, KnowledgeStatus } from "@/lib/knowledge";

type KnowledgeManagerProps = {
  initialDocuments: KnowledgeDocument[];
  loadError?: string;
};

const statusStyles: Record<KnowledgeStatus, string> = {
  uploaded: "bg-blue-100 text-blue-700",
  processing: "bg-amber-100 text-amber-700",
  indexed: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
};

const languageNames: Record<KnowledgeDocument["language"], string> = {
  auto: "Auto detect",
  en: "English",
  hi: "Hindi",
  pa: "Punjabi",
  hinglish: "Hinglish",
};

function readableSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function KnowledgeManager({ initialDocuments, loadError }: KnowledgeManagerProps) {
  const router = useRouter();
  const [documents, setDocuments] = useState(initialDocuments);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(
    loadError ? { type: "error", text: loadError } : null,
  );
  const [pending, startTransition] = useTransition();

  const hasActiveIndexing = documents.some((document) => (
    document.enabled && (document.status === "uploaded" || document.status === "processing")
  ));

  useEffect(() => {
    if (!hasActiveIndexing) return;
    const interval = window.setInterval(() => router.refresh(), 2500);
    return () => window.clearInterval(interval);
  }, [hasActiveIndexing, router]);

  async function uploadDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploading(true);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/knowledge/upload", {
        method: "POST",
        body: new FormData(event.currentTarget),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error || "Upload failed.");
      setShowUpload(false);
      setNotice({ type: "success", text: "Document uploaded. Indexing has started." });
      router.refresh();
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "Upload failed." });
    } finally {
      setUploading(false);
    }
  }

  function toggleDocument(document: KnowledgeDocument) {
    const enabled = !document.enabled;
    startTransition(async () => {
      const result = await toggleKnowledgeDocumentAction(document._id, enabled);
      if (!result.success) {
        setNotice({ type: "error", text: result.error || "Could not update document." });
        return;
      }
      setNotice({
        type: "success",
        text: enabled ? "Document enabled. Re-indexing has started." : "Document disabled and vectors removed.",
      });
      router.refresh();
    });
  }

  function reindexDocument(document: KnowledgeDocument) {
    startTransition(async () => {
      const result = await reindexKnowledgeDocumentAction(document._id);
      if (!result.success) {
        setNotice({ type: "error", text: result.error || "Could not re-index document." });
        return;
      }
      setNotice({ type: "success", text: "Re-indexing has started." });
      router.refresh();
    });
  }

  function deleteDocument(document: KnowledgeDocument) {
    if (!window.confirm(`Delete “${document.title}”, its file, and all indexed vectors?`)) return;
    startTransition(async () => {
      const result = await deleteKnowledgeDocumentAction(document._id);
      if (!result.success) {
        setNotice({ type: "error", text: result.error || "Could not delete document." });
        return;
      }
      setDocuments((current) => current.filter((item) => item._id !== document._id));
      setNotice({ type: "success", text: "Document, file, and vectors deleted." });
      router.refresh();
    });
  }

  return (
    <div className="p-5 sm:p-8">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {documents.length} {documents.length === 1 ? "document" : "documents"}
          </p>
          {notice ? (
            <p className={`mt-1 text-sm ${notice.type === "error" ? "text-red-600" : "text-emerald-700"}`} role="status">
              {notice.text}
            </p>
          ) : null}
        </div>
        <div className="flex gap-2">
          <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={() => router.refresh()} type="button">
            <RefreshCw aria-hidden="true" className="size-4" />
            Refresh
          </button>
          <button className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800" onClick={() => { setShowUpload(true); setNotice(null); }} type="button">
            <Plus aria-hidden="true" className="size-4" />
            Upload document
          </button>
        </div>
      </div>

      {documents.length ? (
        <div className="space-y-4">
          {documents.map((document) => {
            const indexing = document.enabled && (
              document.status === "processing" || document.status === "uploaded"
            );
            return (
              <article className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${document.enabled ? "" : "opacity-65"}`} key={document._id}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <FileText aria-hidden="true" className="size-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-slate-950">{document.title}</h2>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyles[document.status]}`}>
                        {document.status}
                      </span>
                      {!document.enabled ? <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">Disabled</span> : null}
                    </div>
                    <p className="mt-1 truncate text-sm text-slate-500">{document.originalName}</p>
                    {document.description ? <p className="mt-3 text-sm leading-6 text-slate-600">{document.description}</p> : null}
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-400">
                      <span>{document.category}</span>
                      <span>{languageNames[document.language]}</span>
                      <span>{readableSize(document.size)}</span>
                      {document.status === "indexed" ? <span>{document.chunks} chunks</span> : null}
                    </div>
                    {document.status === "failed" && document.indexingError ? (
                      <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">
                        <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                        <span>{document.indexingError}</span>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <button
                      className={`relative h-7 w-12 rounded-full transition ${document.enabled ? "bg-emerald-500" : "bg-slate-300"}`}
                      disabled={pending}
                      onClick={() => toggleDocument(document)}
                      title={document.enabled ? "Disable" : "Enable"}
                      type="button"
                    >
                      <span className={`absolute top-1 size-5 rounded-full bg-white shadow transition-all ${document.enabled ? "left-6" : "left-1"}`} />
                    </button>
                    <button
                      className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                      disabled={pending || indexing || !document.enabled}
                      onClick={() => reindexDocument(document)}
                      type="button"
                    >
                      {indexing ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <RotateCw aria-hidden="true" className="size-4" />}
                      Re-index
                    </button>
                    <button
                      aria-label={`Delete ${document.title}`}
                      className="flex size-9 items-center justify-center rounded-xl border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-40"
                      disabled={pending || document.status === "processing"}
                      onClick={() => deleteDocument(document)}
                      type="button"
                    >
                      <Trash2 aria-hidden="true" className="size-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <BookOpenText aria-hidden="true" className="mx-auto size-10 text-slate-300" />
          <h2 className="mt-4 font-semibold text-slate-900">No knowledge documents yet</h2>
          <p className="mt-2 text-sm text-slate-500">Upload a supported file to extract, chunk, embed, and index it.</p>
        </div>
      )}

      {showUpload ? (
        <div aria-modal="true" className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 backdrop-blur-sm sm:items-center sm:p-5" role="dialog">
          <form className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl" onSubmit={uploadDocument}>
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-7">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Upload knowledge document</h2>
                <p className="mt-0.5 text-xs text-slate-500">Maximum file size: 10MB</p>
              </div>
              <button aria-label="Close upload" className="flex size-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100" disabled={uploading} onClick={() => setShowUpload(false)} type="button">
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>
            <div className="space-y-5 p-5 sm:p-7">
              <label className="block space-y-2 text-sm font-medium text-slate-700">
                File
                <span className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 text-center hover:border-amber-400">
                  <UploadCloud aria-hidden="true" className="size-7 text-slate-400" />
                  <span className="mt-2 text-sm text-slate-600">PDF, DOCX, TXT, MD, CSV, JSON, HTML, JPG, PNG, or WebP</span>
                  <input accept=".pdf,.docx,.txt,.md,.csv,.json,.html,.htm,.jpg,.jpeg,.png,.webp" className="mt-3 block max-w-full text-xs text-slate-500" name="document" required type="file" />
                </span>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  Title
                  <input className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10" name="title" required />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  Category / topic
                  <input className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10" name="category" placeholder="History" required />
                </label>
              </div>
              <label className="block space-y-2 text-sm font-medium text-slate-700">
                Language
                <select className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10" defaultValue="auto" name="language">
                  <option value="auto">Auto detect</option>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="pa">Punjabi</option>
                  <option value="hinglish">Hinglish</option>
                </select>
              </label>
              <label className="block space-y-2 text-sm font-medium text-slate-700">
                Description <span className="font-normal text-slate-400">(optional)</span>
                <textarea className="min-h-24 w-full resize-y rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10" name="description" />
              </label>
              <label className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 text-sm font-medium text-slate-700">
                <input className="size-4 accent-slate-950" defaultChecked name="enabled" type="checkbox" value="true" />
                Enable and index immediately
              </label>
              {notice?.type === "error" ? (
                <p className="text-sm text-red-600" role="alert">{notice.text}</p>
              ) : null}
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4 sm:px-7">
              <button className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50" disabled={uploading} onClick={() => setShowUpload(false)} type="button">Cancel</button>
              <button className="inline-flex h-10 min-w-32 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60" disabled={uploading} type="submit">
                {uploading ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <UploadCloud aria-hidden="true" className="size-4" />}
                {uploading ? "Uploading…" : "Upload"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
