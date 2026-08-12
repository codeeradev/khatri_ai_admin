import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/auth/session";
import { knowledgeApiRequest } from "@/lib/knowledge";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await knowledgeApiRequest(`/${encodeURIComponent((await params).id)}`, { method: "DELETE" });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Could not delete document." }, { status: 502 });
  }
}
