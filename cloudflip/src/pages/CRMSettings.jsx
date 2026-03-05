import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Settings as SettingsIcon, Save, Loader2, Sparkles, Brain, Zap } from "lucide-react";
import { toast } from "sonner";

export default function CRMSettings() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    agents_enabled: false,
    emotion_ai_enabled: false,
    micro_moments_enabled: false,
    auto_escalate_threshold: -0.5,
    default_lead_score_threshold: 50,
    default_pipeline_stages: [],
    email_notifications: true,
    sms_notifications: false,
    webhook_url: "",
    custom_fields: []
  });

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
    };
    loadData();
  }, []);

  // Load organization settings
  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      if (!user?.current_org_id) return [];
      return api.entities.Organization.filter({ id: user.current_org_id });
    },
    enabled: !!user?.current_org_id
  });

  useEffect(() => {
    if (organizations.length > 0 && organizations[0].settings) {
      const orgSettings = organizations[0].settings;
      setSettings({
        agents_enabled: orgSettings.agents_enabled || false,
        emotion_ai_enabled: orgSettings.emotion_ai_enabled || false,
        micro_moments_enabled: orgSettings.micro_moments_enabled || false,
        auto_escalate_threshold: orgSettings.auto_escalate_threshold || -0.5,
        default_lead_score_threshold: orgSettings.default_lead_score_threshold || 50,
        default_pipeline_stages: orgSettings.default_pipeline_stages || [],
        email_notifications: orgSettings.email_notifications !== false,
        sms_notifications: orgSettings.sms_notifications || false,
        webhook_url: orgSettings.webhook_url || "",
        custom_fields: orgSettings.custom_fields || []
      });
    }
  }, [organizations]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (organizations.length > 0) {
        const org = organizations[0];
        return await api.entities.Organization.update(org.id, {
          settings: { ...org.settings, ...data }
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success("CRM settings saved successfully!");
    },
    onError: (error) => {
      toast.error("Failed to save settings");
      console.error("Save error:", error);
    }
  });

  const handleSave = () => {
    saveMutation.mutate(settings);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">CRM <span className="text-amber-400">Settings</span></h1>
          <p className="text-white/70 mt-1 text-sm md:text-base">Configure your <span className="text-amber-400">CRM preferences</span></p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saveMutation.isPending}
          className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
        >
          {saveMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              AI <span className="text-amber-400">Features</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between py-2">
              <div>
                <Label className="text-white">AI Agents</Label>
                <p className="text-sm text-white/50">Enable automated AI agents for lead qualification</p>
              </div>
              <Switch
                checked={settings.agents_enabled}
                onCheckedChange={(checked) => setSettings({...settings, agents_enabled: checked})}
                className="data-[state=checked]:bg-amber-500"
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <Label className="text-white">Emotion AI</Label>
                <p className="text-sm text-white/50">Analyze sentiment in customer interactions</p>
              </div>
              <Switch
                checked={settings.emotion_ai_enabled}
                onCheckedChange={(checked) => setSettings({...settings, emotion_ai_enabled: checked})}
                className="data-[state=checked]:bg-amber-500"
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <Label className="text-white">Micro-Moments</Label>
                <p className="text-sm text-white/50">Track high-intent customer behaviors</p>
              </div>
              <Switch
                checked={settings.micro_moments_enabled}
                onCheckedChange={(checked) => setSettings({...settings, micro_moments_enabled: checked})}
                className="data-[state=checked]:bg-amber-500"
              />
            </div>
            <div>
              <Label htmlFor="escalate_threshold" className="text-white">Auto-Escalate Threshold</Label>
              <p className="text-sm text-white/50 mb-2">Escalate tickets when sentiment drops below this value (-1 to 1)</p>
              <Input
                id="escalate_threshold"
                type="number"
                step="0.1"
                min="-1"
                max="1"
                value={settings.auto_escalate_threshold}
                onChange={(e) => setSettings({...settings, auto_escalate_threshold: parseFloat(e.target.value)})}
                className="bg-white/5 border-amber-500/30 text-white"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white">Lead <span className="text-amber-400">Scoring</span></CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="score_threshold" className="text-white">Minimum Score for Qualified Leads</Label>
              <p className="text-sm text-white/50 mb-2">Leads scoring above this will be marked as qualified (0-100)</p>
              <Input
                id="score_threshold"
                type="number"
                min="0"
                max="100"
                value={settings.default_lead_score_threshold}
                onChange={(e) => setSettings({...settings, default_lead_score_threshold: parseInt(e.target.value)})}
                className="bg-white/5 border-amber-500/30 text-white"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between py-2">
              <div>
                <Label className="text-white">Email Notifications</Label>
                <p className="text-sm text-white/50">Receive email alerts for new leads and activities</p>
              </div>
              <Switch
                checked={settings.email_notifications}
                onCheckedChange={(checked) => setSettings({...settings, email_notifications: checked})}
                className="data-[state=checked]:bg-amber-500"
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <Label className="text-white">SMS Notifications</Label>
                <p className="text-sm text-white/50">Receive SMS alerts for urgent activities</p>
              </div>
              <Switch
                checked={settings.sms_notifications}
                onCheckedChange={(checked) => setSettings({...settings, sms_notifications: checked})}
                className="data-[state=checked]:bg-amber-500"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Webhooks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="webhook_url" className="text-white">Webhook URL</Label>
              <p className="text-sm text-white/50 mb-2">Receive real-time CRM events at this endpoint</p>
              <Input
                id="webhook_url"
                type="url"
                placeholder="https://your-app.com/webhook"
                value={settings.webhook_url}
                onChange={(e) => setSettings({...settings, webhook_url: e.target.value})}
                className="bg-white/5 border-amber-500/30 text-white placeholder:text-white/40"
              />
              <p className="text-xs text-white/40 mt-2">
                Events: contact.created, deal.updated, ticket.escalated
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}