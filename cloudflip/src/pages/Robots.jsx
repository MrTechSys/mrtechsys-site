import React from "react";

export default function Robots() {
  React.useEffect(() => {
    const robotsTxt = `User-agent: *
Allow: /
Sitemap: https://cloudflip.mrtechsys.com/sitemap.xml

# Crawl-delay for polite bots
Crawl-delay: 1

# Block admin and internal pages
Disallow: /Dashboard
Disallow: /Settings
Disallow: /Profile
Disallow: /Billing
Disallow: /MFASettings

# Allow marketing and public pages
Allow: /DataPrivacy
Allow: /TermsOfService
Allow: /ContactUs
Allow: /Sitemap`;

    const blob = new Blob([robotsTxt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'robots.txt';
    
    return () => URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-4">robots.txt</h1>
      <pre className="bg-black/60 border border-amber-500/20 rounded-lg p-6 text-green-400 text-sm">
{`User-agent: *
Allow: /
Sitemap: https://cloudflip.mrtechsys.com/sitemap.xml

# Crawl-delay for polite bots
Crawl-delay: 1

# Block admin and internal pages
Disallow: /Dashboard
Disallow: /Settings
Disallow: /Profile
Disallow: /Billing

# Allow marketing and public pages
Allow: /DataPrivacy
Allow: /TermsOfService
Allow: /ContactUs`}
      </pre>
    </div>
  );
}