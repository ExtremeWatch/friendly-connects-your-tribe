import { supabase } from "@/integrations/supabase/client";

export type GuestIdentity = { id: string; name: string };

const storageKey = (code: string) => `tifkira.guest.${code}`;

export function getGuest(code: string): GuestIdentity | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey(code));
    return raw ? (JSON.parse(raw) as GuestIdentity) : null;
  } catch {
    return null;
  }
}

export function storeGuest(code: string, guest: GuestIdentity) {
  try {
    window.localStorage.setItem(storageKey(code), JSON.stringify(guest));
  } catch {
    /* ignore */
  }
}

export async function joinEvent(code: string, eventId: string, name: string): Promise<GuestIdentity> {
  const { data, error } = await supabase
    .from("guests")
    .insert({ event_id: eventId, name: name.trim() })
    .select("id, name")
    .single();
  if (error) throw error;
  const guest = { id: data.id, name: data.name };
  storeGuest(code, guest);
  return guest;
}
