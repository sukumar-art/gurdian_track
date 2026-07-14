# UI/UX Document – CollabEscrow (Startup Influencer Marketplace)

## 1. Design Philosophy
CollabEscrow’s interface must reflect trust, transparency, and professionalism while appealing to startups and influencers. The design language is premium, modern, and cinematic, with dark mode as the default.

- **Core Values**: Transparency, Trust, Accessibility, Premium Feel
- **Tone**: Professional, startup‑friendly, futuristic
- **Experience Goal**: Simple onboarding, clear rate cards, secure payment flow

---

## 2. Color System
Primary palette is dark slate with neon accents for clarity and energy.

- **Background**: Deep Slate Blue `#0b0f19`
- **Primary Accent (Indigo)**: Electric Indigo `#6366f1`
- **Secondary Accent (Cyan)**: Neon Cyan `#06b6d4`
- **Success State**: Neon Green `#10b981`
- **Error State**: Crimson Red `#ef4444`
- **Neutral Gray**: Slate Gray `#64748b`

Effects:
- `.glass-panel`: backdrop blur + semi‑transparent glass effect
- `.glow-indigo`: indigo shadow glow for buttons
- `.glow-cyan`: cyan glow for hover states

---

## 3. Typography
- **Primary Font**: Inter (sans‑serif, modern, clean)
- **Secondary Font**: JetBrains Mono (for code snippets, admin console)
- **Weights**:
  - Headings: Bold (700)
  - Body: Regular (400)
  - Emphasis: Medium (500)

Hierarchy:
- H1: 32px / Bold / Indigo accent
- H2: 24px / Bold / Cyan accent
- Body: 16px / Regular / Slate Gray
- Small: 14px / Medium / Neutral Gray

---

## 4. Layout & Components
- **Navigation Bar**: Fixed top, dark background, logo left, auth links right.
- **Cards**: Glass panels with neon glow borders for influencer profiles and startup dashboards.
- **Buttons**:
  - Primary: Indigo background, white text, glow on hover.
  - Secondary: Cyan outline, transparent background.
- **Forms**: Multi‑step onboarding with progress indicators.
- **Tables**: Admin panel uses striped rows, hover highlights, export button top‑right.

---

## 5. Motion & Interaction
- **Framer Motion** used for smooth transitions:
  - Fade‑in on page load.
  - Slide‑up for modals (Razorpay checkout).
  - Hover glow animations for buttons.
- **Feedback States**:
  - Success → Neon Green pill + check icon.
  - Error → Crimson Red pill + alert icon.
  - Pending → Indigo spinner.

---

## 6. Accessibility
- WCAG AA compliance:
  - Contrast ratio ≥ 4.5:1 for text.
  - Keyboard navigation supported.
  - Alt text for all icons/images.
- Dark mode default, light mode optional toggle.

---

## 7. Branding Elements
- **Logo Placement**: Top‑left in navbar, monochrome variant for dark background.
- **Tagline**: “Collaboration made transparent, payments made secure.”
- **Visual Identity**: Premium, futuristic, startup‑centric.

---

## 8. Component Library
Reusable components defined in `/src/components`:
- `Button.tsx` (primary, secondary, disabled states)
- `Card.tsx` (glass panel with glow)
- `Form.tsx` (multi‑step onboarding)
- `Table.tsx` (admin transactions)
- `Modal.tsx` (Razorpay checkout, KYC viewer)

---

**Ratified by:**  
Sukumar, Founder – CollabEscrow  
Apticraze Intelligence LLP  
Date: July 13, 2026
