"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Edit3,
  ImageIcon,
  ListTree,
  LoaderCircle,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import {
  createMenuItemAction,
  deleteMenuItemAction,
  reorderMenuItemsAction,
  toggleMenuItemAction,
  updateMenuItemAction,
} from "@/app/actions/menu-items";
import { ImageUploadField } from "@/components/image-upload-field";
import type { LocalizedMenuText, MenuItem, MenuItemInput } from "@/lib/menu-items";

type MenuItemsManagerProps = {
  initialItems: MenuItem[];
  loadError?: string;
};

const languages: Array<{ key: keyof LocalizedMenuText; label: string }> = [
  { key: "en", label: "English" },
  { key: "hi", label: "Hindi" },
  { key: "pa", label: "Punjabi" },
  { key: "hinglish", label: "Hinglish" },
];

const emptyLocalized = (): LocalizedMenuText => ({ en: "", hi: "", pa: "", hinglish: "" });

function itemDraft(item?: MenuItem, order = 0): MenuItemInput {
  if (!item) {
    return {
      key: "",
      labels: emptyLocalized(),
      queries: emptyLocalized(),
      icon: "",
      image: "",
      order,
      enabled: true,
    };
  }
  return {
    key: item.key,
    labels: { ...item.labels },
    queries: { ...item.queries },
    icon: item.icon || "",
    image: item.image || "",
    order: item.order,
    enabled: item.enabled,
  };
}

export function MenuItemsManager({ initialItems, loadError }: MenuItemsManagerProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [editing, setEditing] = useState<MenuItem | null | undefined>(undefined);
  const [draft, setDraft] = useState<MenuItemInput>(() => itemDraft());
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(
    loadError ? { type: "error", text: loadError } : null,
  );
  const [pending, startTransition] = useTransition();

  function openCreate() {
    const nextOrder = items.length ? Math.max(...items.map((item) => item.order)) + 1 : 0;
    setEditing(null);
    setDraft(itemDraft(undefined, nextOrder));
    setNotice(null);
  }

  function openEdit(item: MenuItem) {
    setEditing(item);
    setDraft(itemDraft(item));
    setNotice(null);
  }

  function saveItem() {
    const localizedMissing = languages.some(({ key }) => !draft.labels[key].trim());
    if (!draft.key.trim() || localizedMissing) {
      setNotice({ type: "error", text: "Key and every localized label are required." });
      return;
    }

    const input = { ...draft, queries: { ...draft.labels } };
    startTransition(async () => {
      const result = editing
        ? await updateMenuItemAction(editing._id, input)
        : await createMenuItemAction(input);
      if (!result.success) {
        setNotice({ type: "error", text: result.error || "Could not save menu item." });
        return;
      }
      setEditing(undefined);
      router.refresh();
    });
  }

  function toggleItem(item: MenuItem) {
    const enabled = !item.enabled;
    setItems((current) => current.map((candidate) => (
      candidate._id === item._id ? { ...candidate, enabled } : candidate
    )));
    startTransition(async () => {
      const result = await toggleMenuItemAction(item._id, enabled);
      if (!result.success) {
        setItems((current) => current.map((candidate) => (
          candidate._id === item._id ? { ...candidate, enabled: item.enabled } : candidate
        )));
        setNotice({ type: "error", text: result.error || "Could not update menu item." });
        return;
      }
      setNotice({ type: "success", text: enabled ? "Menu item enabled." : "Menu item disabled." });
      router.refresh();
    });
  }

  function removeItem(item: MenuItem) {
    if (!window.confirm(`Delete “${item.labels.en}”? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteMenuItemAction(item._id);
      if (!result.success) {
        setNotice({ type: "error", text: result.error || "Could not delete menu item." });
        return;
      }
      setItems((current) => current.filter((candidate) => candidate._id !== item._id));
      setNotice({ type: "success", text: "Menu item deleted." });
      router.refresh();
    });
  }

  function moveItem(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length || pending) return;
    const previous = items;
    const reordered = [...items];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    const normalized = reordered.map((item, order) => ({ ...item, order }));
    setItems(normalized);

    startTransition(async () => {
      const result = await reorderMenuItemsAction(
        normalized.map((item) => ({ id: item._id, order: item.order })),
      );
      if (!result.success) {
        setItems(previous);
        setNotice({ type: "error", text: result.error || "Could not reorder menu items." });
        return;
      }
      setNotice({ type: "success", text: "Menu order updated." });
      router.refresh();
    });
  }

  return (
    <div className="p-5 sm:p-8">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {items.length} {items.length === 1 ? "menu item" : "menu items"}
          </p>
          {notice ? (
            <p className={`mt-1 text-sm ${notice.type === "error" ? "text-red-600" : "text-emerald-700"}`} role="status">
              {notice.text}
            </p>
          ) : null}
        </div>
        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
          onClick={openCreate}
          type="button"
        >
          <Plus aria-hidden="true" className="size-4" />
          New menu item
        </button>
      </div>

      {items.length ? (
        <div className="space-y-3">
          {items.map((item, index) => (
            <article
              className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${item.enabled ? "" : "opacity-60"}`}
              key={item._id}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex shrink-0 flex-col gap-1">
                  <button
                    aria-label={`Move ${item.labels.en} up`}
                    className="flex size-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30"
                    disabled={index === 0 || pending}
                    onClick={() => moveItem(index, -1)}
                    type="button"
                  >
                    <ArrowUp aria-hidden="true" className="size-3.5" />
                  </button>
                  <button
                    aria-label={`Move ${item.labels.en} down`}
                    className="flex size-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30"
                    disabled={index === items.length - 1 || pending}
                    onClick={() => moveItem(index, 1)}
                    type="button"
                  >
                    <ArrowDown aria-hidden="true" className="size-3.5" />
                  </button>
                </div>

                <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-amber-100 text-lg font-semibold text-amber-800">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img alt="" className="size-full object-cover" src={item.image} />
                  ) : item.icon || <ImageIcon aria-hidden="true" className="size-5" />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-slate-950">{item.labels.en}</h2>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-500">{item.key}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${item.enabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {item.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  {item.image ? <p className="mt-1 truncate text-xs text-slate-400">Image: {item.image}</p> : null}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    aria-label={`${item.enabled ? "Disable" : "Enable"} ${item.labels.en}`}
                    className={`relative hidden h-7 w-12 rounded-full transition sm:block ${item.enabled ? "bg-emerald-500" : "bg-slate-300"}`}
                    disabled={pending}
                    onClick={() => toggleItem(item)}
                    type="button"
                  >
                    <span className={`absolute top-1 size-5 rounded-full bg-white shadow transition-all ${item.enabled ? "left-6" : "left-1"}`} />
                  </button>
                  <button
                    aria-label={`Edit ${item.labels.en}`}
                    className="flex size-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-950"
                    onClick={() => openEdit(item)}
                    type="button"
                  >
                    <Edit3 aria-hidden="true" className="size-4" />
                  </button>
                  <button
                    aria-label={`Delete ${item.labels.en}`}
                    className="flex size-9 items-center justify-center rounded-xl border border-red-200 text-red-500 hover:bg-red-50"
                    disabled={pending}
                    onClick={() => removeItem(item)}
                    type="button"
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                  </button>
                </div>
              </div>
              <button
                className="mt-3 w-full rounded-lg bg-slate-100 py-2 text-xs font-medium text-slate-600 sm:hidden"
                disabled={pending}
                onClick={() => toggleItem(item)}
                type="button"
              >
                {item.enabled ? "Disable item" : "Enable item"}
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <ListTree aria-hidden="true" className="mx-auto size-10 text-slate-300" />
          <h2 className="mt-4 font-semibold text-slate-900">No menu items yet</h2>
          <p className="mt-2 text-sm text-slate-500">Create as many chatbot menu items as you need.</p>
        </div>
      )}

      {editing !== undefined ? (
        <div aria-modal="true" className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 backdrop-blur-sm sm:items-center sm:p-5" role="dialog">
          <div className="max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-7">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">{editing ? "Edit menu item" : "Create menu item"}</h2>
                <p className="mt-0.5 text-xs text-slate-500">The localized label is displayed and sent when a card is selected.</p>
              </div>
              <button aria-label="Close editor" className="flex size-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100" disabled={pending} onClick={() => setEditing(undefined)} type="button">
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>

            <div className="space-y-6 p-5 sm:p-7">
              <div className="grid gap-4 sm:grid-cols-[1fr_130px]">
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  Key
                  <input
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 font-mono text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                    onChange={(event) => setDraft((current) => ({ ...current, key: event.target.value.toLowerCase().replace(/\s+/g, "-") }))}
                    placeholder="community-events"
                    value={draft.key}
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  Order
                  <input
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                    onChange={(event) => setDraft((current) => ({ ...current, order: Number(event.target.value) }))}
                    type="number"
                    value={draft.order}
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  Icon
                  <input
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                    onChange={(event) => setDraft((current) => ({ ...current, icon: event.target.value }))}
                    placeholder="Emoji or short text, e.g. 🏛️"
                    value={draft.icon}
                  />
                </label>
                <ImageUploadField
                  label="Card image"
                  onChange={(value) => setDraft((current) => ({ ...current, image: value }))}
                  onNotice={setNotice}
                  value={draft.image}
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {languages.map(({ key, label }) => (
                  <div className="rounded-2xl border border-slate-200 p-4" key={key}>
                    <h3 className="text-sm font-semibold text-slate-900">{label}</h3>
                    <label className="mt-3 block space-y-2 text-xs font-medium text-slate-600">
                      Label
                      <input
                        className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                        onChange={(event) => setDraft((current) => ({ ...current, labels: { ...current.labels, [key]: event.target.value } }))}
                        value={draft.labels[key]}
                      />
                    </label>
                  </div>
                ))}
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-medium text-slate-700">
                <input checked={draft.enabled} className="size-4 accent-slate-950" onChange={(event) => setDraft((current) => ({ ...current, enabled: event.target.checked }))} type="checkbox" />
                Enabled and visible in the chatbot menu
              </label>
              {notice?.type === "error" ? <p className="text-sm text-red-600" role="alert">{notice.text}</p> : null}
            </div>

            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:px-7">
              <button className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50" disabled={pending} onClick={() => setEditing(undefined)} type="button">Cancel</button>
              <button className="inline-flex h-10 min-w-32 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60" disabled={pending} onClick={saveItem} type="button">
                {pending ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <Check aria-hidden="true" className="size-4" />}
                {pending ? "Saving…" : "Save item"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
