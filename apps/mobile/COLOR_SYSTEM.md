# ⚠️ SWASTHAI COLOR SYSTEM — CANONICAL REFERENCE
## This file is LAW. All UI development MUST follow this strictly.
## DO NOT introduce any color not listed here.

---

## 🚫 PROHIBITED
- NO dark blue / navy (`#0A0F1E`, `#1E3A5F`, etc.)
- NO teal / cyan (`#00D4AA`, `#06B6D4`, etc.)
- NO neon green hospital theme
- NO Bootstrap default colors
- NO generic blue corporate SaaS palette
- NO saturated red backgrounds
- NO dark cyberpunk themes

---

## ✅ PRIMARY BRAND COLORS

| Token | Hex | Usage |
|---|---|---|
| `primaryPurple` | `#8B5CF6` | Primary CTA buttons, floating AI button, active nav icon, graph highlights, focus states |
| `deepPurple` | `#7C3AED` | Hover states, button gradients, selected states, important analytics |
| `softLavender` | `#C4B5FD` | Secondary cards, light graph fills, background accents |
| `ultraLightLavender` | `#F5F3FF` | Input backgrounds, card hover backgrounds |

---

## ✅ BACKGROUNDS

| Token | Hex | Usage |
|---|---|---|
| `mainBg` | `#FAFAFC` | Main app background |
| `backgroundWhite` | `#FFFFFF` | Secondary background, cards |
| `softSection` | `#F3F0FF` | Soft section dividers |
| `glassmorphism` | `rgba(255,255,255,0.65)` | Overlay effects only |

---

## ✅ TEXT COLORS

| Token | Hex | Usage |
|---|---|---|
| `darkText` | `#111827` | Primary text — headings, body |
| `secondaryText` | `#6B7280` | Labels, subtitles, descriptions |
| `mutedText` | `#9CA3AF` | Placeholders, timestamps, disabled |
| White | `#FFFFFF` | Text on colored/dark backgrounds |

---

## ✅ STATUS COLORS

| Token | Hex | Usage |
|---|---|---|
| `success` | `#22C55E` | Healthy, OK states |
| `warning` | `#FACC15` | Caution states |
| `danger` | `#EF4444` | Critical, error states |
| `neutral` | `#94A3B8` | Neutral / inactive status |
| `info` | `#3B82F6` | Informational badges |

---

## ✅ CARD ACCENT COLORS (backgrounds only, never text)

| Token | Hex | Usage |
|---|---|---|
| `softPink` | `#FBCFE8` | Metric card accents |
| `softPeach` | `#FED7AA` | Metric card accents |
| `mintGreen` | `#BBF7D0` | Metric card accents |
| `softSky` | `#CFFAFE` | Metric card accents |

---

## ✅ EXACT GRADIENTS

```
Primary AI Gradient:    135deg, #8B5CF6 0%, #A78BFA 50%, #C4B5FD 100%
Floating Action Button: 135deg, #7C3AED 0%, #8B5CF6 50%, #A78BFA 100%
Soft Card Gradient:     180deg, #FFFFFF 0%, #F5F3FF 100%
Graph Fill Gradient:    180deg, rgba(139,92,246,0.35) 0%, rgba(139,92,246,0.03) 100%
```

---

## ✅ SHADOWS

```
Soft Purple Shadow:  rgba(139, 92, 246, 0.12)
Floating Button:     rgba(124, 58, 237, 0.28)
Card Shadow:         rgba(15, 23, 42, 0.05)
```

---

## ✅ COMPONENT RULES

### Inputs
- Background: `#F9FAFB`
- Border: `#E5E7EB`
- Focus Border: `#8B5CF6`
- Placeholder: `#9CA3AF`
- Border Radius: `20px`

### Cards
- Background: `#FFFFFF`
- Border Radius: `24px`
- Shadow: `rgba(15, 23, 42, 0.05)`

### Buttons (Primary)
- Background: gradient `#7C3AED → #8B5CF6 → #A78BFA`
- Text: `#FFFFFF`
- Border Radius: `18px`
- Shadow: `rgba(124, 58, 237, 0.28)`

### Bottom Navigation
- Background: `#FFFFFF`
- Active Icon: `#8B5CF6`
- Inactive Icon: `#9CA3AF`
- Floating AI Button: `#8B5CF6` with glow `rgba(139,92,246,0.35)`

### Chat Bubbles
- AI bubble: `#8B5CF6` / text `#FFFFFF`
- User bubble: `#F3F4F6` / text `#111827`

---

## ✅ TYPOGRAPHY

| Scale | Size | Weight |
|---|---|---|
| Hero Heading | 34px | 700 |
| Screen Title | 28px | 700 |
| Section Title | 20px | 600 |
| Card Heading | 16px | 500 |
| Body Text | 14px | 400 |
| Small Label | 12px | 500 |
| Micro Label | 10px | 600 |

**Font:** Inter (primary) · SF Pro Display (iOS fallback)

---

## ✅ GEOMETRY

| Element | Radius |
|---|---|
| Cards | 24px |
| Buttons | 18px |
| Inputs | 20px |
| Floating Buttons | 9999px (circle) |
| Chips/Badges | 20px |

---

## 🎯 DESIGN EMOTION TARGET

The app must feel: **Safe · Calm · Trusting · Modern · Premium**

> Think: Apple Health + Linear + Calm + Luxury healthcare
> NOT: Hospital ERP · Bootstrap · Corporate SaaS · Dark cyberpunk

---

## 📁 WHERE TOKENS LIVE IN CODE

| File | Role |
|---|---|
| `constants/doctorTheme.js` | Theme object used by doctor shell (JS StyleSheet) |
| `tailwind.config.js` | Tailwind utility class tokens (NativeWind) |
| `DESIGN.md` | Human-readable design guidelines |
| `COLOR_SYSTEM.md` | **This file — canonical color bible** |
