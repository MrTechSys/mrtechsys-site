
import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Zap,
  Crown,
  ArrowRight,
  Sparkles,
  Rocket,
  Users,
  Star,
  CreditCard,
  DollarSign,
  Loader2,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label"; // Ensure Label is imported

const plans = [
  {
    name: "Demo",
    price: "$0",
    period: "forever",
    icon: Sparkles,
    tagline: "Test Drive CloudFlip",
    color: "from-gray-500 to-gray-600",
    features: [
      "Branded onboarding experience",
      "Sample quote flow (read-only)",
      "Dashboard preview with dummy data",
      "Explore all features in demo mode",
      "Upgrade prompts throughout",
      "❌ No real-time analytics",
      "❌ No live presence tracking"
    ],
    polling: {
      realtime: "Disabled",
      operational: "1 hour",
      aggregates: "6 hours"
    }
  },
  {
    name: "Starter",
    price: "$20",
    period: "per month",
    icon: Zap,
    tagline: "Perfect for Solo Pros",
    color: "from-blue-500 to-blue-600",
    features: [
      "Full onboarding journey",
      "Manual lead entry + CSV import",
      "Quote generator with templates",
      "Invoice creation & tracking",
      "Basic metrics dashboard",
      "Email notifications",
      "Up to 100 leads/month",
      "📊 Analytics refresh: 30 min",
      "⚡ 10k live events/month",
      "❌ No live presence tracking"
    ],
    polling: {
      realtime: "30 minutes",
      operational: "30 minutes",
      aggregates: "6 hours"
    },
    quotas: {
      live_events: "10,000/month",
      presence_syncs: "Disabled"
    }
  },
  {
    name: "Pro",
    price: "$50",
    period: "per month",
    icon: Rocket,
    tagline: "Scale Your Business",
    color: "from-purple-500 to-pink-600",
    features: [
      "Everything in Starter, plus:",
      "CRM pipeline (drag-and-drop)",
      "Stripe payment integration",
      "Branded landing page builder",
      "Lead source tagging",
      "Quote status tracking",
      "Advanced job scheduling",
      "Up to 500 leads/month",
      "📊 Analytics refresh: 15 min",
      "⚡ 50k live events/month",
      "❌ No live presence tracking",
      "Priority email support"
    ],
    popular: true,
    polling: {
      realtime: "15 minutes",
      operational: "15 minutes",
      aggregates: "1 hour"
    },
    quotas: {
      live_events: "50,000/month",
      presence_syncs: "Disabled"
    }
  },
  {
    name: "Partner",
    price: "$100",
    period: "per month",
    icon: Users,
    tagline: "Automate & Accelerate",
    color: "from-amber-500 to-orange-600",
    features: [
      "Everything in Pro, plus:",
      "Facebook/Instagram/Nextdoor sync",
      "AI-powered quote suggestions",
      "Agent inbox (single user)",
      "Smart reminders & follow-ups",
      "Sentiment analysis",
      "Privacy center & consent mgmt",
      "Unlimited leads",
      "📊 Analytics refresh: 5 min",
      "⚡ 200k live events/month",
      "✅ Live presence tracking enabled",
      "Phone support"
    ],
    polling: {
      realtime: "5 minutes",
      operational: "5 minutes",
      aggregates: "30 minutes"
    },
    quotas: {
      live_events: "200,000/month",
      presence_syncs: "50,000/month"
    }
  },
  {
    name: "Elite",
    price: "$200",
    period: "per month",
    icon: Crown,
    tagline: "White-Label Powerhouse",
    color: "from-yellow-500 to-amber-600",
    features: [
      "Everything in Partner, plus:",
      "White-label branding (remove CloudFlip)",
      "Custom domain support",
      "Multi-agent routing",
      "Team collaboration dashboard",
      "Full REST API access",
      "Advanced analytics & forecasting",
      "Recurring job templates",
      "Contract builder",
      "Client approval portal",
      "Automated workflows",
      "Plugin Hub access",
      "📊 True real-time (5-30 sec)",
      "⚡ Unlimited live events",
      "✅ Advanced presence tracking",
      "Dedicated account manager"
    ],
    polling: {
      realtime: "5 seconds",
      operational: "30 seconds",
      aggregates: "15 minutes"
    },
    quotas: {
      live_events: "Unlimited",
      presence_syncs: "Unlimited"
    }
  }
];

const paymentGateways = [
  {
    id: 'stripe',
    name: 'Stripe',
    icon: CreditCard,
    color: 'from-blue-500 to-purple-600',
    description: 'Credit cards, ACH, digital wallets',
    available: true
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: DollarSign,
    color: 'from-blue-600 to-blue-400',
    description: 'PayPal balance, cards, bank accounts',
    available: false,
    comingSoon: true
  },
  {
    id: 'square',
    name: 'Square',
    icon: CreditCard,
    color: 'from-gray-700 to-gray-500',
    description: 'In-person and online payments',
    available: false,
    comingSoon: true
  }
];

export default function Billing() {
  const [currentPlan, setCurrentPlan] = useState("demo");
  const [isMrTechSys, setIsMrTechSys] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlanToUpgrade, setSelectedPlanToUpgrade] = useState(null);
  const [selectedGateway, setSelectedGateway] = useState("stripe");
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await api.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };
    loadUser();
  }, []);

  const { data: subscriptions = [], isLoading: isLoadingSubs } = useQuery({
    queryKey: ['subscriptions', user?.current_org_id],
    queryFn: async () => {
      try {
        const currentUser = await api.auth.me();
        if (!currentUser?.current_org_id) return [{ plan: 'demo', status: 'active' }];
        
        if (currentUser.email === 'support@mrtechsys.com' || currentUser.role === 'admin') {
          setIsMrTechSys(true);
          setCurrentPlan('elite');
          return [{ plan: 'elite', status: 'active' }];
        }
        
        const subs = await api.entities.BillingSubscription.filter({
          org_id: currentUser.current_org_id
        });
        return subs.length > 0 ? subs : [{ plan: 'demo', status: 'active' }];
      } catch (error) {
        console.error('Error loading subscriptions:', error);
        return [{ plan: 'demo', status: 'active' }];
      }
    },
    enabled: !!user?.current_org_id,
    retry: 1,
    retryDelay: 1000
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['billing-invoices', user?.current_org_id],
    queryFn: async () => {
      try {
        if (!user?.current_org_id) return [];
        return await api.entities.Invoice.filter({
          org_id: user.current_org_id
        }, '-created_date', 50);
      } catch (error) {
        console.error('Error loading invoices:', error);
        return [];
      }
    },
    enabled: !!user?.current_org_id,
    retry: 1
  });

  const { data: usageEvents = [] } = useQuery({
    queryKey: ['usage-events', user?.current_org_id],
    queryFn: async () => {
      try {
        if (!user?.current_org_id) return [];
        const period = new Date().toISOString().slice(0, 7);
        return await api.entities.UsageEvent.filter({
          org_id: user.current_org_id,
          period: period
        });
      } catch (error) {
        console.error('Error loading usage:', error);
        return [];
      }
    },
    enabled: !!user?.current_org_id,
    retry: 1
  });

  useEffect(() => {
    if (subscriptions.length > 0 && !isMrTechSys) {
      setCurrentPlan(subscriptions[0]?.plan || 'demo');
    }
  }, [subscriptions, isMrTechSys]);

  const handleUpgrade = (plan) => {
    setSelectedPlanToUpgrade(plan);
    setShowPaymentModal(true);
  };

  const connectGatewayMutation = useMutation({
    mutationFn: async (gateway) => {
      if (gateway === 'stripe') {
        const { data } = await api.functions.invoke('oauthStripe', {
          action: 'connect'
        });
        return data;
      } else {
        throw new Error('Gateway not yet implemented');
      }
    },
    onSuccess: (data) => {
      if (data?.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        toast.success("Payment gateway connected!");
        queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      }
    },
    onError: (error) => {
      toast.error(error.message || "Integration coming soon!");
    }
  });

  // Calculate revenue metrics
  const totalRevenue = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + (inv.total || 0), 0);

  const monthlyRevenue = invoices
    .filter(inv => {
      const invDate = new Date(inv.created_date);
      const thisMonth = new Date();
      return inv.status === 'paid' && 
             invDate.getMonth() === thisMonth.getMonth() &&
             invDate.getFullYear() === thisMonth.getFullYear();
    })
    .reduce((sum, inv) => sum + (inv.total || 0), 0);

  const avgDealValue = invoices.length > 0 ? totalRevenue / invoices.length : 0;

  // Revenue trend data
  const revenueData = invoices
    .filter(inv => inv.status === 'paid')
    .slice(0, 12)
    .reverse()
    .map(inv => ({
      month: format(new Date(inv.created_date), 'MMM'),
      revenue: inv.total
    }));

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-white">Choose Your <span className="text-amber-400">Plan</span></h1>
        <p className="text-white/80 mt-3 text-lg">
          Scale your <span className="text-amber-400">business</span> with the right <span className="text-amber-400">tools</span>
        </p>
        {isMrTechSys && (
          <div className="mt-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-lg p-4">
            <p className="text-amber-400 font-semibold">
              👑 MrTechSys Owner Access - Elite Plan Enabled for Testing
            </p>
          </div>
        )}
      </div>

      {/* Revenue Analytics */}
      {!isMrTechSys && invoices.length > 0 && (
        <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <Card className="bg-[#0a1929]/60 backdrop-blur border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-xs mb-1">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-green-400">
                    ${monthlyRevenue.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0a1929]/60 backdrop-blur border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-xs mb-1">Total Lifetime Value</p>
                  <p className="text-2xl font-bold text-blue-400">
                    ${totalRevenue.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-400/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0a1929]/60 backdrop-blur border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-xs mb-1">Avg Deal Value</p>
                  <p className="text-2xl font-bold text-purple-400">
                    ${avgDealValue.toLocaleString()}
                  </p>
                </div>
                <Star className="w-8 h-8 text-purple-400/50" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Revenue Chart */}
      {revenueData.length > 0 && (
        <Card className="max-w-4xl mx-auto bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white">Subscription Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="month" stroke="#fff" tick={{ fontSize: 11 }} />
                <YAxis stroke="#fff" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #f59e0b' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* API Usage & Optimization Info */}
      <Card className="max-w-4xl mx-auto bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-400" />
            API Usage & Performance Tiers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-lg border border-cyan-500/20">
              <h4 className="text-cyan-400 font-semibold mb-2">💡 Smart Batching Enabled</h4>
              <p className="text-white/70 text-sm">
                Telemetry events are automatically batched every 30 minutes, reducing API calls by 95%
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg border border-purple-500/20">
              <h4 className="text-purple-400 font-semibold mb-2">⚡ Tiered Polling</h4>
              <p className="text-white/70 text-sm">
                Dashboard refresh rates scale with your plan - upgrade for faster updates
              </p>
            </div>
          </div>
          
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-amber-400 text-sm">
              <strong>Usage-Based Billing:</strong> Live events beyond your plan quota are charged at $0.0001 per event
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-[1800px] mx-auto">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = plan.name.toLowerCase() === currentPlan.toLowerCase();
          
          return (
            <Card
              key={plan.name}
              className={`relative bg-[#0a1929]/60 backdrop-blur border-amber-500/20 transition-all hover:border-amber-500/40 ${
                plan.popular ? 'border-2 border-purple-500 shadow-xl shadow-purple-500/20 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-purple-600 text-white px-4 py-1 font-bold shadow-lg">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              {isCurrentPlan && (
                <div className="absolute -top-4 right-4">
                  <Badge className="bg-green-600 text-white px-3 py-1 font-bold shadow-lg">
                    {isMrTechSys && plan.name === 'Elite' ? 'Testing' : 'Current'}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-6">
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${plan.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                <p className="text-xs text-amber-400 font-medium mt-1">{plan.tagline}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-amber-400">{plan.price}</span>
                  <span className="text-white/60 ml-2">/ {plan.period}</span>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6 min-h-[400px]">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      {feature.startsWith('❌') ? (
                        <span className="text-red-400 text-sm">{feature}</span>
                      ) : feature.startsWith('✅') ? (
                        <span className="text-green-400 text-sm">{feature}</span>
                      ) : (
                        <>
                          <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-white/80">{feature}</span>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
                
                {/* Polling & Quota Info */}
                {plan.polling && (
                  <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10 space-y-2">
                    <p className="text-white/60 text-xs font-semibold">Performance Tier:</p>
                    <div className="space-y-1 text-xs text-white/70">
                      <div className="flex justify-between">
                        <span>Real-time:</span>
                        <span className="text-cyan-400">{plan.polling.realtime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Operational:</span>
                        <span className="text-blue-400">{plan.polling.operational}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Aggregates:</span>
                        <span className="text-purple-400">{plan.polling.aggregates}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <Button
                  disabled={isCurrentPlan}
                  onClick={() => handleUpgrade(plan)}
                  className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isCurrentPlan ? 'Current Plan' : plan.name === 'Demo' ? 'Try Demo' : 'Upgrade'}
                  {!isCurrentPlan && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payment Gateways */}
      <Card className="max-w-4xl mx-auto bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {paymentGateways.map((gateway) => {
            const Icon = gateway.icon;
            return (
              <div
                key={gateway.id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-amber-500/20"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 bg-gradient-to-br ${gateway.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium">{gateway.name}</p>
                      {gateway.comingSoon && (
                        <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                          Coming Soon
                        </Badge>
                      )}
                    </div>
                    <p className="text-white/60 text-sm">{gateway.description}</p>
                  </div>
                </div>
                <Button
                  onClick={() => connectGatewayMutation.mutate(gateway.id)}
                  disabled={!gateway.available || connectGatewayMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-purple-500"
                >
                  {connectGatewayMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    gateway.available ? 'Connect' : 'Notify Me'
                  )}
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Billing History */}
      {invoices.length > 0 && (
        <Card className="max-w-4xl mx-auto bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-400" />
              Billing History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {invoices.slice(0, 5).map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex-1">
                    <p className="text-white font-medium">{invoice.number}</p>
                    <p className="text-white/60 text-xs">
                      {invoice.created_date && format(new Date(invoice.created_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-green-400 font-bold">${invoice.total?.toLocaleString()}</p>
                    <Badge className={
                      invoice.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                      invoice.status === 'overdue' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }>
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage This Month */}
      <Card className="max-w-4xl mx-auto bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
        <CardHeader>
          <CardTitle className="text-white">Usage This <span className="text-amber-400">Month</span></CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-white/60 mb-1">Quotes Created</div>
              <div className="text-2xl font-bold text-white mt-1">
                {usageEvents.filter(e => e.event === 'quote.create').length} / {
                  currentPlan === 'demo' ? '5 (demo)' :
                  currentPlan === 'starter' ? '50' : 
                  currentPlan === 'pro' ? '300' : 'Unlimited'
                }
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{width: '0%'}} />
              </div>
            </div>
            <div>
              <div className="text-sm text-white/60 mb-1">Leads This Month</div>
              <div className="text-2xl font-bold text-white mt-1">
                {usageEvents.filter(e => e.event === 'lead.import').reduce((sum, e) => sum + (e.quantity || 1), 0)} / {
                  currentPlan === 'demo' ? '10 (demo)' :
                  currentPlan === 'starter' ? '100' :
                  currentPlan === 'pro' ? '500' : 'Unlimited'
                }
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                <div className="bg-green-500 h-2 rounded-full" style={{width: '0%'}} />
              </div>
            </div>
            <div>
              <div className="text-sm text-white/60 mb-1">AI Tokens Used</div>
              <div className="text-2xl font-bold text-white mt-1">
                {usageEvents.filter(e => e.event === 'ai.tokens').reduce((sum, e) => sum + (e.quantity || 0), 0)}
              </div>
              <div className="text-xs text-white/50 mt-1">
                {currentPlan === 'demo' || currentPlan === 'starter' || currentPlan === 'pro' ? 
                  'Partner plan required' : 'Unlimited'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Sales CTA */}
      <Card className="max-w-4xl mx-auto bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-2 border-amber-500/30 backdrop-blur">
        <CardContent className="p-8 text-center">
          <Crown className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">
            Need help choosing a <span className="text-amber-400">plan</span>?
          </h3>
          <p className="text-white/70 mb-6">
            Our team is here to help you find the perfect fit for your business
          </p>
          <div className="flex justify-center gap-3">
            <Link to={createPageUrl("ContactUs")}>
              <Button size="lg" className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold">
                Contact Sales
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="bg-[#0a1929] border-amber-500/30">
          <DialogHeader>
            <DialogTitle className="text-white">Upgrade to {selectedPlanToUpgrade?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="text-white font-medium mb-2">Selected Plan: {selectedPlanToUpgrade?.name}</p>
              <p className="text-amber-400 text-2xl font-bold">
                {selectedPlanToUpgrade?.price}
                <span className="text-white/60 text-base ml-2">/ {selectedPlanToUpgrade?.period}</span>
              </p>
            </div>

            <div>
              <Label className="text-white mb-2">Select Payment Method</Label>
              <Select value={selectedGateway} onValueChange={setSelectedGateway}>
                <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentGateways.map(gw => (
                    <SelectItem key={gw.id} value={gw.id} disabled={!gw.available}>
                      {gw.name} {gw.comingSoon ? '(Coming Soon)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <p className="text-purple-400 text-sm">
                <Sparkles className="w-4 h-4 inline mr-2" />
                <strong>Payment integration active!</strong> Connect your payment gateway to enable automatic billing.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPaymentModal(false)}
              className="border-amber-500/30 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Link to={createPageUrl("ContactUs")}>
              <Button className="bg-gradient-to-r from-amber-600 to-amber-500">
                Contact Sales
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
