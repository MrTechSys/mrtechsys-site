// functions/api/cloudflip/consult-submit.ts

interface Env {
  DB?: any;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const payload = await request.json() as {
      name: string;
      email: string;
      businessName: string;
      question?: string;
      selectedBuild?: string[];
      selectedCsps?: string[];
      source?: string;
    };

    if (!payload.name || !payload.email || !payload.businessName) {
      return new Response(JSON.stringify({ error: "Name, business name, and email are required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const timestamp = new Date().toISOString();
    const leadId = crypto.randomUUID();

    // Store in Cloudflare D1 audit_logs / serverless inbox
    if (env.DB) {
      try {
        await env.DB.prepare(
          `INSERT INTO audit_logs (id, tenant_id, user_id, action, resource, metadata, ip_address, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          leadId,
          'public_lead',
          payload.email,
          'CONSULTATION_REQUEST',
          'MrTechSysAdvisory',
          JSON.stringify({
            leadId,
            name: payload.name,
            email: payload.email,
            businessName: payload.businessName,
            question: payload.question || 'General Architecture Advisory',
            selectedBuild: payload.selectedBuild || [],
            selectedCsps: payload.selectedCsps || [],
            source: payload.source || 'consult_modal'
          }),
          request.headers.get('cf-connecting-ip') || 'unknown',
          timestamp
        ).run();
      } catch (dbErr) {
        console.warn("D1 consultation log warning:", dbErr);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      leadId,
      message: "Lead recorded into serverless inbox. Initializing AI advisory session.",
      timestamp
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
