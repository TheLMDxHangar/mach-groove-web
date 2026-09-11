# mach-groove.app

Marketing landing page for **Mach Groove** — the iOS app that beams playlists between Spotify, Apple Music, and YouTube Music.

- Plain static HTML / CSS / JS. No framework, no build step.
- Deployed via GitHub Pages from the `main` branch root.
- Custom domain: `mach-groove.app` (see `CNAME`).

## Structure

```
index.html          landing page
privacy/index.html  privacy policy (placeholder until the policy story lands)
css/styles.css      all styles — brand tokens at the top mirror the app's Colors+Ext.swift
js/main.js          hero mission-log typewriter
assets/             logo + favicons
.nojekyll           tell Pages to serve files as-is
```

## Local preview

Any static server works:

```bash
python3 -m http.server 8080
```

## Brand tokens

| token        | value                 |
|--------------|-----------------------|
| deep space   | `#101026`             |
| mach blue    | `rgb(100, 210, 255)`  |
| mach pink    | `rgb(255, 45, 255)`   |
| mach purple  | `rgb(175, 82, 222)`   |
| mach green   | `rgb(0, 255, 120)`    |
| mach flame   | `rgb(254, 134, 56)`   |
| sans         | Space Grotesk         |
| mono         | JetBrains Mono        |

© LMDx Tech
