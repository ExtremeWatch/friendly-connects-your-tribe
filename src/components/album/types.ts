export type AlbumPermission = "view_and_upload" | "view_only" | "upload_only";

export type EventRow = {
  id: string;
  host_id: string;
  code: string;
  name: string;
  event_date: string | null;
  cover_url: string | null;
  welcome_message: string | null;
  is_closed: boolean;
  created_at: string;
  event_type: string;
  require_approval: boolean;
  album_permission: AlbumPermission | string;
  allow_guest_downloads: boolean;
  allow_likes: boolean;
  allow_photos: boolean;
  allow_videos: boolean;
  allow_text: boolean;
  slideshow_interval: number;
  slideshow_show_qr: boolean;
  slideshow_show_captions: boolean;
  slideshow_show_likes: boolean;
};

export type PostRow = {
  id: string;
  event_id: string;
  guest_id: string | null;
  author_name: string;
  kind: "photo" | "video" | "text";
  media_url: string | null;
  caption: string | null;
  is_hidden: boolean;
  status: "published" | "pending" | string;
  created_at: string;
};
