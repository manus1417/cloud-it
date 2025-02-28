"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export default function FileUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [key, setKey] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setUploadStatus("Please select a file to upload.");
      return;
    }

    setUploading(true);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("secretKey", key);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadStatus("File uploaded successfully! 🎉");
        setFile(null); // ✅ Reset file input
        setKey(""); // ✅ Reset password input
        (document.getElementById("fileInput") as HTMLInputElement).value = ""; // ✅ Clear file input field
      } else {
        setUploadStatus(data.message || "Failed to upload file.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("An error occurred during upload. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          id="fileInput"
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
          aria-label="Select file to upload"
        />
      </div>
      <div>
        <label htmlFor="key">Password</label>
        <Input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          id="key"
          name="key"
          placeholder="Enter password"
          className="w-full"
        />
      </div>
      <Button type="submit" disabled={uploading} className="w-full">
        {uploading ? "Uploading..." : "Upload File"}
      </Button>
      {uploadStatus && (
        <p
          className={`text-sm ${
            uploadStatus.includes("successfully") ? "text-green-500" : "text-red-500"
          }`}
        >
          {uploadStatus}
        </p>
      )}
    </form>
  );
}
