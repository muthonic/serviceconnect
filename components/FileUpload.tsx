import { useState } from "react";
import { uploadFile } from "@/lib/supabase-storage";

interface FileUploadProps {
  onUploadComplete: (fileUrl: string) => void;
  onError: (error: string) => void;
  accept?: string;
  maxSize?: number; // in bytes
  className?: string;
  bucket?: string;
}

export default function FileUpload({
  onUploadComplete,
  onError,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB default
  className = "",
  bucket = "uploads",
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSize) {
      onError(`File size must be less than ${maxSize / 1024 / 1024}MB`);
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress("Initializing upload...");
      
      setUploadProgress("Uploading to Supabase...");
      const fileUrl = await uploadFile(file, bucket);
      
      setUploadProgress("Upload complete!");
      onUploadComplete(fileUrl);
    } catch (error) {
      console.error("Upload error:", error);
      onError(error instanceof Error ? error.message : "Failed to upload file");
    } finally {
      setIsUploading(false);
      setUploadProgress("");
    }
  };

  return (
    <div className={className}>
      <input
        type="file"
        accept={accept}
        onChange={handleFileChange}
        disabled={isUploading}
        aria-label="Upload file"
        title="Choose a file to upload"
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
      />
      {isUploading && (
        <div className="mt-2">
          <p className="text-sm text-gray-500">{uploadProgress}</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div className="bg-blue-600 h-2.5 rounded-full animate-pulse w-full"></div>
          </div>
        </div>
      )}
    </div>
  );
} 