import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const MEDIA_BUCKET = "event-media";

const cache = new Map<string, Promise<string | null>>();

export function signedUrl(path: string): Promise<string | null> {
  if (!cache.has(path)) {
    cache.set(
      path,
      supabase.storage
        .from(MEDIA_BUCKET)
        .createSignedUrl(path, 60 * 60 * 24 * 7)
        .then((res) => res.data?.signedUrl ?? null)
        .catch(() => null),
    );
  }
  return cache.get(path)!;
}

export function useSignedUrl(path: string | null | undefined) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!path) {
      setUrl(null);
      return;
    }
    signedUrl(path).then((value) => {
      if (active) setUrl(value);
    });
    return () => {
      active = false;
    };
  }, [path]);

  return url;
}

const MAX_DIMENSION = 2400;

/** Re-encode a photo to JPEG in the browser: shrinks phone photos and fixes HEIC. */
export async function prepareImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.85),
    );
    if (!blob) return file;
    const name = file.name.replace(/\.[^.]+$/, "") || "photo";
    return new File([blob], `${name}.jpg`, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export async function uploadMedia(eventId: string, file: File): Promise<string> {
  const ext = (file.name.includes(".") ? file.name.split(".").pop() : "") || "bin";
  const path = `${eventId}/${crypto.randomUUID()}.${ext.toLowerCase()}`;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    cacheControl: "3600",
    contentType: file.type || "application/octet-stream",
  });
  if (error) throw error;
  return path;
}

