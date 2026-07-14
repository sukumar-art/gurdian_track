# Phase 1 MVP Task Assignment – Influencer Platform

## 1. Project Setup
1. Register brand domain (~₹800–₹1,000/year).
2. Configure hosting on **Vercel free tier**.
3. Initialize **Next.js frontend** + **Node.js backend**.
4. Connect **Supabase free tier** for database + auth.
5. Integrate **Razorpay** for escrow payments.

---

## 2. Database & Auth
1. Create `startups` table:
   - id, email, budget_range, goal, created_at
2. Create `influencers` table:
   - id, name, social_handle, niche, region, follower_count, rate_card, kyc_status
3. Create `transactions` table:
   - id, startup_id, influencer_id, amount, status (pending/approved/released), commission, escrow_fee
4. Enable **Supabase Auth** for secure login (email/password).

---

## 3. Startup Onboarding
1. Build signup form (email, budget, goals).
2. Store data in `startups` table.
3. Simple dashboard: “Find Influencers” button.

---

## 4. Influencer Onboarding
1. Build signup form (name, social handles, niche, region, follower count).
2. Upload rate card (story/reel/post pricing).
3. Upload KYC docs (manual verification).
4. Store in `influencers` table.

---

## 5. Marketplace
1. Build search/filter UI:
   - Filters: niche, region, budget, follower tier.
2. Display influencer profiles with transparent rate cards.
3. “Book Influencer” button → triggers Razorpay escrow flow.

---

## 6. Escrow Payment Flow
1. Integrate Razorpay checkout:
   - Startup pays into escrow.
   - Transaction recorded in `transactions` table.
2. Status flow:
   - Pending → Influencer delivers → Startup approves → Released.
3. Commission (10–15%) + flat escrow fee (₹99) deducted automatically.

---

## 7. Admin Panel (Lean)
1. Simple admin dashboard:
   - Approve influencer KYC.
   - Monitor transactions.
   - Export basic reports (CSV).

---

## 8. Launch Prep
1. Seed database with **50 influencers manually** (food + education niches).
2. Seed **20 startups** (ZORIA + UNIVISTA pilots).
3. Test full transaction cycle end‑to‑end.

---

## 9. Debug & Iterate
1. Run closed beta with pilot startups.
2. Collect feedback on:
   - Usability
   - Payment flow
   - Transparency of rate cards
3. Fix bugs, optimize UI.

---

## 10. Public Launch
1. Open platform to wider audience.
2. Commission‑only model live.
3. Marketing push via social + startup incubators.
