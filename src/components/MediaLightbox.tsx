import { useState, useCallback, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, Play, Pause, Download } from "lucide-react";

interface MediaLightboxProps {
  urls: string[];
  initialIndex: number;
  onClose: () => void;
}

function isVideo(url: string): boolean {
  return !!url.match(/\.(mp4|webm|mov)$/) || !!url.match(/^data:video/);
}

export default function MediaLightbox({ urls, initialIndex, onClose }: MediaLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const currentUrl = urls[index];
  const isCurrentVideo = isVideo(currentUrl);
  const total = urls.length;

  const goPrev = useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : total - 1));
    setIsZoomed(false);
  }, [total]);

  const goNext = useCallback(() => {
    setIndex((i) => (i < total - 1 ? i + 1 : 0));
    setIsZoomed(false);
  }, [total]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose, goPrev, goNext]);

  const handleDownload = async () => {
    try {
      const response = await fetch(currentUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `titanroute-media-${index + 1}.${isCurrentVideo ? "mp4" : "jpg"}`;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback: open in new tab
      window.open(currentUrl, "_blank");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex flex-col"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">
            {index + 1} / {total}
          </span>
          <span className="text-xs text-white/50">
            {isCurrentVideo ? "Video" : "Image"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!isCurrentVideo && (
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              title="Zoom"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={handleDownload}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="Download"
          >
            <Download className="h-5 w-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="Close (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {/* Previous Button */}
        {total > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className="absolute left-4 z-10 p-3 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all hover:scale-110"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        {/* Media */}
        <div className="max-w-[90vw] max-h-[80vh] flex items-center justify-center">
          {isCurrentVideo ? (
            <div className="relative">
              <video
                src={currentUrl}
                className="max-w-full max-h-[80vh] rounded-lg"
                controls
                autoPlay
                playsInline
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            </div>
          ) : (
            <img
              src={currentUrl}
              alt={`Media ${index + 1}`}
              className={`max-w-full max-h-[80vh] rounded-lg transition-transform duration-300 ${
                isZoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
              }`}
              onClick={() => setIsZoomed(!isZoomed)}
            />
          )}
        </div>

        {/* Next Button */}
        {total > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className="absolute right-4 z-10 p-3 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all hover:scale-110"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Thumbnail Strip */}
      {total > 1 && (
        <div className="px-4 py-3 flex justify-center gap-2 overflow-x-auto">
          {urls.map((url, i) => (
            <button
              key={i}
              onClick={() => {
                setIndex(i);
                setIsZoomed(false);
              }}
              className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                i === index ? "border-blue-500 ring-2 ring-blue-500/30" : "border-white/20 hover:border-white/50"
              }`}
            >
              {isVideo(url) ? (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                  <Play className="h-4 w-4 text-white" />
                </div>
              ) : (
                <img src={url} alt="" className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
