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

    // Fetch the file record, including retrieveFragments
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

    const { retrieveFragments, key, name } = fileRecord;

    if (!retrieveFragments || retrieveFragments.length === 0) {
      console.log("No retrieve fragments found in database");
      return NextResponse.json(
        { success: false, message: "Retrieve fragments missing" },
        { status: 400 }
      );
    }

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
      retrieveFragments.map(async (fragmentUrl) => {
        try {
          const res = await fetch(fragmentUrl);
          if (!res.ok) throw new Error(`Failed to fetch fragment: ${fragmentUrl}`);
          return res.blob();
        } catch (error) {
          console.error(error);
          throw new Error(`Error fetching fragment: ${fragmentUrl}`);
        }
      })
    );

    const decryptedFragments = await Promise.all(
      fragments.map(async (fragment) => new Blob([await decryptFragment(fragment, secretKey)]))
    );

    const file = await mergeFragments(decryptedFragments);
    const fileData = await file.arrayBuffer();

    return new Response(fileData, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream", // Dynamic file type
        "Content-Disposition": `attachment; filename="${name}"`, // Use original filename
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
