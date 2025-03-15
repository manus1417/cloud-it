import { put, del } from "@vercel/blob";

// Upload function 
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
    return { success: false, error: "Upload failed" };
  }
};

// Delete Function
export const deleteFragment = async (url: string) => {
  try {
    await del(url);
    return { success: true };
  } catch (error) {
    console.error("Error deleting fragment:", error);
    return { success: false, message: "Error deleting fragment" };
  }
};
