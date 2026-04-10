"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

interface ThumbnailProps {
  url: string | null | undefined;
}

export const Thumbnail = ({ url }: ThumbnailProps) => {
  const [hasError, setHasError] = useState(false);

  if (!url) return null;

  if (hasError) {
    return (
      <div className="relative flex items-center justify-center max-w-[360px] border rounded-lg my-2 bg-muted h-[200px]">
        <p className="text-sm text-muted-foreground">
          Failed to load image
        </p>
      </div>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="relative overflow-hidden max-w-[360px] border rounded-lg my-2 cursor-zoom-in"
          type="button"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Message image"
            className="object-cover rounded-md size-full"
            src={url}
            onError={() => setHasError(true)}
          />
        </button>
      </DialogTrigger>

      <DialogContent
        className="max-w-[800px] border-none bg-transparent p-0 shadow-none"
        showCloseButton={false}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Image preview</DialogTitle>
          <DialogDescription>Full-size image preview</DialogDescription>
        </DialogHeader>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="Message image"
          className="object-cover rounded-md size-full"
          src={url}
        />
      </DialogContent>
    </Dialog>
  );
};
