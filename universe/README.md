# Sriram T. — Developer Universe (frontend only)

React + Vite + React Three Fiber + GSAP + Tailwind. No backend.

## Run
    npm install
    npm run dev        # http://localhost:5173
    npm run build && npm run preview

## Your files (public/assets/, exact names; placeholders show until they exist)
profile.png · resume.pdf · sports-national.jpg · sports-international.jpg · sports-running.jpg

## Edit content
Everything lives in `src/data/portfolioData.js`.

## Deploy on Vercel
1. Push this folder to a GitHub repository.
2. vercel.com → Add New Project → import the repo. Framework: Vite (auto-detected), build `npm run build`, output `dist`.
3. Deploy. Or from the CLI: `npx vercel --prod`.
