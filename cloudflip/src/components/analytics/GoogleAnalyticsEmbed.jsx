import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, ExternalLink, Sparkles, BarChart3 } from "lucide-react";

export default function GoogleAnalyticsEmbed({ propertyId, embedUrl }) {
  useEffect(() => {
    if (propertyId && !window.gtag) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${propertyId}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      function gtag(){window.dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', propertyId);
    }
  }, [propertyId]);

  if (!propertyId && !embedUrl) {
    return (
      <Card className="bg-[#0a1929]/60 backdrop-blur border-green-500/30">
        <CardContent className="p-12 text-center">
          <Globe className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/60 mb-2">No Google Analytics configured</p>
          <p className="text-white/40 text-sm">
            Configure your GA property ID in Analytics Dashboards
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#0a1929]/60 backdrop-blur border-green-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-green-400" />
            Google Analytics
          </CardTitle>
          <Button
            onClick={() => window.open('https://analytics.google.com/', '_blank')}
            size="sm"
            variant="outline"
            className="border-green-500/30 text-green-400 hover:bg-green-500/10"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Open GA
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {propertyId && (
          <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-green-400 mt-0.5" />
              <div>
                <p className="text-green-400 font-medium mb-1">Tracking Active</p>
                <p className="text-white/70 text-sm">
                  Property ID: <code className="bg-white/10 px-2 py-1 rounded text-xs">{propertyId}</code>
                </p>
                <p className="text-white/60 text-sm mt-2">
                  Analytics data is being collected for your application
                </p>
              </div>
            </div>
          </div>
        )}

        {embedUrl ? (
          <div className="relative w-full rounded-lg overflow-hidden border border-green-500/20">
            <iframe
              src={embedUrl}
              width="100%"
              height="800"
              frameBorder="0"
              className="bg-white"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-6 bg-white/5 rounded-lg border border-white/10 text-center">
              <BarChart3 className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-white/80 mb-2">View Analytics Reports</p>
              <p className="text-white/50 text-sm mb-4">
                For embedded reports, use Google Data Studio or Looker Studio
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => window.open('https://analytics.google.com/', '_blank')}
                  variant="outline"
                  className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Google Analytics
                </Button>
                <Button
                  onClick={() => window.open('https://lookerstudio.google.com/', '_blank')}
                  variant="outline"
                  className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Looker Studio
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}