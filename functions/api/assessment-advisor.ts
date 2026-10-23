// functions/api/assessment-advisor.ts
// MrTechSysGPT Consultant Agent & Deterministic Assessment Engine

import { cleanText, escapeHtml, isSingleEmail, readJsonBody } from '../../shared/emailSafety';
import { consumeLimits, emailLimits, limitResponse } from '../../shared/rateLimit';

interface Env {
  AI?: any;
  DB: D1Database;
  OPENAI_API_KEY?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  ADMIN_ALERT_EMAIL?: string;
  // 'true' turns on send_report_email. Off by default: it emails any address a visitor gives, so it stays off until
  // the endpoint has bot protection (Turnstile) and a per-IP / per-recipient rate limit.
  REPORT_EMAIL_ENABLED?: string;
}

interface DiagnosticState {
  business_profile?: string;
  business_name?: string;
  team_size?: string;
  primary_lead_channel?: string;
  missed_calls?: boolean;
  manual_scheduling?: boolean;
  paper_invoicing?: boolean;
  checks_collected_later?: boolean;
  former_employee_access?: boolean;
  mfa_enabled?: boolean;
  backup_verified?: boolean;
  single_computer_risk?: boolean;
  systems?: string[];
  duplicate_data_entry?: boolean;
  offline_readiness_hours?: number;
}

// ─── DYNAMIC INDUSTRY-SPECIFIC ROADMAP & BENCHMARK MATRIX ────────────────────
const INDUSTRY_PROFILES: Record<string, {
  name: string;
  defaultLeadLeakAction: string;
  defaultPaymentAction: string;
  defaultSchedulingAction: string;
  defaultSecurityAction: string;
  defaultContinuityAction: string;
  strategicLaterActions: string[];
  savingsRange: string;
  hoursRange: string;
}> = {
  contractor: {
    name: 'Contractor & Field Trades',
    defaultLeadLeakAction: 'Deploy an automated 24/7 missed-call text back with emergency job booking so homeowners don’t call the next plumber or electrician on Google.',
    defaultPaymentAction: 'Equip field technicians with mobile photo-to-quote and instant tap-to-pay so payment is collected in the driveway before pulling away.',
    defaultSchedulingAction: 'Implement real-time 2-hour arrival window booking synced directly to technician service trucks.',
    defaultSecurityAction: 'Audit technician mobile device access and immediately revoke former apprentice/subcontractor logins to work order drives.',
    defaultContinuityAction: 'Migrate price books, part supplier logs, and customer records from local office PCs into encrypted cloud storage with daily snapshots.',
    strategicLaterActions: [
      'Institute automated 6-month seasonal service inspection reminders (AC in Spring, Heating in Fall) for recurring service agreements.',
      'Deploy route-clustered mobile dispatch to shave 15-20% off weekly vehicle fuel expenses and drive time.',
      'Launch a customer portal for warranty certificates, equipment install receipts, and filter size tracking.'
    ],
    savingsRange: '$3,600 – $9,600 / year',
    hoursRange: '8 – 16 hours / week'
  },
  pro_service: {
    name: 'Professional Practice (Legal, Accounting, Consulting)',
    defaultLeadLeakAction: 'Add instant confidential consultation booking directly to your website so high-value prospective clients lock in meetings immediately.',
    defaultPaymentAction: 'Automate milestone retainer billing and digital ACH settlement to stop chasing unpaid 30-day net invoices.',
    defaultSchedulingAction: 'Provide clients with automated calendar scheduling that respects your billable prep buffers and time-zone rules.',
    defaultSecurityAction: 'Enforce MFA and immediate access revocation for former paralegals, associates, or contractors across client document vaults and email.',
    defaultContinuityAction: 'Eliminate single-workstation dependency by transitioning practice management records to zero-trust encrypted cloud vaults.',
    strategicLaterActions: [
      'Automate client document onboarding, NDA e-signing, and KYC identity verification workflows.',
      'Implement passive billable time tracking synchronized against matter and case retainers.',
      'Deploy encrypted client-facing portal for secure tax return and legal deliverable exchange.'
    ],
    savingsRange: '$4,200 – $11,000 / year',
    hoursRange: '6 – 14 hours / week'
  },
  auto_fleet: {
    name: 'Auto & Fleet Services',
    defaultLeadLeakAction: 'Capture every towing, roadside, or mobile repair inquiry instantly with automated SMS dispatch qualification.',
    defaultPaymentAction: 'Deploy mobile digital inspection reports with tap-to-approve estimates and immediate credit/debit settlement upon vehicle handover.',
    defaultSchedulingAction: 'Add bay/technician scheduling with estimated vehicle turnaround windows to prevent lot congestion.',
    defaultSecurityAction: 'Lock down diagnostic scan tool accounts, parts catalog logins, and dealer portal credentials against unmonitored shared passwords.',
    defaultContinuityAction: 'Automate off-site cloud backups for repair order databases, parts catalogs, and customer inspection archives.',
    strategicLaterActions: [
      'Integrate vehicle telematics and automated mileage-triggered preventative maintenance notifications.',
      'Deploy automated supplier parts price comparison to cut procurement markup by 8-12%.',
      'Launch automated inspection text updates with video walkthrough links for customer repair approvals.'
    ],
    savingsRange: '$5,000 – $14,000 / year',
    hoursRange: '10 – 20 hours / week'
  },
  solo_pro: {
    name: 'Solo Operator / Independent Consultant',
    defaultLeadLeakAction: 'Stop letting phone tag interrupt deep client work; route missed calls to an automated text-back booking calendar.',
    defaultPaymentAction: 'Eliminate manual late-night invoicing by requiring card on file or 50% deposit upon project booking.',
    defaultSchedulingAction: 'Automate all consultation booking with strict daily capacity caps so you never overbook your calendar.',
    defaultSecurityAction: 'Turn on 2-step verification (MFA) across your master Google/Microsoft account and password manager to secure your livelihood.',
    defaultContinuityAction: 'Ensure your lone work laptop is continuously mirrored to cloud backup so a spilled coffee doesn’t destroy your business.',
    strategicLaterActions: [
      'Automate recurring monthly subscription/retainer charges through Stripe without manual invoicing.',
      'Deploy automated post-service review request sequence to build 5-star Google reputation on autopilot.',
      'Connect lead capture forms directly to your bookkeeping tool to eliminate weekend data entry.'
    ],
    savingsRange: '$1,800 – $3,600 / year',
    hoursRange: '5 – 10 hours / week'
  },
  growing_smb: {
    name: 'Growing Small Business (5–25 Employees)',
    defaultLeadLeakAction: 'Route inbound leads into a unified multi-user inbox with automated owner alerts so quotes are submitted within 15 minutes.',
    defaultPaymentAction: 'Eliminate duplicate accounting entry by synchronizing point-of-sale or web payments directly into QuickBooks/Xero.',
    defaultSchedulingAction: 'Implement role-based team calendar scheduling with automated round-robin distribution to available team members.',
    defaultSecurityAction: 'Institute centralized Identity & Access Management (IAM) to enforce MFA and instantly offboard departing employees across all apps.',
    defaultContinuityAction: 'Establish an automated business continuity runbook with tested 1-hour cloud restoration for accounting and operational databases.',
    strategicLaterActions: [
      'Audit existing SaaS subscriptions to eliminate duplicate software licenses across departments.',
      'Build internal operations dashboard tracking live quote closure rates and team response speeds.',
      'Standardize employee operating procedures (SOPs) into a searchable internal team knowledge base.'
    ],
    savingsRange: '$6,000 – $18,000 / year',
    hoursRange: '12 – 25 hours / week'
  }
};

// ─── JOB 3: DETERMINISTIC DIAGNOSTIC RULES ENGINE ────────────────────────────
function runDiagnosticRules(state: DiagnosticState, profileKey: string = 'contractor') {
  // Own keys only: '__proto__' or 'constructor' would otherwise resolve to a built-in object.
  const profileConfig = Object.hasOwn(INDUSTRY_PROFILES, profileKey) ? INDUSTRY_PROFILES[profileKey] : INDUSTRY_PROFILES.contractor;

  let operations = 75;
  let security = 80;
  let technology = 70;
  let data = 75;
  let cx = 70;
  let financial = 70;
  let continuity = 75;

  const inefficiencies: any[] = [];
  const nowActions: string[] = [];
  const nextActions: string[] = [];
  const laterActions: string[] = [...profileConfig.strategicLaterActions];
  const recommendedRoutes: string[] = [];

  // Rule 1: Former Employee Access & MFA
  if (state.former_employee_access) {
    security -= 35;
    continuity -= 15;
    inefficiencies.push({
      id: 'SEC-01',
      severity: 'CRITICAL',
      title: 'Unrevoked Former Staff Logins',
      desc: 'Former employees or past contractors may retain active access to company emails, shared drives, or financial portals.',
      dimension: 'Security & Access'
    });
    nowActions.push(profileConfig.defaultSecurityAction);
    recommendedRoutes.push('SECURITY_OFFBOARDING');
  }

  if (!state.mfa_enabled) {
    security -= 25;
    nowActions.push('Enforce 2-step verification (MFA) across primary email, banking portals, and accounting software.');
    recommendedRoutes.push('SECURITY_REMEDIATION');
  }

  // Rule 2: Leaking Phone Lead Funnel
  if (state.missed_calls) {
    cx -= 25;
    financial -= 15;
    inefficiencies.push({
      id: 'REV-01',
      severity: 'HIGH',
      title: 'Inbound Lead Leakage & Phone Tag',
      desc: 'Unanswered calls during busy jobs roll to voicemail, prompting high-intent customers to immediately call competitors.',
      dimension: 'Customer Experience'
    });
    nowActions.push(profileConfig.defaultLeadLeakAction);
    recommendedRoutes.push('LEAD_CAPTURE_ENGINE');
  }

  // Rule 3: Manual Invoicing & Payment Drag
  if (state.paper_invoicing || state.checks_collected_later) {
    operations -= 20;
    financial -= 25;
    inefficiencies.push({
      id: 'FIN-01',
      severity: 'MEDIUM',
      title: 'Delayed Invoicing & Cash Flow Friction',
      desc: 'Writing paper invoices or drafting them days later creates an avoidable 14–28 day lag in bank account cash collection.',
      dimension: 'Financial Efficiency'
    });
    nextActions.push(profileConfig.defaultPaymentAction);
    recommendedRoutes.push('PAYMENT_ACCELERATION');
  }

  // Rule 4: Manual Scheduling Phone Tag
  if (state.manual_scheduling) {
    operations -= 20;
    cx -= 15;
    inefficiencies.push({
      id: 'OPS-01',
      severity: 'MEDIUM',
      title: 'Manual Scheduling Friction',
      desc: 'Coordinating appointments via phone tag and manual texting wastes 5–15 administrative hours every week.',
      dimension: 'Operations & Workflow'
    });
    nextActions.push(profileConfig.defaultSchedulingAction);
    recommendedRoutes.push('SMART_SCHEDULING');
  }

  // Rule 5: Duplicate Data Entry
  if (state.duplicate_data_entry) {
    operations -= 15;
    data -= 25;
    inefficiencies.push({
      id: 'OPS-02',
      severity: 'MEDIUM',
      title: 'Manual Duplicate Data Re-entry',
      desc: 'Re-typing client names and addresses between contact forms, spreadsheets, and accounting software invites human errors.',
      dimension: 'Operations & Workflow'
    });
    nextActions.push('Connect online inquiry forms directly to your customer records to permanently eliminate double data entry.');
    recommendedRoutes.push('SYSTEMS_INTEGRATION');
  }

  // Rule 6: Continuity & Single Computer Hazard
  if (state.single_computer_risk || !state.backup_verified) {
    continuity -= 35;
    data -= 25;
    inefficiencies.push({
      id: 'CONT-01',
      severity: 'CRITICAL',
      title: 'Single-Point Hardware Failure & Unverified Backups',
      desc: 'Core operational files or accounting software reside on local hardware without tested off-site cloud disaster recovery.',
      dimension: 'Business Continuity'
    });
    nowActions.push(profileConfig.defaultContinuityAction);
    recommendedRoutes.push('CLOUD_BACKUP_DISASTER_RECOVERY');
  }

  // Normalize scores between 25 and 95
  const normalize = (val: number) => Math.max(25, Math.min(95, Math.round(val)));
  operations = normalize(operations);
  security = normalize(security);
  technology = normalize(technology);
  data = normalize(data);
  cx = normalize(cx);
  financial = normalize(financial);
  continuity = normalize(continuity);

  // Overall Business Technology Health Score
  const healthScore = Math.round(
    operations * 0.15 +
    security * 0.20 +
    technology * 0.10 +
    data * 0.15 +
    cx * 0.15 +
    financial * 0.10 +
    continuity * 0.15
  );

  return {
    healthScore,
    profileName: profileConfig.name,
    savingsRange: profileConfig.savingsRange,
    hoursRange: profileConfig.hoursRange,
    categories: {
      operations,
      security,
      technology,
      data,
      cx,
      financial,
      continuity
    },
    inefficiencies: inefficiencies.slice(0, 4),
    nowActions: Array.from(new Set(nowActions)).slice(0, 5),
    nextActions: Array.from(new Set(nextActions)).slice(0, 3),
    laterActions: laterActions.slice(0, 3),
    recommendedRoutes: Array.from(new Set(recommendedRoutes))
  };
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = await readJsonBody(request);
    const { action, dialogueHistory, currentAnswer, state = {}, profile = 'contractor' } = body;

    // ─── ACTION 1: ADAPTIVE INTERVIEW TURN (Job 1 & Job 2) ──────────────────
    if (action === 'interview_turn') {
      const updatedState = { ...state };

      // Fast deterministic keyword extractions
      const text = (currentAnswer || '').toLowerCase();
      if (text.includes('voicemail') || text.includes('miss') || text.includes('busy') || text.includes('rings')) {
        updatedState.missed_calls = true;
      }
      if (text.includes('phone') || text.includes('call')) {
        updatedState.primary_lead_channel = 'phone';
      }
      if (text.includes('paper') || text.includes('clipboard') || text.includes('invoice later') || text.includes('check')) {
        updatedState.paper_invoicing = true;
        updatedState.checks_collected_later = true;
      }
      if (text.includes('quickbooks') || text.includes('one computer') || text.includes('desktop')) {
        updatedState.single_computer_risk = true;
      }
      if (text.includes('yes') && text.includes('former')) {
        updatedState.former_employee_access = true;
      }
      if (text.includes('no') && (text.includes('mfa') || text.includes('2-step') || text.includes('two-factor'))) {
        updatedState.mfa_enabled = false;
      }

      // Call Workers AI to generate next friendly question
      let replyText = "Understood. How does your team currently track appointments and job schedules?";
      let quickOptions = ["Manual Whiteboard / Calendar", "Google / Outlook Calendar", "Texting Back & Forth", "Dedicated Scheduling App"];

      if (env.AI) {
        try {
          const aiRes = await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fp8', {
            messages: [
              {
                role: 'system',
                content: `You are MrTechSys Business Technology Advisor, an empathetic, plain-English small business technology and operational systems consultant.
Tone: Professional, authoritative, respectful, conversational, zero technical jargon.
Role: Ask ONE clear follow-up question to learn how the business operates.
Target Archetype: ${profile}.
Context so far: ${JSON.stringify(updatedState)}.
Keep your response short (1 to 2 sentences max, no double asterisks **). Then suggest 3 to 4 quick button options the owner can tap.`
              },
              { role: 'user', content: `Owner answered: "${currentAnswer}". What is the next logical operational question?` }
            ]
          });
          if (aiRes?.response) {
            replyText = aiRes.response.trim();
          }
        } catch (e) {
          console.warn('[ASSESSMENT AI FALLBACK]', e);
        }
      }

      return new Response(JSON.stringify({
        reply: replyText,
        options: quickOptions,
        state: updatedState
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    // ─── ACTION 2: REPORT GENERATION & PERSISTENCE (Job 3, 4, 5) ─────────────
    if (action === 'generate_report') {
      const evaluation = runDiagnosticRules(state, profile);
      const profileId = `btp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      // Save canonical business technology profile to D1
      if (env.DB) {
        try {
          await env.DB.prepare(`
            INSERT INTO business_technology_profiles (
              id, business_name, contact_name, contact_email, contact_phone,
              industry, team_size, raw_dialogue_json, extracted_state_json,
              health_score, operations_score, security_score, technology_score,
              data_score, cx_score, financial_score, continuity_score,
              identified_inefficiencies_json, now_actions_json, next_actions_json,
              later_actions_json, recommended_routes_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            profileId,
            state.business_name || 'My Business',
            state.contact_name || 'Business Owner',
            state.contact_email || 'owner@example.com',
            state.contact_phone || null,
            profile,
            state.team_size || '1-10',
            JSON.stringify(dialogueHistory || []),
            JSON.stringify(state),
            evaluation.healthScore,
            evaluation.categories.operations,
            evaluation.categories.security,
            evaluation.categories.technology,
            evaluation.categories.data,
            evaluation.categories.cx,
            evaluation.categories.financial,
            evaluation.categories.continuity,
            JSON.stringify(evaluation.inefficiencies),
            JSON.stringify(evaluation.nowActions),
            JSON.stringify(evaluation.nextActions),
            JSON.stringify(evaluation.laterActions),
            JSON.stringify(evaluation.recommendedRoutes)
          ).run();
        } catch (dbErr) {
          console.warn('[D1 SAVE ASSESSMENT ERROR]', dbErr);
        }
      }

      return new Response(JSON.stringify({
        success: true,
        profileId,
        evaluation,
        savingsRange: evaluation.savingsRange,
        hoursRange: evaluation.hoursRange,
        healthRating: evaluation.healthScore >= 80 ? "STRONG" : evaluation.healthScore >= 60 ? "MODERATE (EFFICIENCY DRAG)" : "HIGH RISK & CASH LEAKAGE"
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    // ─── ACTION 3: EMAIL REPORT DISPATCH VIA RESEND ─────────────────────────
    if (action === 'send_report_email') {
      if (env.REPORT_EMAIL_ENABLED !== 'true') {
        return new Response(JSON.stringify({ success: false, emailSent: false, error: 'Email reports are not available yet. Please download your report instead.' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
      }
      const recipientEmail = String(body.email || state.contact_email || '').trim();
      // Plain text for the subject and storage; escaped wherever it goes into the email HTML.
      const targetBusinessName = cleanText(body.businessName || state.business_name || 'Valued Business', 100);
      const targetContactName = cleanText(body.contactName || state.contact_name || 'Executive Leader', 100);

      if (!isSingleEmail(recipientEmail)) {
        return new Response(JSON.stringify({ error: 'One valid email address required' }), { status: 400 });
      }
      const limited = await consumeLimits(env.DB, await emailLimits(request, recipientEmail));
      if (!limited.ok) return limitResponse(limited);

      const evaluation = runDiagnosticRules(state, profile);
      const leadId = `lead-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const timestamp = new Date().toISOString();

      // 1. Log to D1 database if present
      if (env.DB) {
        try {
          await env.DB.prepare(`
            INSERT INTO business_technology_profiles (
              id, business_name, contact_name, contact_email, contact_phone,
              industry, team_size, raw_dialogue_json, extracted_state_json,
              health_score, operations_score, security_score, technology_score,
              data_score, cx_score, financial_score, continuity_score,
              identified_inefficiencies_json, now_actions_json, next_actions_json,
              later_actions_json, recommended_routes_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            leadId,
            targetBusinessName,
            targetContactName,
            recipientEmail,
            state.contact_phone || null,
            profile,
            state.team_size || '1-10',
            JSON.stringify((Array.isArray(body.dialogueHistory) ? body.dialogueHistory : []).slice(-20).map((t: unknown) => cleanText(typeof t === 'string' ? t : JSON.stringify(t), 1000))),
            JSON.stringify(state),
            evaluation.healthScore,
            evaluation.categories.operations,
            evaluation.categories.security,
            evaluation.categories.technology,
            evaluation.categories.data,
            evaluation.categories.cx,
            evaluation.categories.financial,
            evaluation.categories.continuity,
            JSON.stringify(evaluation.inefficiencies),
            JSON.stringify(evaluation.nowActions),
            JSON.stringify(evaluation.nextActions),
            JSON.stringify(evaluation.laterActions),
            JSON.stringify(evaluation.recommendedRoutes)
          ).run();
        } catch (dbErr) {
          console.warn('[D1 EMAIL LOG WARNING]', dbErr);
        }
      }

      // 2. Dispatch via Resend API
      let emailSent = false;
      let emailError: string | null = null;

      if (env.RESEND_API_KEY) {
        const fromEmail = env.RESEND_FROM_EMAIL || 'notifications@mrtechsys.com';
        const ratingColor = evaluation.healthScore >= 80 ? '#10B981' : evaluation.healthScore >= 60 ? '#F59E0B' : '#EF4444';

        const inefficienciesHtml = evaluation.inefficiencies.map((item: any) => `
          <div style="margin-bottom: 12px; padding: 12px 14px; background: rgba(239,68,68,0.06); border-left: 3px solid #EF4444; border-radius: 0 6px 6px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <strong style="color: #F87171; font-size: 13px;">${item.title}</strong>
              <span style="font-family: monospace; font-size: 10px; color: #FCA5A5; background: rgba(239,68,68,0.2); padding: 2px 6px; border-radius: 4px;">${item.severity}</span>
            </div>
            <p style="color: #CBD5E1; font-size: 12px; margin: 0; line-height: 1.4;">${item.desc}</p>
          </div>
        `).join('');

        const nowActionsHtml = evaluation.nowActions.map((act: string, idx: number) => `
          <div style="margin-bottom: 8px; padding: 10px 12px; background: rgba(212,175,55,0.05); border: 1px solid rgba(212,175,55,0.2); border-radius: 6px;">
            <span style="display: inline-block; font-family: monospace; font-size: 10px; font-weight: bold; color: #D4AF37; margin-right: 6px;">STEP 0${idx + 1}</span>
            <span style="color: #E2E8F0; font-size: 12px;">${act}</span>
          </div>
        `).join('');

        const emailHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 20px; background-color: #07090E; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #E2E8F0;">
  <table style="max-width: 650px; margin: 0 auto; background-color: #0B0F17; border-radius: 12px; border: 1px solid rgba(212, 175, 55, 0.35); overflow: hidden; padding: 32px;">
    <tr>
      <td>
        <div style="text-align: left; margin-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 16px;">
          <span style="font-family: monospace; font-size: 11px; color: #D4AF37; letter-spacing: 1.5px; text-transform: uppercase; font-weight: bold;">
            ⚡ MRTECHSYS &bull; EXECUTIVE SYSTEMS BRIEFING
          </span>
          <h1 style="color: #FFFFFF; font-size: 24px; margin: 8px 0 4px 0; font-weight: 800;">
            10-Point Operational Diagnostic Report
          </h1>
          <p style="color: #94A3B8; font-size: 13px; margin: 0;">
            Prepared for <strong>${escapeHtml(targetBusinessName)}</strong> &bull; Profile: ${evaluation.profileName}
          </p>
        </div>

        <p style="font-size: 14px; line-height: 1.6; color: #CBD5E1;">
          Hello ${escapeHtml(targetContactName)},
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #CBD5E1;">
          Here is your executive operational briefing synthesized by the MrTechSys Diagnostic Engine. Your baseline scores and prioritized recovery actions are summarized below.
        </p>

        <!-- Executive Score Badge -->
        <div style="background-color: #121824; border-left: 4px solid ${ratingColor}; padding: 16px 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <div>
              <span style="font-size: 11px; font-family: monospace; color: #94A3B8; text-transform: uppercase;">Technology Health Score</span>
              <div style="font-size: 32px; font-weight: 800; color: #D4AF37; margin-top: 2px;">
                ${evaluation.healthScore} <span style="font-size: 14px; color: #94A3B8; font-weight: normal;">/ 100</span>
              </div>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 11px; font-family: monospace; color: #94A3B8; text-transform: uppercase;">Estimated Savings</span>
              <div style="font-size: 15px; font-weight: 700; color: #10B981; margin-top: 2px;">${evaluation.savingsRange}</div>
              <div style="font-size: 11px; font-family: monospace; color: #94A3B8;">${evaluation.hoursRange} recoverable</div>
            </div>
          </div>
        </div>

        <!-- Flagged Inefficiencies -->
        ${evaluation.inefficiencies.length > 0 ? `
          <div style="margin: 24px 0;">
            <h3 style="color: #FFFFFF; font-size: 15px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">
              ⚠️ Critical Friction Points Identified
            </h3>
            ${inefficienciesHtml}
          </div>
        ` : ''}

        <!-- Recommended Immediate Actions -->
        <div style="margin: 24px 0;">
          <h3 style="color: #D4AF37; font-size: 15px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">
            ⚡ Phase 1: High-Priority Operational Fixes (Days 1–30)
          </h3>
          ${nowActionsHtml}
        </div>

        <!-- Unbiased Cloud Providers -->
        <div style="margin: 28px 0; padding: 18px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px;">
          <h4 style="color: #FFFFFF; margin: 0 0 6px 0; font-size: 14px;">Recommended Zero-Cost Cloud Primitives</h4>
          <p style="color: #94A3B8; font-size: 12px; margin: 0 0 12px 0; line-height: 1.4;">
            As an objective architecture consultancy, MrTechSys configures systems across top-tier providers so you never suffer vendor lock-in:
          </p>
          <div style="font-size: 11px; font-family: monospace;">
            <a href="https://dash.cloudflare.com/sign-up" target="_blank" style="display: inline-block; margin: 4px 6px 4px 0; padding: 6px 12px; background: rgba(212,175,55,0.15); border: 1px solid rgba(212,175,55,0.4); border-radius: 4px; color: #D4AF37; text-decoration: none; font-weight: bold;">
              Cloudflare Free Tier &rarr;
            </a>
            <a href="https://aws.amazon.com/free" target="_blank" style="display: inline-block; margin: 4px 6px 4px 0; padding: 6px 12px; background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.4); border-radius: 4px; color: #F59E0B; text-decoration: none; font-weight: bold;">
              AWS Free Tier &rarr;
            </a>
            <a href="https://azure.microsoft.com/free" target="_blank" style="display: inline-block; margin: 4px 6px 4px 0; padding: 6px 12px; background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.4); border-radius: 4px; color: #60A5FA; text-decoration: none; font-weight: bold;">
              Azure Free Tier &rarr;
            </a>
            <a href="https://cloud.google.com/free" target="_blank" style="display: inline-block; margin: 4px 6px 4px 0; padding: 6px 12px; background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.4); border-radius: 4px; color: #34D399; text-decoration: none; font-weight: bold;">
              Google Cloud Free Tier &rarr;
            </a>
          </div>
        </div>

        <!-- Strategy Review CTA -->
        <div style="margin-top: 32px; padding: 22px; background-color: #0E131F; border-radius: 8px; border: 1px solid rgba(212,175,55,0.3); text-align: center;">
          <h4 style="color: #FFFFFF; margin: 0 0 8px 0; font-size: 16px; font-weight: 700;">Want Help Implementing Your Roadmap?</h4>
          <p style="color: #94A3B8; font-size: 12px; margin: 0 0 16px 0; line-height: 1.5;">
            Review your findings live with the MrTechSys advisory team in a private, 30-minute strategy session. Zero sales pitch, zero lock-in.
          </p>
          <a href="https://mrtechsys.com/assessment" style="display: inline-block; background: linear-gradient(135deg, #D4AF37, #EAB308); color: #07090E; font-weight: bold; font-family: monospace; font-size: 12px; text-decoration: none; padding: 12px 24px; border-radius: 8px; text-transform: uppercase; letter-spacing: 1px;">
            Book Strategy Session on MrTechSys &rarr;
          </a>
        </div>

        <div style="margin-top: 28px; text-align: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 16px;">
          <p style="font-size: 11px; color: #64748B; font-family: monospace; margin: 0;">
            MrTechSys Digital Transformation Ecosystem &bull; Texas-Rooted Simplicity &bull; Free First, Scale Smart
          </p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;

        try {
          const resendRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${env.RESEND_API_KEY}`
            },
            body: JSON.stringify({
              from: `MrTechSys Advisory <${fromEmail}>`,
              to: [recipientEmail],
              bcc: [env.ADMIN_ALERT_EMAIL || 'direct@mrtechsys.com'],
              reply_to: 'direct@mrtechsys.com',
              subject: `Diagnostic Briefing: ${targetBusinessName} (${evaluation.healthScore}/100 Health Score)`,
              html: emailHtml
            })
          });

          if (resendRes.ok) {
            emailSent = true;
          } else {
            console.warn('[RESEND ASSESSMENT ERROR]', resendRes.status, await resendRes.text());
            emailError = 'delivery_failed';
          }
        } catch (rErr: any) {
          emailError = 'delivery_failed';
          console.warn('[RESEND FETCH ERROR]', rErr);
        }
      }

      return new Response(JSON.stringify({
        success: true,
        emailSent,
        recipientEmail,
        emailError,
        message: emailSent
          ? `Briefing successfully dispatched to ${recipientEmail}.`
          : emailError
            ? 'Your briefing was saved, but the email could not be delivered. Please download your report instead.'
            : 'Your briefing was saved. Email delivery is not configured.',
        timestamp
      }), { headers: { 'Content-Type': 'application/json' } });
    }


    return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
  } catch (err: any) {
    console.error('[ASSESSMENT ADVISOR ERROR]', err);
    if (err?.status === 413) return new Response(JSON.stringify({ error: 'Request too large' }), { status: 413 });
    if (err instanceof SyntaxError) return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 });
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
