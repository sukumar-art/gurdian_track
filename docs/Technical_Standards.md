# Technical Standards – CollabEscrow (Startup Influencer Marketplace)

## 1. Coding Conventions
- **Language**: TypeScript for all frontend and backend code.
- **Framework**: Next.js 15+ App Router.
- **Styling**: TailwindCSS v4 with custom tokens from `Design_System.json`.
- **Linting**: ESLint + Prettier enforced via CI.
- **File Naming**:
  - Components: PascalCase (e.g., `UserCard.tsx`).
  - Hooks: camelCase with `use` prefix (e.g., `useAuth.ts`).
  - API routes: kebab-case (e.g., `/api/razorpay/order`).
- **Commit Messages**: Conventional Commits format (`feat:`, `fix:`, `docs:`, `chore:`).

---

## 2. API Standards
- **Base Layer**: Next.js serverless API routes.
- **Auth**: Supabase Auth (JWT-based).
- **Error Handling**:
  - Use HTTP status codes consistently (`200`, `400`, `401`, `403`, `500`).
  - Return JSON error objects: `{ "error": "message" }`.
- **Endpoints**:
  - `/api/auth/*` → Supabase auth integration.
  - `/api/razorpay/order` → Create Razorpay order.
  - `/api/razorpay/verify` → Verify payment signature.
  - `/api/razorpay/webhook` → Handle Razorpay events.
  - `/api/transactions/release` → Release escrow funds.
- **Security**:
  - Validate all inputs with Zod schemas.
  - Use environment variables for keys (`.env.local`).
  - Ensure only authorized roles (startup/admin) can trigger sensitive routes.

---

## 3. Database Standards
- **Engine**: Supabase (PostgreSQL).
- **Schema**: Defined in `schema.sql`.
- **Tables**:
  - `startups`: onboarding data.
  - `influencers`: profile, rate card, KYC.
  - `transactions`: escrow records.
- **Constraints**:
  - UUID primary keys.
  - Foreign key references enforced.
  - Unique constraints on email/social_handle.
- **Data Integrity**:
  - Commission + escrow fee stored explicitly in `transactions`.
  - KYC docs stored in Supabase Storage, linked via `kyc_doc_url`.

---

## 4. Security & Compliance
- **Authentication**: Supabase JWT tokens.
- **Authorization**: Role-based (startup, influencer, admin).
- **Data Protection**:
  - KYC docs encrypted in storage.
  - No sensitive data in client logs.
- **Payment Security**:
  - Razorpay signature verification (HMAC-SHA256).
  - Webhook validation with secret key.

---

## 5. Testing Standards
- **Unit Tests**: Jest + React Testing Library.
- **Integration Tests**: API routes tested with Supabase + Razorpay test keys.
- **End-to-End Tests**: Playwright for onboarding, marketplace, and payment flows.
- **CI/CD**: GitHub Actions pipeline:
  - Lint → Test → Build → Deploy.

---

## 6. Deployment Standards
- **Hosting**: Vercel free tier.
- **Environment Variables**: Managed via Vercel dashboard.
- **Branching**:
  - `main`: production.
  - `dev`: staging.
  - Feature branches: `feat/*`.

---

## 7. Documentation Standards
- **Markdown Files**: All specs (`Constitution.md`, `Product_Bible.md`, `UIUX_Document.md`, `Technical_Standards.md`, `PRD.md`) stored in repo root.
- **Code Docs**: JSDoc/TSDoc for all functions.
- **API Docs**: Auto-generated via Swagger/OpenAPI from Next.js routes.

---

**Ratified by:**  
Sukumar, Founder – CollabEscrow  
Apticraze Intelligence LLP  
Date: July 13, 2026
