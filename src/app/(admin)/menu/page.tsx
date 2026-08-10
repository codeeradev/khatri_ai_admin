import type { Metadata } from "next";

import { MenuItemsManager } from "@/components/menu-items-manager";
import { PageHeading } from "@/components/page-heading";
import { requireAdmin } from "@/lib/auth/session";
import { getMenuItems, type MenuItem } from "@/lib/menu-items";

export const metadata: Metadata = { title: "Menu" };

export default async function MenuPage() {
  await requireAdmin();
  let items: MenuItem[] = [];
  let loadError: string | undefined;

  try {
    items = await getMenuItems();
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Could not load menu items.";
  }

  return (
    <>
      <PageHeading description="Manage chatbot menu cards and their localized labels." title="Menu" />
      <MenuItemsManager
        initialItems={items}
        key={items.map((item) => `${item._id}:${item.updatedAt}`).join("|")}
        loadError={loadError}
      />
    </>
  );
}
