// functions/cloudflipApiRouter.ts
import { db } from "./db";
import { requireAuth, Env } from "./_auth";

export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const secret = env.JWT_SECRET || "CHANGE_ME_IN_ENV";

    // Auth Middleware
    const auth = await requireAuth(request, secret);
    if (!auth) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    try {
      // Basic REST Router: /api/cloudflip/:entity/:id?
      const parts = path.split("/").filter(Boolean);
      
      // Handle /api/cloudflip prefix
      let entityIndex = 1;
      if (parts[1] === "cloudflip") {
        entityIndex = 2;
      }

      if (parts[0] !== "api") {
        return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
      }

      const entityName = parts[entityIndex];
      const id = parts[entityIndex + 1];

      const entity = (db as any)[entityName];
      if (!entity) {
        return new Response(JSON.stringify({ error: `Entity ${entityName} not found` }), { status: 404 });
      }

      // GET /api/cloudflip/:entity - List or Filter
      if (method === "GET") {
        if (id) {
          const item = await entity.get(id);
          return item 
            ? new Response(JSON.stringify(item), { status: 200 })
            : new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
        } else {
          // Check for query params for basic filtering
          const queryParams = Object.fromEntries(url.searchParams);
          const items = await entity.filter({ ...queryParams, org_id: auth.org_id });
          return new Response(JSON.stringify(items), { status: 200 });
        }
      }

      // POST /api/cloudflip/:entity - Create
      if (method === "POST" && !id) {
        const body = await request.json();
        const newItem = await entity.create({ ...body, org_id: auth.org_id });
        return new Response(JSON.stringify(newItem), { status: 201 });
      }

      // PUT /api/cloudflip/:entity/:id - Update
      if (method === "PUT" && id) {
        const body = await request.json();
        const updatedItem = await entity.update(id, body);
        return new Response(JSON.stringify(updatedItem), { status: 200 });
      }

      // DELETE /api/cloudflip/:entity/:id - Delete
      if (method === "DELETE" && id) {
        await entity.delete(id);
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      }

      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
    } catch (error: any) {
      console.error("CloudFlip API Error:", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  },
};
