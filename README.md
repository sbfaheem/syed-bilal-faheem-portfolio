# Syed Bilal Faheem Portfolio — Vercel Admin Edition

This is the complete Vercel-compatible portfolio, including the password-protected Admin Panel, persistent content storage and image uploads.

## What works

- Admin login at `/admin`
- Edit page text and contact details
- Add, edit, reorder or remove services, awards and portfolio projects
- Select up to four homepage flagship projects
- Update project descriptions, impact metrics, links and thumbnails
- Upload the profile image and dashboard/project images
- Change the whole-site color theme
- Increase font sizes section by section
- Change the Admin Panel password
- Public pages request the newest saved content immediately

## First deployment on Vercel

1. Upload the contents of this folder to the root of your GitHub repository. `package.json`, `app`, `public`, `lib` and `db` must all be at the repository root.
2. In Vercel, choose **Add New → Project**, import the GitHub repository and keep **Next.js** as the detected framework.
3. Before the final production deployment, open the Vercel project’s **Storage/Marketplace** area and connect a Postgres database. Neon Postgres is suitable. Confirm that Vercel adds `DATABASE_URL` to the project.
4. Create and connect a **public Vercel Blob** store to the same project. Vercel adds the Blob credentials automatically.
5. Deploy or redeploy the project after both storage services are connected.
6. Open `https://YOUR-VERCEL-DOMAIN/admin`.

The database tables are created automatically on the first request; there is no SQL migration command to run.

## First login

- Username: `admin`
- Password: `Admin@123`

Immediately open **Security** in the Admin Panel and replace the testing password with a unique password containing at least 10 characters. The new password is salted and hashed before it is saved. Changing it ends all existing Admin Panel sessions.

## How live updates work

Each Save button writes to the connected Postgres database. Public pages load `/api/site-content` without browser caching, so text, collections, contact details, themes and font sizes update on the live Vercel website without a GitHub commit or a new Vercel deployment. Uploaded images are stored in Vercel Blob and become available through the website’s media API.

## Required Vercel resources

| Resource | Purpose |
| --- | --- |
| `DATABASE_URL` | Admin credentials, sessions and all editable website content |
| Vercel Blob connection | Profile images and project/dashboard thumbnails |

Do not commit `.env` or `.env.local` files to GitHub.

## Local development

Copy `.env.example` to `.env.local`, add credentials for a test Postgres database and Vercel Blob store, then run:

```bash
npm install
npm run dev
```

Open `http://localhost:3000` for the website and `http://localhost:3000/admin` for the Admin Panel.
