import type { Config } from "tailwindcss";

const config: Config = {
content: [
"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
],
theme: {
extend: {
    fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-playfair)", "serif"], // 명조체 추가
    },
    colors: {
        paper: "#F8F9FA", // 신문 종이 색
        ink: "#1a1a1a",   // 잉크 색
    }
    },
},
plugins: [],
};
export default config;