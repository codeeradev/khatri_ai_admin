import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/auth/session";
import { forwardMediaUpload } from "@/lib/media";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const media = await forwardMediaUpload(await request.formData());
    return NextResponse.json({ success: true, data: media }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Image upload failed." },
      { status: 502 },
    );
  }
}
