import { put } from "@vercel/blob";

export const uploadFragment = async (
  fragment: Blob,
  fileName: string,
  index: number
) => {
  const fragmentName = `${fileName}-${index}`;
  try {
    const reply = await put(fragmentName, fragment, { access: "public" });
    return { success: true, url: reply.downloadUrl };
  } catch (error) {
    return { success: false, error };
  }
};
