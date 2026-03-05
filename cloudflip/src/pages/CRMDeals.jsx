
import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, DollarSign, TrendingUp, Target, Calendar, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

import CommentThread from "../components/CommentThread";
import AIActionSuggestions from "../components/AIActionSuggestions";
import TeamActivityFeed from "../components/TeamActivityFeed";

const stageColors = {
  qualification: "bg-blue-100 text-blue-800",
  needs_analysis: "bg-purple-100 text-purple-800",
  proposal: "bg-yellow-100 text-yellow-800",
  negotiation: "bg-orange-100 text-orange-800",
  closed_won: "bg-green-100 text-green-800",
  closed_lost: "bg-gray-100 text-gray-800"
};

const CHART_COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444'];

export default function CRMDeals() {
  const [showForm, setShowForm] = useState(false);
  const [showDealDetail, setShowDealDetail] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const queryClient = useQueryClient();

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ['crm-deals'],
    queryFn: () => api.entities.Deal.list('-created_date'),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['crm-contacts'],
    queryFn: () => api.entities.Contact.list(),
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const user = await api.auth.me();
      const expectedValue = data.value * (data.close_probability / 100);
      return api.entities.Deal.create({
        ...data,
        org_id: user.current_org_id,
        owner_id: user.id,
        expected_value: expectedValue
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-deals'] });
      setShowForm(false);
      setSelectedDeal(null);
      toast.success("Deal created successfully!");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.entities.Deal.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-deals'] });
      setShowForm(false);
      setSelectedDeal(null);
      toast.success("Deal updated successfully!");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const data = {
      name: formData.get('name'),
      contact_id: formData.get('contact_id'),
      value: parseFloat(formData.get('value')),
      close_probability: parseFloat(formData.get('close_probability')),
      pipeline_stage: formData.get('pipeline_stage'),
      close_date: formData.get('close_date')
    };

    if (selectedDeal) {
      updateMutation.mutate({ id: selectedDeal.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Calculate metrics
  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const expectedValue = deals.reduce((sum, deal) => sum + (deal.expected_value || 0), 0);
  const activeDeals = deals.filter(d => !['closed_won', 'closed_lost'].includes(d.pipeline_stage)).length;
  const wonDeals = deals.filter(d => d.pipeline_stage === 'closed_won').length;

  // Chart data
  const stageData = Object.keys(stageColors).map(stage => ({
    name: stage.replace(/_/g, ' '),
    value: deals.filter(d => d.pipeline_stage === stage).length,
    amount: deals.filter(d => d.pipeline_stage === stage).reduce((sum, d) => sum + d.value, 0)
  })).filter(d => d.value > 0);

  const forecastData = deals
    .filter(d => d.close_date && d.forecast_quarter)
    .reduce((acc, deal) => {
      const quarter = deal.forecast_quarter;
      const existing = acc.find(item => item.quarter === quarter);
      if (existing) {
        existing.value += deal.expected_value || 0;
      } else {
        acc.push({ quarter, value: deal.expected_value || 0 });
      }
      return acc;
    }, [])
    .sort((a, b) => a.quarter.localeCompare(b.quarter));

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Deals <span className="text-amber-400">Pipeline</span></h1>
          <p className="text-white/70 mt-1 text-sm md:text-base">Forecast and manage your <span className="text-amber-400">revenue</span></p>
        </div>
        <Button
          onClick={() => {
            setSelectedDeal(null);
            setShowForm(true);
          }}
          className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Deal
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-sm text-white/60">Total Value</div>
              <div className="text-2xl font-bold text-white">${(totalValue / 1000).toFixed(0)}k</div>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-sm text-white/60">Expected</div>
              <div className="text-2xl font-bold text-green-400">${(expectedValue / 1000).toFixed(0)}k</div>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-sm text-white/60">Active</div>
              <div className="text-2xl font-bold text-blue-400">{activeDeals}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-sm text-white/60">Won</div>
              <div className="text-2xl font-bold text-purple-400">{wonDeals}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white">Pipeline by <span className="text-amber-400">Stage</span></CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f59e0b20" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#fff', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fill: '#fff' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #f59e0b50' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="amount" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white">Quarterly <span className="text-amber-400">Forecast</span></CardTitle>
          </CardHeader>
          <CardContent>
            {forecastData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f59e0b20" />
                  <XAxis dataKey="quarter" tick={{ fill: '#fff' }} />
                  <YAxis tick={{ fill: '#fff' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #f59e0b50' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-white/60">
                No forecast data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Deals Table */}
      <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-amber-500/20 hover:bg-transparent">
                <TableHead className="text-white/80">Deal Name</TableHead>
                <TableHead className="text-white/80">Contact</TableHead>
                <TableHead className="text-white/80">Value</TableHead>
                <TableHead className="text-white/80">Stage</TableHead>
                <TableHead className="text-white/80">Probability</TableHead>
                <TableHead className="text-white/80">Close Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow className="border-amber-500/20">
                  <TableCell colSpan={6} className="text-center py-8 text-white/60">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : deals.length === 0 ? (
                <TableRow className="border-amber-500/20">
                  <TableCell colSpan={6} className="text-center py-8 text-white/60">
                    No deals yet
                  </TableCell>
                </TableRow>
              ) : (
                deals.map((deal) => {
                  const contact = contacts.find(c => c.id === deal.contact_id);
                  
                  return (
                    <TableRow
                      key={deal.id}
                      onClick={() => {
                        setSelectedDeal(deal);
                        setShowDealDetail(true); // Open deal detail dialog
                      }}
                      className="cursor-pointer hover:bg-white/5 border-amber-500/20"
                    >
                      <TableCell className="font-medium text-white">{deal.name}</TableCell>
                      <TableCell className="text-white/70">
                        {contact ? `${contact.first_name} ${contact.last_name}` : '-'}
                      </TableCell>
                      <TableCell className="font-semibold text-amber-400">
                        ${deal.value.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={stageColors[deal.pipeline_stage]}>
                          {deal.pipeline_stage.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden max-w-[100px]">
                            <div
                              className="h-full bg-amber-500"
                              style={{ width: `${deal.close_probability}%` }}
                            />
                          </div>
                          <span className="text-white/70 text-sm">{deal.close_probability}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-white/60 text-sm">
                        {deal.close_date ? format(new Date(deal.close_date), 'MMM d, yyyy') : '-'}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Deal Detail Dialog */}
      <Dialog open={showDealDetail} onOpenChange={setShowDealDetail}>
        <DialogContent className="bg-[#0a1929] border-amber-500/30 max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">{selectedDeal?.name}</DialogTitle>
          </DialogHeader>

          {selectedDeal && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Content - 2/3 */}
              <div className="lg:col-span-2 space-y-4">
                {/* Deal Details (placeholder for existing code in the outline) */}
                <Card className="bg-white/5 border-amber-500/20">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Deal Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4 text-white/70">
                    <div>
                      <p className="text-sm font-medium">Value:</p>
                      <p className="font-bold text-lg text-amber-400">${selectedDeal.value.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Stage:</p>
                      <Badge className={stageColors[selectedDeal.pipeline_stage]}>
                        {selectedDeal.pipeline_stage.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Probability:</p>
                      <p>{selectedDeal.close_probability}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Close Date:</p>
                      <p>{selectedDeal.close_date ? format(new Date(selectedDeal.close_date), 'MMM d, yyyy') : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Contact:</p>
                      <p>
                        {contacts.find(c => c.id === selectedDeal.contact_id)
                          ? `${contacts.find(c => c.id === selectedDeal.contact_id).first_name} ${contacts.find(c => c.id === selectedDeal.contact_id).last_name}`
                          : 'N/A'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Comments Section */}
                <Card className="bg-white/5 border-amber-500/20">
                  <CardHeader>
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-amber-400" />
                      Team Discussion
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CommentThread 
                      entityType="deal"
                      entityId={selectedDeal.id}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Right Sidebar - 1/3 */}
              <div className="lg:col-span-1 space-y-4">
                {/* AI Action Suggestions */}
                <AIActionSuggestions 
                  entityType="deal"
                  entityId={selectedDeal.id}
                />

                {/* Team Activity Feed */}
                <TeamActivityFeed 
                  entityType="deal"
                  entityId={selectedDeal.id}
                  limit={10}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDealDetail(false)} className="border-amber-500/30 text-white hover:bg-white/10">
              Close
            </Button>
            <Button
              type="button"
              onClick={() => {
                setShowDealDetail(false); // Close detail view first
                setShowForm(true); // Open edit form
              }}
              className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
            >
              Edit Deal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-[#0a1929] border-amber-500/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedDeal ? 'Edit Deal' : 'New Deal'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-white">Deal Name *</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={selectedDeal?.name}
                  required
                  className="bg-white/5 border-amber-500/30 text-white"
                />
              </div>
              <div>
                <Label htmlFor="contact_id" className="text-white">Contact</Label>
                <Select name="contact_id" defaultValue={selectedDeal?.contact_id}>
                  <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                    <SelectValue placeholder="Select contact..." />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map(contact => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.first_name} {contact.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="value" className="text-white">Deal Value ($) *</Label>
                  <Input
                    id="value"
                    name="value"
                    type="number"
                    step="0.01"
                    defaultValue={selectedDeal?.value}
                    required
                    className="bg-white/5 border-amber-500/30 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="close_probability" className="text-white">Close Probability (%) *</Label>
                  <Input
                    id="close_probability"
                    name="close_probability"
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={selectedDeal?.close_probability || 50}
                    required
                    className="bg-white/5 border-amber-500/30 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pipeline_stage" className="text-white">Pipeline Stage *</Label>
                  <Select name="pipeline_stage" defaultValue={selectedDeal?.pipeline_stage || 'qualification'}>
                    <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="qualification">Qualification</SelectItem>
                      <SelectItem value="needs_analysis">Needs Analysis</SelectItem>
                      <SelectItem value="proposal">Proposal</SelectItem>
                      <SelectItem value="negotiation">Negotiation</SelectItem>
                      <SelectItem value="closed_won">Closed Won</SelectItem>
                      <SelectItem value="closed_lost">Closed Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="close_date" className="text-white">Expected Close Date</Label>
                  <Input
                    id="close_date"
                    name="close_date"
                    type="date"
                    defaultValue={selectedDeal?.close_date}
                    className="bg-white/5 border-amber-500/30 text-white"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="border-amber-500/30 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
              >
                {selectedDeal ? 'Update' : 'Create'} Deal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
