"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import type { File } from "@prisma/client";
import Link from "next/link";
import { useState } from "react";

export function FileTable({ files }: { files: File[] }) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileList, setFileList] = useState(files);

  const handleDelete = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    setDeleting(fileId);
    setError(null);

    try {
      const res = await fetch(`/api/delete?id=${fileId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete file");
      }

      // Remove file from UI
      setFileList((prev) => prev.filter((file) => file.id !== fileId));
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete file. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      {error && <p className="text-red-500">{error}</p>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>File Id</TableHead>
            <TableHead>File Name</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fileList.map((file) => (
            <TableRow key={file.id}>
              <TableCell>{file.id}</TableCell>
              <TableCell>{file.name}</TableCell>
              <TableCell className="space-x-2">
                <Button asChild>
                  <Link href={`/download/${file.id}`}>Download</Link>
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(file.id)}
                  disabled={deleting === file.id}
                >
                  {deleting === file.id ? "Deleting..." : "Delete"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
