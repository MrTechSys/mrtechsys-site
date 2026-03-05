
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Send, Eye, Clock, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function SmartNudges({ quotes = [], invoices = [] }) {
  const nudges = [];

  const safeQuotes = quotes || [];
  const safeInvoices = invoices || [];

  // Quote nudges
  safeQuotes.forEach(quote => {
    if (quote?.status === 'sent' || quote?.status === 'viewed') {
      const daysSinceSent = Math.floor((new Date() - new Date(quote.created_date)) / (1000 * 60 * 60 * 24));
      
      if (daysSinceSent >= 3) {
        nudges.push({
          type: 'quote',
          priority: daysSinceSent >= 7 ? 'high' : 'medium',
          title: `Quote #${quote.number?.slice(-4) || quote.id?.slice(0, 4) || 'N/A'} is ${daysSinceSent} days old`,
          description: quote.status === 'viewed' ? 'Client viewed but hasn\'t accepted' : 'Send a follow-up reminder',
          action: 'Send Reminder',
          value: `$${quote.total?.toFixed(0) || '0'}`,
          icon: Eye,
          color: 'text-purple-400'
        });
      }
    }
  });

  // Invoice nudges
  safeInvoices.forEach(invoice => {
    if (invoice?.status === 'sent' || invoice?.status === 'overdue') {
      const daysSinceSent = Math.floor((new Date() - new Date(invoice.created_date)) / (1000 * 60 * 60 * 24));
      
      if (daysSinceSent >= 7 || invoice.status === 'overdue') {
        nudges.push({
          type: 'invoice',
          priority: invoice.status === 'overdue' ? 'high' : 'medium',
          title: `Invoice #${invoice.number || 'N/A'} ${invoice.status === 'overdue' ? 'is overdue' : 'needs follow-up'}`,
          description: 'Payment reminder recommended',
          action: 'Send Reminder',
          value: `$${invoice.balance_due?.toFixed(0) || invoice.total?.toFixed(0) || '0'}`,
          icon: Clock,
          color: 'text-red-400'
        });
      }
    }
  });

  // Sort by priority
  nudges.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  if (nudges.length === 0) {
    return (
      <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            Smart Nudges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-white font-medium">All caught up!</p>
            <p className="text-white/60 text-sm">No follow-ups needed right now</p>
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
            <Bell className="w-5 h-5 text-amber-400" />
            Smart Nudges
            <Badge className="bg-amber-500/20 text-amber-400 ml-2">{nudges.length}</Badge>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {nudges.slice(0, 5).map((nudge, idx) => {
            const Icon = nudge.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-4 rounded-lg border transition-all ${
                  nudge.priority === 'high' 
                    ? 'bg-red-500/10 border-red-500/30' 
                    : 'bg-white/5 border-amber-500/20'
                } hover:border-amber-500/40`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <Icon className={`w-5 h-5 ${nudge.color} mt-0.5`} />
                    <div className="flex-1">
                      <p className="font-medium text-white text-sm">{nudge.title}</p>
                      <p className="text-xs text-white/60 mt-1">{nudge.description}</p>
                      {nudge.value && (
                        <Badge className="mt-2 bg-amber-500/20 text-amber-400 text-xs">
                          {nudge.value}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
                  >
                    <Send className="w-3 h-3 mr-1" />
                    {nudge.action}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
