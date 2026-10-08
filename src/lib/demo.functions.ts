import { createServerFn } from "@tanstack/react-start";

export const DEMO_CODE = "demo";
export const DEMO_EVENT_ID = "00000000-0000-0000-0000-00000000de30";

/**
 * Removes visitor uploads from the public demo album. Seed posts (no guest) are kept.
 * Only ever touches the demo event, so it is safe to expose publicly.
 */
export const cleanupDemo = createServerFn({ method: "POST" })
  .inputValidator((input: { since?: string }) => {
    const d = input?.since ? new Date(input.since) : null;
    return { since: d && !isNaN(d.getTime()) ? d.toISOString() : null };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const stale = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    let q = supabaseAdmin.from("posts").select("id, media_url").eq("event_id", DEMO_EVENT_ID).not("guest_id", "is", null);
    q = data.since ? q.or(`created_at.gte.${data.since},created_at.lt.${stale}`) : q.lt("created_at", stale);
    const { data: posts, error } = await q;
    if (error) throw new Error(error.message);
    if (!posts?.length) return { removed: 0 };
    const ids = posts.map((p) => p.id);
    const paths = posts.map((p) => p.media_url).filter((p): p is string => !!p);
    await supabaseAdmin.from("likes").delete().in("post_id", ids);
    await supabaseAdmin.from("posts").delete().in("id", ids);
    if (paths.length) await supabaseAdmin.storage.from("event-media").remove(paths);
    return { removed: ids.length };
  });
