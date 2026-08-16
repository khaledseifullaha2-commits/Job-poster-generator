# Job Poster Generator (standalone app)

A standalone React app (Vite + React) for building 1080×1350 recruitment
posters. This repository is dedicated to the generator — a clean, self-contained
project with no unrelated folders inside.

## Features

- **Zero-API local parser (instant)** — paste any raw JD in AI mode and a
  pure-browser regex engine fills the poster the moment you paste: no network,
  no rate limits, no keys. It scans for `Responsibilities`, `Requirements`,
  `Eligibility`, `Deadline` and other section headers, splits bullets (`•`,
  `-`, `*`, numbered lists, inline `·`, and sentence fragments), normalizes
  dates (`31/08/2026` → `31 August 2026`), recognizes "looking for <role>"
  titles and "Deadline: URGENT" labels, and extracts every email address.
- **Dual input mode** (toggle in the sidebar):
  - **Manual Form Mode** — editable fields and dynamic add/remove bullet lists.
  - **AI Paste & Extract Mode** — live local parsing plus optional Gemini
    refinement (API key kept only in `localStorage`). If Gemini fails or the
    key is missing/invalid, the app gracefully falls back to the local parser.
- **4 corporate themes on crisp white** — Classic Navy & White, Bold Executive
  Red & White, Vibrant Forest Green & White, Sleek Black & White.
- **10 layout templates** — Classic Corporate, Split Header Banner, Minimalist
  Grid, Executive Serif, Borderless Clean, Modern Dark, and **Corporate EMC
  Flyer** (matches the EMC reference flyers: simultaneous navy/red/green
  grading on white — red-bordered "WE ARE HIRING" badge, green chevron
  deadline ribbon, navy pill section headers, two-tone navy/red job title, and
  a navy footer bar with a red PLEASE NOTE pill), plus three more from your
  reference flyers:
  - **We're Hiring Ribbon** (flyer 7) — light blue tint, angled charcoal
    "HIRING" ribbon badge, red job title.
  - **Dark Poster Card** (flyer 6) — dark green page with everything on a
    centered white content card.
  - **Split Dark Header** (flyer 3) — light field with a navy diagonal split
    panel; the logo renders white on the dark side.
  All templates use a centered corporate structure (centered badge, intro
  phrase, title, chip and ribbon; the corporate template centers its ribbon +
  graphic group symmetrically).
- **Card layout toggle** — Side-by-Side 2-Column Grid or Stacked Full-Width
  Rows (stacked rows cap at 4 bullets per card and show "+N more in the full
  JD" so long JDs never overflow the canvas).
- **Split heading support** — an editable **intro phrase** (e.g. "One of the
  country's leading conglomerates in the healthcare and education sectors is
  looking for") renders cleanly above the main two-tone job title; both parts
  are fully editable. The local parser also auto-captures the intro phrase
  from JDs that use "…is looking for <role>" wording.
- **Poster header** — "Save Paper / Save Tree / Save Water / Save Electricity"
  eco-icons (top-left; the corporate template uses the reference 2×2 colored
  tile grid), company logo (top-right) via a preset dropdown (Enroute, EMC,
  custom text, or uploaded image) **plus an optional partner/secondary logo
  displayed simultaneously beside it**, and a centered "WE ARE HIRING" badge
  (text editable; red-bordered in the corporate template).
- **Logo on both sides** — a separate **top-left logo** (None / Enroute / EMC /
  custom text / uploaded image) renders beside the eco block, while the
  top-right logo cluster stays independent — so you can place branding on
  either side (or both) of the poster.
- **Recruitment graphics** — optional inline-SVG illustrations rendered beside
  the job title on the corporate template: **Magnifying Glass & Candidate**
  (with floating icons, stars and dashed arc), **Hand & Pen (signature)**, and
  **Professional Desk Setup** — selectable from the sidebar.
- **Nothing is locked** — an "Elements on Poster" checkbox group toggles each
  element independently: eco block, logos, WE ARE HIRING badge, intro phrase,
  company chip, deadline ribbon/tile, recruitment graphic, and PLEASE NOTE
  footer.
- **Per-part custom colors** — granular color pickers override the **title
  text**, **deadline ribbon**, **card backgrounds** and **footer banner**
  independently (empty = template default; a reset button restores it).
- **Click-to-edit headings** — edit the card headings directly on the poster
  (e.g. `RESPONSIBILITIES` → `KEY DUTIES`); the form inputs stay in sync.
  Badge text and the submission note are also editable.
- **Dynamic sections & headings** — the two fixed blocks are now a fully
  flexible list of sections. Each section has an editable heading, a
  **“Show heading” toggle** (hide the heading bar, keep the bullets),
  per-section **bullet text size**, **bold** and **italic** toggles, its own
  add/remove bullet list, **↑ ↓ reorder buttons**, a delete button, and you can
  **add unlimited new sections/headings** with the “+ Add New Section” button.
  Sections render in order on the poster in both the 2-column and stacked
  layouts, and the AI parser still fills the first two sections as before.
- **Clean footer** — a "PLEASE NOTE" notice box with the submission emails
  (e.g. `farhana@enroute.com.bd`, `support@enroute.com.bd`) and the
  instruction "Please mention the position applied for in the subject line."
  No placeholder names (no "Khaled Seifullaha", no "AI-Powered Recruitment").
- **Export** — `html-to-image` captures the canvas at full 1080×1350 as a
  high-res PNG with the correct self-hosted fonts.

## Run it

```bash
npm install
npm run dev        # → http://127.0.0.1:5174
```

Production build:

```bash
npm run build
npm run preview
```

## Structure

```
index.html                # entry HTML + self-hosted fonts
public/fonts/             # Inter + Playfair Display woff2 (same-origin for exports)
scripts/fetch-fonts.mjs   # regenerates public/fonts from Google Fonts
src/
  main.jsx                # React root
  App.jsx                 # split-screen studio, mode toggle, themes, layouts, graphics, export
  PosterCanvas.jsx        # fixed 1080×1350 canvas (header, cards, footer, corporate path, SVGs)
  templates.js            # themes (Navy/Red/Green/Black-White) + 10 templates + palette resolver
  lib/extractLocal.js     # zero-API regex parser + optional browser Gemini client
  styles.css              # app chrome (dark split-screen shell)
```

## AI mode note

With no key, the app is fully offline — the local parser runs on every paste
and populates the poster instantly. To use Gemini, paste a valid Google AI
Studio key in the AI panel (kept only in `localStorage`); the model call goes
directly to Google's REST API, and any failure (bad key, network, CORS) falls
back to the local parser with a clear warning.
