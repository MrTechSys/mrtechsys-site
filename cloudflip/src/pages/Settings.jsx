import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Settings as SettingsIcon,
  Save,
  Loader2,
  Zap,
  Clock,
  Activity,
  Database
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getIntervalDescription, POLLING_INTERVALS } from "../components/utils/pollingConfig";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
      
      try {
        const subs = await api.entities.BillingSubscription.list();
        setSubscription(subs.length > 0 ? subs[0] : { plan: 'free' });
      } catch (error) {
        setSubscription({ plan: 'free' });
      }
    };
    loadUser();
  }, []);

  const { data: adminSettings = [] } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const settings = await api.entities.AdminSettings.list();
      return settings.filter(s => s.org_id === user.current_org_id);
    },
    enabled: !!user
  });

  const currentSettings = adminSettings[0] || {};
  const plan = subscription?.plan || 'free';

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates) => {
      if (currentSettings.id) {
        return await api.entities.AdminSettings.update(currentSettings.id, updates);
      } else {
        return await api.entities.AdminSettings.create({
          org_id: user.current_org_id,
          ...updates
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      toast.success("Settings updated successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to update settings: ${error.message}`);
    }
  });

  const handleToggleTelemetry = (enabled) => {
    updateSettingsMutation.mutate({
      telemetry_enabled: enabled,
      last_toggled_by: user.email,
      last_toggled_at: new Date().toISOString()
    });
  };

  const handleUpdatePolling = (category, value) => {
    const currentPolling = currentSettings.polling_frequency || {};
    updateSettingsMutation.mutate({
      polling_frequency: {
        ...currentPolling,
        [category]: value
      }
    });
  };

  const handleToggleBatching = (enabled) => {
    const currentThrottling = currentSettings.api_throttling || {};
    updateSettingsMutation.mutate({
      api_throttling: {
        ...currentThrottling,
        batch_telemetry: enabled
      }
    });
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-amber-400" />
          Organization <span className="text-amber-400">Settings</span>
        </h1>
        <p className="text-white/70 mt-2">Configure telemetry, polling, and API usage controls</p>
      </div>

      {/* Telemetry Controls */}
      <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-400" />
            Telemetry & Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex-1">
              <Label className="text-white font-medium">Enable Telemetry Tracking</Label>
              <p className="text-white/60 text-sm mt-1">
                Collect user activity and performance metrics
              </p>
            </div>
            <Switch
              checked={currentSettings.telemetry_enabled !== false}
              onCheckedChange={handleToggleTelemetry}
              disabled={updateSettingsMutation.isPending}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex-1">
              <Label className="text-white font-medium">Batch Telemetry (30-min intervals)</Label>
              <p className="text-white/60 text-sm mt-1">
                Reduces API calls by 95% - recommended for all plans
              </p>
            </div>
            <Switch
              checked={currentSettings.api_throttling?.batch_telemetry !== false}
              onCheckedChange={handleToggleBatching}
              disabled={updateSettingsMutation.isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Polling Frequency Controls */}
      <Card className="bg-[#0a1929]/60 backdrop-blur border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            Polling Frequency Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-blue-400 text-sm">
              Current Plan: <span className="font-bold">{plan.toUpperCase()}</span>
            </p>
            <p className="text-white/60 text-xs mt-1">
              Default intervals: Real-time ({getIntervalDescription(POLLING_INTERVALS.realtime[plan] || false)}), 
              Operational ({getIntervalDescription(POLLING_INTERVALS.operational[plan])}), 
              Aggregates ({getIntervalDescription(POLLING_INTERVALS.aggregates[plan])})
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label className="text-white">Real-time Metrics</Label>
              <Select
                value={String(currentSettings.polling_frequency?.realtime_minutes || 'default')}
                onValueChange={(v) => handleUpdatePolling('realtime_minutes', v === 'default' ? null : Number(v))}
              >
                <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Plan Default</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white">Operational Metrics</Label>
              <Select
                value={String(currentSettings.polling_frequency?.operational_minutes || 'default')}
                onValueChange={(v) => handleUpdatePolling('operational_minutes', v === 'default' ? null : Number(v))}
              >
                <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Plan Default</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white">Dashboard Aggregates</Label>
              <Select
                value={String(currentSettings.polling_frequency?.aggregates_hours || 'default')}
                onValueChange={(v) => handleUpdatePolling('aggregates_hours', v === 'default' ? null : Number(v))}
              >
                <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Plan Default</SelectItem>
                  <SelectItem value="1">1 hour</SelectItem>
                  <SelectItem value="6">6 hours</SelectItem>
                  <SelectItem value="24">24 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Usage Summary */}
      <Card className="bg-[#0a1929]/60 backdrop-blur border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-400" />
            API Usage Optimization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-white/70">Batch telemetry (30-min):</span>
              <span className="text-green-400 font-semibold">~95% reduction</span>
            </div>
            <div className="flex justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-white/70">Tiered polling rates:</span>
              <span className="text-blue-400 font-semibold">~60-80% reduction</span>
            </div>
            <div className="flex justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-white/70">Aggregate caching:</span>
              <span className="text-purple-400 font-semibold">~70% reduction</span>
            </div>
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-green-400 font-semibold">
                💰 Combined savings: ~99% fewer API calls vs real-time for all features
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}