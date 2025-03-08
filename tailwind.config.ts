import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

/**
 * Enterprise-level Tailwind Configuration
 * Optimized for:
 * - KaTeX math rendering
 * - Code blocks with syntax highlighting
 * - Dark mode support
 * - Responsive typography
 * - Custom color schemes
 * - Geist font integration
 */
const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // Add components directory
    "./lib/**/*.{js,ts,jsx,tsx}", // Add lib directory
  ],
  plugins: [
    require("tailwindcss-animate"),
    typography,
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            // Code block styling
            'code::before': { content: '""' },
            'code::after': { content: '""' },
            'pre code::before': { content: '""' },
            'pre code::after': { content: '""' },
            'pre': {
              'overflow-x': 'auto',
              'border-radius': 'var(--radius)',
              'padding': '1.25rem', // Slightly increased padding
              'background-color': 'var(--card)',
              'color': 'var(--card-foreground)',
              'border': '1px solid var(--border)',
              'margin': '1.5rem 0', // Consistent margins
            },
            'pre code': {
              'font-family': 'var(--font-geist-mono)',
              'font-size': '0.875rem',
              'line-height': '1.6', // Improved readability
            },
            code: {
              backgroundColor: 'hsl(var(--muted))',
              padding: '0.25rem 0.375rem', // Adjusted padding
              borderRadius: '0.25rem',
              fontWeight: '400',
            },

            // Table styling
            table: {
              width: '100%',
              borderCollapse: 'collapse',
              marginTop: '1.5rem',
              marginBottom: '1.5rem',
            },
            'th,td': {
              padding: '0.75rem 1rem', // Consistent padding
              borderColor: 'var(--border)',
              verticalAlign: 'top',
            },
            th: {
              backgroundColor: 'var(--muted)',
              color: 'var(--muted-foreground)',
              fontWeight: '600',
              textAlign: 'left',
              whiteSpace: 'nowrap',
            },
            tr: {
              borderBottom: '1px solid var(--border)',
              transition: 'background-color 0.2s ease',
            },
            'tr:last-child': {
              borderBottom: 'none',
            },
            'tbody tr:hover': {
              backgroundColor: 'var(--muted/5%)', // Subtle hover effect
            },

            // KaTeX Math styling
            '.katex': {
              fontSize: '1.1em',
              fontWeight: '400',
              letterSpacing: '0.02em',
            },
            '.katex-display': {
              margin: '2rem 0', // Increased spacing
              padding: '0.5rem 0',
              overflowX: 'auto',
              overflowY: 'hidden',
              WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
              maxWidth: '100%',
            },
            '.math-content': {
              'overflow-x': 'auto',
              'max-width': '100%',
              'scrollbar-width': 'thin',
              'scrollbar-color': 'var(--border) transparent',
            },
            '.math-block': {
              margin: '1.5rem 0',
              padding: '1rem 0',
              borderTop: '1px solid var(--border)',
              borderBottom: '1px solid var(--border)',
            },
            '.math-inline': {
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
              backgroundColor: 'var(--muted/10%)',
            },
          }
        }
      },

      // Enhanced color system
      colors: {
        neutral: {
          '50': '#fafafa',
          '100': '#f5f5f5',
          '200': '#F0F0F0',
          '300': '#D1D1D1',
          '400': '#a3a3a3',
          '500': '#737373',
          '600': '#525252',
          '700': '#404040',
          '800': '#262626',
          '900': '#171717',
          '950': '#0a0a0a',
        },
        // HSL-based theme colors
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        }
      },

      // Font configuration
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)']
      },

      // Border radius system
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },

      // Animation durations
      transitionDuration: {
        '250': '250ms',
      }
    }
  },

  // Future-proofing configurations
  future: {
    hoverOnlyWhenSupported: true,
    respectDefaultRingColorOpacity: true,
    disableColorOpacityUtilitiesByDefault: true,
  },
};

export default config;