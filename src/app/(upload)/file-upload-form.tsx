"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Alert, AlertDescription } from "~/components/ui/alert";

export default function FileUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [key, setKey] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setUploadStatus("❌ Please select a file to upload.");
      setIsError(true);
      return;
    }

    setUploading(true);
    setUploadStatus(null);
    setIsError(false);

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
        setUploadStatus("✅ File uploaded successfully!");
        setFile(null); 
        setKey(""); 
        (document.getElementById("fileInput") as HTMLInputElement).value = ""; 
      } else {
        setUploadStatus(data.message || "❌ Failed to upload file.");
        setIsError(true);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("❌ An error occurred during upload. Please try again.");
      setIsError(true);
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
        isError ? (
          <Alert variant="destructive"> {/*  Show error in alert */}
            <AlertDescription>{uploadStatus}</AlertDescription>
          </Alert>
        ) : (
          <p className="text-green-500 text-sm">{uploadStatus}</p> //Success message in green text
        )
      )}
    </form>
  );
}
