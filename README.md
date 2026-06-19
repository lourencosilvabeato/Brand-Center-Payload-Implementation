# Brand Center — Payload CMS + Next.js

A private digital platform centralising brand guidelines and assets for a multi-brand corporate group. Built as a Payload CMS 3.x + Next.js application with dual authentication (Azure AD SSO for internal users, email+password for external partners).

This project is one of two parallel implementations of the same product — the other built on WordPress — produced for comparative evaluation of CMS platforms against identical requirements, Figma designs, and specifications.

---

## Key Features

- **Dual authentication** — Azure AD OAuth for internal/SSO users; Payload built-in auth for external users (partners, agencies)
- **Role-based access control** — four roles (Admin, Local Admin, Internal, External) with different capabilities
- **Invite flow** — Admins invite external users via tokenised email links; tokens are SHA-256 hashed and expire after 24 hours
- **Rich content pages** — block-based layout system (10 block types) built on Payload's Lexical editor
- **3-level navigation** — mega-menu with dynamic content sourced entirely from Payload globals
- **Protected file downloads** — authenticated-only access to brand assets via a separate Payload collection
- **Transactional email** — Nodemailer SMTP for invitations, password recovery, admin-initiated resets, and contact form
- **Full-text search** — Payload-powered search across all content pages
- **Mobile-responsive** — custom mobile menu and responsive layout throughout

---

## Tech Stack

| Layer | Technology |
|---|---|
| CMS / Backend | Payload CMS 3.x |
| Frontend | Next.js 14 (App Router) |
| Database | PostgreSQL via Drizzle ORM (`@payloadcms/db-postgres`) |
| Auth — Internal | Azure AD OAuth (custom callback route) |
| Auth — External | Payload built-in email+password |
| Styling | CSS Modules + CSS custom properties |
| Language | TypeScript (strict) |
| Email | Nodemailer (SMTP) |
| Deployment | Docker + AWS ECR/EC2 via Bitbucket Pipelines |

---

## Architecture

### Monorepo — Payload embedded in Next.js

Payload runs inside the same Next.js app. The Payload Admin UI is served at `/admin`. All content queries use the Payload **Local API** server-side — no HTTP round-trips, no REST calls from the frontend.

```
app/
├── (auth)/        # Login, set-password, reset-password, expired-link
├── (platform)/    # Authenticated shell — header, footer, sidebar
│   └── [...slug]/ # Dynamic routing → channelPage or contentPage
├── (public)/      # Unauthenticated legal pages
└── api/
    ├── [...payload]/          # Payload REST API + Admin
    └── users/oauth/callback/  # Azure AD callback
```

### Authentication flow

```
Internal users  →  Azure AD OAuth  →  /api/users/oauth/callback/azure  →  Payload session
External users  →  Payload email+password login  →  Payload session
```

Both paths converge on a Payload JWT cookie (`payload-token`). Middleware verifies the token on every request to `(platform)/` routes.

### Content model

| Collection | Purpose |
|---|---|
| `platformUsers` | Internal/SSO users with role |
| `externalUsers` | External users with Payload-managed passwords |
| `channelPages` | Landing pages with child cards (C01) |
| `contentPages` | Block-layout content pages (C02) |
| `legalPages` | Public legal pages |
| `media` | Image uploads |
| `protectedFiles` | Auth-gated downloadable brand assets |
| `invitations` / `passwordResets` | Secure token storage (hashed) |

Globals: `homePage`, `navigation`, `footerSettings`.

---

## AI Integration

This project was built using **Claude Code** (Anthropic's CLI agent) as the primary development tool, following a structured prompt library methodology.

### What this means in practice

The repository includes a `CLAUDE.md` file — a persistent context document that Claude Code reads at the start of every session. It defines:

- The full technical specification (stack, architecture, collections, auth flow)
- Design token values extracted from Figma
- A 6-step per-requirement workflow (fetch Confluence spec → fetch Figma design → check Miro IA → implement → cross-check → test)
- Coding conventions, branch naming rules, and commit workflow
- Links to connected MCP tools (Figma, Confluence, Miro)

Each feature was implemented by prompting Claude Code with the requirement reference (e.g. "implement A02 — invite flow"). Claude would then fetch the Confluence spec, read the Figma design via the Figma MCP server, implement the feature end-to-end, and follow the defined git workflow to branch, commit, and push.

### MCP integrations used

- **Figma MCP** — fetched component designs and design tokens directly from the Figma file
- **Confluence MCP** — fetched functional specifications from the project's Confluence space
- **Miro MCP** — accessed IA diagrams and flow specs from the design board

### Why this approach

Building a CMS platform from scratch with a well-structured CLAUDE.md allowed consistent, specification-driven implementation across 20+ feature branches without context loss between sessions. The methodology is documented in the repo itself — `CLAUDE.md` is the single source of truth for how the project was built.

---

## Project Structure

```
├── app/                  # Next.js App Router
├── src/
│   ├── components/
│   │   ├── layout/       # Header, Footer, MegaMenu, MobileMenu, Sidebar, Breadcrumb, AnchorBar
│   │   ├── blocks/       # Block renderer + 10 block components
│   │   ├── auth/         # LoginForm, InviteForm, ResetPasswordForm, SetPasswordForm, ChangePasswordForm
│   │   └── homepage/     # HomepageHero, HomepageNewIn, HomepageQuickAccess
│   ├── lib/
│   │   ├── auth.ts       # Session helpers + Azure AD OAuth logic
│   │   ├── email.ts      # Nodemailer transporter + all email templates
│   │   ├── payload.ts    # getPayload() helper for Local API
│   │   └── tokens.ts     # Secure token generation and verification
│   ├── payload/
│   │   ├── collections/  # All Payload collection definitions
│   │   ├── globals/      # homePage, navigation, footerSettings, loginSettings
│   │   └── blocks/       # All block definitions (richText, image, quote, note, table, grid, download, faq…)
│   └── styles/
│       └── tokens.css    # CSS custom properties (colours, typography)
├── CLAUDE.md             # AI context document — project spec, workflow, conventions
├── bitbucket-pipelines.yml  # CI/CD pipeline (Docker → AWS ECR → EC2)
└── .env.example          # All required environment variables with descriptions
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL running locally
- An Azure AD App Registration (for SSO — optional for local dev, can be skipped)
- SMTP credentials (for email — optional for local dev)

### Setup

```bash
# 1. Clone and install
git clone https://github.com/lourencosilvabeato-blip/Brand-Center---Payload.git
cd Brand-Center---Payload
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your local values

# 3. Create the PostgreSQL database
createdb brand-center

# 4. Start the dev server (Payload auto-migrates on first run)
npm run dev
```

The app starts at `http://localhost:3000`. Payload Admin is at `http://localhost:3000/admin`.

On first run, navigate to `/admin` to create the first admin user via Payload's built-in setup flow.

---

## Test Credentials

For local testing without Azure AD:

1. In Payload Admin, create a document in the `externalUsers` collection with an email and password
2. Log in at `/login` using that email and password

To test the SSO flow, an Azure AD App Registration with the correct redirect URI is required.

---

## Environment Variables

See `.env.example` for all required variables with comments. The key ones:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `PAYLOAD_SECRET` | JWT signing secret for Payload sessions |
| `AZURE_CLIENT_ID` | Azure AD app registration client ID |
| `AZURE_CLIENT_SECRET` | Azure AD app registration client secret |
| `AZURE_TENANT_ID` | Azure AD directory (tenant) ID |
| `AZURE_REDIRECT_URI` | Must match a registered redirect URI in Azure |
| `SMTP_USER` / `SMTP_PASS` | SMTP credentials for transactional email |
| `EMAIL_FROM` | Sender address for outgoing emails |
| `NEXT_PUBLIC_APP_URL` | Base URL used in email links |

---

## Scope and Roadmap

### Implemented

- Authentication: SSO (Azure AD), email+password, invite flow, password recovery, admin-initiated reset, change password, logout
- Layout: Header, mega-menu, mobile menu, left sidebar, breadcrumb, anchor bar, footer
- Page types: Homepage, channel pages (with cards), content pages (block layout), legal pages (public)
- Block types: Rich text (Lexical), image, quote, note/callout, table, grid, download, FAQ accordion, divider, collection card
- Search: Full-text across all content
- Contact form with email notification
- Protected file downloads (auth-gated)
- 404 page
- Responsive across desktop and mobile

### Not in scope (this implementation)

- Sub-brand switching UI
- Analytics / usage tracking
- Payload Admin customisation beyond default

---

## Development Approach

Feature branches follow the naming convention in `CLAUDE.md`. Each feature was developed in a dedicated branch, merged into `dev`, and deployed to staging via CI/CD on merge to `main`.

The CI/CD pipeline (`bitbucket-pipelines.yml`) builds a Docker image, pushes it to AWS ECR, and deploys to EC2 via SSH — with automatic security group ingress/egress management for the pipeline IP.
