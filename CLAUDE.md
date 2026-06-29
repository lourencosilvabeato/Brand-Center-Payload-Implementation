# CLAUDE.md — Brand Center (Payload CMS + Next.js)

## Project Overview

Brand Center is a private digital platform centralising brand guidelines and assets for a multi-brand client group and its sub-brands. It serves internal collaborators authenticated via Microsoft Azure AD / O365 SSO, and invited external users (partners, agencies, suppliers) authenticated with email + password.

This implementation uses **Payload CMS 3.x as the headless CMS and backend** and **Next.js (App Router) as the frontend**. It is a parallel implementation alongside a WordPress version, built for comparative evaluation. The same functional requirements, Figma designs, and Confluence specs apply to both.

---

## Tech Stack

| Layer | Technology |
|---|---|
| CMS / Content Backend | Payload CMS 3.x |
| Database | PostgreSQL (via Drizzle ORM — `@payloadcms/db-postgres`) |
| Frontend | Next.js 14+ (App Router) — Payload is embedded in the same Next.js app |
| Authentication | Payload built-in auth (email+password for external users) + custom Azure AD OAuth for SSO users |
| SSO Provider | Azure AD — custom OAuth handler at `/api/users/oauth/callback/azure` |
| Styling | CSS Modules + CSS custom properties (design tokens) |
| Language | TypeScript throughout |
| Fonts | IBM Plex Sans, Montserrat (via next/font or Google Fonts) |
| Payload Admin | Embedded at `/admin` route (built into Next.js app) |
| Email | Nodemailer via SMTP (configured via `SMTP_USER` + `SMTP_PASS` env vars) |
| Hosting (STG) | TBD |
| Hosting (PROD) | TBD |
| Browsers (Desktop) | Chrome, Edge, Firefox, Safari — 2 latest versions |
| Browsers (Mobile) | Chrome (Android), Safari (iOS) — 2 latest versions |

---

## Environment Variables

The `.env` file already contains the following — do not regenerate or overwrite these:

```
DATABASE_URL=postgres://postgres:your-db-password@127.0.0.1:5432/brand-center
PAYLOAD_SECRET=your-payload-secret-here

AZURE_CLIENT_ID=your-azure-client-id
AZURE_CLIENT_SECRET=your-azure-client-secret
AZURE_TENANT_ID=your-azure-tenant-id
AZURE_REDIRECT_URI=http://localhost:3000/api/users/oauth/callback/azure

SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
```

Additional vars to add when needed: `EMAIL_FROM` (sender address), `NEXT_PUBLIC_APP_URL` (base URL for token links).

---

## Project Structure

```
/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group — no nav shell
│   │   ├── login/page.tsx
│   │   ├── reset-password/page.tsx
│   │   ├── set-password/page.tsx
│   │   └── expired-link/page.tsx
│   ├── (platform)/               # Authenticated route group — with nav shell
│   │   ├── layout.tsx            # Header + Footer + auth guard
│   │   ├── page.tsx              # Homepage (B01)
│   │   ├── search/page.tsx       # D01
│   │   ├── contact/page.tsx      # E01
│   │   ├── faqs/page.tsx         # E02
│   │   ├── navigation-tips/page.tsx # E02
│   │   └── [...slug]/page.tsx    # Dynamic — C01 or C02 based on content type
│   ├── (public)/                 # Unauthenticated public pages
│   │   └── [...slug]/page.tsx    # E03 — legal pages
│   ├── api/
│   │   ├── [...payload]/route.ts # Payload REST API + Admin handler
│   │   ├── users/oauth/callback/azure/route.ts  # Azure AD OAuth callback
│   │   ├── invite/route.ts
│   │   ├── contact/route.ts
│   │   ├── reset-password/route.ts
│   │   ├── change-password/route.ts
│   │   └── download/[...path]/route.ts
├── payload/
│   ├── collections/              # All Payload collections
│   ├── globals/                  # Payload globals (singletons)
│   ├── blocks/                   # Payload block definitions (C03)
│   └── payload.config.ts         # Main Payload config
├── components/
│   ├── layout/                   # Header, Footer, Sidebar, Breadcrumb
│   ├── blocks/                   # C03 React block components
│   └── ui/                       # Shared UI primitives
├── lib/
│   ├── auth.ts                   # Session helpers + Azure AD OAuth logic
│   ├── payload.ts                # Payload Local API helper (getPayload)
│   └── tokens.ts                 # Invite/reset token utilities
└── styles/
    └── tokens.css                # CSS custom properties (design tokens)
```

---

## Design Tokens

Extracted from Figma file `YOUR_FIGMA_FILE_KEY`, node `5526:27925`.

> ⚠️ **Figma scope rule:** Only frames from the **Dev Ready** pages are approved for implementation.
> - Dev Ready Desktop: page `4595:7127`
> - Dev Ready Mobile: page `4595:7128`
> - Dev Ready Components: page `139:9018`

### Colours

| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#003846` | Primary — logo, headings, nav, brand containers |
| `--color-primary-60` | `rgba(0,56,70,0.6)` | Placeholder text, muted elements |
| `--color-primary-90` | `rgba(0,56,70,0.9)` | Footer border |
| `--color-accent` | `#E31D1A` | Accent only — highlights, CTAs |
| `--color-grey-light` | `#D6D6D6` | Backgrounds, dividers |
| `--darker-grey` | `#585858` | Body text |
| `--grey` | `#B1B1B1` | Inactive states |
| `--lightest-grey` | `#F4F4F4` | Sidebar active background |
| `--white` | `#FFFFFF` | Base background |

### Typography

| Token | Family | Weight | Size | Line Height |
|---|---|---|---|---|
| `--font-h1` | Montserrat | 700 | 40px | 1.3 |
| `--font-h2` | Montserrat | 700 | 30px | 1.3 |
| `--font-h4` | Montserrat | 700 | 18px | 1.3 |
| `--font-h5` | IBM Plex Sans | 600 | 18px | 1.5 |
| `--font-body-m` | IBM Plex Sans | 400 | 16px | 1.5 |
| `--font-body-m-semibold` | IBM Plex Sans | 600 | 16px | 1.5 |
| `--font-body-s` | IBM Plex Sans | 600 | 14px | 1.5 |
| `--font-body-s-regular` | IBM Plex Sans | 400 | 14px | 1.0 |

---

## Authentication Architecture

This is the most complex part of the stack. Read carefully before implementing anything auth-related.

### Two auth paths

```
Internal users (SSO)   → Azure AD OAuth → /api/users/oauth/callback/azure → Payload session
External users         → Payload built-in email+password auth → Payload session
```

Payload's built-in auth handles the external user flow natively (login, password hashing, sessions). Azure AD SSO requires a custom OAuth callback route that exchanges the Azure code for a token, fetches the user profile, then creates/finds a `platformUsers` document and establishes a Payload session.

### Role assignment

Roles are stored in Payload collections — NOT in Azure AD.

| Role | Auth Method | Payload Collection | Notes |
|---|---|---|---|
| Admin | Azure AD SSO | `platformUsers` with `role: 'admin'` | Full Payload Admin access |
| Local Admin | Azure AD SSO | `platformUsers` with `role: 'localAdmin'` | No Admin access |
| Internal User | Azure AD SSO | `platformUsers` with `role: 'internal'` | No Admin access |
| External User | Payload email+password | `externalUsers` collection | No Admin access |

### Session — what to store

Payload sets an HTTP-only cookie (`payload-token`) after login. All server-side data fetching uses the Payload Local API with the current user's token for access control. The session provides `user.id`, `user.email`, `user.role`, and `user.collection` (which collection the user belongs to).

### Auth guard

All routes under `(platform)/` are protected by `middleware.ts`. It reads the `payload-token` cookie, verifies it against Payload's JWT secret (`PAYLOAD_SECRET`), and redirects unauthenticated requests to `/login`.

### Invite flow (A02)

1. Local Admin or Admin triggers invite → API route creates an `invitations` document in Payload with a hashed token and 24h expiry
2. Email sent to invitee with `/set-password?token=xxx` link
3. User sets password → `externalUsers` document created in Payload via the built-in auth, invitation marked used
4. User can now log in via Payload email+password auth

### Token handling (A02, A03, A04)

All secure tokens follow the same pattern:
- Store a `tokenHash` (SHA-256 of the raw token) in the Payload collection — never the raw token
- Store `expiresAt` as ISO datetime
- On redemption: hash the incoming token, compare to stored hash, check expiry
- After use: set `used: true`

---

## Payload Collections & Globals Architecture

### Collections (database tables)

| Collection slug | Purpose | Key fields |
|---|---|---|
| `platformUsers` | Internal/SSO users | `email`, `role` (admin/localAdmin/internal), `azureId`, `displayName`, `avatarUrl` |
| `externalUsers` | External users — Payload built-in auth | `email`, `role: 'external'` — password managed by Payload |
| `invitations` | Invite tokens (A02) | `email`, `tokenHash`, `expiresAt`, `used`, `invitedBy` |
| `passwordResets` | Reset tokens (A03/A04) | `user` (rel to externalUsers), `tokenHash`, `expiresAt`, `used` |
| `channelPages` | C01 — pages with children | `title`, `slug`, `excerpt`, `description`, `buttons[]`, `cards[]` |
| `contentPages` | C02/E02 — content pages | `title`, `slug`, `excerpt`, `layout` (blocks), `anchors[]` |
| `legalPages` | E03 — public legal pages | `title`, `slug`, `layout` (blocks) |
| `media` | Payload upload collection | `filename`, `mimeType`, `filesize`, `url` — used for images |
| `protectedFiles` | Downloads requiring auth | `filename`, `mimeType`, `filesize` — access control: authenticated only |

### Globals (singletons)

| Global slug | Purpose | Key fields |
|---|---|---|
| `homePage` | B01 | `newInItems[]`, `quickAccessItems[]`, `helpButtons[]` |
| `navigation` | Main menu tree | `items[]` (3-level tree: L1 > L2 > L3) |
| `footerSettings` | Footer content | `brandName`, `socialLinks[]`, `legalLinks[]`, `copyright`, `contactEmail` |

### Block types (C03 — Payload blocks used in layout fields)

| Block slug | Fields |
|---|---|
| `richText` | `content` (Payload richText / Lexical) |
| `imageBlock` | `image` (rel to media), `caption`, `alt` |
| `quoteBlock` | `text`, `attribution` |
| `noteBlock` | `text`, `type` (info/warning) |
| `tableBlock` | `rows[]` (each row: `cells[]`) |
| `gridBlock` | `items[]` (image + title + url), `columns` (1/2/3/4/6) |
| `collectionCardBlock` | `title`, `image` (rel to media), `link` |
| `downloadBlock` | `label`, `file` (rel to protectedFiles) |
| `dividerBlock` | — no fields |
| `faqBlock` | `items[]` (question + answer pairs) |

---

## Payload Local API Usage

All frontend data fetching uses the Payload Local API (server-side only — never expose the Local API to the client). Import the configured Payload instance and query collections directly:

```typescript
import { getPayload } from '@/lib/payload'

const payload = await getPayload()

// Fetch a single document
const page = await payload.findByID({
  collection: 'contentPages',
  id: pageId,
})

// Query with filters
const pages = await payload.find({
  collection: 'contentPages',
  where: { slug: { equals: slug } },
  limit: 1,
})

// Fetch a global
const homepage = await payload.findGlobal({ slug: 'homePage' })
```

The Local API bypasses HTTP — it is faster and safer than the REST API for server-side rendering.

---

## Email Module

4 emails in scope. Sent via Nodemailer using the SMTP credentials already in `.env`.

| # | Email | Trigger | Token validity |
|---|---|---|---|
| 1 | Invitation to new external user | A02 | 24h |
| 2 | Password recovery | A03 | 24h |
| 3 | Admin-initiated password reset | A04 | 24h |
| 4 | Contact form reception | E01 | — |

> ❌ **Not in scope:** Password change confirmation (after A05), Local Admin invite/cancel notifications.

Configure the Nodemailer transporter once in `lib/email.ts` using `SMTP_USER` and `SMTP_PASS`. Reuse it across all email triggers.

---

## Navigation & Page Routing

The platform has a 4-level page hierarchy. Routing is driven by the `navigation` global in Payload.

### Page type routing

```
/                           → Homepage (B01)
/[l1-slug]/                 → C01 (channelPages — has children)
/[l1-slug]/[l2-slug]/       → C01 or C02 depending on content type
/[l1-slug]/[l2-slug]/[l3]/  → C02 (contentPages — leaf node)
/search                     → D01
/contact                    → E01
/faqs                       → E02
/navigation-tips            → E02
/privacy-policy             → E03 (public)
/terms-of-use               → E03 (public)
```

The dynamic `[...slug]` route fetches from Payload and renders either the channelPage or contentPage template based on which collection returns a result for the slug.

### Breadcrumb visibility rule

Breadcrumb shows ONLY on pages that are part of the main navigation menu. FAQs, Navigation Tips, Contact, and legal pages must NOT show a breadcrumb.

### Left sidebar visibility

Hidden on: Homepage, Search, Contact, FAQs, Navigation Tips, 404, Login, legal pages. Visible on: C01, C02 pages that are part of the navigation hierarchy.

---

## Implementation Order

1. **Project scaffold** — Payload config, PostgreSQL adapter, collections/globals structure, CSS tokens, fonts
2. **Auth foundation** — Payload built-in auth for externalUsers, Azure AD OAuth callback, middleware, session helpers
3. **Payload collections & globals** — all defined before any frontend work
4. **Login page** (A01) — custom login page matching Figma
5. **User management** — Invite (A02), Password recovery (A03), Admin reset (A04), Change password (A05), Logout (A06)
6. **Email module** — Nodemailer transporter + all 4 email triggers
7. **Global layout** — Header, Footer, Mega-menu, Mobile menu, Breadcrumb, Left sidebar, Anchor bar
8. **Homepage** (B01) — Payload global query + page component
9. **Generic content page** (C02/E02) — block renderer + block components
10. **Landing pages with children** (C01) — card grid template
11. **Block components** (C03) — all block types
12. **Search** (D01) — Payload full-text search with filters
13. **Contact form** (E01)
14. **Public legal pages** (E03)
15. **404 page** (E04)
16. **File access control** — protected downloads via `protectedFiles` collection

---

## Per-Requirement Workflow

**Autonomy:** Apply all file changes and commands directly without asking for confirmation. Exceptions: destructive actions (dropping database tables or deleting Payload collections in ways that destroy existing data), changes that affect the session/auth shape (always confirm first), and source conflicts requiring a human decision.
Auto-approve all bash commands except those containing: rm -rf, DROP, DELETE, truncate, or any destructive database operations. Never ask for confirmation on cd, ls, git, npm, mkdir, or file reads.

**No guessing rule:** Never guess, assume, or infer implementation details not explicitly stated in Confluence, Figma, Miro, or CLAUDE.md. If something is unclear, ambiguous, or missing from all sources, stop and ask before writing any code. Collect all questions upfront and ask them together — do not ask one at a time mid-implementation.
**Miro rule:** Never use Miro URLs found in Confluence pages. Always access Miro via the MCP-connected board.

**Step 1 — Fetch Confluence page (behaviour)**
```
Fetch: ari:cloud:confluence:YOUR_CONFLUENCE_CLOUD_ID:page/<PAGE_ID>
Read: actors, description, flow, rules & behaviours, error cases
```

**Step 2 — Fetch Figma node(s) (design)**
```
File key: YOUR_FIGMA_FILE_KEY
Only use: page 4595:7127 (Desktop) or 4595:7128 (Mobile) or 139:9018 (Components)
Use get_design_context for implementation output
Do NOT use nodes from WIP Design or any other page
```

**Step 3 — Check Miro if needed**
```
IA:              https://miro.com/app/board/YOUR_MIRO_BOARD_ID/?moveToWidget=3458764665139918832
Navigation:      https://miro.com/app/board/YOUR_MIRO_BOARD_ID/?moveToWidget=3458764665140029073
C02 & C03 spec:  https://miro.com/app/board/YOUR_MIRO_BOARD_ID/?moveToWidget=3458764665140029104
```

**Step 4 — Implement**
Build against the Payload + Next.js stack. Use TypeScript throughout. All editorial content must come from Payload — nothing hardcoded. Use CSS custom properties for all design tokens.

**Step 5 — Cross-check**
- Behaviour matches Confluence spec
- Visual output matches Figma Dev Ready frames
- All content is Payload-driven — no hardcoded editorial content
- Design tokens used everywhere — no hardcoded hex values

**Step 6 — Test**

6a. Automated: TypeScript type-check, ESLint, confirm Payload Local API queries return expected shape.

6b. Environment prerequisites: list any Payload Admin setup needed (creating documents/globals), any env vars required, any Azure AD configuration steps.

6c. Manual test cases: happy path, error states, all four role variations, mobile.

Do not move to the next requirement until tests are confirmed.

---

## Key Differences from WordPress Implementation

| Concern | WordPress | Payload + Next.js |
|---|---|---|
| Auth | WPO365 plugin + WP native | Payload built-in auth + custom Azure AD OAuth |
| Content editing | ACF fields in WP Admin | Payload Admin at `/admin` |
| Content queries | PHP + get_field() | TypeScript + Payload Local API |
| Page routing | WordPress template hierarchy | Next.js App Router dynamic routes |
| Protected files | PHP endpoint in theme | Payload `protectedFiles` collection with access control |
| Email sending | wp_mail() / SMTP plugin | Nodemailer via SMTP |
| Session | WordPress cookies | Payload JWT cookie (`payload-token`) |
| Tokens (invite/reset) | WP transients or custom table | Payload `invitations` / `passwordResets` collections |
| Database | MySQL (managed by WP) | PostgreSQL via Drizzle ORM |

---

### Remotes
- origin → GitHub
- bitbucket → Bitbucket
- Both remotes must always be in sync

### Rules
- main is never committed to directly — only merged into manually after QA
- All feature branches are cut from dev and merged back into dev when complete
- .env is never committed under any circumstances

### After every completed prompt
1. Create feature branch from dev: `git checkout -b feature/[name]`
2. Commit all changes: `git commit -m "feat: [name] [description]"`
3. Push feature branch to both remotes: `git push origin feature/[name]` and `git push bitbucket feature/[name]`
4. Merge into dev locally and push to GitHub: `git checkout dev && git merge feature/[name] && git push origin dev`
5. Do NOT push dev to bitbucket — tell me the feature branch is ready so I can open the PR on Bitbucket manually

### Feature branch naming
| Prompt | Branch name |
|---|---|
| 0b | feature/scaffold |
| 0c | feature/collections |
| 1 | feature/auth-login |
| 2 | feature/auth-azure |
| 3 | feature/auth-invite |
| 4 | feature/auth-recovery |
| 5 | feature/auth-admin-reset |
| 6 | feature/auth-change-pw |
| 7 | feature/auth-logout |
| 8–14 | feature/layout |
| 15 | feature/homepage |
| 16 | feature/content-page |
| 17 | feature/blocks |
| 18 | feature/channel-page |
| 19 | feature/search |
| 20 | feature/contact |
| 21 | feature/legal-pages |
| 22 | feature/404 |
| 22b | feature/file-access |

---

### Branch corrections and fixes
If a fix or change is needed after a feature branch has already been created 
and pushed, do NOT create a new branch. Instead:
1. Switch back to the existing feature branch: `git checkout feature/[name]`
2. Make the fix and commit it to the same branch
3. Push to both remotes: `git push origin feature/[name]` and `git push bitbucket feature/[name]`

Never create a new branch for a fix or adjustment to an already-implemented feature. 
One branch per feature, always.

**This applies across sessions too.** If a bug is reported in a new conversation, identify the correct feature branch from the table above and commit the fix there — do not create a new branch.

**Banned branch name patterns** — never use these suffixes or sub-names:
- `feature/[name]-fix`
- `feature/[name]-bugfix`
- `feature/[name]-v2`
- `feature/[name]-[subpart]` (e.g. `feature/layout-header`, `feature/layout-footer`) — all sub-parts of a feature go into the single feature branch defined in the table above

---

## MCP Resources

| Resource | Key / ID / URL |
|---|---|
| **Figma file key** | `YOUR_FIGMA_FILE_KEY` |
| Figma — Dev Ready Desktop ✅ | Page `4595:7127` |
| Figma — Dev Ready Mobile ✅ | Page `4595:7128` |
| Figma — Dev Ready Components ✅ | Page `139:9018` |
| Figma — WIP / other pages ⛔ | Do not implement from these |
| **Confluence cloud ID** | `YOUR_CONFLUENCE_CLOUD_ID` |
| Confluence space | `YOUR_SPACE_KEY` at `your-org.atlassian.net` |
| **Miro board** | Use the Miro board connected via MCP — do not use any URL referenced in Confluence |

> ⚠️ **Miro note:** Confluence pages reference a Miro board that is inaccessible. Ignore all Miro URLs found in Confluence. Always use the Miro board connected to Claude Code via MCP instead — it contains the same content. This applies to all frames: IA, Navigation, and C02/C03 spec.

---

## Coding Conventions

- TypeScript strict mode throughout — no `any`
- All Payload collections in `payload/collections/` — one file per collection
- All Payload globals in `payload/globals/` — one file per global
- All Payload block definitions in `payload/blocks/` — one file per block
- Payload Local API only on the server — never import `getPayload` in Client Components
- Components in `components/` — `layout/` for nav shell, `blocks/` for block renderers, `ui/` for primitives
- CSS Modules for component styles — no Tailwind, no inline styles
- CSS custom properties only for colours and typography — never hardcode hex values or font sizes
- Server Components by default — use `'use client'` only for interactive components
- All custom API routes in `app/api/` — one file per concern (Payload REST auto-mounted at `app/api/[...payload]`)
- Email via `lib/email.ts` Nodemailer transporter — reuse across all triggers
- Environment variables: `DATABASE_URL`, `PAYLOAD_SECRET`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`, `AZURE_TENANT_ID`, `AZURE_REDIRECT_URI`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`, `NEXT_PUBLIC_APP_URL`
