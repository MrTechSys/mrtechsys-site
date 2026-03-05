import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Store,
  Search,
  Star,
  Download,
  CheckCircle,
  Lock,
  Zap,
  Crown,
  Filter,
  Sparkles,
  Shield,
  BarChart,
  Users,
  Settings
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const categoryIcons = {
  crm: Users,
  devops: Settings,
  security: Shield,
  compliance: Shield,
  analytics: BarChart,
  integrations: Zap,
  automation: Sparkles
};

const planBadges = {
  free: { label: "Free", color: "bg-gray-100 text-gray-800" },
  starter: { label: "Starter+", color: "bg-blue-100 text-blue-800" },
  pro: { label: "Pro+", color: "bg-purple-100 text-purple-800" },
  partner: { label: "Partner Only", color: "bg-amber-100 text-amber-800" }
};

export default function MarketplaceHub() {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAddon, setSelectedAddon] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUserData = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);

      if (currentUser?.current_org_id) {
        const subs = await api.entities.BillingSubscription.filter({ 
          org_id: currentUser.current_org_id 
        });
        setSubscription(subs.length > 0 ? subs[0] : { plan: 'free' });
      }
    };
    loadUserData();
  }, []);

  const { data: addons = [] } = useQuery({
    queryKey: ['marketplace-addons'],
    queryFn: () => api.entities.MarketplaceAddon.filter({ is_active: true }),
  });

  const { data: installations = [] } = useQuery({
    queryKey: ['addon-installations', user?.current_org_id],
    queryFn: () => 
      user?.current_org_id 
        ? api.entities.AddonInstallation.filter({ org_id: user.current_org_id })
        : [],
    enabled: !!user?.current_org_id
  });

  const installAddonMutation = useMutation({
    mutationFn: async (addonId) => {
      const addon = addons.find(a => a.addon_id === addonId);
      
      // Check plan requirement
      const planHierarchy = ['free', 'starter', 'pro', 'partner'];
      const userPlanLevel = planHierarchy.indexOf(subscription?.plan || 'free');
      const requiredPlanLevel = planHierarchy.indexOf(addon.plan_requirement);
      
      if (userPlanLevel < requiredPlanLevel) {
        throw new Error(`This addon requires ${addon.plan_requirement} plan or higher`);
      }

      // Create installation
      const installation = await api.entities.AddonInstallation.create({
        org_id: user.current_org_id,
        addon_id: addonId,
        installed_by: user.id,
        installed_at: new Date().toISOString(),
        configuration: {}
      });

      // Call enablement script if provided
      if (addon.enablement_script) {
        try {
          await api.functions.invoke(addon.enablement_script, {
            orgId: user.current_org_id,
            addonId: addonId
          });
        } catch (error) {
          console.error('Enablement script failed:', error);
        }
      }

      return installation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addon-installations'] });
      queryClient.invalidateQueries({ queryKey: ['marketplace-addons'] });
      setShowDetailsModal(false);
      toast.success("Addon installed successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const uninstallAddonMutation = useMutation({
    mutationFn: (installationId) => 
      api.entities.AddonInstallation.delete(installationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addon-installations'] });
      setShowDetailsModal(false);
      toast.success("Addon uninstalled");
    }
  });

  const isInstalled = (addonId) => {
    return installations.some(inst => inst.addon_id === addonId && inst.status === 'active');
  };

  const getInstallation = (addonId) => {
    return installations.find(inst => inst.addon_id === addonId);
  };

  const canInstall = (addon) => {
    const planHierarchy = ['free', 'starter', 'pro', 'partner'];
    const userPlanLevel = planHierarchy.indexOf(subscription?.plan || 'free');
    const requiredPlanLevel = planHierarchy.indexOf(addon.plan_requirement);
    return userPlanLevel >= requiredPlanLevel;
  };

  const filteredAddons = addons.filter(addon => {
    const matchesSearch = addon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         addon.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || addon.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const installedAddons = addons.filter(addon => isInstalled(addon.addon_id));
  const categories = [...new Set(addons.map(a => a.category))];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Store className="w-8 h-8 text-blue-400" />
            Add-ons <span className="text-amber-400">Marketplace</span>
          </h1>
          <p className="text-white/70 mt-1">Extend CloudFlip with powerful integrations</p>
        </div>
        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
          {installedAddons.length} installed
        </Badge>
      </div>

      {/* Filters */}
      <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
              <Input
                placeholder="Search add-ons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-amber-500/30 text-white placeholder:text-white/40"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
                className={selectedCategory === 'all' ? '' : 'border-amber-500/30 text-white'}
              >
                All
              </Button>
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className={selectedCategory === cat ? '' : 'border-amber-500/30 text-white'}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add-ons Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAddons.map((addon, idx) => {
          const CategoryIcon = categoryIcons[addon.category] || Zap;
          const installed = isInstalled(addon.addon_id);
          const canUse = canInstall(addon);
          const planBadge = planBadges[addon.plan_requirement];

          return (
            <motion.div
              key={addon.addon_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className={`bg-[#0a1929]/60 backdrop-blur border-amber-500/20 hover:border-amber-500/40 transition-all h-full flex flex-col ${
                installed ? 'ring-2 ring-green-500/30' : ''
              }`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {addon.icon_url ? (
                        <img src={addon.icon_url} alt={addon.name} className="w-10 h-10 object-contain" />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                          {addon.icon_emoji ? (
                            <span className="text-xl">{addon.icon_emoji}</span>
                          ) : (
                            <CategoryIcon className="w-5 h-5 text-white" />
                          )}
                        </div>
                      )}
                      <div>
                        <h3 className="text-white font-bold">{addon.name}</h3>
                        <Badge className={planBadge.color} variant="outline">
                          {planBadge.label}
                        </Badge>
                      </div>
                    </div>
                    {installed && (
                      <Badge className="bg-green-500/20 text-green-400">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Installed
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  <p className="text-white/70 text-sm mb-4 line-clamp-3 flex-1">
                    {addon.description}
                  </p>

                  {addon.features?.length > 0 && (
                    <ul className="space-y-1 mb-4">
                      {addon.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="text-white/60 text-xs flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                    <div>
                      {addon.price_type === 'free' ? (
                        <Badge className="bg-green-500/20 text-green-400">Free</Badge>
                      ) : (
                        <p className="text-white font-bold">
                          ${addon.monthly_price}/mo
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedAddon(addon);
                        setShowDetailsModal(true);
                      }}
                      variant={installed ? 'outline' : 'default'}
                      className={installed ? 'border-amber-500/30 text-white' : ''}
                      disabled={!canUse && !installed}
                    >
                      {!canUse ? (
                        <>
                          <Lock className="w-3 h-3 mr-1" />
                          Locked
                        </>
                      ) : installed ? (
                        'Manage'
                      ) : (
                        <>
                          <Download className="w-3 h-3 mr-1" />
                          Install
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Addon Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="bg-[#0a1929] border-amber-500/30 max-w-2xl">
          {selectedAddon && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-3">
                  {selectedAddon.icon_emoji && (
                    <span className="text-3xl">{selectedAddon.icon_emoji}</span>
                  )}
                  {selectedAddon.name}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={planBadges[selectedAddon.plan_requirement].color}>
                    {planBadges[selectedAddon.plan_requirement].label}
                  </Badge>
                  {selectedAddon.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-white text-sm">{selectedAddon.rating.toFixed(1)}</span>
                    </div>
                  )}
                  <Badge variant="outline" className="text-white/60">
                    {selectedAddon.install_count || 0} installs
                  </Badge>
                </div>

                <p className="text-white/80 text-sm leading-relaxed">
                  {selectedAddon.description}
                </p>

                {selectedAddon.features?.length > 0 && (
                  <div>
                    <h4 className="text-white font-medium text-sm mb-2">Features</h4>
                    <ul className="space-y-2">
                      {selectedAddon.features.map((feature, idx) => (
                        <li key={idx} className="text-white/70 text-sm flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedAddon.price_type !== 'free' && (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm">Monthly Price</span>
                      <span className="text-white text-2xl font-bold">
                        ${selectedAddon.monthly_price}
                      </span>
                    </div>
                  </div>
                )}

                {!canInstall(selectedAddon) && (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Lock className="w-4 h-4 text-yellow-400 mt-0.5" />
                      <div>
                        <p className="text-yellow-400 font-medium text-sm">Upgrade Required</p>
                        <p className="text-white/70 text-xs mt-1">
                          This addon requires {selectedAddon.plan_requirement} plan or higher
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                {isInstalled(selectedAddon.addon_id) ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const installation = getInstallation(selectedAddon.addon_id);
                        if (installation) {
                          uninstallAddonMutation.mutate(installation.id);
                        }
                      }}
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      Uninstall
                    </Button>
                    <Button
                      onClick={() => setShowDetailsModal(false)}
                      className="bg-gradient-to-r from-blue-600 to-blue-500"
                    >
                      Configure
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setShowDetailsModal(false)}
                      className="border-amber-500/30 text-white hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => installAddonMutation.mutate(selectedAddon.addon_id)}
                      disabled={!canInstall(selectedAddon) || installAddonMutation.isPending}
                      className="bg-gradient-to-r from-purple-600 to-purple-500"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {installAddonMutation.isPending ? 'Installing...' : 'Install Now'}
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}