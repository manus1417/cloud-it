import { verify } from "argon2";
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/utils/db";
import { decryptFragment, mergeFragments } from "~/utils/file";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const fileId = formData.get("fileName") as string;
    const secretKey = formData.get("secretKey") as string;

    if (!fileId) {
      console.log("No file found");
      return NextResponse.json(
        { success: false, message: "No file found" },
        { status: 400 }
      );
    }

    if (!secretKey) {
      console.log("No secret key sent");
      return NextResponse.json(
        { success: false, message: "No secret key sent" },
        { status: 400 }
      );
    }

    const fileRecord = await db.file.findFirst({
      where: { id: fileId },
    });

    if (!fileRecord) {
      console.log("File not found in database");
      return NextResponse.json(
        { success: false, message: "File not found" },
        { status: 404 }
      );
    }

    const { fragments: fragmentLinks, key } = fileRecord;

    const verifyKey = await verify(key, secretKey);
    if (!verifyKey) {
      console.log("Invalid secret key");
      return NextResponse.json(
        { success: false, message: "Invalid secret key" },
        { status: 400 }
      );
    }

    // Fetch and decrypt each fragment
    const fragments = await Promise.all(
      fragmentLinks.map(async (fragmentLink) => {
        const res = await fetch(fragmentLink);
        if (!res.ok) throw new Error(`Failed to fetch fragment: ${fragmentLink}`);
        return res.blob();
      })
    );

    const decryptedFragments = await Promise.all(
      fragments.map(async (fragment) => {
        return new Blob([await decryptFragment(fragment, secretKey)]);
      })
    );

    const file = await mergeFragments(decryptedFragments);
    const fileData = await file.arrayBuffer();

    return new Response(fileData, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": 'attachment; filename="image.jpg"',
      },
    });

  } catch (error: unknown) {
    console.error(error instanceof Error ? error.message : "An unknown error occurred");

    return new Response(
      JSON.stringify({ success: false, message: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
