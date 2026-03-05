
import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Target, Zap, TrendingUp, Mail, FileText, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";
import AIForecastPanel from "../components/sales/AIForecastPanel";

export default function AISalesAssistant() {
  const [user, setUser] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [insights, setInsights] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: leads = [] } = useQuery({
    queryKey: ['leads-assistant'],
    queryFn: () => api.entities.Lead.list('-score', 100),
    enabled: !!user
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts-assistant'],
    queryFn: () => api.entities.Contact.list('-sentiment_score', 100),
    enabled: !!user
  });

  const { data: deals = [] } = useQuery({
    queryKey: ['deals-assistant'],
    queryFn: () => api.entities.Deal.list('-close_probability', 100),
    enabled: !!user
  });

  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      setAnalyzing(true);
      const { data } = await api.functions.invoke('generateNextActionSuggestions', {
        leads: leads.slice(0, 20),
        contacts: contacts.slice(0, 20),
        deals: deals.slice(0, 20)
      });
      return data;
    },
    onSuccess: (data) => {
      setInsights(data);
      setAnalyzing(false);
      toast.success("AI analysis complete!");
    },
    onError: () => {
      setAnalyzing(false);
      toast.error("Analysis failed");
    }
  });

  const draftProposalMutation = useMutation({
    mutationFn: async (dealId) => {
      const deal = deals.find(d => d.id === dealId);
      const { data } = await api.functions.invoke('generateAIEmail', {
        relatedType: 'deal',
        relatedId: dealId,
        recipientName: deal.contact_id, // Assuming contact_id links to a contact's name or is a placeholder
        purpose: 'proposal',
        tone: 'professional'
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Proposal drafted! Check Email Center.");
    }
  });

  // Identify hot leads
  const hotLeads = [...leads, ...contacts]
    .filter(l => (l.score >= 75) || (l.sentiment_score > 0.5))
    .sort((a, b) => (b.score || b.sentiment_score * 100) - (a.score || a.sentiment_score * 100))
    .slice(0, 10);

  // High-value deals at risk
  const dealsAtRisk = deals
    .filter(d => d.pipeline_stage !== 'closed_won' && d.close_probability < 50 && d.value > 10000)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Identify stale contacts
  const staleContacts = contacts
    .filter(c => {
      if (!c.last_interaction_at) return true;
      const daysSince = (Date.now() - new Date(c.last_interaction_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince > 14 && c.lifecycle_stage !== 'customer';
    })
    .slice(0, 8);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            AI Sales <span className="text-amber-400">Assistant</span>
          </h1>
          <p className="text-white/70 mt-1">Your intelligent sales co-pilot</p>
        </div>
        <Button
          onClick={() => generateInsightsMutation.mutate()}
          disabled={analyzing}
          className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
        >
          {analyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Insights
            </>
          )}
        </Button>
      </div>

      {/* AI Sales Forecast Panel - NEW */}
      <div className="mb-6">
        <AIForecastPanel
          orgId={user?.current_org_id}
          onForecastComplete={(data) => {
            toast.success(`Forecast shows ${data.forecast.quarterly_forecasts?.[0]?.quarter || 'next quarter'}: $${data.forecast.quarterly_forecasts?.[0]?.predicted_revenue?.toLocaleString() || '0'} predicted revenue`);
          }}
        />
      </div>

      {/* AI Insights Panel */}
      {insights && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl"
        >
          <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            AI-Generated Insights
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {insights.priority_actions?.map((action, idx) => (
              <div key={idx} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-white font-medium mb-2">{action.action}</p>
                <p className="text-white/70 text-sm mb-3">{action.reason}</p>
                <Badge className="bg-purple-500/20 text-purple-400">
                  {action.impact} impact
                </Badge>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <Tabs defaultValue="hot-leads" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-amber-500/20">
          <TabsTrigger value="hot-leads" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Target className="w-4 h-4 mr-2" />
            Hot Leads
          </TabsTrigger>
          <TabsTrigger value="at-risk" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <TrendingUp className="w-4 h-4 mr-2" />
            At Risk
          </TabsTrigger>
          <TabsTrigger value="stale" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Zap className="w-4 h-4 mr-2" />
            Stale Contacts
          </TabsTrigger>
          <TabsTrigger value="proposals" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <FileText className="w-4 h-4 mr-2" />
            Proposals
          </TabsTrigger>
        </TabsList>

        {/* Hot Leads */}
        <TabsContent value="hot-leads" className="mt-6">
          <div className="grid gap-4">
            {hotLeads.map((lead, idx) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20 hover:border-amber-500/40 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-white font-medium text-lg">{lead.name}</h4>
                        <p className="text-white/60 text-sm">{lead.email}</p>
                        {lead.ai_summary && (
                          <p className="text-white/70 text-sm mt-2">{lead.ai_summary}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge className="bg-red-500/20 text-red-400 mb-2">
                          {lead.score || (lead.sentiment_score * 100).toFixed(0)}
                        </Badge>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="border-amber-500/30 text-amber-400">
                            <Mail className="w-3 h-3 mr-1" />
                            Email
                          </Button>
                          <Button size="sm" className="bg-amber-500/20 text-amber-400">
                            <FileText className="w-3 h-3 mr-1" />
                            Quote
                          </Button>
                        </div>
                      </div>
                    </div>
                    {lead.ai_suggested_response && (
                      <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <p className="text-blue-400 text-xs font-medium mb-1">💡 AI Suggested Outreach:</p>
                        <p className="text-white/70 text-sm">{lead.ai_suggested_response}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Deals At Risk */}
        <TabsContent value="at-risk" className="mt-6">
          <div className="grid gap-4">
            {dealsAtRisk.map((deal, idx) => (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="bg-[#0a1929]/60 backdrop-blur border-red-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-white font-medium text-lg">{deal.name}</h4>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge className="bg-red-500/20 text-red-400">
                            {deal.close_probability}% probability
                          </Badge>
                          <span className="text-white/60 text-sm">${(deal.value / 1000).toFixed(0)}k value</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => draftProposalMutation.mutate(deal.id)}
                        disabled={draftProposalMutation.isPending}
                        className="bg-gradient-to-r from-amber-600 to-amber-500"
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        Draft Proposal
                      </Button>
                    </div>
                    <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                      <p className="text-amber-400 text-xs font-medium mb-1">⚠️ AI Recommendation:</p>
                      <p className="text-white/70 text-sm">
                        Schedule a check-in call to address concerns. Highlight ROI and success stories from similar clients.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Stale Contacts */}
        <TabsContent value="stale" className="mt-6">
          <div className="grid md:grid-cols-2 gap-4">
            {staleContacts.map((contact, idx) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-white font-medium">
                          {contact.first_name} {contact.last_name}
                        </h4>
                        <p className="text-white/60 text-sm">{contact.company}</p>
                      </div>
                      <Badge className="bg-orange-500/20 text-orange-400">
                        {contact.last_interaction_at
                          ? `${Math.floor((Date.now() - new Date(contact.last_interaction_at).getTime()) / (1000 * 60 * 60 * 24))}d ago`
                          : 'Never contacted'
                        }
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      className="w-full bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                    >
                      <Zap className="w-3 h-3 mr-2" />
                      Generate Follow-up
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Proposals */}
        <TabsContent value="proposals" className="mt-6">
          <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-white">AI-Assisted Proposal Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {deals.filter(d => d.pipeline_stage === 'proposal' || d.pipeline_stage === 'negotiation').slice(0, 6).map((deal) => (
                  <div key={deal.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-white font-medium">{deal.name}</h4>
                        <p className="text-amber-400 font-semibold text-lg">${(deal.value / 1000).toFixed(0)}k</p>
                      </div>
                      <Badge className="bg-purple-500/20 text-purple-400 capitalize">
                        {deal.pipeline_stage}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => draftProposalMutation.mutate(deal.id)}
                      disabled={draftProposalMutation.isPending}
                      className="w-full bg-gradient-to-r from-amber-600 to-amber-500"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Proposal
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
