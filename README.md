# Assets

This frontend uses hotlinked Unsplash photography and pravatar.cc placeholder
avatars for demo imagery instead of bundled binary files, since the project
brief calls for zero backend/external dependencies in *code* — image hosting
is the one exception, used purely so the demo has realistic photography
without shipping large binary assets in this deliverable.

To swap in your own images for production:
1. Drop files into this folder (e.g. `assets/destinations/kyoto.jpg`).
2. Replace the matching `img` field inside the `destinations` array in the
   seed data at the top of `js/app.js` (function `buildSeedData`).

No other code changes are required.

## v2.6 — community feed & posting

- **Center FAB** (Instagram-style +) sits raised on the bottom nav between
  Explore and Trips. Tapping it opens a choice sheet: "Write a review" or
  "Share a moment."
- **Trips tab now hosts two views** via a top-level toggle: "My trips"
  (the original Upcoming/Past planner) and "Community feed" (posts from
  the seeded community + your own, with an All/Mine filter).
- **Review composer** — pick a destination, tap a star rating, write your
  text. Posting adds it to the feed *and* to that destination's own Reviews
  tab on the detail screen, so it actually shows up where reviews live.
- **Moment composer** — a freer post (no rating) with an optional photo,
  for general updates from a trip.
- **"Leave a review" on a past trip** now opens the real review composer
  pre-filled with that trip's destination, instead of just flipping a flag.
- **Likes** on feed posts, toggleable, persisted like everything else.

## v2.5 — persistence, real CRUD, booking flow

This build added a real (client-side) data layer on top of the original
static prototype:

- **Persistence** — trips, favorites, emergency contacts, profile, and
  settings are saved to `localStorage` and survive a page refresh. Use
  Profile → "Reset demo data" to restore the original seed data at any time.
- **13 real destinations** with their own price, safety score, reviews, and
  photos — Explore, the Home "Curated" rail, and the destination detail
  screen all read from the same dataset instead of one hardcoded example.
- **A working booking flow** — Explore → destination detail → "Add to my
  trips" opens a real Booking screen (dates, traveler count, optional
  Vouya Shield protection, live total) and creates an actual trip on
  confirm, which then appears in Trips and Itinerary.
- **Multi-trip itineraries** — each trip owns its own day-by-day plan. The
  Itinerary screen always reflects whichever trip you tapped into, and
  drag-and-drop reordering is saved per trip/day.
- **Real CRUD** — add/remove emergency contacts, add/remove itinerary
  stops, edit your profile name and tier, all with inline form validation.
- **Notifications screen** — a real notification center fed by trip and
  safety events (e.g. confirming a booking or sending an SOS creates a
  notification), with an unread indicator on the Home bell icon.
- **Smarter SOS** — the alert sheet addresses your actual emergency
  contacts by name, and sending an alert logs a real entry to "Recent
  activity" on the Safety screen.
