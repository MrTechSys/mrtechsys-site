
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Send, Eye, CheckCircle, Receipt, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

export default function QuoteFunnel({ quotes = [], invoices = [] }) {
  const safeQuotes = quotes || [];
  const safeInvoices = invoices || [];
  
  const stages = [
    { 
      id: 'draft', 
      label: 'New', 
      icon: FileText, 
      color: 'from-gray-500 to-gray-600',
      count: safeQuotes.filter(q => q?.status === 'draft').length
    },
    { 
      id: 'sent', 
      label: 'Sent', 
      icon: Send, 
      color: 'from-blue-500 to-blue-600',
      count: safeQuotes.filter(q => q?.status === 'sent').length
    },
    { 
      id: 'viewed', 
      label: 'Viewed', 
      icon: Eye, 
      color: 'from-purple-500 to-purple-600',
      count: safeQuotes.filter(q => q?.status === 'viewed').length
    },
    { 
      id: 'accepted', 
      label: 'Accepted', 
      icon: CheckCircle, 
      color: 'from-green-500 to-green-600',
      count: safeQuotes.filter(q => q?.status === 'accepted').length
    },
    { 
      id: 'invoiced', 
      label: 'Invoiced', 
      icon: Receipt, 
      color: 'from-amber-500 to-orange-500',
      count: safeInvoices.filter(i => i?.quote_id && i?.status !== 'paid').length
    },
    { 
      id: 'paid', 
      label: 'Paid', 
      icon: DollarSign, 
      color: 'from-emerald-500 to-emerald-600',
      count: safeInvoices.filter(i => i?.quote_id && i?.status === 'paid').length
    }
  ];

  const totalQuotes = safeQuotes.length;
  const acceptedQuotes = safeQuotes.filter(q => q?.status === 'accepted').length;
  const conversionRate = totalQuotes > 0 ? (acceptedQuotes / totalQuotes) * 100 : 0;

  // Calculate total value at each stage
  const getValue = (stage) => {
    let value = 0;
    switch (stage.id) {
      case 'draft':
      case 'sent':
      case 'viewed':
      case 'accepted':
        value = safeQuotes
          .filter(q => q?.status === stage.id)
          .reduce((sum, q) => sum + (q?.total || 0), 0);
        break;
      case 'invoiced':
        value = safeInvoices
          .filter(i => i?.quote_id && i?.status !== 'paid')
          .reduce((sum, i) => sum + (i?.total || 0), 0);
        break;
      case 'paid':
        value = safeInvoices
          .filter(i => i?.quote_id && i?.status === 'paid')
          .reduce((sum, i) => sum + (i?.total || 0), 0);
        break;
    }
    return value;
  };

  return (
    <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            Quote-to-Cash Funnel
          </CardTitle>
          <Badge className={`${
            conversionRate >= 50 ? 'bg-green-100 text-green-800' :
            conversionRate >= 30 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {conversionRate.toFixed(0)}% conversion
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const value = getValue(stage);
            const maxCount = Math.max(...stages.map(s => s.count));
            const width = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
            
            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stage.color} flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-white">{stage.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-white/10 text-white">{stage.count}</Badge>
                    {value > 0 && (
                      <span className="text-sm font-semibold text-amber-400">
                        ${value.toFixed(0)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${width}%` }}
                    transition={{ delay: idx * 0.1 + 0.2, duration: 0.8 }}
                    className={`h-2 bg-gradient-to-r ${stage.color} rounded-full`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="p-3 bg-white/5 rounded-lg border border-amber-500/20">
            <p className="text-xs text-white/60">Pipeline Value</p>
            <p className="text-lg font-bold text-white mt-1">
              ${safeQuotes.reduce((sum, q) => sum + (q?.total || 0), 0).toFixed(0)}
            </p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg border border-green-500/20">
            <p className="text-xs text-white/60">Revenue (Paid)</p>
            <p className="text-lg font-bold text-green-400 mt-1">
              ${getValue(stages[5]).toFixed(0)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
