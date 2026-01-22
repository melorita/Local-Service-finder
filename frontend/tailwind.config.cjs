module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                dark: {
                    DEFAULT: '#0f172a',
                    lighter: '#1e293b',
                    accent: '#334155'
                }
            },
        },
    },
    plugins: [],
}
