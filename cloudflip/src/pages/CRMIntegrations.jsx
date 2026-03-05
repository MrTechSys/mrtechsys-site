
import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Link as LinkIcon,
  Settings,
  Download,
  Upload,
  Zap
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import InteractiveTutorial from "../components/InteractiveTutorial";

const crmPlatforms = {
  salesforce: {
    name: "Salesforce",
    color: "from-blue-600 to-cyan-600",
    description: "Sync contacts, leads, and opportunities with Salesforce CRM",
    features: ["Contacts", "Leads", "Opportunities", "Accounts"]
  },
  hubspot: {
    name: "HubSpot",
    color: "from-orange-600 to-red-600",
    description: "Connect with HubSpot to sync contacts, deals, and companies",
    features: ["Contacts", "Deals", "Companies", "Tickets"]
  }
};

export default function CRMIntegrations() {
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [syncOptions, setSyncOptions] = useState({
    contacts: true,
    deals: true,
    leads: false
  });
  const queryClient = useQueryClient();

  const { data: accounts = [] } = useQuery({
    queryKey: ['crm-accounts'],
    queryFn: () => api.entities.ConnectedAccount.filter({
      platform: { $in: ['salesforce', 'hubspot'] }
    })
  });

  const { data: syncRecords = [] } = useQuery({
    queryKey: ['crm-syncs'],
    queryFn: () => api.entities.CRMSync.list('-last_synced_at', 50)
  });

  const connectMutation = useMutation({
    mutationFn: async (platform) => {
      const functionMap = {
        salesforce: 'oauthSalesforce',
        hubspot: 'oauthHubspot'
      };
      
      const { data } = await api.functions.invoke(functionMap[platform], { action: 'start' });
      window.location.href = data.authUrl;
    }
  });

  const syncMutation = useMutation({
    mutationFn: async ({ accountId, options }) => {
      const entityTypes = Object.keys(options).filter(key => options[key]);
      return api.functions.invoke('syncCRMData', {
        accountId,
        direction: 'import',
        entityTypes
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['crm-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['crm-syncs'] });
      queryClient.invalidateQueries({ queryKey: ['crm-contacts'] });
      queryClient.invalidateQueries({ queryKey: ['crm-deals'] });
      setShowSyncModal(false);
      toast.success(`Synced: ${data.data.results.imported} new, ${data.data.results.updated} updated`);
    },
    onError: () => {
      toast.error("Sync failed");
    }
  });

  const toggleSyncMutation = useMutation({
    mutationFn: ({ id, enabled }) => 
      api.entities.ConnectedAccount.update(id, { sync_enabled: enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-accounts'] });
      toast.success("Sync settings updated");
    }
  });

  const handleConnect = (platform) => {
    setSelectedPlatform(platform);
    setShowConnectModal(true);
  };

  const handleStartSync = (account) => {
    setSelectedAccount(account);
    setShowSyncModal(true);
  };

  const handleSync = () => {
    if (!selectedAccount) return;
    syncMutation.mutate({
      accountId: selectedAccount.id,
      options: syncOptions
    });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-full overflow-x-hidden">
      <InteractiveTutorial page="crm" />

      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">CRM <span className="text-amber-400">Integrations</span></h1>
        <p className="text-white/70 mt-1 text-sm md:text-base">Connect and sync with your <span className="text-amber-400">CRM platforms</span></p>
      </div>

      {/* Available Platforms */}
      <div className="grid md:grid-cols-2 gap-6" data-tutorial="crm-platforms">
        {Object.entries(crmPlatforms).map(([key, platform]) => {
          const connected = accounts.filter(a => a.platform === key);
          
          return (
            <Card key={key} className="relative overflow-hidden bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${platform.color} opacity-10 transform translate-x-8 -translate-y-8 rounded-full`} />
              
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-white text-lg">{platform.name}</CardTitle>
                  {connected.length > 0 && (
                    <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Connected
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-white/70">{platform.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-1">
                  {platform.features.map((feature, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs border-amber-500/30 text-white/70">
                      {feature}
                    </Badge>
                  ))}
                </div>
                <Button
                  onClick={() => handleConnect(key)}
                  className={`w-full bg-gradient-to-r ${platform.color}`}
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  {connected.length > 0 ? 'Reconnect' : 'Connect'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Connected Accounts */}
      {accounts.length > 0 && (
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white">Connected <span className="text-amber-400">CRM Accounts</span></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {accounts.map((account) => {
                const platform = crmPlatforms[account.platform];
                
                return (
                  <div key={account.id} className="flex items-center justify-between p-4 border border-amber-500/20 rounded-lg bg-white/5">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${platform?.color || 'from-gray-500 to-gray-600'} flex items-center justify-center`}>
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{platform?.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {account.status === 'active' ? (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800 text-xs">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              {account.status}
                            </Badge>
                          )}
                          {account.last_synced && (
                            <span className="text-xs text-white/60">
                              Last synced: {format(new Date(account.last_synced), 'MMM d, h:mm a')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4" data-tutorial="sync-settings">
                      <div className="flex items-center gap-2">
                        <Label className="text-white text-sm">Auto-sync</Label>
                        <Switch
                          checked={account.sync_enabled}
                          onCheckedChange={(checked) => 
                            toggleSyncMutation.mutate({ id: account.id, enabled: checked })
                          }
                          className="data-[state=checked]:bg-amber-500"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartSync(account)}
                        disabled={syncMutation.isPending}
                        className="border-amber-500/30 text-white hover:bg-white/10"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Sync Now
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sync History */}
      {syncRecords.length > 0 && (
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white">Recent <span className="text-amber-400">Sync Activity</span></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {syncRecords.slice(0, 10).map((sync) => (
                <div key={sync.id} className="flex items-center justify-between p-3 border border-amber-500/20 rounded-lg bg-white/5">
                  <div>
                    <p className="text-sm font-medium text-white capitalize">
                      {sync.entity_type} #{sync.cloudflip_id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-white/60 mt-1">
                      {sync.last_synced_at && format(new Date(sync.last_synced_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  <Badge className={sync.sync_status === 'synced' ? 'bg-green-100 text-green-800' : 
                                   sync.sync_status === 'error' ? 'bg-red-100 text-red-800' : 
                                   'bg-yellow-100 text-yellow-800'}>
                    {sync.sync_status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connect Modal */}
      <Dialog open={showConnectModal} onOpenChange={setShowConnectModal}>
        <DialogContent className="bg-[#0a1929] border-amber-500/30">
          <DialogHeader>
            <DialogTitle className="text-white">
              Connect to {crmPlatforms[selectedPlatform]?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-white/70">
              You'll be redirected to {crmPlatforms[selectedPlatform]?.name} to authorize CloudFlip.
            </p>
            <div className="bg-white/5 rounded-lg p-4 border border-amber-500/20">
              <h4 className="font-semibold text-white text-sm mb-2">What we'll sync:</h4>
              <ul className="text-sm text-white/70 space-y-1">
                {crmPlatforms[selectedPlatform]?.features.map(feature => (
                  <li key={feature} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConnectModal(false)}
              className="border-amber-500/30 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => connectMutation.mutate(selectedPlatform)}
              disabled={connectMutation.isPending}
              className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
            >
              {connectMutation.isPending ? 'Connecting...' : 'Connect'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sync Modal */}
      <Dialog open={showSyncModal} onOpenChange={setShowSyncModal}>
        <DialogContent className="bg-[#0a1929] border-amber-500/30">
          <DialogHeader>
            <DialogTitle className="text-white">Sync CRM Data</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-white/70">
              Select which data types to sync from {crmPlatforms[selectedAccount?.platform]?.name}
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-amber-500/20 rounded-lg">
                <div>
                  <p className="font-medium text-white">Contacts</p>
                  <p className="text-xs text-white/60">Sync contact records</p>
                </div>
                <Switch
                  checked={syncOptions.contacts}
                  onCheckedChange={(checked) => setSyncOptions({...syncOptions, contacts: checked})}
                  className="data-[state=checked]:bg-amber-500"
                />
              </div>
              <div className="flex items-center justify-between p-3 border border-amber-500/20 rounded-lg">
                <div>
                  <p className="font-medium text-white">Deals/Opportunities</p>
                  <p className="text-xs text-white/60">Sync deal pipeline</p>
                </div>
                <Switch
                  checked={syncOptions.deals}
                  onCheckedChange={(checked) => setSyncOptions({...syncOptions, deals: checked})}
                  className="data-[state=checked]:bg-amber-500"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSyncModal(false)}
              className="border-amber-500/30 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSync}
              disabled={syncMutation.isPending}
              className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
            >
              {syncMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Start Sync
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
