import * as crypto from "crypto";
import { merge, split } from "@filego/js";
import { db } from "../utils/db";

interface FileChunk {
  index: number;
  blob: Blob;
}

const algorithm = "aes-256-ctr";

// Split a file into chunks
export const fragmentFile = async (file: Blob, chunkSize: number) => {
  const fragments = await split({ file, chunkSize });
  return fragments.chunks;
};

// Encrypt a file fragment
export const encryptFragment = async (fragment: Blob, key: string) => {
  key = crypto.createHash("sha256").update(String(key)).digest("base64").substring(0, 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  const fragmentBuffer = await fragment.arrayBuffer();
  const encryptedBuffer = Buffer.concat([
    iv,
    cipher.update(Buffer.from(fragmentBuffer)),
    cipher.final(),
  ]);

  return encryptedBuffer;
};

// Decrypt a file fragment
export const decryptFragment = async (fragment: Blob, key: string) => {
  key = crypto.createHash("sha256").update(String(key)).digest("base64").substring(0, 32);
  
  const fragmentBuffer = await fragment.arrayBuffer();
  const buffer = Buffer.from(fragmentBuffer);
  
  const iv = buffer.subarray(0, 16);
  const decipher = crypto.createDecipheriv(algorithm, key, iv);

  const decrypted = Buffer.concat([decipher.update(buffer.subarray(16)), decipher.final()]);
  return decrypted;
};

// Merge file fragments back into a file
export const mergeFragments = async (fragments: Blob[]) => {
  const fileChunks: FileChunk[] = fragments.map((blob, index) => ({
    index,
    blob,
  }));

  const merged = await merge({ chunks: fileChunks });
  return merged.blob;
};

// Store retrieve fragment URLs in the database
export const storeRetrieveFragmentUrls = async (fileId: string, fragmentUrls: string[]) => {
  try {
    await db.file.update({
      where: { id: fileId },
      data: { retrieveFragments: { set: fragmentUrls } }, 
    });

    return { success: true };
  } catch (error) {
    console.error("Error storing retrieve fragment URLs:", error);
    return { success: false, error };
  }
};
