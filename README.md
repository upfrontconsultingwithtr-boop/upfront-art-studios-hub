# Upfront Art Studio + Creative Command Hub (v7)

**This release is a self-contained static website.** No paid dependencies, backend, account, or purchase flow.

- `/` Creative Command Hub: project items, statuses, per-item notes, copy brief to ChatGPT, export/import JSON.
- `/studio/` Upfront Art Studio: stylus drawing with pressure and mirror mode, practice guides, PNG export, autosaved current canvas draft (IndexedDB), gallery, three original color-by-number layouts with local progress, 60 distinct guided lessons, writing lab, certificate unlock, and portable studio backup.

## Deploy on Render

1. Publish the contents of this folder at the **root of a dedicated GitHub repository**.
2. Create a Render **Static Site**, selecting the repository and branch `main`.
3. Build command: `echo "No build required"`. Publish directory: `.`.
4. Keep the service on the free Static Site tier; review Render's usage allowances to avoid any unexpected charges. A paid plan is not required for the static site.
5. When deployment succeeds, open the `https://...onrender.com` URL and check both `/` and `/studio/`.

The included `render.yaml` is suitable for a Blueprint created from the same repository, or use the Render Static Site creation tool directly.

## Local test

`python3 -m http.server 8000` from the root, then open `http://localhost:8000/` and `http://localhost:8000/studio/`.

## iPad

After HTTPS deployment, visit the site in Safari, use Share → Add to Home Screen. Apple Pencil pressure depends on the iPad, Safari and Pencil model. The PWA cache can support offline visits after assets have loaded; the app remains browser-local.

## Important limitations

**No real ChatGPT two-way synchronization yet.** Hub notes, lesson progress, drawings, and writing are stored only on the device/browser. Export and import allow manual transfer. This release does not have a shared database, accounts, or remote collaboration. Physical iPad/Pencil testing is still required. Don't rely on local storage as your only copy of important work: export backups.

## v7 updates

- Live-hosting milestone is included on the Hub board without overwriting existing local tasks.
- Both Hub and Studio include Safari-specific Add to Home Screen instructions, no ZIP needed.
- Hub backup import now validates the file and asks before replacing the user's local project board.
- Offline caches versioned to v7 so updates are installed on return visits.

Deployment status was reported live by Render; physical iPad/Pencil and public browser end-to-end tests remain outstanding.

## v8 approved visual direction
Restores the Luminary Studio neon pink, violet, electric blue and gold visual system from the supplied approved reference. The Studio home screen now uses a live, responsive four-column creative dashboard with the illustrated couple, two entry pathways, real lesson progress, six working widgets and functional drawing-tool shortcuts. The Hub uses a matching theme. Existing local work, storage keys and core features are preserved.

**Not yet implemented:** account-based syncing, live collaboration, photo-to-art conversion, automatic timelapse recording. The home screen labels these honestly. No paid APIs are used.
