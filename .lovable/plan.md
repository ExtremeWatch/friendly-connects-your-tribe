# Shared Event Album (Kululu-style) — Phase 1

A photo-sharing app for events: the host creates an event, guests join by link or QR code with no account, and everyone's photos, videos and messages land in one live album.

## What gets built

### Host side (needs an account)
- Sign up / sign in with email
- Create an event: name, date, cover photo, welcome message
- Event dashboard: share link, downloadable QR code, guest count, post count
- Moderation: hide or delete any post
- Delete or close an event

### Guest side (no account)
- Open the link or scan the QR code, type a display name once (remembered on that device)
- Upload photos and videos, several at a time, with an optional caption
- Post a text-only message
- Like any post
- Browse the album feed: newest first, tap a photo to view it full screen and swipe through

### Album
- Live feed that refreshes as new posts arrive
- Photo, video and text posts mixed together, each showing the guest's name
- Event cover and welcome message at the top

## Not in this phase
Live slideshow display, pricing and paid plans, bulk download, the public marketing website. The marketing pages come after the app works.

## Look and feel
Before building, I'll show a few design directions to pick from — the app should feel celebratory and photo-first, not like a generic dashboard.

## Technical notes
- Lovable Cloud provides the database, guest media storage and host accounts.
- Tables: `events` (owned by host), `guests` (per-device identity, name only), `posts` (photo / video / text, caption, guest, event), `likes`.
- Guests are anonymous, so the app uses anonymous sessions so each device has a stable identity for its own posts and likes; row-level rules let anyone with the event link read and post to that event, while only the host can moderate or delete.
- Media goes to a storage bucket keyed by event, uploaded straight from the browser with size limits and image/video type checks.
- Feed updates use realtime subscriptions on `posts` and `likes`.
- QR code generated client-side from the event share URL.
- Routes: `/` (host landing + sign in), `/dashboard`, `/event/new`, `/dashboard/event/$id`, `/a/$code` (guest album), `/a/$code/join`.
