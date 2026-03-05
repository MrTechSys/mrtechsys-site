// functions/cloudflipAuth.ts
import bcrypt from "bcryptjs"; // Pure JS implementation
import { db } from "./db";

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60; // 15 minutes
const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

// ---- JWT Helpers (Cloudflare Web Crypto) ----
// Note: In a real app, use 'jose' for robust JWT handling.
// This is a simplified version using Web Crypto.

async function signJWT(payload: any, secret: string) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  const dataToSign = encoder.encode(`${encodedHeader}.${encodedPayload}`);
  const signature = await crypto.subtle.sign("HMAC", key, dataToSign);
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

async function verifyJWT(token: string, secret: string) {
  try {
    const [headerB64, payloadB64, signatureB64] = token.split(".");
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const dataToVerify = encoder.encode(`${headerB64}.${payloadB64}`);
    const signature = new Uint8Array(
      atob(signatureB64.replace(/-/g, "+").replace(/_/g, "/"))
        .split("")
        .map((c) => c.charCodeAt(0))
    );

    const isValid = await crypto.subtle.verify("HMAC", key, signature, dataToVerify);
    if (!isValid) return null;

    return JSON.parse(atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

// ---- Auth Helpers ----

async function signAccessToken(user: any, secret: string) {
  const now = Math.floor(Date.now() / 1000);
  return signJWT(
    {
      sub: user.id,
      org_id: user.org_id,
      role: user.role,
      iat: now,
      exp: now + ACCESS_TOKEN_TTL_SECONDS,
    },
    secret
  );
}

async function signRefreshToken(user: any, tokenId: string, secret: string) {
  const now = Math.floor(Date.now() / 1000);
  return signJWT(
    {
      sub: user.id,
      org_id: user.org_id,
      jti: tokenId,
      type: "refresh",
      iat: now,
      exp: now + REFRESH_TOKEN_TTL_SECONDS,
    },
    secret
  );
}

function setCookieHeaders(accessToken: string, refreshToken: string) {
  const headers = new Headers();
  headers.append("Set-Cookie", `cf_access_token=${accessToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${ACCESS_TOKEN_TTL_SECONDS}`);
  headers.append("Set-Cookie", `cf_refresh_token=${refreshToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${REFRESH_TOKEN_TTL_SECONDS}`);
  headers.set("Content-Type", "application/json");
  return headers;
}

function clearAuthCookies() {
  const headers = new Headers();
  headers.append("Set-Cookie", "cf_access_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0");
  headers.append("Set-Cookie", "cf_refresh_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0");
  headers.set("Content-Type", "application/json");
  return headers;
}

function getCookie(req: Request, name: string): string | null {
  const cookie = req.headers.get("Cookie");
  if (!cookie) return null;
  const parts = cookie.split(";").map((c) => c.trim());
  for (const part of parts) {
    if (part.startsWith(name + "=")) {
      return part.substring(name.length + 1);
    }
  }
  return null;
}

// ---- Cloudflare Worker Export ----

export interface Env {
  JWT_SECRET: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const secret = env.JWT_SECRET || "CHANGE_ME_IN_ENV";

    try {
      let body: any = {};
      if (method === "POST" || method === "PUT") {
        body = await request.json().catch(() => ({}));
      }

      // Support both /auth/... and /api/cloudflip/auth/...
      const isApiPrefix = path.startsWith("/api/cloudflip");
      const normalizedPath = isApiPrefix ? path.replace("/api/cloudflip", "") : path;

      if (normalizedPath === "/auth/register" && method === "POST") {
        return await handleRegister(body);
      }
      if (normalizedPath === "/auth/login" && method === "POST") {
        return await handleLogin(body, secret);
      }
      if (normalizedPath === "/auth/refresh" && method === "POST") {
        return await handleRefresh(request, secret);
      }
      if (normalizedPath === "/auth/logout" && method === "POST") {
        return await handleLogout(request, secret);
      }

      return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
    } catch (error: any) {
      console.error("CloudFlip Auth Error:", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  },
};

// ---- Handlers ----

async function handleRegister(body: any): Promise<Response> {
  const { email, password, org_id, role } = body;

  if (!email || !password || !org_id) {
    return new Response(JSON.stringify({ error: "email, password, and org_id are required" }), { status: 400 });
  }

  const existing = await db.users.filter({ email });
  if (existing.length > 0) {
    return new Response(JSON.stringify({ error: "Email already registered" }), { status: 400 });
  }

  const password_hash = await bcrypt.hash(password, 10);

  const user = await db.users.create({
    email,
    password_hash,
    org_id,
    role: role ?? "member",
  });

  return new Response(JSON.stringify({
    success: true,
    user: { id: user.id, email: user.email, org_id: user.org_id, role: user.role }
  }), { status: 201 });
}

async function handleLogin(body: any, secret: string): Promise<Response> {
  const { email, password } = body;

  if (!email || !password) {
    return new Response(JSON.stringify({ error: "email and password are required" }), { status: 400 });
  }

  const users = await db.users.filter({ email });
  const user = users[0];
  if (!user) {
    return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });
  }

  const accessToken = await signAccessToken(user, secret);
  const refreshTokenId = crypto.randomUUID();
  const refreshToken = await signRefreshToken(user, refreshTokenId, secret);

  await db.refreshSessions.create({
    user_id: user.id,
    org_id: user.org_id,
    token_id: refreshTokenId,
    expires_at: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000).toISOString(),
    revoked: false,
  });

  const headers = setCookieHeaders(accessToken, refreshToken);

  return new Response(
    JSON.stringify({
      success: true,
      user: { id: user.id, email: user.email, org_id: user.org_id, role: user.role },
    }),
    { status: 200, headers }
  );
}

async function handleRefresh(req: Request, secret: string): Promise<Response> {
  const refreshToken = getCookie(req, "cf_refresh_token");
  if (!refreshToken) {
    return new Response(JSON.stringify({ error: "No refresh token" }), { status: 401 });
  }

  const decoded = await verifyJWT(refreshToken, secret);
  if (!decoded || decoded.type !== "refresh") {
    return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401 });
  }

  const sessions = await db.refreshSessions.filter({ token_id: decoded.jti });
  const session = sessions[0];
  if (!session || session.revoked) {
    return new Response(JSON.stringify({ error: "Refresh session invalid" }), { status: 401 });
  }

  if (new Date(session.expires_at).getTime() < Date.now()) {
    return new Response(JSON.stringify({ error: "Refresh session expired" }), { status: 401 });
  }

  const newAccessToken = await signAccessToken({ id: decoded.sub, org_id: decoded.org_id, role: decoded.role }, secret);
  const headers = setCookieHeaders(newAccessToken, refreshToken);

  return new Response(JSON.stringify({ success: true }), { status: 200, headers });
}

async function handleLogout(req: Request, secret: string): Promise<Response> {
  const refreshToken = getCookie(req, "cf_refresh_token");
  if (refreshToken) {
    const decoded = await verifyJWT(refreshToken, secret);
    if (decoded) {
      const sessions = await db.refreshSessions.filter({ token_id: decoded.jti });
      if (sessions[0]) {
        await db.refreshSessions.update(sessions[0].id, { revoked: true });
      }
    }
  }

  return new Response(JSON.stringify({ success: true }), { status: 200, headers: clearAuthCookies() });
}

// Middleware helper
export async function requireAuth(req: Request, secret: string) {
  const token = getCookie(req, "cf_access_token") || req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return null;

  const decoded = await verifyJWT(token, secret);
  if (!decoded) return null;

  return { user_id: decoded.sub, org_id: decoded.org_id, role: decoded.role };
}
