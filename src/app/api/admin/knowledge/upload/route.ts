import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/auth/session";
import { forwardKnowledgeUpload } from "@/lib/knowledge";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const document = await forwardKnowledgeUpload(await request.formData());
    return NextResponse.json({ success: true, data: document }, { status: 202 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed.",
      },
      { status: 502 },
    );
  }
}
