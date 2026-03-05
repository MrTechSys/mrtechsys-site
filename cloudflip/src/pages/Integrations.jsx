import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Facebook,
  Instagram,
  Link as LinkIcon,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Copy,
  Zap,
  DollarSign,
  FileText,
  CreditCard,
  Upload,
  Download
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const socialPlatformConfig = {
  facebook: {
    name: "Facebook",
    icon: Facebook,
    color: "from-blue-600 to-blue-700",
    scopes: ["pages_read_engagement", "leads_retrieval"]
  },
  nextdoor: {
    name: "Nextdoor",
    icon: LinkIcon,
    color: "from-green-600 to-green-700",
    scopes: ["ads.read", "leads.read"]
  },
  instagram: {
    name: "Instagram",
    icon: Instagram,
    color: "from-pink-600 to-purple-700",
    scopes: ["instagram_basic", "pages_read_engagement"]
  },
  tiktok: {
    name: "TikTok",
    icon: LinkIcon,
    color: "from-black to-gray-800",
    scopes: ["user.info.basic", "video.list"]
  },
  zapier: {
    name: "Zapier / Webhooks",
    icon: Zap,
    color: "from-orange-600 to-red-600",
    scopes: []
  }
};

const businessPlatformConfig = {
  stripe: {
    name: "Stripe",
    icon: CreditCard,
    color: "from-indigo-600 to-purple-700",
    description: "Import customers, invoices, and payment history",
    dataTypes: ["Customers", "Invoices", "Payments", "Products"]
  },
  square: {
    name: "Square",
    icon: DollarSign,
    color: "from-blue-600 to-cyan-600",
    description: "Import customers, transactions, and catalog",
    dataTypes: ["Customers", "Transactions", "Items", "Categories"]
  },
  quickbooks: {
    name: "QuickBooks",
    icon: FileText,
    color: "from-green-600 to-emerald-700",
    description: "Import customers, invoices, estimates, and expenses",
    dataTypes: ["Customers", "Invoices", "Estimates", "Expenses", "Items"]
  }
};

export default function Integrations() {
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [importOptions, setImportOptions] = useState({
    customers: true,
    invoices: true,
    payments: true,
    products: false
  });
  const [webhookUrl, setWebhookUrl] = useState("");
  const [generatingWebhook, setGeneratingWebhook] = useState(false);
  const [processingCallback, setProcessingCallback] = useState(false);
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['connected-accounts'],
    queryFn: () => api.entities.ConnectedAccount.list('-created_date'),
  });

  const { data: importHistory = [] } = useQuery({
    queryKey: ['import-history'],
    queryFn: () => api.entities.DataImport.list('-created_date', 10),
  });

  // OAuth callback handling
  const oauthCallbackMutation = useMutation({
    mutationFn: async ({ platform, code, state }) => {
      if (platform === 'facebook') {
        return await api.functions.invoke('oauthFacebook', { action: 'callback', code, state });
      } else if (platform === 'stripe') {
        return await api.functions.invoke('oauthStripe', { action: 'callback', code, state });
      } else if (platform === 'square') {
        return await api.functions.invoke('oauthSquare', { action: 'callback', code, state });
      } else if (platform === 'quickbooks') {
        return await api.functions.invoke('oauthQuickbooks', { action: 'callback', code, state });
      }
      throw new Error(`Unsupported platform for OAuth callback: ${platform}`);
    },
    onSuccess: () => {
      toast.success("Account connected successfully!");
      queryClient.invalidateQueries({ queryKey: ['connected-accounts'] });
      window.history.replaceState({}, document.title, window.location.pathname);
    },
    onError: (error) => {
      toast.error(`Failed to connect account: ${error.message || 'An unknown error occurred.'}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    },
    onSettled: () => {
      setProcessingCallback(false);
    }
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const platform = params.get('platform');

    if (code && state && platform && !processingCallback) {
      setProcessingCallback(true);
      oauthCallbackMutation.mutate({ platform, code, state });
    }
  }, [oauthCallbackMutation, processingCallback]);

  const connectMutation = useMutation({
    mutationFn: async (platform) => {
      const platformMap = {
        facebook: 'oauthFacebook',
        stripe: 'oauthStripe',
        square: 'oauthSquare',
        quickbooks: 'oauthQuickbooks'
      };
      
      const functionName = platformMap[platform];
      if (functionName) {
        const { data } = await api.functions.invoke(functionName, { action: 'start' });
        window.location.href = data.authUrl;
      }
    }
  });

  const importMutation = useMutation({
    mutationFn: async ({ accountId, options }) => {
      const account = accounts.find(a => a.id === accountId);
      const platformMap = {
        stripe: 'importDataStripe',
        square: 'importDataSquare',
        quickbooks: 'importDataQuickbooks'
      };
      
      const functionName = platformMap[account.platform];
      if (functionName) {
        return await api.functions.invoke(functionName, { accountId, options });
      }
    },
    onSuccess: (data) => {
      toast.success(`Import completed! ${data.data.summary || 'Data imported successfully'}`);
      queryClient.invalidateQueries({ queryKey: ['import-history'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowImportModal(false);
    },
    onError: (error) => {
      toast.error(`Import failed: ${error.message}`);
    }
  });

  const syncMutation = useMutation({
    mutationFn: async (accountId) => {
      const account = accounts.find(a => a.id === accountId);
      if (account.platform === 'facebook') {
        return await api.functions.invoke('importLeadsFacebook', { accountId });
      }
    },
    onSuccess: (data) => {
      toast.success(`Imported ${data.data.imported} leads!`);
      queryClient.invalidateQueries({ queryKey: ['connected-accounts'] });
    },
    onError: () => {
      toast.error("Failed to sync leads");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (accountId) => api.entities.ConnectedAccount.delete(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connected-accounts'] });
      toast.success("Account disconnected");
    }
  });

  const generateWebhookUrl = async () => {
    setGeneratingWebhook(true);
    try {
      const user = await api.auth.me();
      const { data } = await api.functions.invoke('generateWebhookSecret', {
        orgId: user.current_org_id
      });
      setWebhookUrl(data.webhookUrl);
      toast.success("Secure webhook URL generated!");
    } catch (error) {
      toast.error("Failed to generate webhook URL");
      console.error(error);
    } finally {
      setGeneratingWebhook(false);
    }
  };

  const handleConnect = (platform, type = 'social') => {
    if (platform === 'zapier') {
      generateWebhookUrl();
    }
    setSelectedPlatform({ ...platform, type });
    setShowConnectModal(true);
  };

  const handleStartImport = (account) => {
    setSelectedAccount(account);
    setShowImportModal(true);
  };

  const handleImport = () => {
    if (!selectedAccount) return;
    importMutation.mutate({ 
      accountId: selectedAccount.id, 
      options: importOptions 
    });
  };

  const socialAccounts = accounts.filter(a => ['facebook', 'nextdoor', 'instagram', 'tiktok', 'zapier'].includes(a.platform));
  const businessAccounts = accounts.filter(a => ['stripe', 'square', 'quickbooks'].includes(a.platform));

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Integrations</h1>
        <p className="text-white/70 mt-1">Connect <span className="text-amber-400">platforms</span> to sync data and automate workflows</p>
      </div>

      <Tabs defaultValue="social" className="space-y-6">
        <TabsList className="bg-[#0a1929]/60 backdrop-blur border border-amber-500/20">
          <TabsTrigger value="social" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            Social Media
          </TabsTrigger>
          <TabsTrigger value="business" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            Business Platforms
          </TabsTrigger>
        </TabsList>

        {/* Social Media Integrations */}
        <TabsContent value="social" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(socialPlatformConfig).map(([key, platform]) => {
              const Icon = platform.icon;
              const connected = socialAccounts.filter(a => a.platform === key);
              
              return (
                <Card key={key} className="relative overflow-hidden bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${platform.color} opacity-10 transform translate-x-8 -translate-y-8 rounded-full`} />
                  
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-white">{platform.name}</CardTitle>
                          {connected.length > 0 && (
                            <Badge className="mt-1 bg-green-100 text-green-800">
                              {connected.length} Connected
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <Button
                      onClick={() => handleConnect(key, 'social')}
                      className={`w-full bg-gradient-to-r ${platform.color}`}
                    >
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Connect Account
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Connected Social Accounts */}
          {socialAccounts.length > 0 && (
            <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white">Connected <span className="text-amber-400">Social Accounts</span></CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {socialAccounts.map((account) => {
                    const platform = socialPlatformConfig[account.platform];
                    const Icon = platform?.icon || LinkIcon;
                    
                    return (
                      <div key={account.id} className="flex items-center justify-between p-4 border border-amber-500/20 rounded-lg bg-white/5">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${platform?.color || 'from-gray-500 to-gray-600'} flex items-center justify-center`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {account.platform_username || platform?.name}
                            </p>
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
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => syncMutation.mutate(account.id)}
                            disabled={syncMutation.isPending}
                            className="border-amber-500/30 text-white hover:bg-white/10"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMutation.mutate(account.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Business Platform Integrations */}
        <TabsContent value="business" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(businessPlatformConfig).map(([key, platform]) => {
              const Icon = platform.icon;
              const connected = businessAccounts.filter(a => a.platform === key);
              
              return (
                <Card key={key} className="relative overflow-hidden bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${platform.color} opacity-10 transform translate-x-8 -translate-y-8 rounded-full`} />
                  
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      {connected.length > 0 && (
                        <Badge className="bg-green-100 text-green-800">
                          Connected
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg text-white">{platform.name}</CardTitle>
                    <p className="text-sm text-white/70 mt-1">{platform.description}</p>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {platform.dataTypes.map((type, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs border-amber-500/30 text-white/70">
                            {type}
                          </Badge>
                        ))}
                      </div>
                      <Button
                        onClick={() => handleConnect(key, 'business')}
                        className={`w-full bg-gradient-to-r ${platform.color}`}
                      >
                        <LinkIcon className="w-4 h-4 mr-2" />
                        {connected.length > 0 ? 'Reconnect' : 'Connect'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Connected Business Accounts */}
          {businessAccounts.length > 0 && (
            <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white">Connected <span className="text-amber-400">Business Platforms</span></CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {businessAccounts.map((account) => {
                    const platform = businessPlatformConfig[account.platform];
                    const Icon = platform?.icon || FileText;
                    
                    return (
                      <div key={account.id} className="flex items-center justify-between p-4 border border-amber-500/20 rounded-lg bg-white/5">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${platform?.color || 'from-gray-500 to-gray-600'} flex items-center justify-center`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {account.platform_username || platform?.name}
                            </p>
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
                                  Last import: {format(new Date(account.last_synced), 'MMM d, h:mm a')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStartImport(account)}
                            disabled={importMutation.isPending}
                            className="border-amber-500/30 text-white hover:bg-white/10"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Import Data
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMutation.mutate(account.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Import History */}
          {importHistory.length > 0 && (
            <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white">Recent <span className="text-amber-400">Imports</span></CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {importHistory.map((imp) => (
                    <div key={imp.id} className="flex items-center justify-between p-3 border border-amber-500/20 rounded-lg bg-white/5">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {imp.platform} • {imp.data_types?.join(', ')}
                        </p>
                        <p className="text-xs text-white/60 mt-1">
                          {format(new Date(imp.created_date), 'MMM d, yyyy h:mm a')} • {imp.records_imported} records
                        </p>
                      </div>
                      <Badge className={imp.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {imp.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Connect Modal */}
      <Dialog open={showConnectModal} onOpenChange={setShowConnectModal}>
        <DialogContent className="bg-[#0a1929] border-amber-500/30">
          <DialogHeader>
            <DialogTitle className="text-white">
              Connect {selectedPlatform === 'zapier' ? 'Zapier / Webhooks' : businessPlatformConfig[selectedPlatform]?.name || socialPlatformConfig[selectedPlatform]?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedPlatform === 'zapier' ? (
            <div className="space-y-4">
              <p className="text-sm text-white/70">
                Use this secure webhook URL in your <span className="text-amber-400">Zapier</span> flows or other automation tools to send <span className="text-amber-400">leads</span> to CloudFlip.
              </p>
              
              {!webhookUrl ? (
                <Button 
                  onClick={generateWebhookUrl} 
                  disabled={generatingWebhook}
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
                >
                  {generatingWebhook ? 'Generating...' : 'Generate Secure Webhook URL'}
                </Button>
              ) : (
                <>
                  <div>
                    <Label className="text-white">Webhook URL</Label>
                    <div className="flex gap-2 mt-2">
                      <Input value={webhookUrl} readOnly className="font-mono text-xs bg-white/5 text-white border-amber-500/30" />
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(webhookUrl);
                          toast.success("Copied to clipboard!");
                        }}
                        className="border-amber-500/30 text-white hover:bg-white/10"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-amber-400 mt-2 flex items-start gap-1">
                      <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      Keep this URL secret! Anyone with this URL can send leads to your account.
                    </p>
                  </div>
                  
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-300 text-sm mb-2">Expected Payload:</h4>
                    <pre className="text-xs text-blue-200 overflow-x-auto">
{`{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "(555) 123-4567",
  "message": "Interested in your services",
  "source": "facebook",
  "tags": ["hvac", "urgent"]
}`}
                    </pre>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-white/70">
                You'll be redirected to {businessPlatformConfig[selectedPlatform]?.name || socialPlatformConfig[selectedPlatform]?.name} to authorize <span className="text-amber-400">CloudFlip</span> to access your data.
              </p>
              
              {selectedPlatform?.type === 'business' && (
                <div className="bg-white/5 rounded-lg p-4 border border-amber-500/20">
                  <h4 className="font-semibold text-white text-sm mb-2">Data We'll Import:</h4>
                  <ul className="text-sm text-white/70 space-y-1">
                    {businessPlatformConfig[selectedPlatform]?.dataTypes.map(type => (
                      <li key={type} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        {type}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedPlatform?.type === 'social' && (
                <div className="bg-white/5 rounded-lg p-4 border border-amber-500/20">
                  <h4 className="font-semibold text-white text-sm mb-2">Permissions Requested:</h4>
                  <ul className="text-sm text-white/70 space-y-1">
                    {socialPlatformConfig[selectedPlatform]?.scopes.map(scope => (
                      <li key={scope} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        {scope.replace(/_/g, ' ')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConnectModal(false)} className="border-amber-500/30 text-white hover:bg-white/10">
              Cancel
            </Button>
            {selectedPlatform !== 'zapier' && (
              <Button 
                onClick={() => connectMutation.mutate(selectedPlatform)} 
                disabled={connectMutation.isPending}
                className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
              >
                {connectMutation.isPending ? 'Redirecting...' : 'Authorize'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Data Modal */}
      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent className="bg-[#0a1929] border-amber-500/30">
          <DialogHeader>
            <DialogTitle className="text-white">
              Import Data from {businessPlatformConfig[selectedAccount?.platform]?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-white/70">
              Select what data you'd like to import into CloudFlip. This process may take a few minutes.
            </p>
            
            <div className="space-y-3">
              {selectedAccount?.platform === 'stripe' && (
                <>
                  <div className="flex items-center justify-between p-3 border border-amber-500/20 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Customers</p>
                      <p className="text-xs text-white/60">Import as Clients</p>
                    </div>
                    <Switch
                      checked={importOptions.customers}
                      onCheckedChange={(checked) => setImportOptions({...importOptions, customers: checked})}
                      className="data-[state=checked]:bg-amber-500"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border border-amber-500/20 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Invoices</p>
                      <p className="text-xs text-white/60">Import invoice history</p>
                    </div>
                    <Switch
                      checked={importOptions.invoices}
                      onCheckedChange={(checked) => setImportOptions({...importOptions, invoices: checked})}
                      className="data-[state=checked]:bg-amber-500"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border border-amber-500/20 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Payments</p>
                      <p className="text-xs text-white/60">Import payment records</p>
                    </div>
                    <Switch
                      checked={importOptions.payments}
                      onCheckedChange={(checked) => setImportOptions({...importOptions, payments: checked})}
                      className="data-[state=checked]:bg-amber-500"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border border-amber-500/20 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Products</p>
                      <p className="text-xs text-white/60">Import product catalog</p>
                    </div>
                    <Switch
                      checked={importOptions.products}
                      onCheckedChange={(checked) => setImportOptions({...importOptions, products: checked})}
                      className="data-[state=checked]:bg-amber-500"
                    />
                  </div>
                </>
              )}
              
              {selectedAccount?.platform === 'square' && (
                <>
                  <div className="flex items-center justify-between p-3 border border-amber-500/20 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Customers</p>
                      <p className="text-xs text-white/60">Import as Clients</p>
                    </div>
                    <Switch
                      checked={importOptions.customers}
                      onCheckedChange={(checked) => setImportOptions({...importOptions, customers: checked})}
                      className="data-[state=checked]:bg-amber-500"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border border-amber-500/20 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Transactions</p>
                      <p className="text-xs text-white/60">Import transaction history</p>
                    </div>
                    <Switch
                      checked={importOptions.invoices}
                      onCheckedChange={(checked) => setImportOptions({...importOptions, invoices: checked})}
                      className="data-[state=checked]:bg-amber-500"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border border-amber-500/20 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Catalog Items</p>
                      <p className="text-xs text-white/60">Import products/services</p>
                    </div>
                    <Switch
                      checked={importOptions.products}
                      onCheckedChange={(checked) => setImportOptions({...importOptions, products: checked})}
                      className="data-[state=checked]:bg-amber-500"
                    />
                  </div>
                </>
              )}
              
              {selectedAccount?.platform === 'quickbooks' && (
                <>
                  <div className="flex items-center justify-between p-3 border border-amber-500/20 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Customers</p>
                      <p className="text-xs text-white/60">Import as Clients</p>
                    </div>
                    <Switch
                      checked={importOptions.customers}
                      onCheckedChange={(checked) => setImportOptions({...importOptions, customers: checked})}
                      className="data-[state=checked]:bg-amber-500"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border border-amber-500/20 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Invoices</p>
                      <p className="text-xs text-white/60">Import invoice records</p>
                    </div>
                    <Switch
                      checked={importOptions.invoices}
                      onCheckedChange={(checked) => setImportOptions({...importOptions, invoices: checked})}
                      className="data-[state=checked]:bg-amber-500"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border border-amber-500/20 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Estimates</p>
                      <p className="text-xs text-white/60">Import as Quotes</p>
                    </div>
                    <Switch
                      checked={importOptions.payments}
                      onCheckedChange={(checked) => setImportOptions({...importOptions, payments: checked})}
                      className="data-[state=checked]:bg-amber-500"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border border-amber-500/20 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Items</p>
                      <p className="text-xs text-white/60">Import products/services</p>
                    </div>
                    <Switch
                      checked={importOptions.products}
                      onCheckedChange={(checked) => setImportOptions({...importOptions, products: checked})}
                      className="data-[state=checked]:bg-amber-500"
                    />
                  </div>
                </>
              )}
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-xs text-blue-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                This import will not overwrite existing data. Duplicates will be skipped based on email/ID matching.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportModal(false)} className="border-amber-500/30 text-white hover:bg-white/10">
              Cancel
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={importMutation.isPending}
              className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
            >
              {importMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Start Import
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}