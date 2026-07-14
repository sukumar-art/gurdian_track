# MVP Debug Checklist – CollabEscrow (Startup Influencer Marketplace)

## 1. Environment Setup
- [ ] Verify `.env.local` contains Supabase and Razorpay test keys.
- [ ] Confirm LocalStorage fallback works when Supabase keys are absent.
- [ ] Run `npm run dev` → ensure Next.js compiles successfully.

---

## 2. Database Verification
- [ ] Run `schema.sql` in Supabase SQL Editor → confirm tables created (`startups`, `influencers`, `transactions`).
- [ ] Execute `seedSupabase.ts` → confirm 50 influencers + 20 startups inserted.
- [ ] Validate foreign key constraints (startup_id, influencer_id in `transactions`).

---

## 3. Startup Onboarding
- [ ] Register new startup → confirm record in `startups`.
- [ ] Dashboard loads with “Find Influencers” button.
- [ ] Budget and goals saved correctly.

---

## 4. Influencer Onboarding
- [ ] Register new influencer → confirm record in `influencers`.
- [ ] Upload rate card → stored as JSON in `rate_card`.
- [ ] Upload KYC doc → stored in Supabase Storage, URL saved in `kyc_doc_url`.
- [ ] Admin panel shows influencer as “pending”.

---

## 5. Marketplace
- [ ] Search/filter influencers by niche, region, budget, follower tier.
- [ ] Influencer cards display transparent rate cards.
- [ ] “Book Influencer” button triggers Razorpay order creation.

---

## 6. Escrow Payment Flow
- [ ] Razorpay order created → `razorpay_order_id` stored in `transactions`.
- [ ] Payment verification via `/api/razorpay/verify` updates status → `pending`.
- [ ] Webhook `/api/razorpay/webhook` reconciles payment events.
- [ ] Escrow release via `/api/transactions/release` updates status → `released`.
- [ ] Commission (10–15%) + ₹99 fee deducted automatically.

---

## 7. Admin Panel
- [ ] KYC approval toggles influencer status → `approved`.
- [ ] Transaction monitoring dashboard loads correctly.
- [ ] CSV export generates file with transaction_id, startup, influencer, amount, commission, escrow_fee, status, created_at.

---

## 8. UI/UX Verification
- [ ] Dark mode theme applied (slate background, indigo/cyan accents).
- [ ] Buttons glow on hover (indigo/cyan).
- [ ] Success states show neon green pill.
- [ ] Error states show crimson red pill.
- [ ] Accessibility check: keyboard navigation, alt text, contrast ratio ≥ 4.5:1.

---

## 9. QA Scenarios
- [ ] End‑to‑end flow: Startup books influencer → payment → escrow hold → approval → release.
- [ ] Invalid payment signature → error returned.
- [ ] KYC rejected → influencer not listed in marketplace.
- [ ] CSV export tested with >100 transactions.
- [ ] LocalStorage fallback tested offline.

---

## 10. Final Checks
- [ ] All routes compile with zero TypeScript errors.
- [ ] No console errors in browser.
- [ ] Deployment on Vercel successful.
- [ ] QA checklist signed off before public launch.

---

**Ratified by:**  
Sukumar, Founder – CollabEscrow  
Apticraze Intelligence LLP  
Date: July 14, 2026
