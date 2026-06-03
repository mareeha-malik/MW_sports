import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		container: {
  			center: true,
  			padding: '15px'
  		},
  		colors: {
  			BrightOrange: '#F97316',
  			BgWalaBlack: '#1C1C1C',
  			HeaderWalaBlack: '#000000'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		backgroundColor: {
  			'light-bg': '#F9FAFB',
  			'light-card': '#FFFFFF',
  			'light-input': '#F3F4F6'
  		},
  		textColor: {
  			'light-text': '#1F2937',
  			'light-text-secondary': '#6B7280'
  		},
  		borderColor: {
  			'light-border': '#E5E7EB'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
