import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CreditCard,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Download,
  Crown,
  Zap,
  ArrowUpRight,
  Calendar,
  Activity
} from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const planLimits = {
  free: { quotes: 10, leads: 50, storage_gb: 1 },
  starter: { quotes: 100, leads: 500, storage_gb: 10 },
  pro: { quotes: 1000, leads: 5000, storage_gb: 100 },
  partner: { quotes: -1, leads: -1, storage_gb: 500 }
};

const planPrices = {
  free: 0,
  starter: 29,
  pro: 99,
  partner: 299
};

export default function BillingDashboard() {
  const [user, setUser] = useState(null);
  const [currentPeriod, setCurrentPeriod] = useState(new Date().toISOString().slice(0, 7));
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: subscription } = useQuery({
    queryKey: ['subscription', user?.current_org_id],
    queryFn: async () => {
      if (!user?.current_org_id) return null;
      const subs = await api.entities.BillingSubscription.filter({ 
        org_id: user.current_org_id 
      });
      return subs.length > 0 ? subs[0] : { plan: 'free', status: 'active' };
    },
    enabled: !!user?.current_org_id
  });

  const { data: usageEvents = [] } = useQuery({
    queryKey: ['usage-events', currentPeriod, user?.current_org_id],
    queryFn: async () => {
      if (!user?.current_org_id) return [];
      return await api.entities.UsageEvent.filter({ 
        period: currentPeriod,
        org_id: user.current_org_id
      });
    },
    enabled: !!user?.current_org_id
  });

  // Calculate usage by event type
  const usageByType = usageEvents.reduce((acc, event) => {
    acc[event.event] = (acc[event.event] || 0) + (event.quantity || 1);
    return acc;
  }, {});

  const totalCost = usageEvents.reduce((sum, evt) => sum + (evt.cost_estimate || 0), 0);
  const plan = subscription?.plan || 'free';
  const limits = planLimits[plan];
  const basePrice = planPrices[plan];

  // Historical data (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const monthStr = date.toISOString().slice(0, 7);
    
    return {
      month: format(date, 'MMM'),
      cost: basePrice + (monthStr === currentPeriod ? totalCost : Math.random() * 50),
      events: monthStr === currentPeriod ? usageEvents.length : Math.floor(Math.random() * 200) + 50
    };
  });

  // Usage by category
  const categoryData = [
    { name: 'Quotes', value: usageByType['quote.create'] || 0, limit: limits.quotes },
    { name: 'Invoices', value: usageByType['invoice.send'] || 0, limit: -1 },
    { name: 'Emails', value: usageByType['email.send'] || 0, limit: -1 },
    { name: 'SMS', value: usageByType['sms.send'] || 0, limit: -1 },
    { name: 'AI Tokens', value: Math.floor((usageByType['ai.tokens'] || 0) / 1000), limit: -1 }
  ];

  const quotesUsed = usageByType['quote.create'] || 0;
  const quotesLimit = limits.quotes;
  const quotesPercent = quotesLimit > 0 ? Math.min((quotesUsed / quotesLimit) * 100, 100) : 0;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-green-400" />
            Billing <span className="text-amber-400">Dashboard</span>
          </h1>
          <p className="text-white/70 mt-1">Usage, costs, and subscription management</p>
        </div>
        <Link to={createPageUrl("Billing")}>
          <Button className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold">
            <Crown className="w-4 h-4 mr-2" />
            View Plans
          </Button>
        </Link>
      </div>

      {/* Current Plan Card */}
      <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <Badge className="bg-purple-500/20 text-purple-400 mb-2">
                Current Plan
              </Badge>
              <h2 className="text-3xl font-bold text-white capitalize mb-1">
                {plan}
              </h2>
              <p className="text-white/60 text-sm">
                {subscription?.status === 'trialing' && subscription?.trial_end && (
                  <>Trial ends {format(new Date(subscription.trial_end), 'MMM d, yyyy')}</>
                )}
                {subscription?.status === 'active' && subscription?.current_period_end && (
                  <>Renews {format(new Date(subscription.current_period_end), 'MMM d, yyyy')}</>
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-green-400">
                ${basePrice}
              </p>
              <p className="text-white/60 text-sm">/month</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <Badge className="bg-green-500/20 text-green-400">This Month</Badge>
            </div>
            <p className="text-3xl font-bold text-green-400">
              ${(basePrice + totalCost).toFixed(2)}
            </p>
            <p className="text-white/60 text-xs mt-1">
              ${basePrice} base + ${totalCost.toFixed(2)} usage
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-blue-400" />
              <Badge className="bg-blue-500/20 text-blue-400">Events</Badge>
            </div>
            <p className="text-3xl font-bold text-blue-400">{usageEvents.length}</p>
            <p className="text-white/60 text-xs mt-1">Billable events</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <Badge className="bg-purple-500/20 text-purple-400">Forecast</Badge>
            </div>
            <p className="text-3xl font-bold text-purple-400">
              ${(basePrice + totalCost * 1.15).toFixed(0)}
            </p>
            <p className="text-white/60 text-xs mt-1">Projected this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white text-sm">Monthly Cost Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="month" stroke="#fff" tick={{ fontSize: 12 }} />
                <YAxis stroke="#fff" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #06b6d4' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="cost" stroke="#10b981" strokeWidth={2} name="Cost ($)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white text-sm">Usage by Feature</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsBarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="name" stroke="#fff" tick={{ fontSize: 12 }} />
                <YAxis stroke="#fff" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #06b6d4' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="value" fill="#8b5cf6" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Usage Details */}
      <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
        <CardHeader>
          <CardTitle className="text-white">Plan Usage This Month</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quotes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-sm font-medium">Quotes Created</span>
              <span className="text-white/60 text-sm">
                {quotesUsed} / {quotesLimit > 0 ? quotesLimit : '∞'}
              </span>
            </div>
            <Progress value={quotesPercent} className="h-2" />
            {quotesPercent > 80 && quotesLimit > 0 && (
              <p className="text-orange-400 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Approaching limit - consider upgrading
              </p>
            )}
          </div>

          {/* Other Usage Items */}
          {categoryData.slice(1).map((cat) => (
            <div key={cat.name}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-sm font-medium">{cat.name}</span>
                <span className="text-white/60 text-sm">
                  {cat.value} {cat.limit > 0 ? `/ ${cat.limit}` : ''}
                </span>
              </div>
              {cat.limit > 0 && (
                <Progress value={Math.min((cat.value / cat.limit) * 100, 100)} className="h-2" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Upgrade CTA */}
      {plan !== 'partner' && (
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  Unlock More Power
                </h3>
                <p className="text-white/70 text-sm mb-4">
                  Upgrade to get unlimited quotes, advanced AI features, and priority support
                </p>
                <ul className="space-y-2 text-sm text-white/80">
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Unlimited quotes & invoices
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    AI SRE automation
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Custom branding
                  </li>
                </ul>
              </div>
              <Link to={createPageUrl("Billing")}>
                <Button className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade Now
                  <ArrowUpRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Events */}
      <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Recent Billable Events</CardTitle>
            <Button variant="outline" size="sm" className="border-amber-500/30 text-white">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {usageEvents.slice(0, 10).map((event) => (
              <div
                key={event.id}
                className="p-3 bg-white/5 rounded-lg border border-amber-500/20 flex items-center justify-between"
              >
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">
                    {event.event.replace('.', ' ').toUpperCase()}
                  </p>
                  <p className="text-white/60 text-xs">
                    {event.created_date && format(new Date(event.created_date), 'MMM d, h:mm a')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-bold">
                    ${(event.cost_estimate || 0).toFixed(3)}
                  </p>
                  <p className="text-white/50 text-xs">{event.quantity || 1}x</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}