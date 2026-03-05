
import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  Upload,
  Mail,
  Phone,
  FileText,
  Flame,
  ExternalLink,
  Sparkles,
  ThumbsUp,
  MessageSquare,
  Zap,
  BarChart3,
  Map,
  LayoutGrid,
  Activity,
  TrendingUp,
  DollarSign,
  Target
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";
import EmailComposer from "../components/EmailComposer";
import LeadAnalyticsDashboard from "../components/leads/LeadAnalyticsDashboard";
import LeadMapView from "../components/leads/LeadMapView";
import AutomationRulesPanel from "../components/leads/AutomationRulesPanel";
import PredictiveInsights from "../components/leads/PredictiveInsights";
import AILeadRouterButton from "../components/leads/AILeadRouterButton";
import AILeadScorer from "../components/leads/AILeadScorer"; // New import

const statusColors = {
  new: "bg-blue-500/20 text-blue-400",
  contacted: "bg-yellow-500/20 text-yellow-400",
  qualified: "bg-purple-500/20 text-purple-400",
  won: "bg-green-500/20 text-green-400",
  lost: "bg-gray-500/20 text-gray-400",
  claimed: "bg-indigo-500/20 text-indigo-400",
  unclaimed: "bg-orange-500/20 text-orange-400"
};

const sourceColors = {
  facebook: "bg-blue-500/20 text-blue-400",
  nextdoor: "bg-green-500/20 text-green-400",
  instagram: "bg-pink-500/20 text-pink-400",
  tiktok: "bg-slate-500/20 text-white",
  manual: "bg-gray-500/20 text-gray-400",
  zapier: "bg-orange-500/20 text-orange-400",
  import: "bg-cyan-500/20 text-cyan-400"
};

export default function LeadsPage() { // Renamed from Leads to LeadsPage
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTab, setSelectedTab] = useState("my-leads");
  const [viewMode, setViewMode] = useState("table");
  const queryClient = useQueryClient();
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [selectedLeadForEmail, setSelectedLeadForEmail] = useState(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedLeadForEnroll, setSelectedLeadForEnroll] = useState(null);
  const [selectedLeadForScoring, setSelectedLeadForScoring] = useState(null); // New state

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

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: () => api.entities.Lead.list('-created_date'),
  });

  const { data: workflows = [] } = useQuery({
    queryKey: ['nurture-workflows'],
    queryFn: () => api.entities.NurtureWorkflow.filter({ is_active: true })
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const lead = await api.entities.Lead.create({
        ...data,
        org_id: user.current_org_id
      });

      if (data.message) {
        try {
          await api.functions.invoke('automateLeadWorkflow', {
            leadId: lead.id,
            actions: [
              { type: 'score_lead' },
              { type: 'generate_email' }
            ]
          });
        } catch (error) {
          console.error('Failed to automate workflow:', error);
        }
      }

      return lead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setShowForm(false);
      setEditingLead(null);
      toast.success("Lead created & AI workflow started!");
    },
    onError: (error) => {
      toast.error(`Failed to create lead: ${error.message}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.entities.Lead.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setShowForm(false);
      setEditingLead(null);
      toast.success("Lead updated successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to update lead: ${error.message}`);
    }
  });

  const claimMutation = useMutation({
    mutationFn: async (leadId) => {
      await api.entities.Lead.update(leadId, {
        status: 'claimed',
        claimed_by: user.id,
        claimed_at: new Date().toISOString(),
        assigned_to: user.id
      });

      await api.functions.invoke('automateLeadWorkflow', {
        leadId,
        actions: [
          { type: 'score_lead' },
          { type: 'generate_email' },
          { type: 'create_task' }
        ]
      });

      return leadId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success("Lead claimed! AI workflow started.");
    }
  });

  const enrollMutation = useMutation({
    mutationFn: async ({ leadId, workflowId }) => {
      return api.functions.invoke('enrollLeadInWorkflow', { leadId, workflowId });
    },
    onSuccess: () => {
      setShowEnrollModal(false);
      setSelectedLeadForEnroll(null);
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success("Lead enrolled in nurture workflow!");
    },
    onError: (error) => {
      console.error('Enrollment error:', error);
      toast.error('Failed to enroll lead in workflow');
    }
  });

  const handleScoreUpdate = (scoreData) => { // New function
    queryClient.invalidateQueries({ queryKey: ['leads'] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      message: formData.get('message'),
      source: formData.get('source') || 'manual',
      status: formData.get('status') || 'new',
    };

    if (editingLead) {
      updateMutation.mutate({ id: editingLead.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (lead) => {
    setEditingLead(lead);
    setShowForm(true);
  };

  const handleSendEmail = (lead) => {
    setSelectedLeadForEmail(lead);
    setShowEmailComposer(true);
  };

  const handleEnrollInWorkflow = (lead) => {
    setSelectedLeadForEnroll(lead);
    setShowEnrollModal(true);
  };

  const myLeads = leads.filter(l =>
    l.status !== 'unclaimed' &&
    ['manual', 'web', 'form', 'referral', 'import'].includes(l.source)
  );

  const communityLeads = leads.filter(l =>
    ['facebook', 'nextdoor', 'instagram', 'tiktok', 'zapier'].includes(l.source)
  );

  const unclaimedLeads = communityLeads.filter(l => l.status === 'unclaimed');
  const claimedLeads = communityLeads.filter(l => l.status === 'claimed');

  const filteredMyLeads = myLeads.filter(lead => {
    const matchesSearch = lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate KPIs
  const totalValue = leads.reduce((sum, l) => sum + (l.expected_value || 0), 0);
  const avgScore = leads.length > 0 ? leads.reduce((sum, l) => sum + (l.score || 0), 0) / leads.length : 0;
  const conversionRate = leads.filter(l => l.status === 'won').length / Math.max(leads.length, 1);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Hero Stats */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Activity className="w-8 h-8 text-cyan-400" />
            Lead <span className="text-amber-400">Intelligence Hub</span>
          </h1>
          <p className="text-white/70 mt-1 text-sm md:text-base">
            AI-powered lead management with predictive analytics and automation
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                <Badge className="bg-cyan-500/20 text-cyan-400">Total</Badge>
              </div>
              <p className="text-3xl font-bold text-cyan-400">{leads.length}</p>
              <p className="text-white/60 text-xs mt-1">Total leads</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-5 h-5 text-purple-400" />
                <Badge className="bg-purple-500/20 text-purple-400">Pipeline</Badge>
              </div>
              <p className="text-3xl font-bold text-purple-400">${Math.round(totalValue).toLocaleString()}</p>
              <p className="text-white/60 text-xs mt-1">Expected value</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <Badge className="bg-green-500/20 text-green-400">Conversion</Badge>
              </div>
              <p className="text-3xl font-bold text-green-400">{Math.round(conversionRate * 100)}%</p>
              <p className="text-white/60 text-xs mt-1">Win rate</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-5 h-5 text-amber-400" />
                <Badge className="bg-amber-500/20 text-amber-400">Quality</Badge>
              </div>
              <p className="text-3xl font-bold text-amber-400">{Math.round(avgScore)}</p>
              <p className="text-white/60 text-xs mt-1">Avg AI score</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
          <Link to={createPageUrl("LeadScraper")} className="w-full sm:w-auto">
            <Button className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 text-white font-bold">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Lead Discovery
            </Button>
          </Link>
          <Link to={createPageUrl("Integrations")} className="w-full sm:w-auto">
            <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-bold">
              <Zap className="w-4 h-4 mr-2" />
              Connect Platforms
            </Button>
          </Link>
          <Button className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold">
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button onClick={() => {
            setEditingLead(null);
            setShowForm(true);
          }} className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold">
            <Plus className="w-4 h-4 mr-2" />
            New Lead
          </Button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      {user?.current_org_id && (
        <>
          <LeadAnalyticsDashboard leads={leads} />

          {/* Predictive Insights & Automation */}
          <div className="grid lg:grid-cols-2 gap-6">
            <PredictiveInsights leads={leads} orgId={user.current_org_id} />
            <AutomationRulesPanel orgId={user.current_org_id} />
          </div>
        </>
      )}

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2 bg-white/5">
          <TabsTrigger value="my-leads" className="text-white data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            My Leads ({myLeads.length})
          </TabsTrigger>
          <TabsTrigger value="community" className="relative text-white data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400">
            <Flame className="w-4 h-4 mr-2 text-orange-500" />
            Hot Local Leads ({unclaimedLeads.length})
            {unclaimedLeads.length > 0 && (
              <Badge className="ml-2 bg-orange-500 text-white">New</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* My Leads Tab */}
        <TabsContent value="my-leads" className="space-y-4">
          {/* Filters & View Modes */}
          <Card className="p-4 bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                <Input
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/5 border-amber-500/30 text-white"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40 bg-white/5 border-amber-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex border border-amber-500/30 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className={viewMode === 'table' ? 'bg-cyan-500/20 text-cyan-400' : 'text-white/60'}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('analytics')}
                  className={viewMode === 'analytics' ? 'bg-cyan-500/20 text-cyan-400' : 'text-white/60'}
                >
                  <BarChart3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('map')}
                  className={viewMode === 'map' ? 'bg-cyan-500/20 text-cyan-400' : 'text-white/60'}
                >
                  <Map className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>

          {/* View Modes */}
          {viewMode === 'analytics' ? (
            <LeadAnalyticsDashboard leads={filteredMyLeads} />
          ) : viewMode === 'map' ? (
            <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
              <CardContent className="p-4">
                <LeadMapView 
                  leads={filteredMyLeads} 
                  onLeadClick={handleEdit}
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
              <Table>
                <TableHeader>
                  <TableRow className="border-amber-500/20 hover:bg-transparent">
                    <TableHead className="text-cyan-400">Name</TableHead>
                    <TableHead className="text-cyan-400">Contact</TableHead>
                    <TableHead className="text-cyan-400">Source</TableHead>
                    <TableHead className="text-cyan-400">Score</TableHead>
                    <TableHead className="text-cyan-400">Status</TableHead>
                    <TableHead className="text-cyan-400">Created</TableHead>
                    <TableHead className="text-cyan-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow className="border-amber-500/20">
                      <TableCell colSpan={7} className="text-center py-8 text-white/60">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredMyLeads.length === 0 ? (
                    <TableRow className="border-amber-500/20">
                      <TableCell colSpan={7} className="text-center py-8 text-white/60">
                        No leads found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMyLeads.map((lead) => (
                      <TableRow key={lead.id} className="cursor-pointer hover:bg-white/5 border-amber-500/20">
                        <TableCell className="font-medium text-white">{lead.name}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {lead.email && (
                              <div className="flex items-center gap-1 text-sm text-white/70">
                                <Mail className="w-3 h-3 text-cyan-400" />
                                {lead.email}
                              </div>
                            )}
                            {lead.phone && (
                              <div className="flex items-center gap-1 text-sm text-white/70">
                                <Phone className="w-3 h-3 text-cyan-400" />
                                {lead.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`capitalize ${sourceColors[lead.source] || 'bg-gray-500/20 text-gray-400'}`}>
                            {lead.source}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {lead.score ? (
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    lead.score >= 75 ? 'bg-green-500' :
                                    lead.score >= 50 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${lead.score}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-white">{lead.score}</span>
                            </div>
                          ) : (
                            <span className="text-white/40 text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[lead.status]}>
                            {lead.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-white/60">
                          {format(new Date(lead.created_date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(lead)}
                              className="text-white/70 hover:text-white hover:bg-white/10"
                            >
                              Edit
                            </Button>
                            {lead.email && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSendEmail(lead);
                                  }}
                                  className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                                >
                                  <Mail className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEnrollInWorkflow(lead);
                                  }}
                                  className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                                >
                                  <Zap className="w-4 h-4" />
                                </Button>
                                <AILeadRouterButton 
                                  leadId={lead.id}
                                  leadName={lead.name}
                                  onSuccess={() => queryClient.invalidateQueries({ queryKey: ['leads'] })}
                                />
                                {/* Example of a button to trigger scoring - added here for context, not in outline */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedLeadForScoring(lead);
                                  }}
                                  className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                                >
                                  <Sparkles className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            <Link to={createPageUrl("Quotes")}>
                              <Button variant="ghost" size="sm" className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10">
                                <FileText className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        {/* Community Leads Tab */}
        <TabsContent value="community" className="space-y-4">
          {unclaimedLeads.length === 0 ? (
            <Card className="p-12 text-center bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
              <Flame className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No Hot Leads Yet
              </h3>
              <p className="text-white/60 mb-6">
                Connect your social accounts to start receiving hot local leads automatically
              </p>
              <Link to={createPageUrl("Integrations")}>
                <Button className="bg-gradient-to-r from-orange-600 to-red-600">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Connect Platforms
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid gap-4">
              {unclaimedLeads.map((lead, index) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="relative overflow-hidden hover:shadow-lg transition-shadow bg-white/5 backdrop-blur border-amber-500/20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500 to-red-500 opacity-10 transform translate-x-8 -translate-y-8 rounded-full" />

                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={sourceColors[lead.source]}>
                              {lead.source}
                            </Badge>
                            {lead.score >= 75 && (
                              <Badge className="bg-red-500/20 text-red-400">
                                <Flame className="w-3 h-3 mr-1" />
                                Hot
                              </Badge>
                            )}
                            {lead.vertical_tags?.map(tag => (
                              <Badge key={tag} className="capitalize bg-white/10 text-white/70">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <CardTitle className="text-xl text-white">{lead.name}</CardTitle>
                          {lead.location && (
                            <p className="text-sm text-white/60 mt-1">
                              {lead.location.city}, {lead.location.state}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-white">
                            {lead.score || 50}
                          </div>
                          <p className="text-xs text-white/50">AI Score</p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {lead.ai_summary && (
                        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                          <div className="flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-blue-400">AI Summary</p>
                              <p className="text-sm text-white/80 mt-1">{lead.ai_summary}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {lead.message && (
                        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                          <p className="text-sm text-white/70 line-clamp-3">
                            "{lead.message}"
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div className="flex items-center gap-4 text-sm text-white/60">
                          {lead.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4 text-cyan-400" />
                              <span className="blur-sm hover:blur-none transition-all">
                                {lead.email}
                              </span>
                            </div>
                          )}
                          {lead.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4 text-cyan-400" />
                              <span className="blur-sm hover:blur-none transition-all">
                                {lead.phone}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {lead.source_url && (
                            <Button variant="outline" size="sm" asChild className="border-white/20 text-white/70 hover:bg-white/10">
                              <a href={lead.source_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                          <Button
                            onClick={() => claimMutation.mutate(lead.id)}
                            disabled={claimMutation.isPending}
                            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                          >
                            <ThumbsUp className="w-4 h-4 mr-2" />
                            Claim Lead
                          </Button>
                        </div>
                      </div>

                      {lead.ai_suggested_response && (
                        <details className="group">
                          <summary className="cursor-pointer text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            View AI-Suggested Response
                          </summary>
                          <div className="mt-3 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                            <p className="text-sm text-white/80 whitespace-pre-wrap">
                              {lead.ai_suggested_response}
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                              onClick={() => {
                                navigator.clipboard.writeText(lead.ai_suggested_response);
                                toast.success("Copied to clipboard!");
                              }}
                            >
                              Copy Message
                            </Button>
                          </div>
                        </details>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Claimed Leads Section */}
          {claimedLeads.length > 0 && (
            <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white">Recently Claimed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {claimedLeads.slice(0, 5).map(lead => (
                    <div key={lead.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                      <div>
                        <p className="font-medium text-white">{lead.name}</p>
                        <p className="text-sm text-white/60">
                          Claimed {format(new Date(lead.claimed_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                      <Badge className={sourceColors[lead.source]}>
                        {lead.source}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl bg-[#0a1929] border-amber-500/30">
          <DialogHeader>
            <DialogTitle className="text-white">{editingLead ? 'Edit Lead' : 'New Lead'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-white">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingLead?.name}
                    className="bg-white/5 border-amber-500/30 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={editingLead?.email}
                    className="bg-white/5 border-amber-500/30 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone" className="text-white">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    defaultValue={editingLead?.phone}
                    className="bg-white/5 border-amber-500/30 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="source" className="text-white">Source</Label>
                  <Select name="source" defaultValue={editingLead?.source || 'manual'}>
                    <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web">Website</SelectItem>
                      <SelectItem value="form">Contact Form</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="manual">Manual Entry</SelectItem>
                      <SelectItem value="import">Import</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {editingLead && (
                <div>
                  <Label htmlFor="status" className="text-white">Status</Label>
                  <Select name="status" defaultValue={editingLead.status}>
                    <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="won">Won</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label htmlFor="message" className="text-white">Message / Notes</Label>
                <Textarea
                  id="message"
                  name="message"
                  defaultValue={editingLead?.message}
                  rows={4}
                  className="bg-white/5 border-amber-500/30 text-white"
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-white/20 text-white hover:bg-white/10">
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-gradient-to-r from-green-600 to-green-500">
                {editingLead ? 'Update' : 'Create'} Lead
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Enroll in Workflow Modal */}
      <Dialog open={showEnrollModal} onOpenChange={setShowEnrollModal}>
        <DialogContent className="bg-[#0a1929] border-amber-500/30">
          <DialogHeader>
            <DialogTitle className="text-white">Enroll in Nurture Workflow</DialogTitle>
          </DialogHeader>
          {selectedLeadForEnroll && (
            <div className="space-y-4">
              <div className="p-3 bg-white/5 rounded border border-amber-500/20">
                <p className="text-white font-medium">{selectedLeadForEnroll.name}</p>
                <p className="text-white/60 text-sm">{selectedLeadForEnroll.email}</p>
              </div>

              {workflows.length === 0 ? (
                <div className="text-center py-8 text-white/60">
                  <p>No active workflows found.</p>
                  <Link to={createPageUrl("NurtureWorkflows")}>
                    <Button className="mt-4 bg-gradient-to-r from-amber-600 to-amber-500">
                      Create Workflow
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-white">Select Workflow</Label>
                  {workflows.map(workflow => (
                    <Card
                      key={workflow.id}
                      className="p-3 bg-white/5 border-amber-500/20 hover:border-amber-500/40 cursor-pointer transition-all"
                      onClick={() => {
                        enrollMutation.mutate({
                          leadId: selectedLeadForEnroll.id,
                          workflowId: workflow.id
                        });
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-white font-medium">{workflow.name}</h4>
                          {workflow.description && (
                            <p className="text-white/60 text-sm mt-1">{workflow.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">
                              {workflow.steps.length} steps
                            </Badge>
                          </div>
                        </div>
                        <Zap className="w-5 h-5 text-cyan-400" />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEnrollModal(false)}
              className="border-amber-500/30 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Composer */}
      {selectedLeadForEmail && (
        <EmailComposer
          open={showEmailComposer}
          onClose={() => {
            setShowEmailComposer(false);
            setSelectedLeadForEmail(null);
          }}
          relatedType="lead"
          relatedId={selectedLeadForEmail.id}
          recipientEmail={selectedLeadForEmail.email}
          recipientName={selectedLeadForEmail.name}
        />
      )}

      {/* AI Lead Scoring Dialog */}
      <Dialog open={!!selectedLeadForScoring} onOpenChange={(open) => !open && setSelectedLeadForScoring(null)}>
        <DialogContent className="bg-[#0a1929] border-amber-500/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              AI Lead Scoring
            </DialogTitle>
          </DialogHeader>
          {selectedLeadForScoring && (
            <AILeadScorer 
              lead={selectedLeadForScoring} 
              onScoreUpdate={handleScoreUpdate}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
