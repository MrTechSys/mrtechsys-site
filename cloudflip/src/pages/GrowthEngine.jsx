
import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Trophy,
  Award,
  TrendingUp,
  Users,
  DollarSign,
  Star,
  Gift,
  Crown,
  Zap,
  Target,
  ChevronRight,
  Heart,
  User
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { format } from "date-fns";

const tierConfig = {
  bronze: { 
    name: "Bronze", 
    color: "from-orange-700 to-orange-600", 
    textColor: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
    minSpend: 0,
    benefits: ["5% discount on services", "Priority email support"]
  },
  silver: { 
    name: "Silver", 
    color: "from-gray-400 to-gray-300", 
    textColor: "text-gray-300",
    bgColor: "bg-gray-400/10",
    borderColor: "border-gray-400/30",
    minSpend: 1000,
    benefits: ["10% discount on services", "Priority scheduling", "Free seasonal maintenance"]
  },
  gold: { 
    name: "Gold", 
    color: "from-amber-500 to-amber-400", 
    textColor: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    minSpend: 5000,
    benefits: ["15% discount on services", "VIP support 24/7", "Free annual inspection"]
  },
  platinum: { 
    name: "Platinum", 
    color: "from-purple-500 to-pink-500", 
    textColor: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    minSpend: 10000,
    benefits: ["20% discount on services", "Dedicated account manager", "Free upgrades"]
  }
};

const badgeDefinitions = [
  { name: "First Timer", icon: Star, requirement: "Complete first job", points: 50 },
  { name: "Loyal Customer", icon: Heart, requirement: "5 jobs completed", points: 100 },
  { name: "VIP", icon: Crown, requirement: "Spend $5,000+", points: 200 },
  { name: "Referral Champion", icon: Users, requirement: "Refer 3 customers", points: 150 },
  { name: "Elite Patron", icon: Trophy, requirement: "Platinum tier reached", points: 500 }
];

export default function GrowthEngine() {
  const [selectedClient, setSelectedClient] = useState(null);
  const queryClient = useQueryClient();

  const { data: loyaltyPrograms = [] } = useQuery({
    queryKey: ['loyalty-programs'],
    queryFn: () => api.entities.LoyaltyProgram.list('-lifetime_value'),
    initialData: []
  });

  const { data: referrals = [] } = useQuery({
    queryKey: ['referrals'],
    queryFn: () => api.entities.Referral.list('-created_date'),
    initialData: []
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.entities.Client.list(),
    initialData: []
  });

  const awardBadgeMutation = useMutation({
    mutationFn: async ({ programId, badgeName }) => {
      const program = loyaltyPrograms.find(p => p.id === programId);
      const badge = badgeDefinitions.find(b => b.name === badgeName);
      
      const existingBadges = program.badges || [];
      if (existingBadges.find(b => b.badge_name === badgeName)) {
        throw new Error("Badge already earned!");
      }

      const newBadges = [...existingBadges, {
        badge_name: badgeName,
        earned_at: new Date().toISOString(),
        description: badge.requirement
      }];

      return api.entities.LoyaltyProgram.update(programId, {
        badges: newBadges,
        points: (program.points || 0) + badge.points
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty-programs'] });
      toast.success("Badge awarded!");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const safeLoyalty = Array.isArray(loyaltyPrograms) ? loyaltyPrograms : [];
  const safeReferrals = Array.isArray(referrals) ? referrals : [];
  const safeClients = Array.isArray(clients) ? clients : [];

  const stats = {
    totalMembers: safeLoyalty.length,
    totalLTV: safeLoyalty.reduce((sum, p) => sum + (p.lifetime_value || 0), 0),
    avgLTV: safeLoyalty.length > 0 
      ? safeLoyalty.reduce((sum, p) => sum + (p.lifetime_value || 0), 0) / safeLoyalty.length 
      : 0,
    totalReferrals: safeReferrals.length,
    convertedReferrals: safeReferrals.filter(r => r.status === 'converted').length,
    referralValue: safeReferrals.reduce((sum, r) => sum + (r.conversion_value || 0), 0)
  };

  const tierDistribution = safeLoyalty.reduce((acc, p) => {
    acc[p.tier] = (acc[p.tier] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1929] via-[#0d1f3c] to-[#0a1929] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Zap className="w-8 h-8 text-amber-400" />
            Growth Engine
          </h1>
          <p className="text-white/60">Loyalty rewards, referral tracking, and gamification</p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
            <CardContent className="p-6 text-center">
              <Trophy className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white mb-1">{stats.totalMembers}</p>
              <p className="text-white/60 text-sm">Loyalty Members</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
            <CardContent className="p-6 text-center">
              <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white mb-1">${stats.totalLTV.toLocaleString()}</p>
              <p className="text-white/60 text-sm">Total Lifetime Value</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white mb-1">{stats.convertedReferrals}</p>
              <p className="text-white/60 text-sm">Referral Conversions</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white mb-1">${stats.avgLTV.toLocaleString()}</p>
              <p className="text-white/60 text-sm">Avg LTV per Client</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="leaderboard" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="tiers">Loyalty Tiers</TabsTrigger>
            <TabsTrigger value="badges">Badges & Achievements</TabsTrigger>
            <TabsTrigger value="referrals">Referral Network</TabsTrigger>
          </TabsList>

          {/* Leaderboard */}
          <TabsContent value="leaderboard">
            <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  Top Clients by Lifetime Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {safeLoyalty.slice(0, 10).map((program, idx) => {
                    const client = safeClients.find(c => c.id === program.client_id);
                    if (!client) return null;

                    const tier = tierConfig[program.tier];
                    // Calculate progress to next tier if needed for display, otherwise `progress` is unused here.
                    // const progress = (program.total_spent / tier.minSpend) * 100;

                    return (
                      <div
                        key={program.id}
                        className={`p-4 rounded-lg border ${tier.borderColor} ${tier.bgColor} cursor-pointer hover:scale-[1.02] transition-all`}
                        onClick={() => setSelectedClient(program)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center text-white font-bold text-lg`}>
                            {idx + 1}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-white font-medium">{client.name}</h4>
                              <Badge className={`${tier.bgColor} ${tier.textColor} capitalize`}>
                                {tier.name}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-white/60">
                              <span>{program.jobs_completed || 0} jobs</span>
                              <span>•</span>
                              <span>{program.referrals_made || 0} referrals</span>
                              <span>•</span>
                              <span>{program.points || 0} points</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-400">
                              ${(program.lifetime_value || 0).toLocaleString()}
                            </p>
                            <p className="text-white/50 text-xs">Lifetime Value</p>
                          </div>
                        </div>

                        {(program.badges || []).length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {(program.badges || []).slice(0, 3).map((badge, i) => (
                              <Badge key={i} className="bg-amber-500/20 text-amber-400 text-xs">
                                <Award className="w-3 h-3 mr-1" />
                                {badge.badge_name}
                              </Badge>
                            ))}
                            {(program.badges || []).length > 3 && (
                              <Badge className="bg-white/10 text-white/60 text-xs">
                                +{(program.badges || []).length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Loyalty Tiers */}
          <TabsContent value="tiers">
            <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(tierConfig).map(([tierKey, tier]) => {
                const count = tierDistribution[tierKey] || 0;
                
                return (
                  <Card key={tierKey} className={`bg-gradient-to-br ${tier.bgColor} border ${tier.borderColor}`}>
                    <CardHeader>
                      <CardTitle className={`${tier.textColor} flex items-center gap-2`}>
                        <Crown className="w-6 h-6" />
                        {tier.name} Tier
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-white/70 text-sm">Current Members</span>
                          <span className="text-2xl font-bold text-white">{count}</span>
                        </div>

                        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                          <p className="text-white/60 text-xs mb-2">Minimum Spend</p>
                          <p className="text-white font-bold text-lg">
                            ${tier.minSpend.toLocaleString()}
                          </p>
                        </div>

                        <div>
                          <p className="text-white/70 text-sm mb-2">Benefits:</p>
                          <ul className="space-y-1">
                            {tier.benefits.map((benefit, i) => (
                              <li key={i} className="text-white/80 text-sm flex items-start gap-2">
                                <ChevronRight className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Badges */}
          <TabsContent value="badges">
            <Card className="bg-[#0a1929]/60 backdrop-blur border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-400" />
                  Available Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {badgeDefinitions.map(badge => {
                    const Icon = badge.icon;
                    const earnedCount = safeLoyalty.filter(p => 
                      (p.badges || []).find(b => b.badge_name === badge.name)
                    ).length;

                    return (
                      <div
                        key={badge.name}
                        className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-bold">{badge.name}</h4>
                            <p className="text-white/60 text-sm">{badge.requirement}</p>
                          </div>
                          <Badge className="bg-amber-500/20 text-amber-400">
                            +{badge.points} pts
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/50">{earnedCount} clients earned</span>
                          <span className="text-purple-400 font-medium">Active</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Referral Network */}
          <TabsContent value="referrals">
            <Card className="bg-[#0a1929]/60 backdrop-blur border-green-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-400" />
                  Referral Network Visualization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {safeReferrals.map(referral => {
                    const referrer = safeClients.find(c => c.id === referral.referrer_client_id);
                    const statusColors = {
                      pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
                      contacted: "bg-blue-500/20 text-blue-400 border-blue-500/30",
                      converted: "bg-green-500/20 text-green-400 border-green-500/30",
                      declined: "bg-red-500/20 text-red-400 border-red-500/30"
                    };

                    return (
                      <div
                        key={referral.id}
                        className="p-4 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                                <Users className="w-4 h-4 text-white" />
                              </div>
                              <ChevronRight className="w-4 h-4 text-white/40" />
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                              </div>
                            </div>
                            <p className="text-white font-medium text-sm mb-1">
                              {referrer?.name || referral.referrer_name} → {referral.referred_name}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-white/60">
                              <Badge className={statusColors[referral.status]}>
                                {referral.status}
                              </Badge>
                              {referral.conversion_value && (
                                <span className="text-green-400 font-medium">
                                  +${referral.conversion_value.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>

                          {referral.reward_type !== 'none' && referral.reward_claimed && (
                            <Badge className="bg-amber-500/20 text-amber-400">
                              <Gift className="w-3 h-3 mr-1" />
                              Reward Claimed
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {safeReferrals.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
                      <p className="text-white/60">No referrals tracked yet</p>
                      <p className="text-white/40 text-sm mt-2">Start tracking referrals to build your network</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Client Detail Modal */}
        {selectedClient && (
          <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
            <DialogContent className="max-w-2xl bg-[#0a1929] border-purple-500/30">
              <DialogHeader>
                <DialogTitle className="text-white text-2xl">
                  {safeClients.find(c => c.id === selectedClient.client_id)?.name}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Current Tier */}
                <div className={`p-6 rounded-lg border ${tierConfig[selectedClient.tier].borderColor} ${tierConfig[selectedClient.tier].bgColor}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Crown className={`w-8 h-8 ${tierConfig[selectedClient.tier].textColor}`} />
                      <div>
                        <h3 className="text-white font-bold text-xl">{tierConfig[selectedClient.tier].name} Tier</h3>
                        <p className="text-white/60 text-sm">{selectedClient.points || 0} points earned</p>
                      </div>
                    </div>
                    <Badge className="bg-amber-500/20 text-amber-400 text-lg px-4 py-2">
                      ${(selectedClient.lifetime_value || 0).toLocaleString()}
                    </Badge>
                  </div>

                  {/* Progress to Next Tier */}
                  {selectedClient.tier !== 'platinum' && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/70 text-sm">Progress to next tier</span>
                        <span className="text-white/70 text-sm">
                          ${(selectedClient.total_spent || 0).toLocaleString()} / ${tierConfig[
                            selectedClient.tier === 'bronze' ? 'silver' :
                            selectedClient.tier === 'silver' ? 'gold' : 'platinum'
                          ].minSpend.toLocaleString()}
                        </span>
                      </div>
                      <Progress 
                        value={((selectedClient.total_spent || 0) / tierConfig[
                          selectedClient.tier === 'bronze' ? 'silver' :
                          selectedClient.tier === 'silver' ? 'gold' : 'platinum'
                        ].minSpend) * 100} 
                        className="h-2" 
                      />
                    </div>
                  )}
                </div>

                {/* Badges Earned */}
                {(selectedClient.badges || []).length > 0 && (
                  <div>
                    <h4 className="text-white font-medium mb-3">Badges Earned</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {(selectedClient.badges || []).map((badge, i) => {
                        const badgeDef = badgeDefinitions.find(b => b.name === badge.badge_name);
                        const Icon = badgeDef?.icon || Award;

                        return (
                          <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/10">
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className="w-4 h-4 text-amber-400" />
                              <span className="text-white font-medium text-sm">{badge.badge_name}</span>
                            </div>
                            <p className="text-white/50 text-xs">
                              {format(new Date(badge.earned_at), 'MMM d, yyyy')}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-white/5 rounded-lg text-center">
                    <p className="text-2xl font-bold text-white">{selectedClient.jobs_completed || 0}</p>
                    <p className="text-white/60 text-xs">Jobs</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg text-center">
                    <p className="text-2xl font-bold text-white">{selectedClient.referrals_made || 0}</p>
                    <p className="text-white/60 text-xs">Referrals</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg text-center">
                    <p className="text-2xl font-bold text-white">${(selectedClient.total_spent || 0).toLocaleString()}</p>
                    <p className="text-white/60 text-xs">Total Spent</p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
