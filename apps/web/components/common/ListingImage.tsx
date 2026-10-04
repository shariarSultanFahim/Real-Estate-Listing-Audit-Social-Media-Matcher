"use client";

import { useState } from "react";
import { Building2, Image as ImageIcon, ExternalLink } from "lucide-react";

interface ListingImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  showGalleryButton?: boolean;
}

export function ListingImage({
  src,
  alt,
  className = "object-cover size-full",
  showGalleryButton = false,
}: ListingImageProps) {
  const isGalleryUrl = Boolean(src && (src.includes("photogallery") || src.includes("mediabrowser")));
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // If the URL is an internal gallery page or errored out
  if (!src || hasError || isGalleryUrl) {
    return (
      <div className="size-full flex flex-col items-center justify-center bg-gradient-to-br from-muted/80 to-muted/30 text-muted-foreground p-2 relative overflow-hidden group">
        <Building2 className="size-5 text-muted-foreground/60 transition-transform duration-300 group-hover:scale-110" />
        <span className="text-[10px] font-mono text-muted-foreground/80 mt-1 truncate max-w-full text-center px-1">
          {alt || "Property Photo"}
        </span>
        {isGalleryUrl && showGalleryButton && src && (
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-medium border border-primary/20 transition-colors"
          >
            <span>Open Gallery</span>
            <ExternalLink className="size-2.5" />
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="size-full relative overflow-hidden bg-muted/40">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/60 animate-pulse">
          <ImageIcon className="size-4 text-muted-foreground/40" />
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        onError={() => setHasError(true)}
        onLoad={() => setIsLoaded(true)}
        className={`${className} ${isLoaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
        loading="lazy"
      />
    </div>
  );
}
