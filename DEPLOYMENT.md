# GitHub Pages Deployment

## What was fixed

- The Vite production base path now matches the GitHub repository name: `yogshala`
- The `clean` script is now Windows-safe
- A GitHub Actions workflow now builds and deploys the app to GitHub Pages

## Required GitHub secrets

Add these repository secrets before deploying:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_GROQ_API_KEY`

## GitHub Pages setup

1. Open `Settings -> Pages`
2. Set `Source` to `GitHub Actions`
3. Push to `main` or `master`

The workflow file is `.github/workflows/deploy.yml`.

## Base path overrides

The app defaults to `/${repo-name}/` in production, using `yogshala`.

If the repo name changes, you can override it with:

- `VITE_GITHUB_PAGES_REPO`
- `VITE_BASE_PATH`
