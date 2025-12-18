
import type { Config } from "tailwindcss";



export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'heading': ['Rajdhani', 'sans-serif'],
				'body': ['Sentient', 'sans-serif'],
				'mono': ['JetBrains Mono', 'monospace'],
				'code': ['Fira Code', 'monospace'],
				'manrope': ['Manrope', 'sans-serif'],
			},
			fontSize: {
				// Brand typography scale - Zuvy Design System
				// Headings - Rajdhani font with line-height 1.3
				'h1': ['5.5rem', { lineHeight: '1.3', fontWeight: '700' }],      // 88px
				'h2': ['4rem', { lineHeight: '1.3', fontWeight: '700' }],        // 64px
				'h3': ['3rem', { lineHeight: '1.3', fontWeight: '700' }],        // 48px
				'h4': ['2.25rem', { lineHeight: '1.3', fontWeight: '700' }],     // 36px
				'h5': ['1.75rem', { lineHeight: '1.3', fontWeight: '700' }],     // 28px
				'h6': ['1.3125rem', { lineHeight: '1.3', fontWeight: '700' }],   // 21px

				// Mobile heading variants
				'h1-mobile': ['4.75rem', { lineHeight: '1.3', fontWeight: '700' }],   // 76px
				'h2-mobile': ['3.5rem', { lineHeight: '1.3', fontWeight: '700' }],    // 56px
				'h3-mobile': ['2.75rem', { lineHeight: '1.3', fontWeight: '700' }],   // 44px
				'h4-mobile': ['2rem', { lineHeight: '1.3', fontWeight: '700' }],      // 32px
				'h5-mobile': ['1.5rem', { lineHeight: '1.3', fontWeight: '700' }],    // 24px
				'h6-mobile': ['1.125rem', { lineHeight: '1.3', fontWeight: '700' }],  // 18px

				// Body text - Sentient font with line-height 1.5
				'body1': ['1rem', { lineHeight: '1.5', fontWeight: '400' }],         // 16px
				'body2': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],     // 14px
				'caption': ['0.75rem', { lineHeight: '1.5', fontWeight: '400' }],    // 12px

				// Mobile body variants
				'body1-mobile': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],  // 14px
				'body2-mobile': ['0.75rem', { lineHeight: '1.5', fontWeight: '400' }],   // 12px
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				info: {
					DEFAULT: 'hsl(var(--info))',
					foreground: 'hsl(var(--info-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			spacing: {
				'18': '4.5rem',
				'22': '5.5rem',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(0.5rem)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;