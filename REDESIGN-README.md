# Portfolio — next-generation frontend update

This update was prepared from the supplied GitHub main ZIP (archive commit `548e415a99f8a748289846c026d20274a30ccc64`, dated September 30, 2026). It is not deployed. The existing Vercel project, Postgres data, Blob assets, CMS defaults, administrator routes and dependencies are untouched.

## What changed

- `public/home.html`: new AI appointment receptionist lab, hero demo link, interactive service details and hero visual grid; original homepage copy, CMS keys, sections and links retained.
- `public/style.css`: appended public frontend visual treatment, responsive demo, button/keyboard styles, CSS hover lighting and motion-pause behavior. The original orange and cyan accents remain, with a navy/violet gradient layer.
- `public/next-generation.js`: progressive enhancement module for hero entrance and finite tech-card float, animated statistics, scroll progress, card spotlights, timeline highlights, toolkit filters, a motion pause preference and a four-industry scripted receptionist demo.
- `public/scroll-effects.js`: connects the new module to the existing controller lifecycle (including cleanup).
- `scripts/validate-site.mjs`: corrects two existing stale assertions (flagship introduction and Gmail compose link) to match the supplied source. This does not change the production copy or contact link.

The receptionist demo runs in the browser with sample choices only. It makes no real calls, uses no model API, records no personal information and makes no appointments. Its new content is static, not editable through the current admin UI. No new npm dependencies or environment variables are needed.

## Deploy safely through the existing GitHub + Vercel project

1. Keep your current GitHub repository and Vercel project. If the current repository differs from the September 30 archive, review the diff before copying files; do not overwrite newer edits.
2. In a clean checkout of your actual portfolio repository, create a feature branch:

   ```bash
   git switch main
   git pull --ff-only
   git switch -c feature/next-gen-portfolio
   ```

3. Apply the supplied patch (from this archive's base commit) or copy only the five changed files listed above plus this optional README. If the patch does not apply cleanly, merge manually with your newer source rather than force overwriting.

   ```bash
   git apply --check /path/to/portfolio-next-generation.patch
   git apply /path/to/portfolio-next-generation.patch
   npm ci
   npm run lint:html
   npm run build
   ```

4. Run `npm run dev` locally. Open `http://localhost:3000`. The existing app needs a configured Postgres database to render live CMS content. Use a separate test database and Blob store for preview tests, never production secrets in a public repository. Use Vercel environment settings for the existing variable names (`DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`). Do not commit `.env` or `.env.local`.
5. Check homepage, `/portfolio`, `/services`, `/awards`, `/contact`, `/admin`, and `/api/site-content`. Confirm your original project selections, CMS text, images, credentials, project filters, contact form and admin edits still work. Exercise all four receptionist demo industries, alternate time, confirmation and restart. Verify mobile menu, 390px/768px/1440px layout, keyboard navigation, pause preference after reload, system reduced-motion, and Lighthouse performance.
6. Review `git diff`. Commit the changed files, push the feature branch, and open a pull request. If configured, your existing Vercel Git integration will create a Preview Deployment. Test that preview with a test database and Blob configuration. Merge only after it passes review; the production branch deployment then follows your existing Vercel configuration.

   ```bash
   git add public/home.html public/style.css public/scroll-effects.js public/next-generation.js scripts/validate-site.mjs
   git commit -m "Enhance portfolio with interactive next-generation frontend"
   git push -u origin feature/next-gen-portfolio
   ```

7. If necessary, use your existing Vercel deployment rollback workflow or revert the merge. No data migration is included.

## Verification status

- Passed: original HTML/site validation after correcting the two stale tests; Node syntax checks for the new script, scroll controller, original behavior and CMS scripts; source comparison against the uploaded ZIP.
- Not verified: full Next.js production build, real database and Blob integrations, real browser interactions/layout and performance. Dependency installation and browser preview navigation were unavailable in the preparation environment. Complete the above checks before merging.
- Security: the original source uses documented bootstrap admin credentials. Ensure the production admin password was changed, and never expose actual credentials or environment files. This update does not modify authentication.
