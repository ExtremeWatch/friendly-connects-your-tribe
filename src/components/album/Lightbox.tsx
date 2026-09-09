import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect } from "react";
import { MediaImage, MediaVideo } from "./Media";
import type { PostRow } from "./types";

export function Lightbox({
  posts,
  index,
  onClose,
  onIndexChange,
}: {
  posts: PostRow[];
  index: number;
  onClose: () => void;
  onIndexChange: (next: number) => void;
}) {
  const post = posts[index];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onIndexChange((index - 1 + posts.length) % posts.length);
      if (e.key === "ArrowRight") onIndexChange((index + 1) % posts.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, posts.length, onClose, onIndexChange]);

  if (!post) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-foreground/95 backdrop-blur">
      <div className="flex items-center justify-between p-4 text-background">
        <div className="text-sm">
          <span className="font-semibold">{post.author_name}</span>
          {post.caption ? <span className="ml-2 opacity-80">{post.caption}</span> : null}
        </div>
        <button onClick={onClose} aria-label="Close" className="rounded-full p-2 hover:bg-background/10">
          <X className="size-5" />
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-2 pb-6">
        {posts.length > 1 && (
          <button
            aria-label="Previous"
            onClick={() => onIndexChange((index - 1 + posts.length) % posts.length)}
            className="absolute left-2 z-10 rounded-full bg-background/20 p-3 text-background hover:bg-background/30"
          >
            <ChevronLeft className="size-6" />
          </button>
        )}

        {post.kind === "video" ? (
          <MediaVideo path={post.media_url} className="max-h-full max-w-full rounded-xl" />
        ) : (
          <MediaImage
            path={post.media_url}
            alt={post.caption ?? `Photo by ${post.author_name}`}
            className="max-h-full max-w-full rounded-xl object-contain"
          />
        )}

        {posts.length > 1 && (
          <button
            aria-label="Next"
            onClick={() => onIndexChange((index + 1) % posts.length)}
            className="absolute right-2 z-10 rounded-full bg-background/20 p-3 text-background hover:bg-background/30"
          >
            <ChevronRight className="size-6" />
          </button>
        )}
      </div>
    </div>
  );
}
