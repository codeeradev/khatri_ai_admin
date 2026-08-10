import type { Metadata } from "next";

import { KnowledgeManager } from "@/components/knowledge-manager";
import { PageHeading } from "@/components/page-heading";
import { requireAdmin } from "@/lib/auth/session";
import { getKnowledgeDocuments, type KnowledgeDocument } from "@/lib/knowledge";

export const metadata: Metadata = { title: "Knowledge Base" };

export default async function KnowledgePage() {
  await requireAdmin();
  let documents: KnowledgeDocument[] = [];
  let loadError: string | undefined;

  try {
    documents = await getKnowledgeDocuments();
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Could not load knowledge documents.";
  }

  return (
    <>
      <PageHeading description="Manage indexed documents and knowledge sources." title="Knowledge Base" />
      <KnowledgeManager
        initialDocuments={documents}
        key={`${loadError || "ready"}:${documents.map((document) => `${document._id}:${document.updatedAt}`).join("|")}`}
        loadError={loadError}
      />
    </>
  );
}
