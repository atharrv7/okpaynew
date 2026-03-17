/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // CSS variable theme tokens (used by @apply border-border, bg-background, etc.)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // App-specific colors
        primary: "#1ad5e6", // Cyan/Teal
        secondary: "#020817", // Dark Navy
        dark: "#020817", // Main background
        "dark-lighter": "#0a1128", // Cards / Nav background
        "okpay-bg": "#020817",
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(26,213,230,0.3)',
        'glow-md': '0 0 20px rgba(26,213,230,0.05)',
        'glow-lg': '0 0 20px rgba(26,213,230,0.4)',
        'glow-xl': '0 0 24px rgba(26,213,230,0.4)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}

