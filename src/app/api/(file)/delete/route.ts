import { NextRequest, NextResponse } from "next/server";
import { db } from "~/utils/db";
import { deleteFragment } from "~/utils/cloud";

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("id");

    if (!fileId) {
      return NextResponse.json({ success: false, message: "File ID missing" }, { status: 400 });
    }

    // Find file in DB
    const file = await db.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return NextResponse.json({ success: false, message: "File not found" }, { status: 404 });
    }

    // Delete each fragment from cloud storage
    const deletionResults = await Promise.all(
      file.fragments.map((url) => deleteFragment(url))
    );

    const hasFailures = deletionResults.some((res) => !res.success);
    if (hasFailures) {
      return NextResponse.json({ success: false, message: "Failed to delete some fragments" }, { status: 500 });
    }

    // Delete file record from DB
    await db.file.delete({ where: { id: fileId } });

    return NextResponse.json({ success: true, message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
