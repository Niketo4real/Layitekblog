# Layitek Blog – Layitek Limited

Official technology, telecommunications, Corporate Affairs Commission (CAC) compliance, and corporate branding publication for **Layitek Limited** (`layitek.com`).

## Key Features

1. **6 Specialized Content Categories & 60 Original Nigerian-Focused Articles**:
   - **Computers** (`/computers`) – 10 complete guides
   - **Phones & Accessories** (`/phones-accessories`) – 10 complete guides
   - **Gadgets** (`/gadgets`) – 10 complete guides
   - **Telecommunications** (`/telecommunications`) – 10 complete guides
   - **CAC Arena** (`/cac-arena`) – 10 complete CAMA 2020 compliance guides
   - **Branding & Printing** (`/branding-printing`) – 10 complete corporate branding & print guides
2. **Uniform 16-Part Editorial Article Template**:
   - Featured image, breadcrumb, H1 headline, introductory excerpt, publication date, reading time, auto-generated clickable Table of Contents, structured H2/H3 sections, technical diagram, practical step-by-step checklist, FAQ section with Schema.org JSON-LD, conclusion, related articles, social share buttons, and Layitek Limited promotional callout.
3. **Secure Administrator Dashboard (`/admin`)**:
   - Protected by Firebase Authentication (Google Sign-In + Email/Password + Password Reset).
   - Dashboard Overview metrics, Full Article CMS with Rich-Text formatting toolbar and Live Preview, Direct Device Image Upload (Laptop, Desktop, Android, iPhone), Website Settings Management (Logo replacement, Brand Colours, Homepage Hero, Contact, Footer, SEO), and Newsletter Subscriber records.
4. **PostgreSQL Database & Drizzle ORM**:
   - Backed by Cloud SQL for PostgreSQL (`src/db/schema.ts`, `src/db/index.ts`, `src/db/queries.ts`) and compatible with external Supabase PostgreSQL instances (`supabase_schema.sql`).

## Development & Build Commands

```bash
# Start full-stack server (Express + Vite + PostgreSQL) on port 3000
npm run dev

# Type-check TypeScript
npm run lint

# Build production bundle
npm run build
```

## Vercel / External Deployment Configuration

1. Import the project into Vercel.
2. Set the environment variables in the Vercel dashboard (`.env.example`):
   - `SQL_HOST`, `SQL_DB_NAME`, `SQL_USER`, `SQL_PASSWORD`
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (if connecting an external Supabase project using `supabase_schema.sql`).
3. `vercel.json` is pre-configured to route dynamic category/article URLs (`/:categorySlug/:articleSlug`), `/admin`, `/sitemap.xml`, and `/robots.txt`.
