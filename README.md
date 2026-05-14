# SwasthAI — AI-Powered Healthcare Platform

A monorepo containing the SwasthAI mobile app, web dashboard, backend services, and shared packages.

---

## ⚠️ Design System Law

All UI development must strictly follow the **SwasthAI Color System**.

> 📖 **[`apps/mobile/COLOR_SYSTEM.md`](./apps/mobile/COLOR_SYSTEM.md)** — The canonical color bible. Read before touching any UI.

**Core Identity:** Purple `#8B5CF6` · Background `#FAFAFC` · Cards `#FFFFFF`  
**Prohibited:** Dark navy, teal, cyan, neon, Bootstrap blue, hospital green.

---

## Monorepo Structure

```
apps/
  mobile/          — Expo React Native app (Patient, Doctor, Nurse)
  web-admin/       — Admin & Billing dashboard (web only)
  web-billing/     — Billing portal (web only)
  landing/         — Public marketing site
  docs-site/       — Documentation

packages/
  ui/              — Shared component library
  theme/           — Design tokens
  api-client/      — Data fetching
  auth/            — Authentication
  types/           — Shared TypeScript types
  ...

services/
  api-gateway/     — Entry point for all backend traffic
  ai-service/      — AI consultation engine
  auth-service/    — Authentication & authorization
  user-service/    — User management
  consultation-service/
  billing-service/
  ...
```

---

## Mobile App — Quick Start

```bash
cd apps/mobile
npx expo start          # Web preview
npx expo start --localhost   # Local network (phone on same Wi-Fi)
```

**To run on physical phone:** Ensure Wi-Fi network profile is set to **Private** in Windows settings, then scan the QR code with Expo Go.

---

## Key Design Files (Mobile)

| File | Purpose |
|---|---|
| `apps/mobile/COLOR_SYSTEM.md` | **Canonical color law** — all UI must follow this |
| `apps/mobile/DESIGN.md` | Full design system guidelines |
| `apps/mobile/constants/doctorTheme.js` | JS theme object (doctor shell) |
| `apps/mobile/tailwind.config.js` | NativeWind utility class tokens |
