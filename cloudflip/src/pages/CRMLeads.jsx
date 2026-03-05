import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, DollarSign, Clock, Zap, Mail, Phone, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import CommentThread from "../components/CommentThread";
import AIActionSuggestions from "../components/AIActionSuggestions";
import TeamActivityFeed from "../components/TeamActivityFeed";

const stages = [
  { id: "new", label: "New", headerGradient: "from-blue-500 to-blue-600", badgeColorClass: "bg-blue-500" },
  { id: "contacted", label: "Contacted", headerGradient: "from-purple-500 to-purple-600", badgeColorClass: "bg-purple-500" },
  { id: "qualified", label: "Qualified", headerGradient: "from-yellow-500 to-yellow-600", badgeColorClass: "bg-yellow-500" },
  { id: "won", label: "Won", headerGradient: "from-green-500 to-green-600", badgeColorClass: "bg-green-500" },
  { id: "lost", label: "Lost", headerGradient: "from-gray-500 to-gray-600", badgeColorClass: "bg-gray-500" }
];

export default function CRMLeads() {
  const queryClient = useQueryClient();
  const [selectedLead, setSelectedLead] = useState(null);

  const { data: leads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ['crm-leads'],
    queryFn: () => api.entities.Lead.list('-created_date'),
  });

  const { data: contacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ['crm-contacts'],
    queryFn: () => api.entities.Contact.list('-created_date'),
  });

  const isLoading = leadsLoading || contactsLoading;

  // Convert contacts to lead format for pipeline display
  const contactsAsLeads = contacts.map(contact => ({
    id: contact.id,
    name: `${contact.first_name} ${contact.last_name}`,
    email: contact.email,
    company: contact.company,
    stage: contact.lifecycle_stage === 'lead' || contact.lifecycle_stage === 'subscriber' ? 'new' :
           contact.lifecycle_stage === 'mql' ? 'contacted' :
           contact.lifecycle_stage === 'sql' || contact.lifecycle_stage === 'opportunity' ? 'qualified' :
           contact.lifecycle_stage === 'customer' || contact.lifecycle_stage === 'evangelist' ? 'won' : 'new',
    score: contact.sentiment_score ? Math.round((contact.sentiment_score + 1) * 50) : 50,
    expected_value: 0,
    ai_summary: contact.notes,
    source: 'crm',
    _type: 'contact'
  }));

  // Combine leads and contacts
  const allLeads = [...leads, ...contactsAsLeads];

  const updateLeadMutation = useMutation({
    mutationFn: ({ id, data, type }) => {
      if (type === 'contact') {
        const lifecycle_stage =
          data.stage === 'new' ? 'lead' :
          data.stage === 'contacted' ? 'mql' :
          data.stage === 'qualified' ? 'sql' :
          data.stage === 'won' ? 'customer' :
          'lead';

        return api.entities.Contact.update(id, { lifecycle_stage });
      } else {
        return api.entities.Lead.update(id, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-leads'] });
      queryClient.invalidateQueries({ queryKey: ['crm-contacts'] });
      toast.success("Updated successfully!");
    }
  });

  // Stats calculations
  const totalValue = leads.reduce((sum, lead) => sum + (lead.expected_value || 0), 0);
  const qualifiedLeads = allLeads.filter(l => l.stage === 'qualified' || l.stage === 'won').length;
  const conversionRate = allLeads.length > 0 ? ((allLeads.filter(l => l.stage === 'won').length / allLeads.length) * 100).toFixed(1) : 0;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Lead <span className="text-amber-400">Pipeline</span></h1>
        <p className="text-white/70 mt-1 text-sm md:text-base">Visualize and manage your <span className="text-amber-400">sales pipeline</span></p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-sm text-white/60">Total Leads</div>
              <div className="text-2xl font-bold text-white">{allLeads.length}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-sm text-white/60">Qualified</div>
              <div className="text-2xl font-bold text-green-400">{qualifiedLeads}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-sm text-white/60">Pipeline Value</div>
              <div className="text-2xl font-bold text-purple-400">${totalValue.toFixed(0)}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-sm text-white/60">Win Rate</div>
              <div className="text-2xl font-bold text-blue-400">{conversionRate}%</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Pipeline View */}
      <div className="grid lg:grid-cols-5 gap-4 overflow-x-auto">
        {stages.map(stage => {
          const stageLeads = allLeads.filter(lead => 
            lead.stage === stage.id || 
            (stage.id === 'new' && (!lead.stage || lead.stage === 'new'))
          );

          return (
            <Card key={stage.id} className="min-w-[280px] bg-[#0a1929]/60 backdrop-blur border-amber-500/20 h-full">
              <CardHeader className={`bg-gradient-to-r ${stage.headerGradient} text-white py-3`}>
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>{stage.label}</span>
                  <Badge className={stage.badgeColorClass}>
                    {stageLeads.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[600px] overflow-y-auto p-2">
                {stageLeads.map(lead => (
                  <motion.div
                    key={lead.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-white/5 border border-amber-500/20 rounded-lg hover:border-amber-500/40 cursor-pointer transition-all"
                    onClick={() => setSelectedLead(lead)}
                  >
                    <h4 className="text-white font-medium text-sm mb-1">{lead.name}</h4>
                    {lead.score !== undefined && lead.score !== null && (
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              lead.score >= 75 ? 'bg-green-500' :
                              lead.score >= 50 ? 'bg-amber-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${lead.score}%` }}
                          />
                        </div>
                        <span className="text-xs text-white/60">{lead.score}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      {lead.email && <Mail className="w-3 h-3 text-white/40" />}
                      {lead.phone && <Phone className="w-3 h-3 text-white/40" />}
                      {lead.source && <span className="text-xs text-white/50 capitalize">{lead.source}</span>}
                    </div>
                  </motion.div>
                ))}
                {stageLeads.length === 0 && (
                  <p className="text-center text-white/40 text-xs py-8">No leads in this stage</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Lead Detail Sidebar */}
      {selectedLead && (
        <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
          <DialogContent className="bg-[#0a1929] border-amber-500/30 max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Lead Details</DialogTitle>
            </DialogHeader>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-4">
                {/* Lead Details Card */}
                <Card className="bg-white/5 border-amber-500/20">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">{selectedLead.name} <span className="text-white/60 text-base">({selectedLead.company || 'N/A'})</span></CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-white/60 text-sm">Stage</p>
                      <Badge className={stages.find(s => s.id === selectedLead.stage)?.badgeColorClass || 'bg-gray-500'}>
                        {stages.find(s => s.id === selectedLead.stage)?.label || selectedLead.stage}
                      </Badge>
                    </div>
                    {selectedLead.email && (
                      <div>
                        <p className="text-white/60 text-sm">Email</p>
                        <p className="text-white text-base">{selectedLead.email}</p>
                      </div>
                    )}
                    {selectedLead.phone && (
                      <div>
                        <p className="text-white/60 text-sm">Phone</p>
                        <p className="text-white text-base">{selectedLead.phone}</p>
                      </div>
                    )}
                    {selectedLead.source && (
                      <div>
                        <p className="text-white/60 text-sm">Source</p>
                        <p className="text-white text-base capitalize">{selectedLead.source}</p>
                      </div>
                    )}
                    {selectedLead.expected_value && selectedLead.expected_value !== 0 && (
                      <div>
                        <p className="text-white/60 text-sm">Expected Value</p>
                        <p className="text-white text-base">${selectedLead.expected_value.toLocaleString()}</p>
                      </div>
                    )}
                    {selectedLead.close_date && (
                      <div>
                        <p className="text-white/60 text-sm">Close Date</p>
                        <p className="text-white text-base">{format(new Date(selectedLead.close_date), 'MMM d, yyyy')}</p>
                      </div>
                    )}
                    {selectedLead.ai_summary && (
                      <div className="col-span-2">
                        <p className="text-white/60 text-sm">AI Summary</p>
                        <p className="text-white text-base italic">{selectedLead.ai_summary}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Comments Section */}
                <Card className="bg-white/5 border-amber-500/20">
                  <CardHeader>
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-amber-400" />
                      Team Comments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CommentThread 
                      entityType="lead"
                      entityId={selectedLead.id}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-4">
                {/* AI Suggestions */}
                <AIActionSuggestions 
                  entityType="lead"
                  entityId={selectedLead.id}
                />

                {/* Team Activity */}
                <TeamActivityFeed 
                  entityType="lead"
                  entityId={selectedLead.id}
                  limit={10}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {isLoading && (
        <div className="text-center py-12 text-white/60">Loading pipeline...</div>
      )}
    </div>
  );
}