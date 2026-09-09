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
  created_at: string;
};
