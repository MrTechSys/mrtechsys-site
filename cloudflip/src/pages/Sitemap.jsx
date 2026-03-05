import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Map, ExternalLink } from "lucide-react";

const publicPages = [
  { url: "/", title: "Home", priority: "1.0", changefreq: "daily" },
  { url: "/DataPrivacy", title: "Data Privacy", priority: "0.8", changefreq: "monthly" },
  { url: "/TermsOfService", title: "Terms of Service", priority: "0.8", changefreq: "monthly" },
  { url: "/ContactUs", title: "Contact Us", priority: "0.9", changefreq: "weekly" },
  { url: "/Billing", title: "Pricing", priority: "0.9", changefreq: "weekly" },
];

export default function Sitemap() {
  const baseUrl = "https://cloudflip.mrtechsys.com";

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${publicPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Map className="w-8 h-8 text-green-400" />
          Sitemap
        </h1>
        <p className="text-white/60">Public pages indexed for search engines</p>
      </div>

      <Card className="bg-[#0a1929]/60 backdrop-blur border-green-500/30">
        <CardHeader>
          <CardTitle className="text-white">XML Sitemap</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-black/60 border border-green-500/20 rounded-lg p-6 text-green-400 text-xs overflow-x-auto">
            {sitemapXml}
          </pre>
        </CardContent>
      </Card>

      <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/30">
        <CardHeader>
          <CardTitle className="text-white">Public Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {publicPages.map((page) => (
              <Link key={page.url} to={page.url}>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:border-amber-500/40 transition-all">
                  <div>
                    <p className="text-white font-medium">{page.title}</p>
                    <p className="text-white/40 text-xs">{baseUrl}{page.url}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-green-500/20 text-green-400 text-xs">
                      Priority: {page.priority}
                    </Badge>
                    <ExternalLink className="w-4 h-4 text-amber-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}