import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users,
  TrendingUp,
  DollarSign,
  Award,
  Plus,
  Check,
  UserPlus,
  Trophy,
  Sparkles,
  Loader2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function ReferralHub() {
  const [user, setUser] = useState(null);
  const [showNewReferral, setShowNewReferral] = useState(false);
  const [referrerId, setReferrerId] = useState("");
  const [referredName, setReferredName] = useState("");
  const [referredEmail, setReferredEmail] = useState("");
  const [referredPhone, setReferredPhone] = useState("");
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await api.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to load user:', error);
        toast.error('Failed to load user data');
      } finally {
        setIsLoadingUser(false);
      }
    };
    loadUser();
  }, []);

  const { data: referrals = [], isLoading: isLoadingReferrals } = useQuery({
    queryKey: ['referrals', user?.current_org_id],
    queryFn: async () => {
      try {
        return await api.entities.Referral.list('-created_date', 100);
      } catch (error) {
        console.error('Error fetching referrals:', error);
        return [];
      }
    },
    enabled: !!user?.current_org_id,
    retry: 1
  });

  const { data: clients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ['clients', user?.current_org_id],
    queryFn: async () => {
      try {
        return await api.entities.Client.list('-created_date', 100);
      } catch (error) {
        console.error('Error fetching clients:', error);
        return [];
      }
    },
    enabled: !!user?.current_org_id,
    retry: 1
  });

  const { data: loyalty = [], isLoading: isLoadingLoyalty } = useQuery({
    queryKey: ['loyalty', user?.current_org_id],
    queryFn: async () => {
      try {
        return await api.entities.LoyaltyProgram.list('-lifetime_value', 50);
      } catch (error) {
        console.error('Error fetching loyalty programs:', error);
        return [];
      }
    },
    enabled: !!user?.current_org_id,
    retry: 1
  });

  const createReferralMutation = useMutation({
    mutationFn: async (data) => {
      if (!user?.current_org_id) {
        throw new Error('No organization selected');
      }

      const referrer = clients.find(c => c.id === data.referrerId);
      
      return await api.entities.Referral.create({
        org_id: user.current_org_id,
        referrer_client_id: data.referrerId,
        referrer_name: referrer?.name || '',
        referred_name: data.referredName,
        referred_email: data.referredEmail || '',
        referred_phone: data.referredPhone || '',
        status: 'pending',
        reward_type: 'discount',
        reward_value: 10
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
      toast.success("Referral tracked!");
      handleCloseModal();
    },
    onError: (error) => {
      console.error('Create referral error:', error);
      toast.error('Failed to create referral');
    }
  });

  const convertReferralMutation = useMutation({
    mutationFn: async ({ referralId, clientId }) => {
      await api.entities.Referral.update(referralId, {
        status: 'converted',
        converted_client_id: clientId,
        converted_at: new Date().toISOString(),
        reward_claimed: true,
        reward_claimed_at: new Date().toISOString()
      });

      const referral = referrals.find(r => r.id === referralId);
      if (referral?.referrer_client_id) {
        const existingLoyalty = loyalty.find(l => l.client_id === referral.referrer_client_id);
        if (existingLoyalty) {
          await api.entities.LoyaltyProgram.update(existingLoyalty.id, {
            points: (existingLoyalty.points || 0) + 100,
            referrals_made: (existingLoyalty.referrals_made || 0) + 1
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
      queryClient.invalidateQueries({ queryKey: ['loyalty'] });
      toast.success("Referral converted! Reward granted.");
    },
    onError: (error) => {
      console.error('Convert referral error:', error);
      toast.error('Failed to convert referral');
    }
  });

  const handleSubmit = () => {
    if (!referrerId || !referredName) {
      toast.error("Please fill in required fields");
      return;
    }

    createReferralMutation.mutate({
      referrerId,
      referredName,
      referredEmail,
      referredPhone
    });
  };

  const handleCloseModal = () => {
    setShowNewReferral(false);
    setReferrerId("");
    setReferredName("");
    setReferredEmail("");
    setReferredPhone("");
  };

  const safeReferrals = Array.isArray(referrals) ? referrals : [];
  const safeClients = Array.isArray(clients) ? clients : [];
  const safeLoyalty = Array.isArray(loyalty) ? loyalty : [];

  const stats = {
    total: safeReferrals.length,
    converted: safeReferrals.filter(r => r?.status === 'converted').length,
    pending: safeReferrals.filter(r => r?.status === 'pending').length,
    totalValue: safeReferrals.reduce((sum, r) => sum + (r?.conversion_value || 0), 0)
  };

  const conversionRate = stats.total > 0 ? ((stats.converted / stats.total) * 100).toFixed(1) : 0;

  const isLoading = isLoadingUser || isLoadingReferrals || isLoadingClients || isLoadingLoyalty;

  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading referral hub...</p>
        </div>
      </div>
    );
  }

  if (!user?.current_org_id) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/30 max-w-md">
          <CardContent className="p-8 text-center">
            <Users className="w-16 h-16 text-amber-400/50 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">No Organization Selected</h2>
            <p className="text-white/60">Please select an organization to access the referral hub.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-green-400" />
            Referral & <span className="text-amber-400">Loyalty Hub</span>
          </h1>
          <p className="text-white/60">Track referrals, reward loyalty, and grow organically</p>
        </div>
        <Button
          onClick={() => setShowNewReferral(true)}
          disabled={isLoadingClients}
          className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Track Referral
        </Button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
          <CardContent className="p-6 text-center">
            <UserPlus className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white mb-1">{stats.total}</p>
            <p className="text-white/60 text-sm">Total Referrals</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
          <CardContent className="p-6 text-center">
            <Check className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white mb-1">{stats.converted}</p>
            <p className="text-white/60 text-sm">Converted</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white mb-1">{conversionRate}%</p>
            <p className="text-white/60 text-sm">Conversion Rate</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
          <CardContent className="p-6 text-center">
            <DollarSign className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white mb-1">${stats.totalValue.toLocaleString()}</p>
            <p className="text-white/60 text-sm">Referral Value</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Referrers */}
      <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Top Referrers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingLoyalty ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-2" />
              <p className="text-white/60 text-sm">Loading top referrers...</p>
            </div>
          ) : safeLoyalty.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-amber-400/50 mx-auto mb-3" />
              <p className="text-white/60">No loyalty program members yet</p>
              <p className="text-white/50 text-sm mt-1">Start tracking referrals to build your loyalty program</p>
            </div>
          ) : (
            <div className="space-y-3">
              {safeLoyalty.slice(0, 5).map((program, idx) => {
                const client = safeClients.find(c => c.id === program.client_id);
                if (!client) return null;

                return (
                  <div
                    key={program.id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-500 flex items-center justify-center text-[#0a1929] font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{client.name}</h4>
                        <div className="flex items-center gap-3 text-sm text-white/60 mt-1">
                          <span>{program.referrals_made || 0} referrals</span>
                          <span>•</span>
                          <span>{program.points || 0} points</span>
                          <Badge className="bg-amber-500/20 text-amber-400 capitalize">
                            {program.tier}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-400">
                        ${(program.lifetime_value || 0).toLocaleString()}
                      </p>
                      <p className="text-white/50 text-xs">Lifetime Value</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Referrals */}
      <Card className="bg-[#0a1929]/60 backdrop-blur border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Recent Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingReferrals ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-2" />
              <p className="text-white/60 text-sm">Loading referrals...</p>
            </div>
          ) : safeReferrals.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-cyan-400/50 mx-auto mb-3" />
              <p className="text-white/60">No referrals tracked yet</p>
              <p className="text-white/50 text-sm mt-1">Click "Track Referral" to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {safeReferrals.slice(0, 10).map(referral => {
                const referrer = safeClients.find(c => c.id === referral.referrer_client_id);
                const statusColors = {
                  pending: "bg-amber-500/20 text-amber-400",
                  contacted: "bg-blue-500/20 text-blue-400",
                  converted: "bg-green-500/20 text-green-400",
                  declined: "bg-red-500/20 text-red-400"
                };

                return (
                  <div
                    key={referral.id}
                    className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-green-500/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-white font-medium">{referral.referred_name}</h4>
                          <Badge className={statusColors[referral.status] || statusColors.pending}>
                            {referral.status}
                          </Badge>
                        </div>
                        <p className="text-white/60 text-sm mb-1">
                          Referred by: <span className="text-amber-400">{referrer?.name || referral.referrer_name}</span>
                        </p>
                        {referral.referred_email && (
                          <p className="text-white/50 text-xs">{referral.referred_email}</p>
                        )}
                        {referral.referred_phone && (
                          <p className="text-white/50 text-xs">{referral.referred_phone}</p>
                        )}
                      </div>
                    </div>

                    {referral.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="bg-green-500 hover:bg-green-600 text-white"
                          onClick={() => {
                            toast.info("Create client first, then mark referral as converted");
                          }}
                        >
                          <UserPlus className="w-3 h-3 mr-1" />
                          Convert to Client
                        </Button>
                      </div>
                    )}

                    {referral.status === 'converted' && referral.conversion_value && (
                      <div className="mt-2 p-2 bg-green-500/10 rounded border border-green-500/20">
                        <p className="text-green-400 text-sm">
                          ✓ Converted • Generated ${referral.conversion_value.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Referral Modal */}
      <Dialog open={showNewReferral} onOpenChange={setShowNewReferral}>
        <DialogContent className="bg-[#0a1929] border-green-500/30">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl">Track New Referral</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="text-white">Who referred this person? *</Label>
              <Select value={referrerId} onValueChange={setReferrerId}>
                <SelectTrigger className="bg-white/5 border-green-500/30 text-white">
                  <SelectValue placeholder="Select referring client" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingClients ? (
                    <SelectItem value="loading" disabled>Loading clients...</SelectItem>
                  ) : safeClients.length === 0 ? (
                    <SelectItem value="none" disabled>No clients found - create a client first</SelectItem>
                  ) : (
                    safeClients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white">Referred Person's Name *</Label>
              <Input
                value={referredName}
                onChange={(e) => setReferredName(e.target.value)}
                placeholder="Full name"
                className="bg-white/5 border-green-500/30 text-white"
              />
            </div>

            <div>
              <Label className="text-white">Email</Label>
              <Input
                type="email"
                value={referredEmail}
                onChange={(e) => setReferredEmail(e.target.value)}
                placeholder="email@example.com"
                className="bg-white/5 border-green-500/30 text-white"
              />
            </div>

            <div>
              <Label className="text-white">Phone</Label>
              <Input
                value={referredPhone}
                onChange={(e) => setReferredPhone(e.target.value)}
                placeholder="(555) 123-4567"
                className="bg-white/5 border-green-500/30 text-white"
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={handleCloseModal}
              className="border-green-500/30 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createReferralMutation.isPending || !user?.current_org_id || isLoadingClients}
              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold"
            >
              {createReferralMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Tracking...
                </>
              ) : (
                'Track Referral'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}