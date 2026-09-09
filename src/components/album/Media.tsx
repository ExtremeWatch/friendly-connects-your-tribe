import { useSignedUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

export function MediaImage({
  path,
  alt,
  className,
}: {
  path: string | null | undefined;
  alt: string;
  className?: string;
}) {
  const url = useSignedUrl(path);
  if (!url) return <div className={cn("animate-pulse bg-muted", className)} />;
  return <img src={url} alt={alt} loading="lazy" className={className} />;
}

export function MediaVideo({ path, className }: { path: string | null | undefined; className?: string }) {
  const url = useSignedUrl(path);
  if (!url) return <div className={cn("animate-pulse bg-muted", className)} />;
  return <video src={url} controls playsInline preload="metadata" className={className} />;
}
