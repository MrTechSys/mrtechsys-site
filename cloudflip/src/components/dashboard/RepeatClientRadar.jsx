
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Award, Gift, TrendingUp, Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function RepeatClientRadar({ clients = [], invoices = [] }) {
  const safeClients = clients || [];
  const safeInvoices = invoices || [];
  
  // Calculate repeat clients
  const clientStats = safeClients.map(client => {
    const clientInvoices = safeInvoices.filter(inv => inv?.client_id === client?.id);
    const paidInvoices = clientInvoices.filter(inv => inv?.status === 'paid');
    const totalSpent = paidInvoices.reduce((sum, inv) => sum + (inv?.total || 0), 0);
    
    return {
      ...client,
      jobCount: paidInvoices.length,
      totalSpent,
      lastJob: paidInvoices.length > 0 
        ? new Date(Math.max(...paidInvoices.map(inv => new Date(inv?.created_date || Date.now()))))
        : null
    };
  });

  // Get top repeat clients
  const repeatClients = clientStats
    .filter(c => c.jobCount >= 2)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  const loyaltyTiers = {
    bronze: { min: 2, max: 3, color: 'bg-orange-100 text-orange-800', icon: Award },
    silver: { min: 4, max: 6, color: 'bg-gray-100 text-gray-800', icon: Award },
    gold: { min: 7, max: Infinity, color: 'bg-yellow-100 text-yellow-800', icon: Award }
  };

  const getTier = (jobCount) => {
    if (jobCount >= loyaltyTiers.gold.min) return { name: 'Gold', ...loyaltyTiers.gold };
    if (jobCount >= loyaltyTiers.silver.min) return { name: 'Silver', ...loyaltyTiers.silver };
    return { name: 'Bronze', ...loyaltyTiers.bronze };
  };

  if (repeatClients.length === 0) {
    return (
      <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            Repeat Client Radar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-white/40 mx-auto mb-3" />
            <p className="text-white/60 text-sm">No repeat clients yet</p>
            <p className="text-white/40 text-xs mt-1">Focus on delivering great service!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            Repeat Client Radar
            <Badge className="bg-green-500/20 text-green-400 ml-2">{repeatClients.length}</Badge>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {repeatClients.map((client, idx) => {
            const tier = getTier(client?.jobCount || 0);
            const TierIcon = tier.icon;
            const clientName = client?.name || 'Unknown Client';
            
            return (
              <motion.div
                key={client?.id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 rounded-lg bg-white/5 border border-amber-500/20 hover:border-amber-500/40 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {clientName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-white">{clientName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={tier.color + ' text-xs'}>
                          <TierIcon className="w-3 h-3 mr-1" />
                          {tier.name}
                        </Badge>
                        <span className="text-xs text-white/60">
                          {client?.jobCount || 0} jobs
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-amber-400">
                      ${(client?.totalSpent || 0).toFixed(0)}
                    </p>
                    <p className="text-xs text-white/60">lifetime value</p>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-3 border-t border-white/10">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-amber-500/30 text-white hover:bg-amber-500/10"
                  >
                    <Gift className="w-3 h-3 mr-1" />
                    Send Reward
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-amber-500/30 text-white hover:bg-amber-500/10"
                  >
                    <Mail className="w-3 h-3 mr-1" />
                    Upsell
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-blue-300 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span className="font-medium">
              {safeClients.length > 0 ? Math.round((repeatClients.length / safeClients.length) * 100) : 0}% repeat client rate
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
