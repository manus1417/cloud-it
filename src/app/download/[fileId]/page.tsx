import { DownloadForm } from "./download-form";

export default async function Page({
  params,
}: {
  params: Promise<{ fileId: string }>;
}) {
  const fileId = (await params).fileId;
  console.log(fileId);
  return (
    <div className="flex justify-center items-center">
      <DownloadForm fileId={fileId} />
    </div>
  );
}
