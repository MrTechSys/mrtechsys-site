// services/auth-service/src/index.ts
import { SessionManager } from "./SessionManager";

export interface Env {
  SESSION_KV: KVNamespace;
  SESSION_MANAGER: DurableObjectNamespace;
  JWT_SECRET: string;
  SERVICE_TOKEN_SECRET: string; // Used for validating calls from Gateway
}

export { SessionManager };

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // --- SERVICE-TO-SERVICE AUTH (Gateway -> Auth) ---
    // Validate that the request is coming from our own Gateway or another internal service
    const serviceToken = request.headers.get("X-CloudFlip-Service-Token");
    if (!serviceToken || serviceToken !== env.SERVICE_TOKEN_SECRET) {
      // For now, in dev, we could log this and allow it, but in prod this is a must-have
      // return new Response(JSON.stringify({ error: "Unauthorized Service Call" }), { status: 403 });
      console.log("DEBUG: Service call without valid token, allowing for dev...");
    }

    // --- INTERNAL ROUTER ---
    
    // POST /auth/login
    if (path === "/api/auth/login" && method === "POST") {
      return handleLogin(request, env);
    }

    // POST /auth/logout
    if (path === "/api/auth/logout" && method === "POST") {
      return handleLogout(request, env);
    }

    // GET /auth/validate
    if (path === "/api/auth/validate" && method === "GET") {
      return handleValidate(request, env);
    }

    // Health Check
    if (path === "/api/auth/health") {
      return new Response(JSON.stringify({ status: "Auth Service Active", date: new Date().toISOString() }), { status: 200 });
    }

    return new Response(JSON.stringify({ 
      error: "Auth route not found", 
      path: path,
      method: method
    }), { status: 404 });
  }
};

// --- HANDLER STUBS (Starting Clean) ---

async function handleLogin(request: Request, env: Env): Promise<Response> {
  const body = await request.json() as any;
  const { username, password } = body;

  // TODO: Implement actual credentials check against D1 User Table (via another service?)
  console.log(`[AUTH] Login attempt for user: ${username}`);

  if (username === "admin" && password === "password123") {
    const sessionId = crypto.randomUUID();
    // 1. Store session in KV
    await env.SESSION_KV.put(`session:${sessionId}`, JSON.stringify({ 
      userId: "user_admin_1", 
      roles: ["platform_admin"],
      created_at: new Date().toISOString()
    }), { expirationTtl: 86400 }); // 24h

    return new Response(JSON.stringify({ 
      success: true, 
      session: sessionId,
      message: "AUTHENTICATION_SUCCESS"
    }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ error: "INVALID_CREDENTIALS" }), { status: 401 });
}

async function handleLogout(request: Request, env: Env): Promise<Response> {
  const sessionId = request.headers.get("X-CloudFlip-Session-ID");
  if (sessionId) {
    await env.SESSION_KV.delete(`session:${sessionId}`);
  }
  return new Response(JSON.stringify({ success: true, message: "SESSION_TERMINATED" }), { status: 200 });
}

async function handleValidate(request: Request, env: Env): Promise<Response> {
  const sessionId = request.headers.get("X-CloudFlip-Session-ID");
  if (!sessionId) {
    return new Response(JSON.stringify({ error: "MISSING_SESSION" }), { status: 401 });
  }

  const sessionData = await env.SESSION_KV.get(`session:${sessionId}`);
  if (!sessionData) {
    return new Response(JSON.stringify({ error: "SESSION_EXPIRED" }), { status: 401 });
  }

  return new Response(sessionData, { 
    status: 200, 
    headers: { "Content-Type": "application/json" }
  });
}
