// services/gateway/src/index.ts

export interface Env {
  AUTH_SERVICE: Fetcher;
  AI_SERVICE: Fetcher;
  AUTOMATION_SERVICE: Fetcher;
  SERVICE_TOKEN_SECRET: string; // Used to authenticate Gateway -> Service calls
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // --- GLOBAL GATEWAY MIDDLEWARE ---
    
    // (Middleware like Auth/Tenant goes here...)

    // --- ROUTING LOGIC (Microservice Dispatch) ---

    // --> Auth Service (/api/auth/*)
    if (path.startsWith("/api/auth")) {
      return forwardToService(request, env.AUTH_SERVICE, env.SERVICE_TOKEN_SECRET);
    }

    // --> AI Service (/api/ai/*)
    if (path.startsWith("/api/ai")) {
      return forwardToService(request, env.AI_SERVICE, env.SERVICE_TOKEN_SECRET);
    }

    // --> Automation Service (/api/automation/*)
    if (path.startsWith("/api/automation")) {
      return forwardToService(request, env.AUTOMATION_SERVICE, env.SERVICE_TOKEN_SECRET);
    }

    // --- FALLBACK ---
    return new Response(JSON.stringify({ 
      error: "SERVICE_NOT_FOUND", 
      path: path,
      message: "The requested route is not registered with the CloudFlip Gateway."
    }), { 
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }
};

/**
 * Securely forwards a request to an internal service binding.
 * Clones the request and injects the internal Service Token.
 */
async function forwardToService(request: Request, service: Fetcher, secret: string): Promise<Response> {
  // Clone request to allow modification (headers are immutable on original)
  const newRequest = new Request(request);
  
  // Inject Service Token for internal auth
  newRequest.headers.set("X-CloudFlip-Service-Token", secret);
  
  // (Optional) Inject Gateway Context (Tenant ID, User ID from JWT, Request ID)
  // newRequest.headers.set("X-CloudFlip-Gateway-Context", JSON.stringify({ ... }));

  try {
    return await service.fetch(newRequest);
  } catch (err: any) {
    console.error(`Gateway Forwarding Error: ${err.message}`);
    return new Response(JSON.stringify({ 
      error: "INTERNAL_SERVICE_ERROR", 
      message: "Failed to communicate with the internal service." 
    }), { status: 502 });
  }
}
