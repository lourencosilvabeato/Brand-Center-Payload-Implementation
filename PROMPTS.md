# PROMPTS.md — Brand Center
## Feature Reference Guide for Claude Code

Read CLAUDE.md in full before starting any implementation.

---

## Checklist before starting a new session

- [ ] CLAUDE.md read in full
- [ ] `.env` configured (see Environment Variables section in CLAUDE.md)
- [ ] PostgreSQL running locally and database exists
- [ ] Azure AD App Registration configured with correct redirect URI — optional, skip for email+password local testing
- [ ] SMTP credentials set — optional, skip if not testing email flows
- [ ] GitHub repository: https://github.com/lourencosilvabeato/Brand-Center---Payload
- [ ] `.env` is in `.gitignore` and never committed

---

## What is built — feature overview

### 1. Project scaffold
Next.js 14 App Router + Payload CMS 3.x + PostgreSQL (`@payloadcms/db-postgres` / Drizzle ORM) + TypeScript strict mode. CSS Modules + CSS custom properties for all styling — no Tailwind. Fonts: IBM Plex Sans + Montserrat via `next/font`. Payload Admin embedded at `/admin`. Route groups: `(auth)` for unauthenticated pages, `(platform)` for the authenticated shell, `(public)` for legal pages, `(payload)` for the Payload Admin and REST API.

### 2. Authentication — Azure AD SSO
Custom OAuth 2.0 callback at `app/api/users/oauth/callback/azure/route.ts`. Flow: redirect to Azure login → Azure redirects back with a `code` → callback exchanges the code for tokens using the Azure token endpoint → fetches the user profile from Microsoft Graph → finds or creates a `platformUsers` document → sets a Payload session cookie (`payload-token`). Azure credentials live in `.env`: `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`, `AZURE_TENANT_ID`, `AZURE_REDIRECT_URI`.

### 3. Authentication — Payload built-in (external users)
`externalUsers` collection uses Payload's built-in auth. Email+password login goes through Payload's standard login endpoint. The custom `/login` page calls `POST /api/external-users/login` and sets the Payload JWT cookie on success. Password hashing, salting, and session management are handled entirely by Payload.

### 4. Middleware and auth guard
`src/middleware.ts` (Next.js Edge runtime). Decodes the `payload-token` JWT structurally (no Node crypto — Edge limitation). Rules: `/api/*` passes through; `/_next/*` and static assets pass through; `/admin/login`, `/admin/create-first-user`, `/admin/logout` pass through; `/admin/*` requires `role: 'admin'`; public auth pages (`/login`, `/reset-password`, `/set-password`, `/expired-link`) pass through; all other routes require any valid non-expired session. Expired or invalid tokens are cleared from cookies.

### 5. Payload collections

**platformUsers** — internal SSO users. Fields: `email`, `displayName`, `avatarUrl`, `azureId`, `role` (admin | localAdmin | internal). No password — SSO only.

**externalUsers** — external users with Payload built-in auth. Fields: `email`, `role: 'external'`. Password managed by Payload.

**invitations** — invite tokens. Fields: `email`, `tokenHash` (SHA-256), `expiresAt` (ISO), `used` (boolean), `invitedBy` (relation to platformUsers). Token never stored raw.

**passwordResets** — reset tokens. Fields: `user` (relation to externalUsers), `tokenHash`, `expiresAt`, `used`. Same hashing pattern as invitations.

**channelPages** — C01 landing pages with child cards. Fields: `title`, `slug`, `excerpt`, `description`, `buttons[]`, `cards[]` (image + title + link).

**contentPages** — C02 content pages with block layout. Fields: `title`, `slug`, `excerpt`, `layout` (blocks array), `anchors[]` (id + label for the anchor bar).

**legalPages** — E03 public legal pages. Fields: `title`, `slug`, `layout` (blocks array). No auth required.

**media** — Payload upload collection for images. Used by imageBlock, channelPage cards, login page hero.

**protectedFiles** — authenticated download collection. Access control: authenticated users only. Served via `app/api/download/[fileId]/route.ts`.

### 6. Payload globals

**homePage** — B01 homepage content. Fields: `newInItems[]` (title + link + image), `quickAccessItems[]` (title + link + icon), `helpButtons[]` (label + url).

**navigation** — main menu tree. Fields: `items[]` — 3-level tree (L1 > L2 > L3), each node has `title`, `slug`, `pageType` (channelPage | contentPage). Drives mega-menu, mobile menu, left sidebar, and breadcrumb.

**footerSettings** — footer content. Fields: `brandName`, `socialLinks[]`, `legalLinks[]`, `copyright`, `contactEmail`.

**loginSettings** — login page CMS control. Fields: `heroImage` (relation to media), `institutionalLinkLabel`, `institutionalLinkUrl`, `changePasswordIntroduction`.

### 7. Block system (C03)
All blocks defined in `src/payload/blocks/` and rendered in `src/components/blocks/Blocks.tsx`. Ten block types:

- **richText** — Payload Lexical editor. Renders headings, paragraphs, lists (including checkmark and cross lists), inline formatting, links. Custom Lexical nodes for checkmark/cross list items.
- **imageBlock** — single image with optional caption and alt. Relation to `media`.
- **quoteBlock** — styled blockquote with optional attribution.
- **noteBlock** — info/warning callout with left border accent colour.
- **tableBlock** — `rows[]` each containing `cells[]`. Rendered as a standard HTML table.
- **gridBlock** — image grid with configurable columns (1/2/3/4/6). Each item: image + title + optional url.
- **collectionCardBlock** — card with image, title, and link. Used for cross-linking.
- **downloadBlock** — labelled download button. `file` is a relation to `protectedFiles`.
- **dividerBlock** — horizontal rule, no fields.
- **faqBlock** — accordion FAQ. `items[]` each with `question` and `answer` (Lexical rich text).

### 8. Invite flow (A02)
`POST /api/invite` — Admin or Local Admin sends an invite. Creates an `invitations` document with a SHA-256 hashed token and 24h expiry. Sends invitation email with a `/set-password?token=xxx` link. `GET /set-password?token=xxx` — validates token (hash match + expiry + not used). On password submission: creates an `externalUsers` document via Payload's built-in auth, marks invitation as `used: true`.

### 9. Password recovery (A03)
`POST /api/reset-password/request` — user submits email. Creates a `passwordResets` document with hashed token. Sends recovery email with `/reset-password?token=xxx` link. `POST /api/reset-password/confirm` — validates token, resets password via Payload's `resetPassword` API, marks token used.

### 10. Admin-initiated password reset (A04)
`POST /api/admin-reset-password` — Admin or Local Admin triggers a reset for a specific `externalUsers` document. Same token flow as A03 but initiated by an admin rather than the user. Sends a distinct email ("your password has been reset by an administrator").

### 11. Change password (A05)
`POST /api/change-password` — authenticated external user changes their own password. Verifies current password against Payload's auth, then updates via Payload's `updateByID`. Accessible from the platform header user menu at `/change-password`.

### 12. Logout (A06)
`POST /api/logout` — deletes the `payload-token` cookie and redirects to `/login`. Also calls Payload's logout endpoint to invalidate the server-side session.

### 13. Email module
`src/lib/email.ts` — single Nodemailer transporter configured from `SMTP_USER` and `SMTP_PASS`. Four email functions: `sendInvitationEmail`, `sendPasswordRecoveryEmail`, `sendAdminPasswordResetEmail`, `sendContactFormEmail`. All templates are inline HTML with hardcoded styles (email client compatibility). Sender address from `EMAIL_FROM` env var with fallback to `SMTP_USER`.

### 14. Global layout
`src/components/layout/` — all layout components are Server Components except where interaction is required.

**Header / HeaderClient.tsx** — logo, desktop nav trigger, user avatar menu, search icon. Sticky. `HeaderClient` is a Client Component handling open/close state for the mega-menu and mobile menu.

**MegaMenu** — desktop dropdown driven by the `navigation` global. L1 items trigger L2 panels with L3 links. Closes on outside click and route change.

**MobileMenu** — full-screen overlay for mobile. Same `navigation` global. Accordion-style L1 > L2 > L3 expansion.

**Footer** — static layout fed from `footerSettings` global. Social links, legal links, copyright.

**LeftSidebar** — visible on C01 and C02 pages within the navigation hierarchy. Renders the current L1 section's L2/L3 tree. Active state tracked by current pathname.

**Breadcrumb** — visible only on pages in the navigation tree. Not shown on FAQs, Navigation Tips, Contact, legal pages.

**AnchorBar** — visible on C02 content pages that declare `anchors[]`. Sticky on desktop. Smooth-scrolls to section IDs on click.

### 15. Homepage (B01)
`src/app/(platform)/page.tsx` — fetches `homePage` global via Payload Local API. Three sections: **New In** (recent additions carousel/grid), **Quick Access** (icon links), **Help** (CTA buttons). Hero image and section content fully CMS-driven.

### 16. Channel page (C01)
`src/app/(platform)/[...slug]/page.tsx` — resolves slug against `channelPages`. Renders the page excerpt, description, optional buttons, and a card grid of child pages. Cards link to the corresponding C02 content pages.

### 17. Content page (C02)
`src/app/(platform)/[...slug]/page.tsx` — resolves slug against `contentPages`. Renders the block layout via `Blocks.tsx`. Shows the anchor bar if `anchors[]` is populated. Shows the left sidebar based on navigation membership.

### 18. Search (D01)
`src/app/(platform)/search/page.tsx` — `GET /api/search?q=` queries Payload's full-text search across `contentPages` and `channelPages`. Results display with title, excerpt, and breadcrumb path. Debounced input with loading state.

### 19. Contact form (E01)
`src/app/(platform)/contact/page.tsx` + `POST /api/contact` — form fields: name, email, subject, message. On submit: sends a notification email via the email module. No data is persisted in Payload.

### 20. Legal pages (E03)
`src/app/(public)/[...slug]/page.tsx` — unauthenticated route group. Resolves slug against `legalPages`. Same block renderer as content pages. No sidebar, no breadcrumb, no auth required.

### 21. 404 page
`src/app/(platform)/[...slug]/page.tsx` — returns `notFound()` when neither `channelPages` nor `contentPages` returns a result for the slug. Renders `not-found.tsx` with a back-to-home link.

### 22. Protected file downloads
`src/app/api/download/[fileId]/route.ts` — verifies the `payload-token` cookie. If valid, fetches the file from the `protectedFiles` collection and streams it with the correct `Content-Disposition` header. Invalid or missing token returns 401.

### 23. CI/CD pipeline
`bitbucket-pipelines.yml` — triggers on push to `main`. Builds a Docker image, pushes to AWS ECR, then deploys to EC2 via SSH. The pipeline IP is temporarily added to the EC2 security group for the SSH step and removed in the after-script. All secrets injected via Bitbucket repository variables.

---

## How to extend the system

### Adding a new block type
1. Create the block definition in `src/payload/blocks/NewBlock.ts` following existing patterns
2. Register it in the `layout` field array in `contentPages` (and `legalPages` if applicable) in `src/payload/collections/`
3. Add a React component in `src/components/blocks/`
4. Add the case to the switch in `src/components/blocks/Blocks.tsx`
5. Run `npm run generate:types` to update `payload-types.ts`

### Adding a new collection
1. Create `src/payload/collections/NewCollection.ts`
2. Register it in `src/payload/payload.config.ts`
3. Run `npm run generate:types`
4. Add access control using the role pattern from existing collections

### Adding a new email trigger
1. Add a new function to `src/lib/email.ts` following the existing template pattern
2. Call it from the relevant API route
3. No transporter changes needed — the single transporter is reused

### Adding a new role
1. Add the value to the `role` enum in the relevant collection (`platformUsers` or `externalUsers`)
2. Update access control functions across all collections that reference the role
3. Update `middleware.ts` if the new role needs different route access
4. Run `npm run generate:types`

---

## Known limitations

- Azure AD SSO requires a live App Registration — cannot be fully tested without one. External user (email+password) flows work without Azure.
- Email sending requires real SMTP credentials. For local dev, email functions can be stubbed or the env vars left empty (Nodemailer will fail silently if the transporter is misconfigured).
- The `protectedFiles` collection stores files on the local filesystem in development. There is no cloud storage integration (S3/R2) in this implementation.
- Search relies on Payload's built-in full-text search — no external search engine (Algolia, Elasticsearch, etc.).
- No sub-brand switching — all content is served under a single brand identity.
- The WordPress parallel implementation is not in this repository.

---

## Environment variables

```
DATABASE_URL          — PostgreSQL connection string (postgres://user:pass@host:5432/dbname)
PAYLOAD_SECRET        — JWT signing secret for Payload sessions — use a long random string
AZURE_CLIENT_ID       — Azure AD App Registration client ID
AZURE_CLIENT_SECRET   — Azure AD App Registration client secret
AZURE_TENANT_ID       — Azure AD directory (tenant) ID
AZURE_REDIRECT_URI    — Must match a Redirect URI registered in the Azure app (e.g. http://localhost:3000/api/users/oauth/callback/azure)
SMTP_USER             — SMTP username / login
SMTP_PASS             — SMTP password or API key
EMAIL_FROM            — Sender address shown in outgoing emails
NEXT_PUBLIC_APP_URL   — Base URL used to build absolute links in emails (e.g. http://localhost:3000)
```
