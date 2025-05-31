import type { Config } from 'tailwindcss'
import { PluginAPI } from 'tailwindcss/types/config'
import { fontFamily } from 'tailwindcss/defaultTheme'

const config = {
    darkMode: ['class'],
    content: [
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
    ],
    prefix: '',
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px',
            },
        },
        extend: {
            fontFamily: {
                sans: ['var(--font-sans)'],
                heading: ['var(--font-heading)'],
            },
            colors: {
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                success: {
                    DEFAULT: 'hsl(var(--success))',
                    foreground: 'hsl(var(--success-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
                chart: {
                    1: 'oklch(var(--chart-1))',
                    2: 'oklch(var(--chart-2))',
                    3: 'oklch(var(--chart-3))',
                    4: 'oklch(var(--chart-4))',
                    5: 'oklch(var(--chart-5))',
                },
                sidebar: {
                    DEFAULT: 'oklch(var(--sidebar))',
                    foreground: 'oklch(var(--sidebar-foreground))',
                    primary: {
                        DEFAULT: 'oklch(var(--sidebar-primary))',
                        foreground: 'oklch(var(--sidebar-primary-foreground))',
                    },
                    accent: {
                        DEFAULT: 'oklch(var(--sidebar-accent))',
                        foreground: 'oklch(var(--sidebar-accent-foreground))',
                    },
                    border: 'oklch(var(--sidebar-border))',
                    ring: 'oklch(var(--sidebar-ring))',
                },
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            spacing: {
                '0': '0',
                '1': '0.25rem',
                '2': '0.5rem',
                '3': '0.75rem',
                '4': '1rem',     // 16px
                '5': '1.25rem',
                '6': '1.5rem',   // 24px
                '7': '1.75rem',
                '8': '2rem',
                '9': '2.25rem',
                '10': '2.5rem',
                '11': '2.75rem',
                '12': '3rem',
                '14': '3.5rem',  // 56px
                '16': '4rem',
                '20': '5rem',
                '24': '6rem',
            },
            boxShadow: {
                'sm': '0 1px 2px 0 oklch(0 0 0 / 0.02)',
                'DEFAULT': '0 1px 3px 0 oklch(0 0 0 / 0.04), 0 1px 2px -1px oklch(0 0 0 / 0.03)',
                'md': '0 2px 4px -1px oklch(0 0 0 / 0.05), 0 1px 2px -1px oklch(0 0 0 / 0.04)',
                'lg': '0 3px 6px -1px oklch(0 0 0 / 0.06), 0 2px 4px -1px oklch(0 0 0 / 0.05)',
                'xl': '0 5px 10px -2px oklch(0 0 0 / 0.07), 0 3px 6px -2px oklch(0 0 0 / 0.06)',
                'inner': 'inset 0 1px 2px 0 oklch(0 0 0 / 0.02)',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' },
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
            },
            screens: {
                '1920x1080': {
                    raw: '(min-width: 1920px) and (min-height: 1080px)',
                },
                '1366x768': {
                    raw: '(max-width: 1366px) and (max-height: 768px)',
                },
                // Add more custom breakpoints as needed
            },
            height: {
                'screen-1366': '480px', // For 1366x768 resolution
                'screen-1920': '600px', // For 1920x1080 resolution
            },
        },
    },
    plugins: [
        require('tailwindcss-animate'),
        require('@tailwindcss/typography'),
        function ({ addComponents }: PluginAPI) {
            addComponents({
                '.no-spinners': {
                    '-moz-appearance': 'textfield',
                    '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button':
                        {
                            '-webkit-appearance': 'none',
                            margin: '0',
                        },
                },
            })
        },
    ],
} satisfies Config

export default config
