"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/session";
import {
  menuItemApiRequest,
  type MenuItem,
  type MenuItemInput,
} from "@/lib/menu-items";

export type MenuActionResult = { success: boolean; error?: string };

async function runMenuMutation(operation: () => Promise<unknown>): Promise<MenuActionResult> {
  await requireAdmin();
  try {
    await operation();
    revalidatePath("/menu");
    return { success: true };
  } catch (error) {
    console.error("Menu mutation failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Menu update failed.",
    };
  }
}

export async function createMenuItemAction(input: MenuItemInput) {
  return runMenuMutation(() => menuItemApiRequest<MenuItem>("", {
    method: "POST",
    body: JSON.stringify(input),
  }));
}

export async function updateMenuItemAction(id: string, input: MenuItemInput) {
  return runMenuMutation(() => menuItemApiRequest<MenuItem>(`/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(input),
  }));
}

export async function deleteMenuItemAction(id: string) {
  return runMenuMutation(() => menuItemApiRequest(`/${encodeURIComponent(id)}`, {
    method: "DELETE",
  }));
}

export async function toggleMenuItemAction(id: string, enabled: boolean) {
  return runMenuMutation(() => menuItemApiRequest<MenuItem>(
    `/${encodeURIComponent(id)}/enabled`,
    { method: "PATCH", body: JSON.stringify({ enabled }) },
  ));
}

export async function reorderMenuItemsAction(items: Array<{ id: string; order: number }>) {
  return runMenuMutation(() => menuItemApiRequest<MenuItem[]>("/reorder", {
    method: "PATCH",
    body: JSON.stringify({ items }),
  }));
}
