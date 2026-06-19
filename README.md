# Brand Center — Payload CMS + Next.js

## Overview

Brand Center is a private digital platform centralising brand guidelines and assets for a multi-brand corporate group. Internal staff authenticate via Azure AD SSO while external partners — agencies, suppliers, and collaborators — use email and password through an invite-only onboarding flow managed by admins.

This is one of two parallel implementations of the same product, the other built on WordPress, produced for comparative evaluation of CMS platforms against identical functional requirements, Figma designs, and Confluence specifications. Both implementations share the same brief, design system, and content model.

## Core Technology Stack

The system runs on **Payload CMS 3.x embedded directly in a Next.js 14 App Router application**, backed by PostgreSQL via Drizzle ORM. All content queries use Payload's Local API server-side — no HTTP round-trips between the frontend and the CMS. Authentication is split: Azure AD OAuth for internal users via a custom callback route, and Payload's built-in email+password auth for external users. Emails are sent via Nodemailer over SMTP. The frontend uses CSS Modules with CSS custom properties throughout — no Tailwind, no inline styles.

## Key Capabilities

**Dual Authentication and Role System**
Internal users authenticate via Azure AD OAuth through a custom `/api/users/oauth/callback/azure` route that exchanges the Azure code, fetches the user profile, and establishes a Payload session. External users are invited by admins and authenticate with email+password managed by Payload's built-in auth. Four roles — Admin, Local Admin, Internal, External — control access across the platform. All role assignments live in Payload collections, not in Azure AD.

**Secure Token Flows**
Invite links, password recovery, and admin-initiated resets all follow the same pattern: a SHA-256 hashed token stored in a dedicated Payload collection with a 24-hour expiry and a used flag. Raw tokens are never persisted — only their hash.

**Block-Based Content Pages**
Content editors build pages from 10 block types: rich text (Lexical editor), image, quote, note/callout, table, grid, download, FAQ accordion, divider, and collection card. All editorial content is Payload-driven — nothing is hardcoded in components.

**Navigation and Layout**
A three-level navigation tree is managed as a Payload global and drives the mega-menu, mobile menu, left sidebar, and breadcrumb simultaneously. A separate anchor bar renders in-page section links from each content page's declared anchors field.

**Protected File Downloads**
Brand assets live in a separate `protectedFiles` Payload collection. A custom API route gates every download behind session verification — unauthenticated requests are rejected before the file stream opens.

**Full-Text Search**
Search runs across all content pages through Payload's built-in search capability, with results rendered with excerpt highlighting and page-type filtering.

## Setup Instructions

Clone the repository and run `npm install`. Copy `.env.example` to `.env` and fill in the values — PostgreSQL connection string, Payload secret, Azure AD credentials, and SMTP credentials. Ensure PostgreSQL is running locally and the database exists. Run `npm run dev` — Payload auto-runs migrations on first start. Navigate to `/admin` to create the first admin user through Payload's setup flow. For SSO, an Azure AD App Registration with the matching redirect URI is required; it can be skipped for local email+password testing.

## Project Scope

The platform covers the full authenticated user lifecycle (invite, onboarding, SSO, password management), the complete content authoring and publishing flow (channel pages, content pages, block library), dynamic navigation management, full-text search, a contact form with email notification, protected file downloads, and public legal pages. A CI/CD pipeline deploys to AWS EC2 via Docker and Bitbucket Pipelines. Sub-brand switching UI, analytics, and Payload Admin customisation beyond the default are not in scope for this implementation.
