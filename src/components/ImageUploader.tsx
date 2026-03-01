"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export interface ImageData {
  base64: string;
  mimeType: string;
  preview: string;
}

interface ImageUploaderProps {
  onImagesSelect: (images: ImageData[]) => void;
  isLoading: boolean;
}

export default function ImageUploader({
  onImagesSelect,
  isLoading,
}: ImageUploaderProps) {
  const [images, setImages] = useState<ImageData[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    (files: FileList | File[]) => {
      const imageFiles = Array.from(files).filter((f) =>
        f.type.startsWith("image/")
      );
      if (imageFiles.length === 0) return;

      const promises = imageFiles.map(
        (file) =>
          new Promise<ImageData>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const dataUrl = e.target?.result as string;
              resolve({
                base64: dataUrl.split(",")[1],
                mimeType: file.type,
                preview: dataUrl,
              });
            };
            reader.readAsDataURL(file);
          })
      );

      Promise.all(promises).then((newImages) => {
        const updated = [...images, ...newImages];
        setImages(updated);
        onImagesSelect(updated);
      });
    },
    [images, onImagesSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    onImagesSelect(updated);
  };

  const clearAll = () => {
    setImages([]);
    onImagesSelect([]);
  };

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all ${
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
        } ${isLoading ? "pointer-events-none opacity-50" : ""}`}
      >
        {images.length > 0 ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 justify-center">
              {images.map((img, i) => (
                <div key={i} className="group relative">
                  <img
                    src={img.preview}
                    alt={`Page ${i + 1}`}
                    className="h-24 w-auto rounded-lg object-cover shadow-sm"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(i);
                    }}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    ✕
                  </button>
                  <span className="absolute bottom-0.5 left-0.5 rounded bg-black/60 px-1 text-[10px] text-white">
                    {i + 1}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {images.length} page{images.length > 1 ? "s" : ""} — click or
              drag to add more
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <svg
                className="h-6 w-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium">
              Drop book page images here
            </p>
            <p className="text-xs text-muted-foreground">
              or click to browse — multiple pages supported (PNG, JPG, WebP)
            </p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) processFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {images.length > 0 && !isLoading && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            clearAll();
          }}
        >
          Clear All Images
        </Button>
      )}
    </div>
  );
}
