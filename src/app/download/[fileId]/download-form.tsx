"use client";

import { useState } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Alert, AlertDescription } from "~/components/ui/alert";

export function DownloadForm({ fileId }: { fileId: string }) {
  const [secretKey, setSecretKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data = new FormData();
      data.set("fileName", fileId);
      data.set("secretKey", secretKey);
      const res = await fetch("/api/download", {
        method: "POST",
        body: data,
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.style.display = "none";
      link.href = url;
      link.download = `${fileId}.jpg`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);

      if (res.status != 200) throw new Error(res.statusText);
    } catch (err) {
  console.error("Download error:", err); // ✅ Logs the error
  setError("An unexpected error occurred. Please try again.");

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="secretKey">Secret Key</Label>
        <Input
          id="secretKey"
          type="password"
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
          required
        />
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Processing..." : "Download File"}
      </Button>
    </form>
  );
}
