import * as crypto from "crypto";
import { merge, split } from "@filego/js";

interface FileChunk {
  index: number;
  blob: Blob;
}

const algorithm = "aes-256-ctr";

export const fragmentFile = async (file: Blob, chunkSize: number) => {
  const fragments = await split({ file, chunkSize });
  return fragments.chunks;
};

export const encryptFragment = async (fragment: Blob, key: string) => {
  // Hash the key
  key = crypto
    .createHash("sha256")
    .update(String(key))
    .digest("base64")
    .substring(0, 32);

  // Create an initialization vector (IV)
  const iv = crypto.randomBytes(16);

  // Create a new cipher using the algorithm, key and iv
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  // Create the updated buffer
  const fragmentBuffer = await fragment.arrayBuffer();
  const res = Buffer.concat([
    iv,
    cipher.update(Buffer.from(fragmentBuffer)),
    cipher.final(),
  ]);

  return res;
};

export const decryptFragment = async (fragment: Blob, key: string) => {
  // Hash the key
  key = crypto
    .createHash("sha256")
    .update(String(key))
    .digest("base64")
    .substring(0, 32);

  // Create a buffer from the fragment
  const fragmentBuffer = await fragment.arrayBuffer();
  const buffer = Buffer.from(fragmentBuffer);

  // Extract the IV from the buffer
  const iv = buffer.subarray(0, 16);

  // Create a decipher using the algorithm, key and iv
  const decipher = crypto.createDecipheriv(algorithm, key, iv);

  // Decrypt the buffer
  const decrypted = Buffer.concat([
    decipher.update(buffer.subarray(16)),
    decipher.final(),
  ]);

  return decrypted;
};

export const mergeFragments = async (fragments: Blob[] | File[]) => {
  // Transform Uint8Array[] to FileChunk[]
  const fileChunks: FileChunk[] = fragments.map((uint8Array, index) => ({
    index,
    blob: new Blob([uint8Array]),
  }));

  const merged = await merge({ chunks: fileChunks }); // Pass FileChunk[] to merge
  return merged.blob;
};
