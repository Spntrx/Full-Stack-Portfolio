# Avi Balsingh Portfolio — Frontend

The React frontend for the Assignment 3 full-stack portfolio. It includes six portfolio views, account sign-up/sign-in, API-backed contact submissions, and administrator CRUD controls for projects, qualifications, and contacts.

## Run locally

```sh
npm install --prefix ..
npm install
npm run dev --prefix ..
```

The backend must be configured using `server/.env`; see the repository [README](../README.md). The API URL defaults to `http://localhost:5000/api` and can be overridden with `VITE_API_URL` in `client/.env.local`.

## Build and lint

```sh
npm run build
npm run lint
```

Run the production build locally with `npm run preview`. The built static site is written to `dist/`.

## Project assets

- Profile and project photographs are in `public/images/`.
- The résumé PDF is `public/resume.pdf` and is linked from the About page.
- The original AB brand mark is used in the main navigation and browser favicon.

## Contact form

The contact form requires a visitor's first name, last name, contact number, email address, and message. Submissions are saved by the backend and the visitor returns to Home with a confirmation.

## Assignment handoff

- [ ] Review portfolio content and résumé before publishing.
- [x] Create a GitHub repository and push the complete source project: [Spntrx/React-Portfolio](https://github.com/Spntrx/React-Portfolio).
- [ ] Deploy the production build from `dist/` using a static host such as Netlify, Vercel, or Render.
- [ ] Add the live-site URL to the assignment submission.
- [x] Include a ZIP of the project source; exclude `node_modules/` and `dist/`.