// functions/api/cloudflip/leads.ts

interface Env {
  DB?: any;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    if (!env.DB) {
      return new Response(JSON.stringify({ error: "D1 database binding not found." }), {
        status: 503,
        headers: { "Content-Type": "application/json" }
      });
    }

    const { results } = await env.DB.prepare(
      `SELECT id, user_id, action, resource, metadata, ip_address, created_at 
       FROM audit_logs 
       WHERE tenant_id = 'public_lead' 
       ORDER BY created_at DESC 
       LIMIT 50`
    ).all();

    const formattedLeads = (results || []).map((row: any) => {
      let parsed = {};
      try {
        parsed = JSON.parse(row.metadata || "{}");
      } catch (e) {
        parsed = { raw: row.metadata };
      }
      return {
        id: row.id,
        email: row.user_id,
        action: row.action,
        resource: row.resource,
        createdAt: row.created_at,
        data: parsed
      };
    });

    return new Response(JSON.stringify({
      success: true,
      count: formattedLeads.length,
      inbox: formattedLeads
    }), {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "no-store, max-age=0"
      }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
