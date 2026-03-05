import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  Settings,
  Download
} from "lucide-react";
import { toast } from "sonner";

/**
 * Advanced Analytics Embed Component
 * Supports Tableau, Power BI, and Google Data Studio embeddings
 * Note: Requires platform-specific embed URLs or API keys to be configured
 */
export default function AdvancedAnalyticsEmbed({ 
  platform = "tableau", // "tableau" | "powerbi" | "datastudio"
  embedUrl,
  title = "Advanced Analytics",
  height = "600px",
  allowFullscreen = true
}) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast.success("Dashboard refreshed");
  };

  const platformConfig = {
    tableau: {
      icon: BarChart3,
      color: "text-blue-400",
      name: "Tableau",
      sandbox: "allow-same-origin allow-scripts allow-popups allow-forms"
    },
    powerbi: {
      icon: TrendingUp,
      color: "text-amber-400",
      name: "Power BI",
      sandbox: "allow-same-origin allow-scripts allow-popups allow-forms"
    },
    datastudio: {
      icon: BarChart3,
      color: "text-green-400",
      name: "Google Data Studio",
      sandbox: "allow-same-origin allow-scripts allow-popups allow-forms"
    }
  };

  const config = platformConfig[platform];
  const Icon = config.icon;

  // Fallback if no embed URL provided
  if (!embedUrl) {
    return (
      <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Icon className={`w-5 h-5 ${config.color}`} />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Icon className={`w-16 h-16 ${config.color} mx-auto mb-4 opacity-50`} />
            <p className="text-white/70 mb-4">
              {config.name} integration not configured yet
            </p>
            <p className="text-white/50 text-sm mb-6">
              Connect your {config.name} workspace to embed interactive dashboards
            </p>
            <Button
              onClick={() => toast.info(`Configure ${config.name} in Settings > Integrations`)}
              className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
            >
              <Settings className="w-4 h-4 mr-2" />
              Configure Integration
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Icon className={`w-5 h-5 ${config.color}`} />
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={`${config.color} bg-white/10`}>
              {config.name}
            </Badge>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            {allowFullscreen && (
              <a href={embedUrl} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </a>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div 
          className="relative w-full bg-white/5 rounded-lg overflow-hidden"
          style={{ height }}
        >
          <iframe
            key={refreshKey}
            src={embedUrl}
            className="w-full h-full border-0"
            sandbox={config.sandbox}
            allowFullScreen={allowFullscreen}
            title={`${config.name} Dashboard`}
          />
        </div>
      </CardContent>
    </Card>
  );
}