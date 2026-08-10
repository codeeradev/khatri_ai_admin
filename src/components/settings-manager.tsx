"use client";

import { useState, useTransition } from "react";
import { Check, ImageIcon, LoaderCircle, Save, Sparkles } from "lucide-react";

import { updateChatbotSettingsAction } from "@/app/actions/settings";
import { ImageUploadField } from "@/components/image-upload-field";
import type { ChatbotSettings } from "@/lib/settings";

type SettingsManagerProps = {
  initialSettings: ChatbotSettings;
  loadError?: string;
};

function isImageSource(value: string) {
  const source = value.trim();
  return /^(https?:\/\/|\.{1,2}\/|\/|data:image\/)/i.test(source) ||
    /\.(svg|png|jpe?g|webp|gif|ico)(\?.*)?$/i.test(source);
}

export function SettingsManager({ initialSettings, loadError }: SettingsManagerProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(
    loadError ? { type: "error", text: loadError } : null,
  );
  const [pending, startTransition] = useTransition();

  function setField(field: keyof ChatbotSettings, value: string) {
    setSettings((current) => ({ ...current, [field]: value }));
  }

  function saveSettings() {
    if (!settings.appName.trim() || !settings.assistantName.trim() ||
      !settings.shortDescription.trim() || !settings.welcomeHeading.trim()) {
      setNotice({
        type: "error",
        text: "App name, assistant name, description, and welcome heading are required.",
      });
      return;
    }

    startTransition(async () => {
      const result = await updateChatbotSettingsAction(settings);
      if (!result.success) {
        setNotice({ type: "error", text: result.error || "Could not save settings." });
        return;
      }
      setNotice({ type: "success", text: "Chatbot settings saved." });
    });
  }

  return (
    <div className="grid gap-6 p-5 xl:grid-cols-[minmax(0,1fr)_360px] sm:p-8">
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
          <h2 className="font-semibold text-slate-950">Brand and welcome content</h2>
          <p className="mt-1 text-sm text-slate-500">
            Changes appear in the chatbot after it is refreshed.
          </p>
        </div>
        <div className="space-y-5 p-5 sm:p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              App name
              <input
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                maxLength={120}
                onChange={(event) => setField("appName", event.target.value)}
                value={settings.appName}
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Assistant name
              <input
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                maxLength={120}
                onChange={(event) => setField("assistantName", event.target.value)}
                value={settings.assistantName}
              />
            </label>
          </div>

          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Welcome heading
            <input
              className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
              maxLength={240}
              onChange={(event) => setField("welcomeHeading", event.target.value)}
              value={settings.welcomeHeading}
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Short description
            <textarea
              className="min-h-24 w-full resize-y rounded-xl border border-slate-200 p-3 text-sm leading-6 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
              maxLength={500}
              onChange={(event) => setField("shortDescription", event.target.value)}
              value={settings.shortDescription}
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <ImageUploadField
              label="Logo"
              onChange={(value) => setField("logo", value)}
              onNotice={setNotice}
              value={settings.logo}
            />
            <ImageUploadField
              accept="image/jpeg,image/png,image/webp,image/gif,image/x-icon,.ico"
              helpText="JPG, PNG, WebP, GIF, or ICO up to 5MB."
              label="Favicon"
              onChange={(value) => setField("favicon", value)}
              onNotice={setNotice}
              value={settings.favicon}
            />
          </div>

          <ImageUploadField
            label="Assistant avatar"
            onChange={(value) => setField("assistantAvatar", value)}
            onNotice={setNotice}
            value={settings.assistantAvatar}
          />

          {notice ? (
            <div
              className={`rounded-xl px-4 py-3 text-sm ${
                notice.type === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
              }`}
              role="status"
            >
              {notice.text}
            </div>
          ) : null}

          <div className="flex justify-end">
            <button
              className="inline-flex h-10 min-w-36 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              disabled={pending}
              onClick={saveSettings}
              type="button"
            >
              {pending ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <Save aria-hidden="true" className="size-4" />}
              {pending ? "Saving…" : "Save settings"}
            </button>
          </div>
        </div>
      </section>

      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:sticky xl:top-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Preview</p>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-amber-500 text-slate-950">
              {settings.logo && isImageSource(settings.logo) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt="" className="size-full object-cover" src={settings.logo} />
              ) : settings.logo ? settings.logo : <Sparkles aria-hidden="true" className="size-5" />}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-950">{settings.assistantName || "Assistant"}</p>
              <p className="truncate text-xs text-slate-400">{settings.appName || "App name"}</p>
            </div>
          </div>
          <div className="mt-8 text-center">
            <div className="mx-auto flex size-16 items-center justify-center overflow-hidden rounded-2xl text-4xl">
              {settings.assistantAvatar && isImageSource(settings.assistantAvatar) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt="" className="size-full object-cover" src={settings.assistantAvatar} />
              ) : settings.assistantAvatar || <ImageIcon aria-hidden="true" className="size-7 text-slate-300" />}
            </div>
            <h3 className="mt-4 font-semibold text-slate-950">
              {settings.welcomeHeading || "Welcome heading"}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {settings.shortDescription || "Short description"}
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
          <Check aria-hidden="true" className="size-3.5 text-emerald-500" />
          Public settings never invoke Gemini.
        </div>
      </aside>
    </div>
  );
}
