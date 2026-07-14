# Product Requirements Document (PRD) – CollabEscrow MVP

## 1. Overview
CollabEscrow is a startup influencer marketplace designed to connect startups with influencers through transparent rate cards and secure escrow payments. This PRD defines the Phase 1 MVP requirements.

---

## 2. Objectives
- Enable startups to discover and book influencers easily.
- Ensure influencers are paid securely via escrow.
- Provide transparency in pricing and collaboration.
- Deliver a lean MVP under ₹50k using free-tier tools.

---

## 3. User Roles
- **Startup**: Registers, sets budget/goals, searches influencers, books campaigns.
- **Influencer**: Registers, uploads rate card, completes KYC, receives payments.
- **Admin**: Approves KYC, monitors transactions, exports reports.

---

## 4. Core Features

### 4.1 Startup Onboarding
**User Story**: As a startup, I want to register and define my budget/goals so I can find suitable influencers.  
**Acceptance Criteria**:
- Signup form with email, company name, budget range, goals.
- Dashboard with “Find Influencers” button.

### 4.2 Influencer Onboarding
**User Story**: As an influencer, I want to create a profile with rate cards and KYC so startups can book me.  
**Acceptance Criteria**:
- Signup form with name, social handles, niche, region, follower count.
- Upload rate card (story/reel/post pricing).
- Upload KYC documents.
- Status: pending → approved/rejected.

### 4.3 Marketplace
**User Story**: As a startup, I want to search influencers by niche, region, budget, and follower tier so I can book the right match.  
**Acceptance Criteria**:
- Search/filter UI.
- Influencer cards with transparent rate cards.
- “Book Influencer” button triggers Razorpay escrow flow.

### 4.4 Escrow Payment Flow
**User Story**: As a startup, I want my payment held securely until I approve deliverables.  
**Acceptance Criteria**:
- Razorpay order creation.
- Payment verification via signature.
- Transaction recorded in Supabase.
- Status flow: pending → delivered → approved → released.
- Commission (10–15%) + ₹99 fee deducted automatically.
- `/api/transactions/release` route for payout.

### 4.5 Admin Panel
**User Story**: As an admin, I want to approve KYC and monitor transactions.  
**Acceptance Criteria**:
- Dashboard with pending KYC list.
- Approve/reject toggle.
- Transaction monitoring.
- CSV export of transactions.

---

## 5. Technical Requirements
- **Frontend**: Next.js 15+ App Router, TailwindCSS v4, Framer Motion.
- **Backend**: Next.js API routes (Node.js).
- **Database**: Supabase PostgreSQL.
- **Auth**: Supabase Auth (JWT).
- **Payments**: Razorpay Checkout SDK + webhook verification.
- **Storage**: Supabase Storage for KYC docs.
- **Fallback**: LocalStorage mock engine for offline testing.

---

## 6. Non-Functional Requirements
- **Performance**: Pages load < 2s on standard broadband.
- **Security**: JWT auth, HMAC-SHA256 signature verification.
- **Scalability**: Modular design for future AI integration.
- **Accessibility**: WCAG AA compliance.

---

## 7. Deliverables
- MVP deployed on Vercel.
- Supabase schema + seeded data (50 influencers, 20 startups).
- Razorpay escrow integrated.
- Admin panel functional with CSV export.
- QA checklist completed.

---

## 8. Out of Scope (Phase 1)
- Mobile app.
- Advanced analytics dashboards.
- Automated influencer verification APIs.
- AI-driven recommendations.

---

## 9. Timeline
- Week 1–2: Project setup, onboarding flows.
- Week 3–4: Marketplace + escrow integration.
- Week 5: Admin panel + CSV export.
- Week 6: QA, bug fixes, closed beta launch.

---

**Ratified by:**  
Sukumar, Founder – CollabEscrow  
Apticraze Intelligence LLP  
Date: July 14, 2026
