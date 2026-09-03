// services/ai-service/src/index.ts

export interface Env {
  AI: any;
  AI_KV: KVNamespace;
  VECTOR_INDEX: any; // Vectorize
  SERVICE_TOKEN_SECRET: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // 1. SERVICE-TO-SERVICE AUTH (Gateway -> AI)
    const serviceToken = request.headers.get("X-CloudFlip-Service-Token");
    if (!serviceToken || serviceToken !== env.SERVICE_TOKEN_SECRET) {
      console.log("DEBUG: AI Service call without valid token, allowing for dev...");
    }

    // --- INTERNAL AI ROUTES ---

    // POST /api/ai/chat
    if (path === "/api/ai/chat" && method === "POST") {
      return handleAIChat(request, env);
    }

    // POST /api/ai/embeddings
    if (path === "/api/ai/embeddings" && method === "POST") {
      return handleEmbeddings(request, env);
    }

    // POST /api/ai/summarize
    if (path === "/api/ai/summarize" && method === "POST") {
      return handleSummarization(request, env);
    }

    // Health Check
    if (path === "/api/ai/health") {
      return new Response(JSON.stringify({ 
        status: "AI Service Active", 
        models: ["llama-3", "mistral-7b", "bge-small-en-v1.5"] 
      }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: "AI_ROUTE_NOT_FOUND", path }), { status: 404 });
  }
};

// --- HANDLERS (Edge Native AI) ---

async function handleAIChat(request: Request, env: Env): Promise<Response> {
  const body = await request.json() as any;
  const { messages, model = "@cf/meta/llama-3-8b-instruct", stream = false } = body;

  if (!messages) {
    return new Response(JSON.stringify({ error: "MISSING_MESSAGES" }), { status: 400 });
  }

  try {
    const response = await env.AI.run(model, {
      messages,
      stream
    });

    if (stream) {
      return new Response(response, { headers: { "Content-Type": "text/event-stream" } });
    }

    return new Response(JSON.stringify(response), { 
      headers: { "Content-Type": "application/json" } 
    });
  } catch (err: any) {
    console.error(`AI Chat Error: ${err.message}`);
    return new Response(JSON.stringify({ error: "AI_INFERENCE_FAILED", details: err.message }), { status: 500 });
  }
}

async function handleEmbeddings(request: Request, env: Env): Promise<Response> {
  const body = await request.json() as any;
  const { text, model = "@cf/baai/bge-small-en-v1.5" } = body;

  if (!text) return new Response(JSON.stringify({ error: "MISSING_TEXT" }), { status: 400 });

  try {
    const response = await env.AI.run(model, { text });
    return new Response(JSON.stringify(response), { headers: { "Content-Type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "EMBEDDING_FAILED", details: err.message }), { status: 500 });
  }
}

async function handleSummarization(request: Request, env: Env): Promise<Response> {
  const body = await request.json() as any;
  const { text, model = "@cf/facebook/bart-large-cnn" } = body;

  if (!text) return new Response(JSON.stringify({ error: "MISSING_TEXT" }), { status: 400 });

  // Optional: Check cache (AI_KV) for this hash before running inference
  
  try {
    const response = await env.AI.run(model, { input_text: text });
    return new Response(JSON.stringify(response), { headers: { "Content-Type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "SUMMARIZATION_FAILED", details: err.message }), { status: 500 });
  }
}
