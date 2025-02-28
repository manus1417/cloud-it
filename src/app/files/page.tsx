import { auth } from "@clerk/nextjs/server";
import { FileTable } from "~/components/site/file-table";
import { db } from "~/utils/db";

export default async function DownloadsPage() {
  const { userId } = await auth();

  const files = await db.file.findMany({
    where: {
      user: userId as string,
    },
  });

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Available Downloads</h1>
      <FileTable files={files} />
    </div>
  );
}
