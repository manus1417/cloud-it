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

export function FileTable({ files }: { files: File[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>File Id</TableHead>
          <TableHead>File Name</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {files.map((file) => (
          <TableRow key={file.id}>
            <TableCell>{file.id}</TableCell>
            <TableCell>{file.name}</TableCell>
            <TableCell>
              <Button asChild>
                <Link href={`/download/${file.id}`}>Download</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
