import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  BarChart3,
  TrendingUp,
  Database,
  Settings,
  Save,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import AdvancedAnalyticsEmbed from "../components/analytics/AdvancedAnalyticsEmbed";
import { motion } from "framer-motion";

export default function AdvancedAnalytics() {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [embedUrls, setEmbedUrls] = useState({
    tableau: "",
    powerbi: "",
    datastudio: ""
  });
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
      
      if (currentUser.current_org_id) {
        const orgs = await api.entities.Organization.filter({ id: currentUser.current_org_id });
        if (orgs.length > 0) {
          const org = orgs[0];
          setOrganization(org);
          
          // Load configured embed URLs from organization settings
          if (org.settings?.analytics_integrations) {
            setEmbedUrls({
              tableau: org.settings.analytics_integrations.tableau_url || "",
              powerbi: org.settings.analytics_integrations.powerbi_url || "",
              datastudio: org.settings.analytics_integrations.datastudio_url || ""
            });
          }
        }
      }
    };
    loadData();
  }, []);

  const handleSaveUrls = async () => {
    try {
      await api.entities.Organization.update(organization.id, {
        settings: {
          ...organization.settings,
          analytics_integrations: {
            tableau_url: embedUrls.tableau,
            powerbi_url: embedUrls.powerbi,
            datastudio_url: embedUrls.datastudio
          }
        }
      });
      toast.success("Analytics integrations saved!");
      setEditMode(false);
    } catch (error) {
      toast.error("Failed to save settings");
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-cyan-400" />
            Advanced <span className="text-cyan-400">Analytics</span>
          </h1>
          <p className="text-white/70 mt-1">Enterprise-grade analytics powered by best-in-class platforms</p>
        </div>
        <Button
          onClick={() => setEditMode(!editMode)}
          variant="outline"
          className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
        >
          <Settings className="w-4 h-4 mr-2" />
          {editMode ? 'Cancel' : 'Configure'}
        </Button>
      </div>

      {/* Configuration Panel */}
      {editMode && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-400" />
                Configure Analytics Integrations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white">Tableau Embed URL</Label>
                <Input
                  value={embedUrls.tableau}
                  onChange={(e) => setEmbedUrls({ ...embedUrls, tableau: e.target.value })}
                  placeholder="https://public.tableau.com/views/..."
                  className="bg-white/5 border-amber-500/30 text-white mt-1"
                />
                <p className="text-white/50 text-xs mt-1">
                  Get embed URL from Tableau: Share → Embed Code → Copy URL
                </p>
              </div>

              <div>
                <Label className="text-white">Power BI Embed URL</Label>
                <Input
                  value={embedUrls.powerbi}
                  onChange={(e) => setEmbedUrls({ ...embedUrls, powerbi: e.target.value })}
                  placeholder="https://app.powerbi.com/view?r=..."
                  className="bg-white/5 border-amber-500/30 text-white mt-1"
                />
                <p className="text-white/50 text-xs mt-1">
                  Get embed URL from Power BI: File → Publish to web → Copy embed URL
                </p>
              </div>

              <div>
                <Label className="text-white">Google Data Studio URL</Label>
                <Input
                  value={embedUrls.datastudio}
                  onChange={(e) => setEmbedUrls({ ...embedUrls, datastudio: e.target.value })}
                  placeholder="https://datastudio.google.com/embed/reporting/..."
                  className="bg-white/5 border-amber-500/30 text-white mt-1"
                />
                <p className="text-white/50 text-xs mt-1">
                  Get embed URL from Data Studio: Share → Embed → Copy embed URL
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  onClick={() => setEditMode(false)}
                  variant="outline"
                  className="border-amber-500/30 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveUrls}
                  className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Analytics Dashboards */}
      <Tabs defaultValue="tableau" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-amber-500/20">
          <TabsTrigger value="tableau">
            <BarChart3 className="w-4 h-4 mr-2" />
            Tableau
          </TabsTrigger>
          <TabsTrigger value="powerbi">
            <TrendingUp className="w-4 h-4 mr-2" />
            Power BI
          </TabsTrigger>
          <TabsTrigger value="datastudio">
            <Database className="w-4 h-4 mr-2" />
            Data Studio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tableau" className="mt-6">
          <AdvancedAnalyticsEmbed
            platform="tableau"
            embedUrl={embedUrls.tableau}
            title="Tableau Analytics"
            height="700px"
          />
        </TabsContent>

        <TabsContent value="powerbi" className="mt-6">
          <AdvancedAnalyticsEmbed
            platform="powerbi"
            embedUrl={embedUrls.powerbi}
            title="Power BI Reports"
            height="700px"
          />
        </TabsContent>

        <TabsContent value="datastudio" className="mt-6">
          <AdvancedAnalyticsEmbed
            platform="datastudio"
            embedUrl={embedUrls.datastudio}
            title="Google Data Studio"
            height="700px"
          />
        </TabsContent>
      </Tabs>

      {/* Integration Guide */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-blue-400" />
            Integration Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                Tableau
              </h4>
              <p className="text-white/70 text-sm mb-3">
                Connect your Tableau dashboards for interactive visualizations
              </p>
              <ol className="text-white/60 text-xs space-y-1">
                <li>1. Publish dashboard to Tableau Public/Server</li>
                <li>2. Click Share → Embed</li>
                <li>3. Copy the embed URL</li>
                <li>4. Paste in configuration above</li>
              </ol>
            </div>

            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                Power BI
              </h4>
              <p className="text-white/70 text-sm mb-3">
                Embed Power BI reports and dashboards
              </p>
              <ol className="text-white/60 text-xs space-y-1">
                <li>1. Open report in Power BI Service</li>
                <li>2. File → Publish to web</li>
                <li>3. Copy embed URL</li>
                <li>4. Paste in configuration above</li>
              </ol>
            </div>

            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                <Database className="w-4 h-4 text-green-400" />
                Data Studio
              </h4>
              <p className="text-white/70 text-sm mb-3">
                Connect Google Data Studio reports
              </p>
              <ol className="text-white/60 text-xs space-y-1">
                <li>1. Open report in Data Studio</li>
                <li>2. Share → Get report link</li>
                <li>3. Enable embed option</li>
                <li>4. Copy embed URL</li>
              </ol>
            </div>
          </div>

          <div className="mt-4 p-3 bg-amber-500/10 rounded border border-amber-500/30">
            <p className="text-amber-400 text-sm">
              💡 <strong>Pro Tip:</strong> Use CloudFlip's built-in analytics engine to export data to these platforms via API or CSV exports from any module.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}