# Luminary Studio — Creative Universe (updated working prototype)

## Start for free
Open `index.html` for a quick desktop preview. For full PWA and offline support, run `python3 -m http.server 8000` inside this folder, then visit `http://localhost:8000`. Publish these files to a static HTTPS host to make them accessible online. No paid app-store account is needed.

## Implemented
- Responsive neon-futuristic home screen featuring the supplied couple photograph
- Six widget entry points: Sketch, Draw, Color, Color by Number, Podcast Writing, Book Writing
- Guided learning: 10 levels, 6 selectable practice steps per level (60 lessons), progress saved locally
- Free Play canvas: touch/mouse/stylus pointer input, pressure-aware strokes where supported, mirror, undo, eraser, brushes, export PNG, local gallery
- Color by Number mini-game and 20 creative activity ideas
- Separate auto-saving local podcast/book writing editors with starter outlines and text export
- Installable PWA manifest and offline service worker after first online visit when hosted securely

## Important limitations
This is a working prototype, not a production-ready state-of-the-art release. Guided lessons are text prompts, not full animated tutorials. The color-by-number game has one simple image. AI coaching, collaboration, secure accounts, cross-device sync, audio recording, video replay, custom photo-to-coloring conversion, publishing and accessibility testing are NOT implemented. Data saved in localStorage is device/browser-specific and may be erased by clearing browser data. Stylus pressure varies by device. The app has not been deployed or published. Some capabilities need third-party hosting or services and cannot be guaranteed permanently free.

## Privacy
No backend and no automatic upload of personal art or writing. The founders' photo is bundled as a local asset.


## Phase Two monetization preview
A Premium Preview tab now shows six proposed offers, example prices, and a functional local-browser wish list. This is a **non-transactional concept storefront**. No billing, purchases, paid entitlements, checkout, subscriptions, or user accounts are enabled. The core 60 lessons, free-play tools, and original Master Sketch Artist Award are intended to remain free. Before launch: build and secure paid content, choose a payment provider for the website, verify app-store billing policies if publishing native apps, implement entitlement validation and refunds, add privacy/terms disclosures, and test on supported devices. Pricing is exploratory.

## Installation readiness update
Added 192px/512px app icons, Apple touch icon, stable manifest identity and updated offline cache. Publication to an HTTPS host is still required for iPad Home Screen installation. No live deployment or real-device testing has been performed.


## V4 guided drawing update
- Six non-destructive canvas guide options (blank, lines, shapes, botanical flower, face proportions, perspective).
- Show/hide guide; export artwork alone or with the guide.
- Lesson practice opens the canvas with a related guide.
- Progress panel unlocks a printable certificate after all 60 lessons.
- Data is browser-local; no online account or sync is provided.
- Run from an HTTPS host or local development server for PWA/offline features; opening index.html from a ZIP is not an app installation.
