"use client";

import { useCallback, useState, useRef } from "react";
import { getLemmaClient } from "@/lib/lemma-client";

type UploadStatus = "idle" | "uploading" | "processing" | "done" | "error";

interface UploadItem {
  name: string;
  status: UploadStatus;
  error?: string;
}

export function IngestionDropzone() {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList) => {
    const newItems: UploadItem[] = Array.from(files).map((f) => ({
      name: f.name,
      status: "uploading" as UploadStatus,
    }));
    setItems((prev) => [...prev, ...newItems]);

    const client = getLemmaClient();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const idx = items.length + i;

      try {
        setItems((prev) => {
          const copy = [...prev];
          copy[idx].status = "uploading";
          return copy;
        });

        const formData = new FormData();
        formData.append("file", file);

        await client.files.upload(file, {
          directoryPath: "/documents",
        });

        setItems((prev) => {
          const copy = [...prev];
          copy[idx].status = "processing";
          return copy;
        });

        setTimeout(() => {
          setItems((prev) => {
            const copy = [...prev];
            copy[idx].status = "done";
            return copy;
          });
        }, 2000);
      } catch (err) {
        setItems((prev) => {
          const copy = [...prev];
          copy[idx].status = "error";
          copy[idx].error =
            err instanceof Error ? err.message : "Upload failed";
          return copy;
        });
      }
    }
  }, [items]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  const statusColor = (status: UploadStatus) => {
    switch (status) {
      case "uploading":
        return "text-amber-600";
      case "processing":
        return "text-blue-600";
      case "done":
        return "text-emerald-600";
      case "error":
        return "text-red-600";
      default:
        return "text-zinc-400";
    }
  };

  const statusIcon = (status: UploadStatus) => {
    switch (status) {
      case "uploading":
        return "\u21BB";
      case "processing":
        return "\u25D8";
      case "done":
        return "\u2713";
      case "error":
        return "\u2717";
      default:
        return "\u25CB";
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
        Document Ingestion
      </h2>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
          isDragOver
            ? "border-zinc-900 bg-zinc-50"
            : "border-zinc-200 bg-white hover:border-zinc-300"
        }`}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="mb-2 text-zinc-400"
        >
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p className="text-sm text-zinc-600">
          Drop scanned documents here or click to browse
        </p>
        <p className="mt-1 text-xs text-zinc-400">
          PDF, images, and text files
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.tiff,.txt"
          className="hidden"
          onChange={handleInputChange}
        />
      </div>

      {items.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-md bg-white px-3 py-2 text-sm"
            >
              <span className="truncate text-zinc-700">{item.name}</span>
              <span
                className={`ml-2 shrink-0 text-xs font-medium ${statusColor(item.status)}`}
              >
                {statusIcon(item.status)} {item.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
