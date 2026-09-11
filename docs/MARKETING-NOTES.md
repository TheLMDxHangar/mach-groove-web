# Marketing notes — running list

Things noticed while building mach-groove.app that a head of marketing needs to
own. Raw input for the "head of marketing" chat prompt. Add as we go.

## Brand facts (don't re-derive)
- Product: Mach Groove, iOS, transfers playlists between Spotify / Apple Music / YouTube Music.
- Company: LMDx Tech. Launch target: Halloween 2026 on the App Store.
- Voice: mission-control. BEAM, PAYLOAD, TARGET LOCKED, mission log; the user is "the pilot".
- Palette: deep space #101026, mach blue rgb(100,210,255), mach pink, mach green, mach flame.
- Type: Space Grotesk + JetBrains Mono.
- Mascot motif: rocket + astronaut. The 8-bit rocket = "a transfer is running" everywhere (app + site).
- Differentiators to lead with: honest transfer counts (47/48 means 47/48); pilot resolves misses — no song left behind; songs vs music-video modes.

## Decisions needed from marketing
- [x] Email capture: DECIDED (2026-09-08) — own endpoint on mach-groove-api + Firestore (IV-0020, blocked on IV-0008 Terraform). Launch email sent once at launch from hello@ via Resend/Buttondown import. Site form posts `{email, platforms, source}` + honeypot `callsign`.
- [ ] Android demand: the form has an "I'm on Android" checkbox (2026-09-08). Count it before committing to a Play Store date. Android = full Kotlin/Compose rewrite, est. 4–6 months solo part-time after iOS launch; Google requires 12 testers × 14 days closed test before production for new accounts. No Play Store "coming soon" on the site until a start date exists.
- [x] Social handles LIVE (2026-09-10), all @machgroove under social@mach-groove.app:
  - Instagram https://www.instagram.com/machgroove/
  - Threads https://www.threads.com/@machgroove
  - X https://x.com/machgroove
  - TikTok https://www.tiktok.com/@machgroove
  - Facebook https://www.facebook.com/profile.php?id=61594497351598 (set a vanity username later for a clean URL)
  - Fanbase: signup pending (new flow) — chip dimmed on site
  - YouTube channel: not created yet; chip removed from site until it exists
- [x] Addresses LIVE 2026-09-11 (IV-0028): social@ (platform identity), hello@ (humans + launch-email sender), support@ (App Store Connect), ops@ (machine mail, receive-only). Gmail label tree Mach Groove/{Social,Ops,Support}. SPF/DKIM/DMARC already published.
- [ ] Launch-badge swap: replace the text "coming soon" chip with Apple's official App Store badge the day the app is approved.
- [ ] YouTube Music mark: only via Google's Brand Use Request Form (brand.youtube). Decide if worth requesting for launch materials.
- [ ] OG / social share image: currently the 500px logo. Needs a proper 1200×630 card with tagline.
- [ ] Press kit: logo files, screenshots, one-paragraph blurb, founder bio.
- [x] Site LIVE at https://mach-groove.app (2026-09-11), GitHub Pages, HTTPS enforced.
- Publishing: Metricool (free) decided for IV-0029; drafts live in the Notion 'Mach Groove Content Calendar'; head-of-marketing prompt in docs/HEAD-OF-MARKETING-PROMPT.md.

## Content the site already has (reuse, don't rewrite)
- TAGLINE TRIO (locked 2026-09-10):
  - Tagline (under the logo, avatars, App Store subtitle candidate): "All songs aboard."  ("All songs abroad" = intentional Easter-egg reading)
  - Bio line (socials): "Playlists with places to go. No strings attached."
  - Launch-day post: "Cut the strings. Keep the playlists."
  - App idea: "ALL SONGS ABOARD" as the mission-log line at LAUNCH SEQUENCE (log as a story when Dom wants it)
  - Hashtag candidate: #AllSongsAboard
- Hero headline (2026-09-10): "All songs aboard." — replaced "Every song makes the trip." (retired; fine as a caption line)
- Hero subline (locked 2026-09-11): "Your playlists shouldn't be stuck in one place, or one format. Mach Groove moves them between services in the format you pick and reports what landed, track by track."
- VOICE: "songs" for the human/emotional lines (All songs aboard), "track" for the technical readout lines — deliberate split. Don't write copy that assumes the user is LEAVING a service; many run two.
- RULE (Dom, 2026-09-06): never hard-code service names in headline/subline/meta copy — services may be added or lost to API changes. Service names appear only where the icons do (pills, beam, feature cards, FAQ).
- App Store subtitle (30-char limit): "All songs aboard." (17) is now the lead candidate; "Take your playlists with you." (28) is the fallback.
- App Store description opener: "Your playlists shouldn't be stuck in one place, or one format."
- Features section title (locked 2026-09-09): "Moves your music. Keeps the receipts." Dom's favourite line so far — strong social-bio / ad-copy candidate.
- VOICE RULE (Dom): don't address the reader as "pilot"/"commander" in marketing copy — corny. Mission-control words are fine as labels (PAYLOAD MANIFEST, BEAM SEQUENCE); the sentences stay plain and human.
- Retired tagline (still fine for social bios): "Beam your playlists between services."
- Brand posture (Dom): "smooth, clean Air Max 1 — not the Virgil Abloh with writing on the side." Company name lives in footer + legal pages only; product leads.
- Feature copy: cross-service transfers; no song left behind; honest transfer counts; songs or music videos.
- Three-step mission: connect uplinks → load cargo → resolve & deliver.
- FAQ on /support (5 questions).

## Ideas parked
- Live Activity / Dynamic Island HUD (big shareable moment for TikTok).
- Launch countdown on the site (T-minus is already the copy).
- "Mission log" screenshots as social content — the terminal is the most shareable surface.
