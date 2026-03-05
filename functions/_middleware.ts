// functions/_middleware.ts
export const onRequest: PagesFunction = async ({ request, next, env }) => {
  const url = new URL(request.url);
  const host = request.headers.get("host");

  // Handle CloudFlip Subdomain
  if (host === "cloudflip.mrtechsys.com") {
    // 1. Pass through API calls
    if (url.pathname.startsWith("/api/")) {
      return next();
    }

    // 2. Rewrite root or SPA routes to /cloudflip/index.html
    // This allows cloudflip.mrtechsys.com/dashboard to work
    // We check if the path looks like a file (has an extension)
    const hasExtension = url.pathname.includes(".");
    if (!hasExtension || url.pathname === "/") {
      const rewriteUrl = new URL(request.url);
      rewriteUrl.pathname = `/cloudflip/index.html`;
      return env.ASSETS.fetch(rewriteUrl);
    }
  }

  // Default behavior for mrtechsys.com
  return next();
};
