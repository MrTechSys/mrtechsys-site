# MrTechSys Engineering Backlog & Prioritized Action Plan

Tasks are scored using the deterministic priority formula:
$$\text{Priority Score} = (\text{Urgency} \times 0.35) + (\text{Impact} \times 0.35) + (\text{Effort Inverse} \times 0.15) + (\text{Strategic Alignment} \times 0.15)$$

*(Effort Inverse = 10 - Effort)*

---

### [TODO-001] Commit and Tag Handoff Agent Baseline
- **Priority Score**: 9.1 / 10
  - Urgency: 10/10 | Impact: 9/10 | Effort: 2/10 (Effort Inverse: 8) | Strategic Alignment: 10/10
- **Target Files**:
  - `.agents/skills/mrtechsys-handoff/SKILL.md`
  - `scripts/session-manager.mjs`
  - `scripts/tolCoreClient.mjs`
  - `handoff/session-state.json`
  - `handoff/handoff-summary.md`
  - `handoff/todo.md`
  - `changelog/session-history.md`
  - `package.json`
- **Acceptance Criteria**:
  - [ ] Add `"session"` script to `package.json`.
  - [ ] Stage and commit newly created handoff engine files.
  - [ ] Run `npm run session status` to confirm working tree transitions to clean.

---

### [TODO-002] Automated Assessment Email Notification & Dispatch
- **Priority Score**: 8.2 / 10
  - Urgency: 7/10 | Impact: 9/10 | Effort: 3/10 (Effort Inverse: 7) | Strategic Alignment: 9/10
- **Target Files**:
  - `functions/api/assessment-advisor.ts`
  - `functions/api/cloudflip/blueprint-submit.ts`
- **Acceptance Criteria**:
  - [ ] Trigger an email via Resend/Cloudflare MailChannels when an assessment report is generated.
  - [ ] Include individualized CSP recommendation links (AWS, Azure, GCP, Cloudflare) in the outgoing email.

---

### [TODO-003] CloudFlip OS Page Redesign & De-duplication
- **Priority Score**: 7.6 / 10
  - Urgency: 6/10 | Impact: 8/10 | Effort: 4/10 (Effort Inverse: 6) | Strategic Alignment: 8/10
- **Target Files**:
  - `src/pages/CloudFlipOSPage.jsx`
  - `src/pages/WhyMrTechSysPage.jsx`
- **Acceptance Criteria**:
  - [ ] Differentiate messaging: Make "Why MrTechSys" focus on consulting & engineering capabilities, and "CloudFlip OS" focus purely on platform architecture & workflows.
  - [ ] Eliminate duplicated copy and overlapping diagrams.
