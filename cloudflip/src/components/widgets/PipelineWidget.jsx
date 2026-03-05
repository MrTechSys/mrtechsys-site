import React from "react";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function PipelineWidget() {
  const { data: leads = [] } = useQuery({
    queryKey: ['pipeline-widget-leads'],
    queryFn: () => api.entities.Lead.list('-created_date', 100)
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['pipeline-widget-contacts'],
    queryFn: () => api.entities.Contact.list('-created_date', 100)
  });

  const allLeads = [...leads, ...contacts];

  const pipelineData = [
    { 
      status: 'new', 
      count: leads.filter(l => l.status === 'new').length + 
             contacts.filter(c => c.lifecycle_stage === 'lead' || c.lifecycle_stage === 'subscriber').length,
      label: 'New'
    },
    { 
      status: 'contacted', 
      count: leads.filter(l => l.status === 'contacted').length + 
             contacts.filter(c => c.lifecycle_stage === 'mql').length,
      label: 'Contacted'
    },
    { 
      status: 'qualified', 
      count: leads.filter(l => l.status === 'qualified').length + 
             contacts.filter(c => c.lifecycle_stage === 'sql' || c.lifecycle_stage === 'opportunity').length,
      label: 'Qualified'
    },
    { 
      status: 'won', 
      count: leads.filter(l => l.status === 'won').length + 
             contacts.filter(c => c.lifecycle_stage === 'customer' || c.lifecycle_stage === 'evangelist').length,
      label: 'Won'
    }
  ];

  return (
    <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-400" />
          Pipeline Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pipelineData.map((stage, idx) => (
            <div key={stage.status}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-white font-medium">{stage.label}</span>
                <span className="text-sm font-bold text-amber-400">{stage.count}</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((stage.count / Math.max(allLeads.length, 1)) * 100, 100)}%` }}
                  transition={{ delay: idx * 0.1, duration: 0.8 }}
                  className="bg-gradient-to-r from-amber-600 to-amber-400 h-2 rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}