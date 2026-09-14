# Technical Quiz — Output Prediction Challenge

A static, single-page quiz app (plain HTML/CSS/JS — no build step, no dependencies).

## Deploy to Vercel

**Option A — Vercel dashboard**
1. Push this folder to a GitHub/GitLab/Bitbucket repo (or drag-and-drop the folder at https://vercel.com/new).
2. Import the repo in Vercel. Framework preset: "Other" (no build command, no output directory needed — it's already static).
3. Click Deploy.

**Option B — Vercel CLI**
```bash
npm i -g vercel
cd output_prediction
vercel        # first deploy, follow the prompts
vercel --prod # promote to production
```

No environment variables, build command, or output directory are required — `index.html`, `style.css`, `script.js`, and `questions.js` are served as-is.

## Local preview

Just open `index.html` in a browser, or serve it locally:
```bash
npx serve .
```
