// functions/api/assessment-advisor.ts
// MrTechSysGPT Consultant Agent & Deterministic Assessment Engine

interface Env {
  AI?: any;
  DB: D1Database;
  OPENAI_API_KEY?: string;
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

// ─── JOB 3: DETERMINISTIC DIAGNOSTIC RULES ENGINE ────────────────────────────
function runDiagnosticRules(state: DiagnosticState) {
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
  const laterActions: string[] = [];
  const recommendedRoutes: string[] = [];

  // Rule 1: Former Employee Access & MFA
  if (state.former_employee_access) {
    security -= 35;
    continuity -= 15;
    inefficiencies.push({
      id: 'SEC-01',
      severity: 'CRITICAL',
      title: 'Active Former Employee Logins',
      desc: 'Former staff or past contractors may retain active access to company emails, files, or bookkeeping.',
      dimension: 'Security & Access'
    });
    nowActions.push('Audit and revoke all former employee and contractor logins across Google, Microsoft, and accounting platforms.');
    recommendedRoutes.push('PROCESS_FIX');
  }

  if (!state.mfa_enabled) {
    security -= 25;
    nowActions.push('Enforce 2-step verification (MFA) on master emails, banking portals, and accounting software.');
    recommendedRoutes.push('SECURITY_REMEDIATION');
  }

  // Rule 2: Leaking Phone Lead Funnel
  if (state.missed_calls) {
    cx -= 25;
    financial -= 15;
    inefficiencies.push({
      id: 'REV-01',
      severity: 'HIGH',
      title: 'Lead Capture Leakage',
      desc: 'Unanswered calls during peak operating hours roll to unmonitored voicemail, causing customers to call competitors.',
      dimension: 'Customer Experience'
    });
    nowActions.push('Deploy instant automated missed-call auto-reply with a direct online scheduling link to capture urgent leads.');
    recommendedRoutes.push('CLOUDFLIP_OR_VOICE');
  }

  // Rule 3: Manual Invoicing & Payment Drag
  if (state.paper_invoicing || state.checks_collected_later) {
    operations -= 20;
    financial -= 25;
    inefficiencies.push({
      id: 'FIN-01',
      severity: 'MEDIUM',
      title: 'Delayed Invoicing & Cash Flow Drag',
      desc: 'Waiting to invoice customers days after job completion adds an average 14–21 day delay to cash collection.',
      dimension: 'Financial Efficiency'
    });
    nextActions.push('Implement mobile driveway tap-to-pay and photo-to-quote so technicians collect payment upon job completion.');
    recommendedRoutes.push('CLOUDFLIP_OR_STRIPE');
  }

  // Rule 4: Manual Scheduling Phone Tag
  if (state.manual_scheduling) {
    operations -= 20;
    cx -= 15;
    inefficiencies.push({
      id: 'OPS-01',
      severity: 'MEDIUM',
      title: 'Manual Scheduling Friction',
      desc: 'Staff spends 5–10 hours per week playing phone tag coordinating appointment times manually.',
      dimension: 'Operations & Workflow'
    });
    nextActions.push('Add instant customer self-scheduling to your website with real-time arrival windows and buffer rules.');
    recommendedRoutes.push('AUTOMATION');
  }

  // Rule 5: Duplicate Data Entry
  if (state.duplicate_data_entry) {
    operations -= 15;
    data -= 25;
    nextActions.push('Connect web inquiries directly to your customer CRM list to eliminate re-typing customer names and addresses.');
    recommendedRoutes.push('INTEGRATION');
  }

  // Rule 6: Continuity & Single Computer Hazard
  if (state.single_computer_risk || !state.backup_verified) {
    continuity -= 35;
    data -= 25;
    inefficiencies.push({
      id: 'CONT-01',
      severity: 'CRITICAL',
      title: 'Unverified Backups & Single Machine Hazard',
      desc: 'Critical company records or software reside on local hardware without verified off-site cloud backups.',
      dimension: 'Business Continuity'
    });
    nowActions.push('Set up automated off-site cloud backups with a verified 1-click disaster recovery restoration test.');
    recommendedRoutes.push('CLOUD_BACKUP');
  }

  // Default Fallbacks for Strategic Scale
  laterActions.push('Launch a dedicated customer portal for repeat client appointment history and receipt downloads.');
  laterActions.push('Deploy route-clustered mobile dispatch to minimize technician drive time and vehicle fuel expenses.');
  laterActions.push('Institute automated 6-month seasonal service reminders to drive predictable recurring revenue.');

  // Normalize scores between 20 and 95
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
    const body = await request.json() as any;
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
                content: `You are MrTechSys Business Technology Advisor, an empathetic, plain-English small business consultant in Texas.
Tone: Friendly, authoritative, respectful, conversational, zero tech jargon.
Role: Ask ONE clear follow-up question to learn how the business operates.
Target Archetype: ${profile}.
Context so far: ${JSON.stringify(updatedState)}.
Keep your response short (1 to 2 sentences max). Then suggest 3 to 4 quick button options the owner can tap.`
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
      const evaluation = runDiagnosticRules(state);
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
        savingsRange: "$1,200 – $3,600 / year",
        hoursRange: "5 – 12 hours / week",
        healthRating: evaluation.healthScore >= 80 ? "STRONG" : evaluation.healthScore >= 60 ? "MODERATE (EFFICIENCY DRAG)" : "HIGH RISK & CASH LEAKAGE"
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
  } catch (err: any) {
    console.error('[ASSESSMENT ADVISOR ERROR]', err);
    return new Response(JSON.stringify({ error: err.message || 'Server error' }), { status: 500 });
  }
};
