module.exports = {
   content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}", "./pages/**/*.{js,jsx,ts,tsx}"],

    theme: {
      extend: {
        colors: {
          // Primary brand colors - warm, food-related tones
          amber: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
            900: '#78350f',
            950: '#451a03',
          },
          orange: {
            50: '#fff7ed',
            100: '#ffedd5',
            200: '#fed7aa',
            300: '#fdba74',
            400: '#fb923c',
            500: '#f97316',
            600: '#ea580c',
            700: '#c2410c',
            800: '#9a3412',
            900: '#7c2d12',
            950: '#431407',
          },
        },
        typography: {
          DEFAULT: {
            css: {
              color: '#1f2937',
              h1: {
                color: '#111827',
                fontWeight: '700',
              },
              h2: {
                color: '#111827',
                fontWeight: '600',
              },
              h3: {
                color: '#374151',
                fontWeight: '600',
              },
              strong: {
                fontWeight: '600',
              },
            },
          },
        },
        boxShadow: {
          'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          'lg': '0 10px 15px -3px rgba(249, 115, 22, 0.1)',
          'xl': '0 20px 25px -5px rgba(249, 115, 22, 0.15)',
          'glow': '0 0 20px rgba(249, 115, 22, 0.5)',
        },
        animation: {
          'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          'bounce-slow': 'bounce 2s infinite',
        },
        keyframes: {
          'pulse-glow': {
            '0%, 100%': { 
              opacity: '1',
              boxShadow: '0 0 20px rgba(249, 115, 22, 0.5)',
            },
            '50%': { 
              opacity: '0.8',
              boxShadow: '0 0 10px rgba(249, 115, 22, 0.3)',
            },
          },
        },
      },
    },
    plugins: [],
  }