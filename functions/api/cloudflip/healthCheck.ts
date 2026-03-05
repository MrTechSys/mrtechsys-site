// functions/healthCheck.ts

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    return new Response(JSON.stringify({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      platform: "cloudflare-workers"
    }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
}
