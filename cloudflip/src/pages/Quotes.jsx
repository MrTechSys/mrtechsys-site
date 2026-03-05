
import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  FileText,
  Plus,
  Sparkles,
  TrendingUp,
  DollarSign,
  Clock,
  Target,
  Search,
  Edit,
  Eye,
  BarChart3
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion } from "framer-motion";
import QuoteGeneratorModal from "../components/quotes/QuoteGeneratorModal";
import ManualQuoteModal from "../components/quotes/ManualQuoteModal";
import {
  LineChart,
  Line,
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

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  viewed: "bg-purple-100 text-purple-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  expired: "bg-orange-100 text-orange-800"
};

const CHART_COLORS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];

export default function Quotes() {
  const [showAIModal, setShowAIModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => api.entities.Quote.list('-created_date', 200),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.entities.Client.list(),
  });

  const updateQuoteMutation = useMutation({
    mutationFn: ({ id, data }) => api.entities.Quote.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      setShowEditModal(false);
      setSelectedQuote(null);
      toast.success("Quote updated successfully!");
    }
  });

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Unknown Client';
  };

  // Analytics calculations with safety checks
  const safeQuotes = quotes || [];
  const totalValue = safeQuotes.reduce((sum, q) => sum + (q?.total || 0), 0);
  const acceptedQuotes = safeQuotes.filter(q => q?.status === 'accepted');
  const acceptanceRate = safeQuotes.length > 0 ? (acceptedQuotes.length / safeQuotes.length) * 100 : 0;
  const avgQuoteValue = safeQuotes.length > 0 ? totalValue / safeQuotes.length : 0;
  const pendingValue = safeQuotes.filter(q => q?.status === 'sent' || q?.status === 'viewed').reduce((sum, q) => sum + (q?.total || 0), 0);

  // Status distribution for pie chart
  const statusDistribution = Object.entries(
    safeQuotes.reduce((acc, quote) => {
      const status = quote?.status || 'draft';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name: name.toUpperCase(), value }));

  // Monthly trend data
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const monthStr = date.toISOString().slice(0, 7);
    
    const monthQuotes = safeQuotes.filter(q => 
      q?.created_date?.startsWith(monthStr)
    );
    
    return {
      month: format(date, 'MMM'),
      quotes: monthQuotes.length,
      value: monthQuotes.reduce((sum, q) => sum + (q?.total || 0), 0),
      accepted: monthQuotes.filter(q => q?.status === 'accepted').length
    };
  });

  // Top clients by quote value
  const safeClients = clients || [];
  const clientStats = safeClients.map(client => {
    const clientQuotes = safeQuotes.filter(q => q?.client_id === client?.id);
    return {
      name: client?.name || 'Unknown',
      quotes_count: clientQuotes.length,
      total_value: clientQuotes.reduce((sum, q) => sum + (q?.total || 0), 0),
      accepted_count: clientQuotes.filter(q => q?.status === 'accepted').length
    };
  }).filter(c => c.quotes_count > 0).sort((a, b) => b.total_value - a.total_value).slice(0, 5);

  // Filter quotes
  const filteredQuotes = safeQuotes.filter(quote => {
    const matchesSearch = 
      quote?.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getClientName(quote?.client_id).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quote?.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const isAdmin = user?.role === 'admin';

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FileText className="w-8 h-8 text-amber-400" />
            Quotes <span className="text-amber-400">Management</span>
          </h1>
          <p className="text-white/70 mt-1">Create, track, and manage customer quotes</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowAIModal(true)}
            className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-bold"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI Generate
          </Button>
          <Button
            onClick={() => setShowManualModal(true)}
            className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Quote
          </Button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <Badge className="bg-blue-500/20 text-blue-400">Total</Badge>
            </div>
            <p className="text-3xl font-bold text-white">{safeQuotes.length}</p>
            <p className="text-white/60 text-xs mt-1">All Quotes</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <Badge className="bg-green-500/20 text-green-400">Value</Badge>
            </div>
            <p className="text-3xl font-bold text-green-400">${(totalValue / 1000).toFixed(0)}k</p>
            <p className="text-white/60 text-xs mt-1">Total Quote Value</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <Badge className="bg-purple-500/20 text-purple-400">Rate</Badge>
            </div>
            <p className="text-3xl font-bold text-purple-400">{acceptanceRate.toFixed(0)}%</p>
            <p className="text-white/60 text-xs mt-1">Acceptance Rate</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <Badge className="bg-amber-500/20 text-amber-400">Pending</Badge>
            </div>
            <p className="text-3xl font-bold text-amber-400">${(pendingValue / 1000).toFixed(0)}k</p>
            <p className="text-white/60 text-xs mt-1">Pending Value</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              Quote Trends (6 Months)
            </CardTitle>
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
                <Line type="monotone" dataKey="quotes" stroke="#06b6d4" strokeWidth={2} name="Quotes Created" />
                <Line type="monotone" dataKey="accepted" stroke="#10b981" strokeWidth={2} name="Accepted" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              Quote Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #06b6d4' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Clients */}
      {clientStats.length > 0 && (
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Top Clients by Quote Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-5 gap-3">
              {clientStats.map((client, idx) => (
                <div key={idx} className="p-3 bg-white/5 rounded-lg border border-green-500/20">
                  <p className="text-white font-medium text-sm mb-1">{client?.name || 'Unknown'}</p>
                  <p className="text-2xl font-bold text-green-400">${((client?.total_value || 0) / 1000).toFixed(0)}k</p>
                  <p className="text-white/50 text-xs mt-1">
                    {client?.quotes_count || 0} quotes • {client?.accepted_count || 0} accepted
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters & Search */}
      <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
              <Input
                placeholder="Search by quote number or client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-amber-500/30 text-white placeholder:text-white/40"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 bg-white/5 border-amber-500/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="viewed">Viewed</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quotes Table */}
      <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">All Quotes</CardTitle>
            <Badge className="bg-white/10 text-white">
              {filteredQuotes.length} {filteredQuotes.length === 1 ? 'quote' : 'quotes'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-amber-500/20 hover:bg-transparent">
                  <TableHead className="text-white/80">Quote #</TableHead>
                  <TableHead className="text-white/80">Client</TableHead>
                  <TableHead className="text-white/80">Amount</TableHead>
                  <TableHead className="text-white/80">Status</TableHead>
                  <TableHead className="text-white/80">Created</TableHead>
                  <TableHead className="text-white/80">Valid Until</TableHead>
                  <TableHead className="text-white/80">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow className="border-amber-500/20">
                    <TableCell colSpan={7} className="text-center py-8 text-white/60">
                      Loading quotes...
                    </TableCell>
                  </TableRow>
                ) : filteredQuotes.length === 0 ? (
                  <TableRow className="border-amber-500/20">
                    <TableCell colSpan={7} className="text-center py-12">
                      <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
                      <p className="text-white/60 mb-4">No quotes found</p>
                      <div className="flex gap-3 justify-center">
                        <Button
                          onClick={() => setShowAIModal(true)}
                          className="bg-gradient-to-r from-purple-600 to-purple-500"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate with AI
                        </Button>
                        <Button
                          onClick={() => setShowManualModal(true)}
                          className="bg-gradient-to-r from-amber-600 to-amber-500 text-[#0a1929]"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create Manually
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredQuotes.map((quote) => (
                    <TableRow
                      key={quote.id}
                      className="border-amber-500/20 hover:bg-white/5 cursor-pointer"
                      onClick={() => {
                        setSelectedQuote(quote);
                        setShowEditModal(true);
                      }}
                    >
                      <TableCell>
                        <span className="text-white font-medium">{quote.number || `Q-${quote.id.slice(0, 8)}`}</span>
                      </TableCell>
                      <TableCell className="text-white/70">
                        {getClientName(quote.client_id)}
                      </TableCell>
                      <TableCell>
                        <span className="text-green-400 font-semibold">
                          ${quote.total?.toLocaleString() || '0'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[quote.status]}>
                          {quote.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white/60 text-sm">
                        {quote.created_date && format(new Date(quote.created_date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-white/60 text-sm">
                        {quote.valid_until ? format(new Date(quote.valid_until), 'MMM d, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {quote.pdf_url && (
                            <a href={quote.pdf_url} target="_blank" rel="noopener noreferrer">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                            </a>
                          )}
                          {isAdmin && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedQuote(quote);
                                setShowEditModal(true);
                              }}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Quote Modal (Admin Only) */}
      {isAdmin && selectedQuote && (
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="bg-[#0a1929] border-amber-500/30 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Quote - {selectedQuote?.number || 'Quote'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              updateQuoteMutation.mutate({
                id: selectedQuote.id,
                data: {
                  status: formData.get('status'),
                  notes: formData.get('notes')
                }
              });
            }}>
              <div className="space-y-4">
                <div className="p-3 bg-blue-500/10 rounded border border-blue-500/30">
                  <p className="text-blue-400 text-sm">
                    Client: <strong>{getClientName(selectedQuote?.client_id)}</strong>
                  </p>
                  <p className="text-blue-400 text-sm mt-1">
                    Total: <strong>${selectedQuote?.total?.toLocaleString() || '0'}</strong>
                  </p>
                </div>

                <div>
                  <label className="text-white text-sm block mb-2">Status</label>
                  <Select name="status" defaultValue={selectedQuote?.status || 'draft'}>
                    <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a1929] border-amber-500/20 text-white">
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="viewed">Viewed</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-white text-sm block mb-2">Admin Notes</label>
                  <textarea
                    name="notes"
                    defaultValue={selectedQuote?.notes || ''}
                    rows={4}
                    className="w-full bg-white/5 border border-amber-500/30 text-white rounded-lg p-3 text-sm"
                  />
                </div>

                {selectedQuote?.items && Array.isArray(selectedQuote.items) && selectedQuote.items.length > 0 && (
                  <div>
                    <label className="text-white text-sm block mb-2">Line Items</label>
                    <div className="space-y-2">
                      {selectedQuote.items.map((item, idx) => (
                        <div key={idx} className="p-2 bg-white/5 rounded border border-white/10">
                          <p className="text-white text-sm">{item?.name || 'Item'}</p>
                          <p className="text-white/60 text-xs">
                            {item?.quantity || 0} × ${item?.unit_price || 0} = ${((item?.quantity || 0) * (item?.unit_price || 0)).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  className="border-amber-500/30 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateQuoteMutation.isPending}
                  className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Modals */}
      <QuoteGeneratorModal open={showAIModal} onOpenChange={setShowAIModal} />
      <ManualQuoteModal open={showManualModal} onOpenChange={setShowManualModal} />
    </div>
  );
}
