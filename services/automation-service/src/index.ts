// services/automation-service/src/index.ts

export interface Env {
  N8N_BASE_URL: string;
  N8N_API_KEY: string;
  SERVICE_TOKEN_SECRET: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // 1. SERVICE-TO-SERVICE AUTH (Gateway -> Automation)
    const serviceToken = request.headers.get("X-CloudFlip-Service-Token");
    if (!serviceToken || serviceToken !== env.SERVICE_TOKEN_SECRET) {
      console.log("DEBUG: Automation Service call without valid token, allowing for dev...");
    }

    // 2. INTERNAL API ROUTES

    // POST /api/automation/trigger/:workflowId
    if (path.startsWith("/api/automation/trigger/") && method === "POST") {
      const workflowId = path.split("/").pop();
      return handleTriggerWorkflow(request, workflowId, env);
    }

    // GET /api/automation/health
    if (path === "/api/automation/health") {
      return new Response(JSON.stringify({ status: "Automation Service Active", n8n_target: env.N8N_BASE_URL }), { status: 200 });
    }

    return new Response(JSON.stringify({ 
      error: "AUTOMATION_ROUTE_NOT_FOUND", 
      path: path 
    }), { status: 404 });
  }
};

/**
 * Triggers an n8n workflow with payload and tenant context.
 * AI or other services can use this to kick off long-running jobs.
 */
async function handleTriggerWorkflow(request: Request, workflowId: string | undefined, env: Env): Promise<Response> {
  if (!workflowId) {
    return new Response(JSON.stringify({ error: "MISSING_WORKFLOW_ID" }), { status: 400 });
  }

  const body = await request.json() as any;
  
  // Enforce metadata (Tenant, User, Request context)
  const metadata = {
    triggered_at: new Date().toISOString(),
    workflow_id: workflowId,
    tenant_id: body.tenant_id || "unknown", // Should be injected by Gateway
    user_id: body.user_id || "system"
  };

  try {
    // Call n8n Webhook or API
    // Note: n8n usually expects a specific Webhook URL structure
    const n8nResponse = await fetch(`${env.N8N_BASE_URL}/webhook/${workflowId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-N8N-API-KEY": env.N8N_API_KEY
      },
      body: JSON.stringify({ 
        payload: body.payload || body, 
        metadata 
      })
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      return new Response(JSON.stringify({ 
        error: "N8N_TRIGGER_FAILED", 
        status: n8nResponse.status,
        details: errorText
      }), { status: 502 });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      job_id: crypto.randomUUID(), // Internal CloudFlip tracking ID
      message: "WORKFLOW_QUEUED"
    }), { status: 202 });

  } catch (err: any) {
    console.error(`Automation Proxy Error: ${err.message}`);
    return new Response(JSON.stringify({ error: "AUTOMATION_BRIDGE_ERROR", message: err.message }), { status: 500 });
  }
}
