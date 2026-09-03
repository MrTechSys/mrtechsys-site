import { requireAuth } from "./api/cloudflip/_auth";

// Helper to generate UUIDs
function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

export const onRequest: PagesFunction<{ JWT_SECRET: string, DB: D1Database }> = async ({ request, next, env }) => {
  const startTime = Date.now();
  const url = new URL(request.url);
  const host = request.headers.get("host");
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const country = request.cf?.country || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  // @ts-ignore - Cloudflare Types issue
  const botScore = request.cf?.botManagement?.score || -1; 

  // --- 1. Security & Bot Management ---
  
  // Throttle low bot scores (Example: < 30)
  if (botScore !== -1 && botScore < 30 && !url.pathname.startsWith("/api/public")) {
    return new Response(JSON.stringify({ error: "Access Denied: Low Bot Score" }), { status: 403 });
  }

  // SOC 2 Posture: Ensure JWT_SECRET is present when accessing protected routes
  const isPublicRoute = url.pathname.includes("mrtechsysgpt") || url.pathname.includes("blueprint-submit") || url.pathname.includes("consult-submit") || url.pathname.startsWith("/api/public");
  if (!env.JWT_SECRET && !isPublicRoute && (url.pathname.startsWith("/api/cloudflip") || host === "cloudflip.mrtechsys.com")) {
    console.error("SOC 2 Violation: JWT_SECRET environment variable is missing.");
    return new Response(JSON.stringify({ error: "Configuration Error" }), { status: 500 });
  }

  // --- 2. Auth & RBAC ---
  let userId = null;
  let tenantId = null;

  // Handle CloudFlip Subdomain & API Security
  if (!isPublicRoute && (host === "cloudflip.mrtechsys.com" || url.pathname.startsWith("/api/cloudflip"))) {
    
    // RBAC: Protect Admin-only entities and functions
    const adminPathPrefixes = ["/api/cloudflip/ComplianceControl", "/api/cloudflip/AuditLog", "/api/cloudflip/functions/soc2"];
    const isAdminPath = adminPathPrefixes.some(p => url.pathname.startsWith(p));

    // Exclude Auth routes from checks
    if (!url.pathname.includes("/auth/")) {
       try {
         const session = await requireAuth(request, env.JWT_SECRET);
         if (session) {
           userId = session.user_id;
           tenantId = session.org_id;
           
           if (isAdminPath && session.role !== "admin") {
              // Log 403 Attempt
              await logTelemetry(env.DB, { ip, country, userAgent, path: url.pathname, method: request.method, status: 403, duration: Date.now() - startTime, botScore, userId, tenantId, action: "RBAC_VIOLATION" });
              return new Response(JSON.stringify({ error: "Forbidden: Elevated privileges required" }), { status: 403 });
           }
         } else if (isAdminPath || url.pathname.startsWith("/api/cloudflip")) {
             // 401 Unauthorized
             await logTelemetry(env.DB, { ip, country, userAgent, path: url.pathname, method: request.method, status: 401, duration: Date.now() - startTime, botScore, userId, tenantId, action: "UNAUTHORIZED_ACCESS" });
             return new Response(JSON.stringify({ error: "Unauthorized: Active session required" }), { status: 401 });
         }
       } catch (e) {
         // Token error
       }
    }
  }

  // --- 3. Execute Request ---
  let response = await next();

  // CloudFlip subdomain isolation (if applicable)
  // Ensures mrtechsys.com and all pages stay strictly on the MrTechSys home site
  if (host === "cloudflip.mrtechsys.com" && !url.pathname.startsWith("/api/")) {
    const hasExtension = url.pathname.includes(".");
    if (!hasExtension && url.pathname.startsWith("/app")) {
      const rewriteUrl = new URL(request.url);
      rewriteUrl.pathname = `/index.html`;
      response = await env.ASSETS.fetch(rewriteUrl);
    }
  }

  // --- 4. Telemetry Logging (Async) ---
  const duration = Date.now() - startTime;
  
  // Use ctx.waitUntil to not block response
  // Note: env.DB must be bound
  if (env.DB) {
      const payload = {
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          ip, 
          country,
          user_agent: userAgent,
          path: url.pathname,
          method: request.method,
          response_status: response.status,
          duration_ms: duration,
          bot_score: botScore,
          tenant_id: tenantId,
          user_id: userId,
          component_id: "api-gateway",
          action_type: "http_request",
          metadata: JSON.stringify({}) 
      };

      // Fire and forget logging
      // In high scale, use a Queue. For this scale, direct D1 insert is fine but wrapped in error handler
      try {
        await env.DB.prepare(`
          INSERT INTO telemetry_events 
          (id, timestamp, ip, country, user_agent, path, method, response_status, duration_ms, bot_score, tenant_id, user_id, component_id, action_type, metadata)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            payload.id, payload.timestamp, payload.ip, payload.country, payload.user_agent, 
            payload.path, payload.method, payload.response_status, payload.duration_ms, 
            payload.bot_score, payload.tenant_id, payload.user_id, payload.component_id, 
            payload.action_type, payload.metadata
        ).run();
      } catch (err) {
          console.error("Telemetry Logging Failed:", err);
      }
  }

  // Add Security Headers
  const newHeaders = new Headers(response.headers);
  newHeaders.set("X-Frame-Options", "DENY");
  newHeaders.set("X-Content-Type-Options", "nosniff");
  newHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");
  if (host === "cloudflip.mrtechsys.com") {
      newHeaders.set("Access-Control-Allow-Origin", "https://cloudflip.mrtechsys.com");
  }

  return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
  });
};

async function logTelemetry(db: D1Database, data: any) {
    if (!db) return;
    try {
        await db.prepare(`
          INSERT INTO telemetry_events 
          (id, timestamp, ip, country, user_agent, path, method, response_status, duration_ms, bot_score, tenant_id, user_id, component_id, action_type, metadata)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            uuidv4(), new Date().toISOString(), data.ip, data.country, data.userAgent, 
            data.path, data.method, data.status, data.duration, 
            data.botScore, data.tenantId, data.userId, "middleware-block", 
            data.action, JSON.stringify({})
        ).run();
    } catch (e) { console.error("Log Error", e); }
}
