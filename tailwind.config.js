/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F9FAFB",
        card: "#FFFFFF",
        border: "#E5E7EB",
        "border-soft": "#EEF0F2",
        primary: {
          DEFAULT: "#2563EB",
          soft: "#EFF4FF",
        },
        success: {
          DEFAULT: "#059669",
          soft: "#ECFDF5",
        },
        danger: {
          DEFAULT: "#DC2626",
          soft: "#FEF2F2",
        },
        ink: {
          900: "#111827",
          700: "#374151",
          500: "#6B7280",
          400: "#9CA3AF",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "14px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(16,24,40,0.04)",
        md: "0 1px 3px rgba(16,24,40,0.06), 0 6px 16px -8px rgba(16,24,40,0.08)",
      },
    },
  },
  plugins: [],
}
