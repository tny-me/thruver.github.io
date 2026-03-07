# CLAUDE.md — Thruver Codebase Guide

This file documents the structure, conventions, and workflows of the **Thruver** repository for AI assistants and new contributors.

---

## Project Overview

**Thruver** (`thruver.com`) is a Spanish-language home-services marketplace built as a static PWA hosted on GitHub Pages. It connects three personas:

- **Clientes** — homeowners / businesses requesting services
- **Técnicos** — verified service technicians
- **Empresas** — B2B companies seeking maintenance contracts

The entire backend is Firebase (Firestore + Auth). There is no server, no build step, and no package manager. All HTML files are self-contained.

---

## Repository Layout

```
thruver.github.io/
├── index.html          # Main marketplace / conversion funnel (~5 800 lines)
├── admin.html          # Internal admin dashboard (~1 500 lines)
├── empresas.html       # B2B landing page (~560 lines)
├── tecnico.html        # Technician onboarding / signup (~1 200 lines)
├── sw.js               # Service Worker (offline caching)
├── manifest.json       # PWA manifest
├── CNAME               # Custom domain: thruver.com
├── Favicon.png
├── Logo.png
├── Plomero.jpeg
├── Electrico.jpeg
├── Pintor.jpeg
├── Limpieza.jpeg
├── electricorestaurante.png
├── videotecnico.mp4
└── tecnicosupervision.mp4
```

No `package.json`, `node_modules`, `.env`, or build-output directories exist. If you find yourself wanting to create them, reconsider — the project intentionally stays dependency-free.

---

## Technology Stack

| Layer | Choice |
|---|---|
| Hosting | GitHub Pages (static) |
| Domain | thruver.com (CNAME) |
| Database | Firebase Firestore |
| Auth | Firebase Auth (email/password + Google OAuth) |
| Analytics | Firebase Analytics |
| JS | Vanilla ES Modules (inline `<script type="module">`) |
| CSS | Vanilla CSS with custom design tokens |
| PWA | Service Worker + manifest.json |
| Build | **None** — deploy by pushing to `master` |
| Tests | **None** — manual only |

Firebase SDK version: **10.8.1**, loaded from `cdn.firebase.com` via `<script type="module">`.

---

## Firebase Architecture

### Project

Firebase project ID: `thruver-3de75`

### Firestore Collections

| Collection | Contents |
|---|---|
| `solicitudes` | Service requests submitted by clients |
| `tecnicos` | Technician profiles and status |
| `clientes` | Client profiles |

### Global Window Exports

Each page initialises Firebase and exposes helpers on `window` for cross-script access:

```js
window.db                  // Firestore instance
window.auth                // Auth instance
window.fbAddDoc            // addDoc
window.fbCollection        // collection
window.fbQuery             // query
window.fbWhere             // where
window.fbGetDocs           // getDocs
window.fbOrderBy           // orderBy
window.fbUpdateDoc         // updateDoc
window.fbDoc               // doc
window.fbCreateUser        // createUserWithEmailAndPassword
window.fbSignIn            // signInWithEmailAndPassword
window.fbSignInWithPopup   // signInWithPopup
window.fbGoogleProvider    // GoogleAuthProvider instance
window.fbSignOut           // signOut
window.fbOnAuthStateChanged// onAuthStateChanged
```

Exposing Firebase on `window` is the intentional pattern here. Do not refactor to imports-only unless every call site in the same file is updated simultaneously.

---

## HTML File Conventions

### Single-file architecture

Each HTML file is **fully self-contained**: embedded `<style>`, embedded `<script type="module">`, no external `.js` or `.css` files. This is intentional — it keeps deployment trivially simple and avoids bundlers.

### Script organisation within a file

1. Firebase initialisation block (top of `<script type="module">`)
2. DOM references (`const el = document.getElementById(...)`)
3. Helper / utility functions
4. Feature-level functions (tunnel flow, form handlers, etc.)
5. Event listeners and `onAuthStateChanged` at the bottom

### Language

All user-facing copy, comments, variable names, and Firestore field names are in **Spanish**. When adding code, follow the same language:

```js
// Good
const solicitud = { urgencia: 'alta', estado: 'pendiente' };

// Avoid
const request = { urgency: 'high', status: 'pending' };
```

---

## CSS Conventions

### Design tokens (CSS custom properties)

Defined in `:root {}` at the top of each file's `<style>` block:

```css
:root {
  --bg: …;   --bg2: …;   --bg3: …;
  --white: …; --black: …;
  --text: …; --muted: …;
  --blue: …; --blue-dark: …;
  --radius: …; --rsm: …;
  --font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
}
```

Always use these tokens; do not hardcode colour values.

### Class naming

| Prefix | Area |
|---|---|
| `.tnl-` | Conversion tunnel overlay |
| `.nav-` | Navigation bar |
| `.btn-` | Buttons |
| `.tjt-` | Tech-job-tracker UI |
| `.rpt-` | Report / modal dialogs |

New component classes should follow the existing prefix pattern.

### Responsive design

Mobile-first. Breakpoints via `@media (min-width: …)`. The hamburger menu pattern is used for mobile navigation.

---

## JavaScript Conventions

- **No frameworks** — vanilla JS only.
- **camelCase** function names with action verbs: `openTunnel()`, `closeTunnel()`, `saveToFirebase()`, `renderSolicitudes()`.
- Event handlers are attached programmatically (not inline `onclick=`), except in a few legacy spots — new code should avoid inline handlers.
- Functions that need to be callable from outside a module scope are assigned to `window.*`.

---

## Service Worker (`sw.js`)

Cache name: `thruver-v1`. Strategy:

- **HTML** (`/`, `/index.html`): cache-first.
- **Everything else**: network-first, fall back to cache.

When adding new offline-critical assets, update the `urlsToCache` array in `sw.js`.

---

## Deployment

1. Edit the relevant HTML file directly.
2. `git add <file>` → `git commit -m "..."` → `git push origin master`.
3. GitHub Pages deploys automatically within ~1 minute.
4. Production URL: `https://thruver.com`

There is no staging environment and no CI pipeline. Test changes locally by opening the HTML file in a browser, or use a local HTTP server (`python3 -m http.server 8080`).

---

## Admin Access

The admin dashboard (`admin.html`) is gated by Firebase Auth. The designated admin email is set in code. Do not hard-code additional admin emails in new commits; use a Firestore-based role check instead if extending admin functionality.

---

## Known Patterns to Follow

- Keep all CSS, HTML, and JS for a page **in one file**.
- Mirror the existing indentation style (2-space in most files).
- Use the existing `window.*` Firebase helpers rather than re-importing Firebase.
- Log errors to the console (`console.error`) — there is no external error tracking.
- Comments should be in Spanish to match the codebase language.

## Known Patterns to Avoid

- Do **not** introduce a build tool (Vite, Webpack, esbuild, etc.).
- Do **not** add a `package.json` or `node_modules`.
- Do **not** create separate `.js` or `.css` files — keep everything inline.
- Do **not** use a CSS framework (Bootstrap, Tailwind, etc.) without first discussing it.
- Do **not** push directly to `master` without verifying the page renders correctly.

---

## Git Workflow

- Main production branch: `master`
- Feature / AI branches: `claude/<description>-<id>` (created per task)
- Commit messages: short imperative sentences, written in Spanish when describing product changes, English for technical/infra changes.
- No PR process is enforced; commits go directly to `master` for production work.

---

## Updating This File

When you make significant structural changes (new page, new Firebase collection, new CSS naming convention, etc.), update the relevant section of this file in the same commit.
