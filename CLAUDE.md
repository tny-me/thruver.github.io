# CLAUDE.md — Thruver Codebase Guide

## Project Overview

Thruver is a two-sided marketplace connecting customers with verified home service technicians (plumbers, electricians, painters, cleaners, etc.). It is deployed as a GitHub Pages static site with a Firebase backend.

- **Live URL:** https://thruver.com
- **Repo:** thruver.github.io (GitHub Pages, custom domain via CNAME)
- **Language:** Spanish (UI content and commit messages are in Spanish)
- **Stack:** Vanilla JS + HTML/CSS, Firebase (Auth + Firestore), PWA

---

## Repository Structure

```
/
├── index.html          Customer-facing landing page and portal (4,200+ lines)
├── tecnico.html        Technician registration and dashboard (1,200+ lines)
├── sw.js               Service Worker (PWA offline caching)
├── manifest.json       PWA manifest (app name, icons, theme)
├── CNAME               GitHub Pages custom domain → thruver.com
└── Assets/
    ├── Favicon.png     App icon (2000×2000)
    ├── Logo.png        Brand logo (2000×2000)
    ├── Plomero.jpeg    Plumber service image
    ├── Electrico.jpeg  Electrician service image
    ├── Pintor.jpeg     Painter service image
    └── Limpieza.jpeg   Cleaning service image
```

All HTML, CSS, and JavaScript live inline in `index.html` and `tecnico.html`. There is no build step, no bundler, and no package.json.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML5, CSS3, JavaScript (ES Modules via CDN) |
| Backend/DB | Firebase Firestore |
| Auth | Firebase Authentication (Email/Password + Google OAuth) |
| Analytics | Firebase Analytics |
| Hosting | GitHub Pages |
| PWA | Custom Service Worker (`sw.js`) |
| External | Google Apps Script webhook (`SCRIPT_URL`) |

**Firebase SDK version:** 10.8.1 (loaded via `https://www.gstatic.com/firebasejs/10.8.1/`)

---

## Pages and Their Roles

### `index.html` — Customer Portal

- **Landing page** with hero carousel (4 service images), services grid, how-it-works, and trust section.
- **Multi-step conversion tunnel** (modal overlay):
  - Step 1: Service selection
  - Step 2: Location, urgency (immediate vs scheduled), description
  - Step 3: Contact info + Firebase auth (register or login)
- **Customer dashboard**: Shows active service requests and history after login.
- **Authentication flows**: Email/password registration, login, password reset, and Google OAuth.

### `tecnico.html` — Technician Portal

- **Onboarding tunnel** (4-step form): Specialty → Experience/availability → Address → Bio.
- **Technician dashboard**: Lists incoming requests and active jobs; technicians can accept or reject assignments.
- **Distinct dark theme** (different from the customer-facing light theme).

---

## Firebase Data Model

### `solicitudes` collection (service requests)

| Field | Type | Description |
|---|---|---|
| `servicio` | string | Service type (e.g., "Plomería") |
| `descripcion` | string | Customer's problem description |
| `urgencia` | string | `"inmediata"` or `"programada"` |
| `fecha` | string | Scheduled date (if programada) |
| `hora` | string | Scheduled time (if programada) |
| `zona` | string | Neighborhood/zone |
| `direccion` | string | Address details |
| `nombre` | string | Customer name |
| `telefono` | string | Customer phone |
| `email` | string | Customer email |
| `uid` | string | Firebase Auth UID |
| `estado` | string | `"nueva"` → `"asignada"` → `"completada"` |
| `timestamp` | Timestamp | Creation time |

### `tecnicos` collection (technician profiles)

| Field | Type | Description |
|---|---|---|
| `especialidad` | string | Primary specialty |
| `experiencia` | string | Years of experience |
| `disponibilidad` | string | Availability hours |
| `herramientas` | string | Tools/equipment owned |
| `zona` | string | Service area |
| `direccion` | string | Technician address |
| `bio` | string | Personal description |
| `uid` | string | Firebase Auth UID |
| `timestamp` | Timestamp | Registration time |

---

## Key JavaScript Patterns

### Global State (window object)

The app uses the `window` object for global state:
- `window.currentUser` — Firebase Auth user object
- `window.db` — Firestore database instance
- `window.auth` — Firebase Auth instance

### Core Functions (index.html)

| Function | Purpose |
|---|---|
| `openTunnel(presetSvc)` | Opens multi-step service request modal |
| `closeTunnel()` | Closes and resets the modal |
| `showView(n, forward)` | Navigates between modal steps |
| `resetTunnel()` | Full state reset after submission |
| `saveToFirebase(coleccion, data)` | Generic Firestore document save |

### Core Functions (tecnico.html)

| Function | Purpose |
|---|---|
| `cargarSolicitudesTecnico(user)` | Load new incoming requests for a technician |
| `cargarTrabajoActivo(user)` | Load current active job assignments |

### Service Icons (Emoji mapping)

Services use emoji icons for visual identification:
- 🔧 Plomería (Plumbing)
- 💡 Electricidad (Electrical)
- 🎨 Pintura (Painting)
- 🧹 Limpieza (Cleaning)
- ❄️ Clima (HVAC)
- 🚪 Cerrajería (Locksmith)
- 🪵 Carpintería (Carpentry)
- 🔩 General (Handyman)

---

## CSS Design System

### Custom Properties (CSS Variables)

```css
--bg:      #f3f3f3   /* Page background */
--bg2:     #eaeaea   /* Card backgrounds */
--bg3:     #e0e0e0   /* Dividers, subtle surfaces */
--white:   #ffffff
--black:   #111111   /* Primary text */
--text:    #111111
--muted:   #777777   /* Secondary text */
--muted2:  #aaaaaa   /* Placeholder/tertiary text */
--border:  rgba(0,0,0,0.08)
```

### Naming Conventions

HTML IDs follow a prefix system:
- `tnl-*` — Tunnel/modal elements (e.g., `tnl-overlay`, `tnl-step1`)
- `tdv-*` — Technician dashboard views
- `tjt-*` — Job table components

CSS classes use BEM-like naming with kebab-case.

### Design Tokens

- Border radius: `14px` (cards/large), `8px` (inputs/small)
- Font stack: `Arial, "Arial Unicode MS", sans-serif`
- Transitions: `0.15s` for interactive states
- Touch targets: minimum `44px` height (accessibility)
- Animations: `fadeUp`, `gridBreathe`, `pulse`, `slideDown`, `tnlIn`

---

## Naming Conventions

| Context | Convention |
|---|---|
| JavaScript functions/variables | camelCase |
| HTML element IDs | kebab-case with prefix |
| CSS classes | kebab-case |
| Commit messages | Spanish, imperative mood |
| Console logs | Prefixed with `[Thruver]` |
| LocalStorage keys | `thruver_*` prefix |

---

## Development Workflow

### No Build Step

This project has no package.json, no bundler (webpack/vite), and no test suite. Development is:
1. Edit `index.html` or `tecnico.html` directly.
2. Open in browser to test (or use a local dev server like `python3 -m http.server`).
3. Commit and push to deploy via GitHub Pages.

### Deployment

Pushes to `master` deploy automatically via GitHub Pages. The custom domain `thruver.com` is configured via the `CNAME` file.

### PWA Caching

The Service Worker (`sw.js`) uses:
- **Cache-first** for `index.html`
- **Network-first** for all other assets

When updating cached assets, increment the cache version in `sw.js`.

---

## Error Handling Conventions

- Use `.catch()` on Promises (avoid try/catch unless necessary).
- User-facing error messages must be in **Spanish**.
- Log debug info to console with `[Thruver]` prefix: `console.log('[Thruver] mensaje...')`.
- Defensive null checks before accessing DOM elements or Firestore data.
- No hard crashes — always show graceful fallback UI to the user.

---

## LocalStorage Keys

| Key | Purpose |
|---|---|
| `thruver_nombre` | Cached customer name |
| `thruver_telefono` | Cached customer phone |
| `thruver_email` | Cached customer email |

---

## Authentication Flows

1. **Email/Password Registration** — Creates Firebase user, then saves contact info to Firestore.
2. **Email/Password Login** — Signs in, loads customer dashboard.
3. **Google OAuth** — One-tap sign-in via Firebase Google provider.
4. **Password Reset** — Sends Firebase reset email.
5. **Session Persistence** — Firebase `onAuthStateChanged` handles auto-login on page load.

Role distinction (customer vs technician) is determined by which page the user is on (`index.html` vs `tecnico.html`), not a Firestore role field.

---

## Key Conventions for AI Assistants

1. **Write all user-visible text in Spanish.** The product is in Spanish; do not introduce English strings in UI.
2. **No build tools.** Do not add package.json, npm scripts, webpack, or any bundler.
3. **No external CSS/JS frameworks.** Keep it vanilla — no React, Vue, Bootstrap, Tailwind, etc.
4. **Keep JavaScript inline** in the HTML files. Do not extract to separate `.js` files unless explicitly asked.
5. **Follow the prefix convention** for new HTML IDs (`tnl-`, `tdv-`, `tjt-`, etc.).
6. **Use CSS variables** for colors — never hardcode color values in new rules.
7. **Maintain 44px minimum touch targets** for all interactive elements.
8. **Write commit messages in Spanish**, imperative mood (e.g., `fix: corrige error en formulario`).
9. **Test on mobile layout** — the site is mobile-first and must work on small screens.
10. **Do not expose or log sensitive credentials.** The Firebase config is intentionally client-side (Firebase security rules govern access), but do not add new secrets to the frontend.
11. **Firestore status flow is**: `nueva` → `asignada` → `completada`. Maintain this ordering.
12. **Use `.catch()` for async errors**, not try/catch, to stay consistent with existing code style.
