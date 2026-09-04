# Codebase Modules & Directory Guide · mrtechsys-site

A breakdown of the components, modules, pages, and functions inside `mrtechsys-site`.

---

## Directory Overview

```
mrtechsys-site/
├── functions/             # Cloudflare Pages serverless functions (Edge API)
│   ├── _middleware.ts     # Auth whitelist, security headers, bot telemetry
│   └── api/
│       ├── booking-availability.ts  # Dynamic calendar availability
│       ├── booking-submit.ts        # Booking submission + email + CloudFlip bridge
│       ├── booking-cancel.ts        # Secure tokenized cancellation
│       ├── mrtechsysgpt.ts          # AI senior architect advice engine
│       ├── blueprint-submit.ts      # Cloud provisioner blueprint dispatch
│       ├── consult-submit.ts        # Consultation modal lead capture
│       └── leads.ts                 # Lead review API
├── src/
│   ├── components/        # Reusable UI widgets & modals
│   │   ├── SmartBookingModal.jsx   # 5-step native booking wizard
│   │   ├── ConsultationModal.jsx   # AI architecture advisory modal
│   │   ├── CloudProvisionerWizard.jsx # Multi-cloud builder wizard
│   │   ├── FlipEngine.jsx          # 5-step drag diagnostic
│   │   ├── TexasBot.jsx            # Floating AI chat assistant
│   │   ├── Navbar.jsx              # Header with Book Strategy CTA
│   │   └── ...
│   ├── pages/             # Page views mapped to React Router
│   │   ├── Home.jsx                # Landing page
│   │   ├── DiagnosticPage.jsx      # /diagnostic (The Flip Engine)
│   │   ├── CloudProvisionerPage.jsx # /cloud-provisioner (Multi-cloud builder)
│   │   ├── FoundryPage.jsx         # /foundry (Foundry & AI services)
│   │   └── About.jsx               # /about/mrtechsys (Origin & Mission)
│   └── modules/
│       └── auto-risk-analyzer/     # Integrated insurance review engine (/risk/*)
├── schema.sql             # Cloudflare D1 database schema and seed records
├── wrangler.toml          # Cloudflare Pages D1 & Workers AI bindings
└── dist/                  # Production build output
```

---

## Key Global Event Triggers

The application uses an event-driven architecture to coordinate modals and assistants across the site without prop drilling:

- **`mrtechsys-open-booking`**:
  - Triggers the `SmartBookingModal`.
  - Can accept `detail: { service: string, context: { name, email, businessName, question } }`.
  - Dispatched from Navbar, ConsultationModal, and TexasBot.

- **`mrtechsys-open-chat`**:
  - Triggers `TexasBot` into active view with a preloaded prompt.
  - Dispatched from `ConsultationModal` and `CloudProvisionerWizard`.
