/**
 * ============================================================
 * SWASTHAI DOCTOR THEME — STRICT PREMIUM PURPLE COLOR SYSTEM
 * ============================================================
 * ⚠️  DO NOT change any color without reading: COLOR_SYSTEM.md
 *
 * PROHIBITED:  dark navy (#0A0F1E), teal (#00D4AA), neon, bootstrap blue
 * BRAND COLOR: #8B5CF6 (Primary Purple) — used everywhere as `brand.teal`
 *              (key kept as `teal` for backward compatibility only)
 * BACKGROUND:  #FAFAFC (main) / #FFFFFF (cards) / #F5F3FF (sections)
 * TEXT:        #111827 (primary) / #6B7280 (secondary) / #9CA3AF (muted)
 * ============================================================
 */
export const doctorTheme = {
  bg: {
    primary: '#FAFAFC',      // Main Background
    secondary: '#FFFFFF',    // Secondary / Card Background
    tertiary: '#F5F3FF',     // Soft Section Background (Ultra Light Lavender)
    section: '#F3F0FF',      // Soft Section Background
  },
  brand: {
    teal: '#8B5CF6',         // Main Brand Purple (replaces teal everywhere)
    tealDim: '#8B5CF626',    // Soft Purple Shadow dim
    tealGlow: 'rgba(139,92,246,0.35)', // AI glow
    indigo: '#7C3AED',       // Deep Premium Purple
    lavender: '#C4B5FD',     // Soft Lavender
  },
  text: {
    primary: '#111827',      // Primary Text
    secondary: '#6B7280',    // Secondary Text
    muted: '#9CA3AF',        // Muted Text
    inverse: '#FFFFFF',      // White Text
  },
  border: {
    subtle: '#E5E7EB',       // Input Border / Card Border
    default: '#C4B5FD',      // Soft Lavender Border
  },
  semantic: {
    success: '#22C55E',
    successDim: '#22C55E20',
    warning: '#FACC15',
    warningDim: '#FACC1520',
    error: '#EF4444',
    errorDim: '#EF444420',
    neutral: '#94A3B8',
  },
  card: {
    softPink: '#FBCFE8',
    softPeach: '#FED7AA',
    softMint: '#BBF7D0',
    softSky: '#CFFAFE',
  },
  shadow: {
    soft: 'rgba(139, 92, 246, 0.12)',
    floating: 'rgba(124, 58, 237, 0.28)',
    card: 'rgba(15, 23, 42, 0.05)',
  },
  typography: {
    display: { fontFamily: 'Syne_800ExtraBold', fontSize: 28, lineHeight: 34, color: '#111827' },
    h1: { fontFamily: 'Syne_700Bold', fontSize: 24, lineHeight: 30, color: '#111827' },
    h2: { fontFamily: 'Syne_600SemiBold', fontSize: 18, lineHeight: 24, color: '#111827' },
    h3: { fontFamily: 'Syne_600SemiBold', fontSize: 16, lineHeight: 22, color: '#111827' },
    bodyLg: { fontFamily: 'DMSans_400Regular', fontSize: 15, lineHeight: 22 },
    body: { fontFamily: 'DMSans_400Regular', fontSize: 13, lineHeight: 20 },
    bodyMed: { fontFamily: 'DMSans_500Medium', fontSize: 13, lineHeight: 20 },
    bodySemi: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, lineHeight: 20 },
    caption: { fontFamily: 'DMSans_400Regular', fontSize: 11, lineHeight: 16 },
    link: { fontFamily: 'DMSans_500Medium', fontSize: 12, lineHeight: 16 },
    chipValue: { fontFamily: 'Syne_700Bold', fontSize: 20, lineHeight: 24 },
    tab: { fontFamily: 'DMSans_600SemiBold', fontSize: 10, lineHeight: 12 },
    tabInactive: { fontFamily: 'DMSans_500Medium', fontSize: 10, lineHeight: 12 },
    fabLabel: { fontFamily: 'DMSans_500Medium', fontSize: 9, lineHeight: 11 },
  },
  fonts: {
    sans: 'DMSans_400Regular',
  },
  radius: {
    chip: 20,
    card: 24,
    input: 20,
    btn: 18,
    sm: 8,
  },
  space: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
}
