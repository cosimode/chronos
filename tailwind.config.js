/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                // Il nostro "Nero OLED" non è #000000, ma un grigio scurissimo per profondità
                background: '#050505',
                surface: '#121212',
                surfaceHighlight: '#1E1E1E',
                // Accenti Emozionali
                accent: {
                    glow: '#4ade80', // Verde Smeraldo per il "Presente"
                    past: '#64748b', // Grigio Ardesia per il "Passato"
                    future: '#262626', // Grigio scuro per il "Futuro"
                }
            },
            animation: {
                'breathe': 'breathe 4s ease-in-out infinite',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                breathe: {
                    '0%, 100%': { opacity: 0.6, transform: 'scale(1)' },
                    '50%': { opacity: 1, transform: 'scale(1.05)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            }
        },
    },
    plugins: [],
}