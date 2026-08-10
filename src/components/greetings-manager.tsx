"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Edit3,
  LoaderCircle,
  MessageSquareText,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import {
  createGreetingAction,
  deleteGreetingAction,
  toggleGreetingAction,
  updateGreetingAction,
} from "@/app/actions/greetings";
import type { Greeting, GreetingInput, GreetingResponses } from "@/lib/greetings";

type GreetingsManagerProps = {
  initialGreetings: Greeting[];
  loadError?: string;
};

const languageFields: Array<{ key: keyof GreetingResponses; label: string; hint: string }> = [
  { key: "en", label: "English", hint: "Welcome to Khatri AI Assistant…" },
  { key: "hi", label: "Hindi", hint: "खत्री AI असिस्टेंट में आपका स्वागत है…" },
  { key: "pa", label: "Punjabi", hint: "ਖੱਤਰੀ AI ਅਸਿਸਟੈਂਟ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ…" },
  { key: "hinglish", label: "Hinglish", hint: "Khatri AI Assistant mein aapka welcome hai…" },
];

const emptyDraft: GreetingInput = {
  name: "",
  triggers: [],
  responses: { en: "", hi: "", pa: "", hinglish: "" },
  showMenu: true,
  enabled: true,
  priority: 0,
};

function greetingDraft(greeting?: Greeting): GreetingInput {
  if (!greeting) return structuredClone(emptyDraft);
  return {
    name: greeting.name,
    triggers: [...greeting.triggers],
    responses: { ...greeting.responses },
    showMenu: greeting.showMenu,
    enabled: greeting.enabled,
    priority: greeting.priority,
  };
}

export function GreetingsManager({ initialGreetings, loadError }: GreetingsManagerProps) {
  const router = useRouter();
  const [greetings, setGreetings] = useState(initialGreetings);
  const [editing, setEditing] = useState<Greeting | null | undefined>(undefined);
  const [draft, setDraft] = useState<GreetingInput>(() => greetingDraft());
  const [triggerInput, setTriggerInput] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    loadError ? { type: "error", text: loadError } : null,
  );
  const [pending, startTransition] = useTransition();

  function openCreate() {
    setEditing(null);
    setDraft(greetingDraft());
    setTriggerInput("");
    setMessage(null);
  }

  function openEdit(greeting: Greeting) {
    setEditing(greeting);
    setDraft(greetingDraft(greeting));
    setTriggerInput("");
    setMessage(null);
  }

  function closeEditor() {
    if (!pending) setEditing(undefined);
  }

  function addTrigger() {
    const trigger = triggerInput.trim();
    if (!trigger) return;
    if (!draft.triggers.some((item) => item.toLocaleLowerCase() === trigger.toLocaleLowerCase())) {
      setDraft((current) => ({ ...current, triggers: [...current.triggers, trigger] }));
    }
    setTriggerInput("");
  }

  function removeTrigger(index: number) {
    setDraft((current) => ({
      ...current,
      triggers: current.triggers.filter((_, triggerIndex) => triggerIndex !== index),
    }));
  }

  function saveGreeting() {
    if (!draft.name.trim() || !draft.triggers.length || languageFields.some(({ key }) => !draft.responses[key].trim())) {
      setMessage({ type: "error", text: "Name, at least one trigger, and all four responses are required." });
      return;
    }

    startTransition(async () => {
      const result = editing
        ? await updateGreetingAction(editing._id, draft)
        : await createGreetingAction(draft);

      if (!result.success) {
        setMessage({ type: "error", text: result.error || "Could not save greeting." });
        return;
      }

      setEditing(undefined);
      setMessage({ type: "success", text: editing ? "Greeting updated." : "Greeting created." });
      router.refresh();
    });
  }

  function toggleGreeting(greeting: Greeting) {
    const enabled = !greeting.enabled;
    setGreetings((current) => current.map((item) => (
      item._id === greeting._id ? { ...item, enabled } : item
    )));

    startTransition(async () => {
      const result = await toggleGreetingAction(greeting._id, enabled);
      if (!result.success) {
        setGreetings((current) => current.map((item) => (
          item._id === greeting._id ? { ...item, enabled: greeting.enabled } : item
        )));
        setMessage({ type: "error", text: result.error || "Could not update greeting." });
        return;
      }
      setMessage({ type: "success", text: enabled ? "Greeting enabled." : "Greeting disabled." });
      router.refresh();
    });
  }

  function deleteGreeting(greeting: Greeting) {
    if (!window.confirm(`Delete “${greeting.name}”? This cannot be undone.`)) return;

    startTransition(async () => {
      const result = await deleteGreetingAction(greeting._id);
      if (!result.success) {
        setMessage({ type: "error", text: result.error || "Could not delete greeting." });
        return;
      }
      setGreetings((current) => current.filter((item) => item._id !== greeting._id));
      setMessage({ type: "success", text: "Greeting deleted." });
      router.refresh();
    });
  }

  return (
    <div className="p-5 sm:p-8">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {greetings.length} {greetings.length === 1 ? "greeting rule" : "greeting rules"}
          </p>
          {message ? (
            <p
              className={`mt-1 text-sm ${message.type === "error" ? "text-red-600" : "text-emerald-700"}`}
              role="status"
            >
              {message.text}
            </p>
          ) : null}
        </div>
        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
          onClick={openCreate}
          type="button"
        >
          <Plus aria-hidden="true" className="size-4" />
          New greeting
        </button>
      </div>

      {greetings.length ? (
        <div className="space-y-4">
          {greetings.map((greeting) => (
            <article
              className={`rounded-2xl border bg-white p-5 shadow-sm transition ${
                greeting.enabled ? "border-slate-200" : "border-slate-200 opacity-65"
              }`}
              key={greeting._id}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-slate-950">{greeting.name}</h2>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      greeting.enabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                    }`}>
                      {greeting.enabled ? "Enabled" : "Disabled"}
                    </span>
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                      Priority {greeting.priority}
                    </span>
                    {greeting.showMenu ? (
                      <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                        Shows menu
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                    {greeting.responses.en}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {greeting.triggers.map((trigger) => (
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600" key={trigger}>
                        {trigger}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    aria-label={`${greeting.enabled ? "Disable" : "Enable"} ${greeting.name}`}
                    className={`relative h-7 w-12 rounded-full transition ${greeting.enabled ? "bg-emerald-500" : "bg-slate-300"}`}
                    disabled={pending}
                    onClick={() => toggleGreeting(greeting)}
                    type="button"
                  >
                    <span className={`absolute top-1 size-5 rounded-full bg-white shadow transition-all ${greeting.enabled ? "left-6" : "left-1"}`} />
                  </button>
                  <button
                    aria-label={`Edit ${greeting.name}`}
                    className="flex size-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
                    onClick={() => openEdit(greeting)}
                    type="button"
                  >
                    <Edit3 aria-hidden="true" className="size-4" />
                  </button>
                  <button
                    aria-label={`Delete ${greeting.name}`}
                    className="flex size-9 items-center justify-center rounded-xl border border-red-200 text-red-500 transition hover:bg-red-50"
                    disabled={pending}
                    onClick={() => deleteGreeting(greeting)}
                    type="button"
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <MessageSquareText aria-hidden="true" className="mx-auto size-10 text-slate-300" />
          <h2 className="mt-4 font-semibold text-slate-900">No greeting rules yet</h2>
          <p className="mt-2 text-sm text-slate-500">Create a rule to respond without calling Gemini.</p>
        </div>
      )}

      {editing !== undefined ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-5"
          role="dialog"
        >
          <div className="max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-7">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  {editing ? "Edit greeting" : "Create greeting"}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">Matching is exact after punctuation, case, and spacing are normalized.</p>
              </div>
              <button
                aria-label="Close editor"
                className="flex size-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
                onClick={closeEditor}
                type="button"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>

            <div className="space-y-6 p-5 sm:p-7">
              <div className="grid gap-5 sm:grid-cols-[1fr_140px]">
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  Name
                  <input
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                    onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Default welcome"
                    value={draft.name}
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  Priority
                  <input
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                    onChange={(event) => setDraft((current) => ({ ...current, priority: Number(event.target.value) }))}
                    type="number"
                    value={draft.priority}
                  />
                </label>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700" htmlFor="trigger">
                  Trigger phrases
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                    id="trigger"
                    onChange={(event) => setTriggerInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addTrigger();
                      }
                    }}
                    placeholder="Type a phrase and press Enter"
                    value={triggerInput}
                  />
                  <button
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-medium hover:bg-slate-50"
                    onClick={addTrigger}
                    type="button"
                  >
                    <Plus aria-hidden="true" className="size-4" />
                    Add
                  </button>
                </div>
                <div className="mt-3 flex min-h-8 flex-wrap gap-2">
                  {draft.triggers.map((trigger, index) => (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 py-1 pl-2.5 pr-1 text-xs text-slate-700" key={`${trigger}-${index}`}>
                      {trigger}
                      <button
                        aria-label={`Remove ${trigger}`}
                        className="flex size-5 items-center justify-center rounded hover:bg-slate-200"
                        onClick={() => removeTrigger(index)}
                        type="button"
                      >
                        <X aria-hidden="true" className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {languageFields.map(({ key, label, hint }) => (
                  <label className="space-y-2 text-sm font-medium text-slate-700" key={key}>
                    {label} response
                    <textarea
                      className="min-h-28 w-full resize-y rounded-xl border border-slate-200 p-3 text-sm leading-6 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                      onChange={(event) => setDraft((current) => ({
                        ...current,
                        responses: { ...current.responses, [key]: event.target.value },
                      }))}
                      placeholder={hint}
                      value={draft.responses[key]}
                    />
                  </label>
                ))}
              </div>

              <div className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:gap-8">
                <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-700">
                  <input
                    checked={draft.enabled}
                    className="size-4 accent-slate-950"
                    onChange={(event) => setDraft((current) => ({ ...current, enabled: event.target.checked }))}
                    type="checkbox"
                  />
                  Enabled
                </label>
                <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-700">
                  <input
                    checked={draft.showMenu}
                    className="size-4 accent-slate-950"
                    onChange={(event) => setDraft((current) => ({ ...current, showMenu: event.target.checked }))}
                    type="checkbox"
                  />
                  Show chatbot menu with response
                </label>
              </div>

              {message?.type === "error" ? (
                <p className="text-sm text-red-600" role="alert">{message.text}</p>
              ) : null}
            </div>

            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:px-7">
              <button
                className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                disabled={pending}
                onClick={closeEditor}
                type="button"
              >
                Cancel
              </button>
              <button
                className="inline-flex h-10 min-w-32 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                disabled={pending}
                onClick={saveGreeting}
                type="button"
              >
                {pending ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <Check aria-hidden="true" className="size-4" />}
                {pending ? "Saving…" : "Save greeting"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
