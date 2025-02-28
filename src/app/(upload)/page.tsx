import { Metadata } from "next";
import FileUploadForm from "./file-upload-form";

export const metadata: Metadata = {
  title: "File Upload",
  description: "Upload your files",
};

export default function FileUploadPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-gray-900">
          File Upload
        </h1>
        <FileUploadForm />
      </div>
    </div>
  );
}
