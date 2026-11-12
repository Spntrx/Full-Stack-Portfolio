# MyPortfolio — Full-Stack Portfolio

Assignment 3 integrates the React portfolio with the Express/MongoDB API from Assignment 2. Visitors can browse projects and qualifications and submit contact messages. Signed-in users can read portfolio records; only the seeded administrator can manage them or view contact submissions.

## Local setup

1. Install backend dependencies from the repository root and frontend dependencies from `client/`:

   ```sh
   npm install
   npm install --prefix client
   ```

2. Copy `server/.env.example` to `server/.env` and set `MONGO_URI`, a long random `JWT_SECRET`, and administrator values. Generate `ADMIN_PASSWORD_HASH` locally with bcrypt (for example, in the Node REPL: `const bcrypt = (await import('bcrypt')).default; await bcrypt.hash('your-private-password', 10)`), then put only the resulting hash in `server/.env`. The server seeds the administrator on startup without storing the plaintext password. Do not commit either `.env` file or paste credentials into screenshots.
3. Start the server and Vite frontend together:

   ```sh
   npm run dev
   ```

   The frontend uses `http://localhost:5173`, and the API uses `http://localhost:5000`. To use another API URL, set `VITE_API_URL` in `client/.env.local` (include the `/api` path). Add the deployed frontend origin to `FRONTEND_ORIGIN`.

The server loads `server/.env` when present and also accepts environment variables supplied by the hosting environment. MongoDB and JWT configuration are required. If the administrator settings are absent, the server logs a warning and no administrator is seeded.

## Authentication and authorization

- `POST /api/users/signup` (also `/register`) creates a regular user; `POST /api/users/login` signs in. Both return a one-day JWT access token and a password-free user object.
- The frontend stores that access token in `localStorage` under `portfolioAccessToken` and sends it as a bearer token for protected requests. The server verifies the token and checks its `role` claim for administrator operations.
- Sign-out removes the token from the browser. Tokens are stateless and are not revoked server-side, so a signed-out token remains valid until its one-day expiry; use HTTPS in deployment and keep the token private.
- Projects and qualifications can be read publicly. Creating, editing, and deleting them, and all contact-submission reads/updates/deletes, require the seeded administrator. Anyone may submit a contact form.
- Public sign-up cannot assign an administrator role. User administration endpoints are administrator-only.

## API routes

| Resource | Public access | Administrator access |
| --- | --- | --- |
| `/api/projects` | List and view one | Create, update, delete |
| `/api/qualifications` | List and view one | Create, update, delete |
| `/api/contacts` | Create a submission | List, view one, update, delete |
| `/api/users` | Sign up, sign in, view own profile at `/me` | User CRUD |

## Validation

```sh
npm run build --prefix client
npm run lint --prefix client
```
