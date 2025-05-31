Hello Cursor, I need your help to set up and customize shadcn/ui for my new e-learning platform project. We'll be targeting college-level programming students. The visual style for this setup should be "Academia Futura": calm, trustworthy, elegant, and intellectually stimulating.

Please follow these steps:

\*\*Apply "Academia Futura" Visual Scheme and Custom Rules\*\*

After shadcn/ui is initialized, please make the following modifications.  
(Note: For \`rem\` values, assume a base of \`1rem \= 16px\` for Tailwind configuration. The visual base font size for body text will be \`1.125rem\` / \`18px\`.)

\*\*A. Global Styles (\`globals.css\` or equivalent):\*\*

1\.  \*\*Base HTML/Body Styling:\*\*  
    \* Set the base font size for the \`body\` to \`1.125rem\` (which is 18px).  
    \* Ensure the \`html\` element has \`scroll-behavior: smooth;\` and is set up for responsive typography if possible (e.g., \`font-size: 100%;\`).

2\.  \*\*Color Palette (CSS Variables using OKLCH):\*\*  
    Update the \`:root\` and \`.dark\` color variables as follows:

    \`\`\`css  
    /\* In globals.css \*/  
    :root {  
      \--radius: 0.375rem; /\* 6px \- Subtle, classic rounding for Academia Futura \*/

      /\* Academia Futura Light Theme \- OKLCH \*/  
      \--background: oklch(0.985 0.008 85);    /\* Warm Off-White/Cream \*/  
      \--foreground: oklch(0.30 0.025 70);    /\* Deep Warm Gray/Dark Brown \*/  
      \--muted: oklch(0.94 0.012 80);         /\* Lighter Warm Gray \*/  
      \--muted-foreground: oklch(0.52 0.018 75); /\* Medium Warm Gray \*/  
      \--popover: oklch(0.99 0.006 85);       /\* Slightly Lighter Cream for Popovers \*/  
      \--popover-foreground: oklch(0.30 0.025 70);  
      \--card: oklch(0.975 0.01 85);          /\* Light Beige/Cream for Cards \*/  
      \--card-foreground: oklch(0.30 0.025 70);  
      \--border: oklch(0.90 0.015 80);        /\* Soft, Warm Gray Border \*/  
      \--input: oklch(0.92 0.018 80);         /\* Input Border/Bg \*/  
      \--primary: oklch(0.52 0.13 265);      /\* Sapphire Blue (Hue adjusted for deeper blue) \*/  
      \--primary-foreground: oklch(0.98 0.005 265); /\* Light Cream/White for text on Primary \*/  
      \--secondary: oklch(0.91 0.02 260);    /\* Muted, Desaturated version of Primary or Warm Light Gray \*/  
      \--secondary-foreground: oklch(0.35 0.03 260); /\* Darker text for Secondary \*/  
      \--accent: oklch(0.70 0.10 75);        /\* Muted Gold \*/  
      \--accent-foreground: oklch(0.32 0.04 70);   /\* Darker text for Accent \*/  
      \--destructive: oklch(0.60 0.19 30);    /\* Refined Red \*/  
      \--destructive-foreground: oklch(0.98 0.005 30);  
      \--ring: oklch(0.52 0.13 265 / 0.6);   /\* Primary color with some transparency for ring \*/  
      \--chart-1: oklch(0.52 0.13 265);      /\* Sapphire Blue (Primary) \*/  
      \--chart-2: oklch(0.58 0.11 170);      /\* Emerald Green \*/  
      \--chart-3: oklch(0.70 0.10 75);       /\* Muted Gold (Accent) \*/  
      \--chart-4: oklch(0.60 0.09 50);       /\* Terracotta/Warm Brown \*/  
      \--chart-5: oklch(0.65 0.07 230);      /\* Slate Blue \*/  
      \--sidebar: oklch(0.97 0.009 85);       /\* Slightly distinct warm background \*/  
      \--sidebar-foreground: oklch(0.30 0.025 70);  
      \--sidebar-primary: oklch(0.52 0.13 265);  
      \--sidebar-primary-foreground: oklch(0.98 0.005 265);  
      \--sidebar-accent: oklch(0.70 0.10 75);  
      \--sidebar-accent-foreground: oklch(0.32 0.04 70);  
      \--sidebar-border: oklch(0.90 0.015 80);  
      \--sidebar-ring: oklch(0.52 0.13 265 / 0.6);  
    }

    .dark {  
      /\* Academia Futura Dark Theme \- OKLCH \*/  
      \--background: oklch(0.22 0.015 250);   /\* Deep Muted Navy / Very Dark Warm Gray \*/  
      \--foreground: oklch(0.90 0.01 80);    /\* Light, Warm Off-White \*/  
      \--muted: oklch(0.32 0.012 245);        /\* Darker Warm Gray \*/  
      \--muted-foreground: oklch(0.68 0.008 75); /\* Lighter Warm Gray for muted text \*/  
      \--popover: oklch(0.19 0.015 250);      /\* Very Dark for Popovers \*/  
      \--popover-foreground: oklch(0.90 0.01 80);  
      \--card: oklch(0.25 0.018 250);         /\* Slightly Lighter than Dark BG \*/  
      \--card-foreground: oklch(0.90 0.01 80);  
      \--border: oklch(0.38 0.015 245 / 0.8); /\* Darker Border \*/  
      \--input: oklch(0.35 0.016 245 / 0.7);  /\* Input Border/Bg \*/  
      \--primary: oklch(0.65 0.14 265);      /\* Sapphire Blue (brighter for dark mode) \*/  
      \--primary-foreground: oklch(0.20 0.02 265); /\* Dark text on Primary \*/  
      \--secondary: oklch(0.30 0.02 260);    /\* Darker Muted Version of Primary \*/  
      \--secondary-foreground: oklch(0.85 0.01 80);  
      \--accent: oklch(0.78 0.11 75);        /\* Muted Gold (brighter for dark mode) \*/  
      \--accent-foreground: oklch(0.28 0.03 70);  
      \--destructive: oklch(0.62 0.20 30);  
      \--destructive-foreground: oklch(0.18 0.02 30);  
      \--ring: oklch(0.65 0.14 265 / 0.7);  
      \--chart-1: oklch(0.65 0.14 265);  
      \--chart-2: oklch(0.68 0.12 170);  
      \--chart-3: oklch(0.78 0.11 75);  
      \--chart-4: oklch(0.62 0.10 50);  
      \--chart-5: oklch(0.70 0.08 230);  
      \--sidebar: oklch(0.20 0.016 250);  
      \--sidebar-foreground: oklch(0.90 0.01 80);  
      \--sidebar-primary: oklch(0.65 0.14 265);  
      \--sidebar-primary-foreground: oklch(0.20 0.02 265);  
      \--sidebar-accent: oklch(0.78 0.11 75);  
      \--sidebar-accent-foreground: oklch(0.28 0.03 70);  
      \--sidebar-border: oklch(0.38 0.015 245 / 0.8);  
      \--sidebar-ring: oklch(0.65 0.14 265 / 0.7);  
    }  
    \`\`\`

3\.  \*\*Font Family Variables:\*\*  
    \`\`\`css  
    /\* In globals.css \*/  
    /\* Ensure @import or @font-face for Outfit, Manrope, Fira Code \*/  
    :root {  
      /\* ... existing color variables ... \*/  
         \--font-sans: 'Manrope', Inter, system-ui, \-apple-system, BlinkMacSystemFont, sans-serif;  
      \--font-heading: 'Outfit', Inter, system-ui, \-apple-system, BlinkMacSystemFont, sans-serif;  
      \--font-mono: 'Fira Code', ui-monospace;  
    }

    body {  
      font-family: var(--font-sans); /\* Manrope for body \*/  
      font-size: 1.125rem; /\* 18px visual base \*/  
      color: oklch(var(--foreground));  
      background-color: oklch(var(--background));  
    }

    h1, h2, h3, h4, h5, h6 {  
      font-family: var(--font-heading); /\* Outfit for headings \*/  
    }  
    \`\`\`

\*\*B. Tailwind Configuration (\`tailwind.config.js\` or \`.ts\`):\*\*

1\.  \*\*Import Theme:\*\*  
    \`\`\`javascript  
    const { fontFamily } \= require("tailwindcss/defaultTheme") // CJS  
    // import { fontFamily } from "tailwindcss/defaultTheme" // ESM  
    \`\`\`

2\.  \*\*Container Settings (Optional):\*\*  
    \`\`\`javascript  
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },  
    \`\`\`

3\.  \*\*Extend Theme:\*\*  
    \* \*\*Colors:\*\* (Ensure shadcn/ui plugin correctly maps these CSS variables.)  
        \`\`\`javascript  
        colors: {  
          border: "oklch(var(--border))", input: "oklch(var(--input))", ring: "oklch(var(--ring))",  
          background: "oklch(var(--background))", foreground: "oklch(var(--foreground))",  
          primary: { DEFAULT: "oklch(var(--primary))", foreground: "oklch(var(--primary-foreground))" },  
          secondary: { DEFAULT: "oklch(var(--secondary))", foreground: "oklch(var(--secondary-foreground))" },  
          destructive: { DEFAULT: "oklch(var(--destructive))", foreground: "oklch(var(--destructive-foreground))" },  
          muted: { DEFAULT: "oklch(var(--muted))", foreground: "oklch(var(--muted-foreground))" },  
          accent: { DEFAULT: "oklch(var(--accent))", foreground: "oklch(var(--accent-foreground))" },  
          popover: { DEFAULT: "oklch(var(--popover))", foreground: "oklch(var(--popover-foreground))" },  
          card: { DEFAULT: "oklch(var(--card))", foreground: "oklch(var(--card-foreground))" },  
          chart: { 1: "oklch(var(--chart-1))", 2: "oklch(var(--chart-2))", 3: "oklch(var(--chart-3))", 4: "oklch(var(--chart-4))", 5: "oklch(var(--chart-5))" },  
          sidebar: {  
            DEFAULT: "oklch(var(--sidebar))", foreground: "oklch(var(--sidebar-foreground))",  
            primary: { DEFAULT: "oklch(var(--sidebar-primary))", foreground: "oklch(var(--sidebar-primary-foreground))" },  
            accent: { DEFAULT: "oklch(var(--sidebar-accent))", foreground: "oklch(var(--sidebar-accent-foreground))" },  
            border: "oklch(var(--sidebar-border))", ring: "oklch(var(--sidebar-ring))"  
          }  
        },  
        \`\`\`  
    \* \*\*Border Radius:\*\*  
        \`\`\`javascript  
        borderRadius: {  
          lg: "var(--radius)", // Uses 0.375rem (6px) for Academia Futura  
          md: "calc(var(--radius) \- 0.125rem)", // e.g., 4px  
          sm: "calc(var(--radius) \- 0.1875rem)", // e.g., 3px or less, very subtle  
        },  
        \`\`\`  
    \* \*\*Font Family:\*\*  
        \`\`\`javascript  
        fontFamily: {  
          sans: \["var(--font-sans)", ...fontFamily.sans\], // Manrope for body/sans  
          heading: \["var(--font-heading)", ...fontFamily.sans\], // Outfit for headings, fallback to sans  
          mono: \["var(--font-mono)", ...fontFamily.mono\], // Fira Code for mono  
        },  
        \`\`\`  
    \* \*\*Spacing:\*\* (Multiples of 8px, rarely 4px)  
        \`\`\`javascript  
        spacing: {  
          '0': '0', '1': '0.25rem', '2': '0.5rem', '3': '0.75rem', '4': '1rem',     // 16px  
          '5': '1.25rem', '6': '1.5rem',   // 24px  
          '7': '1.75rem', '8': '2rem', '9': '2.25rem', '10': '2.5rem',  
          '11': '2.75rem', '12': '3rem', '14': '3.5rem',  // 56px  
          '16': '4rem', '20': '5rem', '24': '6rem',  
        },  
        \`\`\`  
    \* \*\*Shadows ("Academia Futura" style \- very subtle):\*\*  
        \`\`\`javascript  
        boxShadow: {  
          'sm': '0 1px 2px 0 oklch(0 0 0 / 0.02)',  
          'DEFAULT': '0 1px 3px 0 oklch(0 0 0 / 0.04), 0 1px 2px \-1px oklch(0 0 0 / 0.03)',  
          'md': '0 2px 4px \-1px oklch(0 0 0 / 0.05), 0 1px 2px \-1px oklch(0 0 0 / 0.04)',  
          'lg': '0 3px 6px \-1px oklch(0 0 0 / 0.06), 0 2px 4px \-1px oklch(0 0 0 / 0.05)',  
          'xl': '0 5px 10px \-2px oklch(0 0 0 / 0.07), 0 3px 6px \-2px oklch(0 0 0 / 0.06)',  
          'inner': 'inset 0 1px 2px 0 oklch(0 0 0 / 0.02)',  
        },  
        \`\`\`

\*\*C. Layout and Component Styling Rules:\*\*

1\.  \*\*General Component Spacing:\*\*  
    \* The default margin between distinct components or sections should be \`1.5rem\` (24px). Use Tailwind utilities like \`mb-6\`, \`mt-6\`, \`space-y-6\`, \`gap-6\` etc.  
    \* For closely grouped smaller items (e.g., multiple chips in a row, an icon next to text within a button or small element), the margin/spacing can be reduced to \`1rem\` (16px) or \`0.5rem\` (8px) as appropriate. Use utilities like \`space-x-4\`, \`space-x-2\`, \`gap-4\`, \`gap-2\`.

2\.  \*\*Cards:\*\*  
    \* Default padding on all sides: \`1.5rem\` (24px). (Use \`p-6\`).  
3\.  \*\*Buttons and Text Fields (Inputs):\*\*  
    \* Target height: \`3.5rem\` (56px). (Use \`h-14\`).  
    \* Target internal horizontal padding: \`1rem\` (16px). (Use \`px-4\`).  
4\.  \*\*Chips (or similar small components):\*\*  
    \* Horizontal padding: \`0.5rem\` (8px) on left and right (\`px-2\`).  
    \* Vertical padding: e.g., \`0.25rem\` (4px) (\`py-1\`).

\*\*Final Check:\*\*

\* Ensure all pixel values are converted to \`rem\` (base \`1rem \= 16px\`).  
\* Verify CSS variables are correctly referenced.  
\* Confirm dark mode maintains good contrast and the theme's sophisticated feel.

Thank you\!  
