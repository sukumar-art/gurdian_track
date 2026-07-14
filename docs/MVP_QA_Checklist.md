# MVP QA Checklist – CollabEscrow (Startup Influencer Marketplace)

## 1. User Story Validation

### Startup Role
- [ ] Startup can register, set budget/goals, and access dashboard.
- [ ] Startup can search influencers by niche, region, budget, follower tier.
- [ ] Startup can book influencer → Razorpay checkout → escrow hold.
- [ ] Startup can approve deliverables → funds released via `/api/transactions/release`.

### Influencer Role
- [ ] Influencer can register, upload rate card, and submit KYC docs.
- [ ] Influencer profile visible in marketplace only after KYC approval.
- [ ] Influencer receives payout after startup approval (minus commission + fee).

### Admin Role
- [ ] Admin can view pending KYC requests and approve/reject.
- [ ] Admin can monitor transactions in dashboard.
- [ ] Admin can export CSV of transactions successfully.

---

## 2. Payment Flow Verification
- [ ] Razorpay order creation works with test keys.
- [ ] Signature verification updates transaction status correctly.
- [ ] Webhook reconciliation matches Razorpay events with Supabase records.
- [ ] Commission (10–15%) + ₹99 fee deducted automatically before payout.

---

## 3. Data Integrity
- [ ] Supabase seeded with 50 influencers + 20 startups.
- [ ] All tables (`startups`, `influencers`, `transactions`) populated correctly.
- [ ] Foreign key constraints enforced.
- [ ] KYC docs securely stored in Supabase Storage, linked via `kyc_doc_url`.

---

## 4. UI/UX Validation
- [ ] Dark mode theme applied consistently (slate background, indigo/cyan accents).
- [ ] Buttons glow on hover (indigo/cyan).
- [ ] Success → neon green pill; Error → crimson red pill.
- [ ] Accessibility: keyboard navigation, alt text, contrast ratio ≥ 4.5:1.

---

## 5. End-to-End Scenarios
- [ ] Startup books influencer → payment → escrow hold → approval → release.
- [ ] Influencer rejected in KYC → not listed in marketplace.
- [ ] Invalid payment signature → error returned.
- [ ] CSV export tested with >100 transactions.
- [ ] LocalStorage fallback tested offline.

---

## 6. Launch Readiness
- [ ] Next.js build compiles with zero TypeScript errors.
- [ ] No console errors in browser.
- [ ] Deployment on Vercel successful.
- [ ] QA checklist signed off by Founder before public launch.

---

**Ratified by:**  
Sukumar, Founder – CollabEscrow  
Apticraze Intelligence LLP  
Date: July 14, 2026
