/**
 * ============================================================
 * SWASTHAI TAILWIND CONFIG — STRICT PREMIUM PURPLE COLOR SYSTEM
 * ============================================================
 * ⚠️  DO NOT add colors here without reading: COLOR_SYSTEM.md
 *
 * PROHIBITED:  dark navy, teal, cyan, neon, bootstrap colors
 * BRAND:       primaryPurple #8B5CF6 | deepPurple #7C3AED
 * BACKGROUND:  mainBg #FAFAFC | backgroundWhite #FFFFFF
 * TEXT:        darkText #111827 | secondaryText #6B7280 | mutedText #9CA3AF
 * ============================================================
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primaryPurple: "#8B5CF6",
        deepPurple: "#7C3AED",
        lightPurple: "#A78BFA",
        softLavender: "#C4B5FD",
        ultraLightLavender: "#F5F3FF",
        // Backgrounds
        backgroundWhite: "#FFFFFF",
        offWhite: "#FAFAFA",
        lightGray: "#F3F4F6",
        borderGray: "#E5E7EB",
        softSection: "#F3F0FF",
        mainBg: "#FAFAFC",
        // Text
        darkText: "#111827",
        secondaryText: "#6B7280",
        mutedText: "#9CA3AF",
        // Status
        success: "#22C55E",
        warning: "#FACC15",
        danger: "#EF4444",
        neutral: "#94A3B8",
        info: "#3B82F6",
        // Card accents
        softPink: "#FBCFE8",
        softPeach: "#FED7AA",
        mintGreen: "#BBF7D0",
        softSky: "#CFFAFE",
        // ── Backward-compat aliases (used in existing onboarding screens) ──
        background: {
          light: "#FAFAFC",
          dark: "#FAFAFC",
        },
        surface: {
          light: "#FFFFFF",
          dark: "#FFFFFF",
        },
        text: {
          primary: "#111827",
          secondary: "#6B7280",
        },
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        sf: ["SF Pro Display", "Inter", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
      },
      borderRadius: {
        'card': '24px',
        'btn': '18px',
        'input': '20px',
        'chart': '22px',
        'floating': '9999px',
      },
      boxShadow: {
        'soft': '0px 10px 30px rgba(139, 92, 246, 0.08)',
        'card': '0px 8px 20px rgba(0,0,0,0.05)',
        'floating': '0px 15px 40px rgba(139,92,246,0.25)',
      }
    },
  },
  plugins: [],
}
