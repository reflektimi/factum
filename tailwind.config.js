import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            colors: {
                // Primary: Indigo (Modern SaaS)
                primary: {
                    50: '#eef2ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    300: '#a5b4fc',
                    400: '#818cf8',
                    500: '#6366f1',
                    600: '#4f46e5', // Main Brand
                    700: '#4338ca',
                    800: '#3730a3',
                    900: '#312e81',
                    950: '#1e1b4b',
                },
                // Sidebar: Slate (Dark Mode feel)
                sidebar: {
                    DEFAULT: '#0f172a', // slate-900
                    hover: '#1e293b',   // slate-800
                    active: '#334155',  // slate-700
                    text: '#f8fafc',    // slate-50
                    muted: '#94a3b8',   // slate-400
                },
                // Semantic Colors
                success: { DEFAULT: '#10b981', 50: '#ecfdf5', 600: '#059669' }, // Emerald
                warning: { DEFAULT: '#f59e0b', 50: '#fffbeb', 600: '#d97706' }, // Amber
                danger:  { DEFAULT: '#ef4444', 50: '#fef2f2', 600: '#dc2626' }, // Red
                info:    { DEFAULT: '#3b82f6', 50: '#eff6ff', 600: '#2563eb' }, // Blue
                
                // Surface
                surface: '#ffffff',
                background: '#f8fafc', // slate-50
            },
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
                heading: ['Inter', ...defaultTheme.fontFamily.sans], // Unifying for clean look
                display: ['Poppins', ...defaultTheme.fontFamily.sans], // Optional for hero text
            },
            boxShadow: {
                'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                'nav': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                'subtle': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-in',
                'slide-in': 'slideIn 0.3s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideIn: {
                    '0%': { transform: 'translateX(-20px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
            },
        },
    },

    plugins: [forms],
};
