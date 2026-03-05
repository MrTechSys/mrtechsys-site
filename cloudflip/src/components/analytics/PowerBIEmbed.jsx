import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, ExternalLink } from "lucide-react";

export default function PowerBIEmbed({ embedUrl, title = "Power BI Report", height = 800 }) {
  if (!embedUrl) {
    return (
      <Card className="bg-[#0a1929]/60 backdrop-blur border-yellow-500/30">
        <CardContent className="p-12 text-center">
          <TrendingUp className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/60 mb-2">No Power BI dashboard configured</p>
          <p className="text-white/40 text-sm">
            Configure your Power BI embed URL in Analytics Dashboards
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#0a1929]/60 backdrop-blur border-yellow-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-yellow-400" />
            {title}
          </CardTitle>
          <Button
            onClick={() => window.open(embedUrl, '_blank')}
            size="sm"
            variant="outline"
            className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Full Screen
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative w-full rounded-lg overflow-hidden border border-yellow-500/20">
          <iframe
            src={embedUrl}
            width="100%"
            height={height}
            frameBorder="0"
            allowFullScreen
            className="bg-white"
          />
        </div>
      </CardContent>
    </Card>
  );
}