"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/session";
import { knowledgeApiRequest, type KnowledgeDocument } from "@/lib/knowledge";

export type KnowledgeActionResult = { success: boolean; error?: string };

async function runKnowledgeMutation(operation: () => Promise<unknown>): Promise<KnowledgeActionResult> {
  await requireAdmin();
  try {
    await operation();
    revalidatePath("/knowledge");
    return { success: true };
  } catch (error) {
    console.error("Knowledge mutation failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Knowledge update failed.",
    };
  }
}

export async function toggleKnowledgeDocumentAction(id: string, enabled: boolean) {
  return runKnowledgeMutation(() => knowledgeApiRequest<KnowledgeDocument>(
    `/${encodeURIComponent(id)}/enabled`,
    { method: "PATCH", body: JSON.stringify({ enabled }) },
  ));
}

export async function reindexKnowledgeDocumentAction(id: string) {
  return runKnowledgeMutation(() => knowledgeApiRequest<KnowledgeDocument>(
    `/${encodeURIComponent(id)}/reindex`,
    { method: "POST" },
  ));
}

export async function deleteKnowledgeDocumentAction(id: string) {
  return runKnowledgeMutation(() => knowledgeApiRequest(
    `/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  ));
}
