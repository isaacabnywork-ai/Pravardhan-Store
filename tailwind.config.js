/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#0C831F",
          "green-dark": "#096317",
          "green-light": "#F0F8F1",
          "green-subtle": "#F7FCF8",
          "green-border": "#CBE8CE",
          yellow: "#F8B602",
          "yellow-hover": "#E5A700",
          "yellow-light": "#FFF9E6",
          bg: "#F4F6F8",
          surface: "#FFFFFF",
          text: "#1C1C1C",
          "text-muted": "#666666",
          "text-subtle": "#999999",
          border: "#EAEAEA",
          "border-subtle": "#F2F2F2",
        },
        status: {
          success: "#0C831F",
          "success-bg": "#F0F8F1",
          warning: "#D97706",
          "warning-bg": "#FFFBEB",
          danger: "#DC2626",
          "danger-bg": "#FEF2F2",
          info: "#2563EB",
          "info-bg": "#EFF6FF",
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        card: "0 1px 4px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04)",
        dropdown: "0 8px 24px -4px rgba(0, 0, 0, 0.12)",
        drawer: "0 -4px 24px -4px rgba(0, 0, 0, 0.15), 0 20px 30px -10px rgba(0, 0, 0, 0.2)",
        cartbar: "0 -2px 10px 0 rgba(0, 0, 0, 0.08)",
      },
      borderRadius: {
        base: "8px",
        md: "10px",
        lg: "12px",
        xl: "16px",
      }
    },
  },
  plugins: [],
};
