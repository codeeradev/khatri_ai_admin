import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/auth/session";
import { knowledgeApiRequest, type KnowledgeDocument } from "@/lib/knowledge";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const document = await knowledgeApiRequest<KnowledgeDocument>(`/${encodeURIComponent((await params).id)}/reindex`, { method: "POST" });
    return NextResponse.json({ success: true, data: document });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Could not re-index document." }, { status: 502 });
  }
}
