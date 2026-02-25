import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                carmelita: {
                    red: "#C0392B",
                    "red-dark": "#962D22",
                    gold: "#D4A520",
                    "gold-light": "#F0C040",
                    dark: "#1A0A00",
                    cream: "#FDF6E3",
                    "cream-dark": "#F5E6C8",
                    orange: "#E8681A",
                    green: "#2E7D32",
                },
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
            },
            fontFamily: {
                display: ["Playfair Display", "Georgia", "serif"],
                body: ["Inter", "system-ui", "sans-serif"],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "hero-pattern":
                    "linear-gradient(135deg, rgba(26,10,0,0.85) 0%, rgba(192,57,43,0.7) 100%)",
            },
            animation: {
                "fade-in": "fadeIn 0.5s ease-in-out",
                "slide-up": "slideUp 0.4s ease-out",
                "slide-in": "slideIn 0.3s ease-out",
                pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(20px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                slideIn: {
                    "0%": { opacity: "0", transform: "translateX(-10px)" },
                    "100%": { opacity: "1", transform: "translateX(0)" },
                },
            },
            boxShadow: {
                "card-hover": "0 20px 60px rgba(192, 57, 43, 0.15)",
                glass: "0 8px 32px rgba(0, 0, 0, 0.12)",
            },
        },
    },
    plugins: [],
};

export default config;
