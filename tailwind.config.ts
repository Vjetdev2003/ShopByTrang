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
                sans: ['Montserrat', 'sans-serif'],
                serif: ['"Playfair Display"', 'serif'],
            },
            colors: {
                neutral: {
                    50: '#f9f9f9',
                    100: '#f0f0f0',
                    200: '#e0e0e0',
                    300: '#d0d0d0',
                    400: '#a0a0a0',
                    500: '#808080',
                    600: '#606060',
                    700: '#404040',
                    800: '#202020',
                    900: '#101010',
                },
            },
        },
    },
    plugins: [],
};
export default config;
