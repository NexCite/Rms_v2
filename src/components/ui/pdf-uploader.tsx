import { UploadCloudIcon } from "lucide-react";
import React, { useCallback } from "react";

interface PDFUploaderProps {
  onUpload: (file: File) => void;
}

const PDFUploader: React.FC<PDFUploaderProps> = ({ onUpload }) => {
  const handleUpload = useCallback(
    (file: File) => {
      if (file.type === "application/pdf") {
        onUpload(file);
      } else {
        alert("Please upload a valid PDF file.");
      }
    },
    [onUpload]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLLabelElement>) => {
      event.preventDefault();
      handleUpload(event.dataTransfer.files[0]);
    },
    [handleUpload]
  );

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  return (
    <label
      className="flex flex-col items-center justify-center bg-white border border-black hover:bg-gray-100 hover:border-blue-500 text-black font-bold py-6 px-4 rounded cursor-pointer"
      onDrop={handleDrop}
      onDragOver={(event) => event.preventDefault()}
    >
      <UploadCloudIcon />
      Drag & Drop or Click to Upload PDF
      <input
        id="fileInput"
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleFileUpload}
      />
    </label>
  );
};

export default PDFUploader;
