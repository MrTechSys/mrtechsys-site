import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Ticket,
  Plus,
  Search,
  Clock,
  AlertCircle,
  CheckCircle,
  User,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const statusColors = {
  new: "bg-blue-100 text-blue-800",
  open: "bg-yellow-100 text-yellow-800",
  escalated: "bg-red-100 text-red-800",
  waiting_on_customer: "bg-purple-100 text-purple-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800"
};

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800"
};

export default function TicketingSystem() {
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: tickets = [] } = useQuery({
    queryKey: ['support-tickets'],
    queryFn: () => api.entities.SupportTicket.list('-created_date', 100),
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members'],
    queryFn: () => api.entities.User.list(),
  });

  const createTicketMutation = useMutation({
    mutationFn: async (ticketData) => {
      return api.entities.SupportTicket.create({
        ...ticketData,
        org_id: user.current_org_id,
        ticket_number: `TKT-${Date.now()}`,
        requester_id: user.id,
        requester_name: user.full_name,
        requester_email: user.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      setShowNewTicket(false);
      toast.success("Ticket created successfully!");
    }
  });

  const updateTicketMutation = useMutation({
    mutationFn: ({ id, data }) => api.entities.SupportTicket.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      toast.success("Ticket updated!");
    }
  });

  const handleCreateTicket = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    createTicketMutation.mutate({
      subject: formData.get('subject'),
      body: formData.get('body'),
      category: formData.get('category'),
      priority: formData.get('priority'),
      status: 'new',
      channel: 'web'
    });
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticket_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const openTickets = tickets.filter(t => ['new', 'open', 'escalated'].includes(t.status)).length;
  const urgentTickets = tickets.filter(t => t.priority === 'urgent' && ['new', 'open'].includes(t.status)).length;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Ticket className="w-8 h-8 text-blue-400" />
            Support <span className="text-amber-400">Tickets</span>
          </h1>
          <p className="text-white/70 mt-1">Manage customer support requests</p>
        </div>
        <Button
          onClick={() => setShowNewTicket(true)}
          className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <Badge className="bg-blue-500/20 text-blue-400">Open</Badge>
            </div>
            <p className="text-3xl font-bold text-blue-400">{openTickets}</p>
            <p className="text-white/60 text-xs mt-1">Active tickets</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <Badge className="bg-red-500/20 text-red-400">Urgent</Badge>
            </div>
            <p className="text-3xl font-bold text-red-400">{urgentTickets}</p>
            <p className="text-white/60 text-xs mt-1">Needs attention</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <Badge className="bg-green-500/20 text-green-400">Resolved</Badge>
            </div>
            <p className="text-3xl font-bold text-green-400">
              {tickets.filter(t => t.status === 'resolved').length}
            </p>
            <p className="text-white/60 text-xs mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
              <Input
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-amber-500/30 text-white placeholder:text-white/40"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-white/5 border-amber-500/30 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40 bg-white/5 border-amber-500/30 text-white">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.map((ticket) => (
          <Card
            key={ticket.id}
            className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20 hover:border-amber-500/40 cursor-pointer transition-all"
            onClick={() => setSelectedTicket(ticket)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-white/60">
                      {ticket.ticket_number}
                    </Badge>
                    <Badge className={statusColors[ticket.status]}>
                      {ticket.status.replace(/_/g, ' ')}
                    </Badge>
                    <Badge className={priorityColors[ticket.priority]}>
                      {ticket.priority}
                    </Badge>
                    {ticket.category && (
                      <Badge variant="outline" className="text-white/60">
                        {ticket.category}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-white font-bold text-lg mb-1">{ticket.subject}</h3>
                  <p className="text-white/60 text-sm line-clamp-2">{ticket.description}</p>
                  
                  <div className="flex items-center gap-4 mt-3 text-xs text-white/50">
                    <span>
                      Created {ticket.created_date && format(new Date(ticket.created_date), 'MMM d, h:mm a')}
                    </span>
                    {ticket.assigned_to && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Assigned
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* New Ticket Dialog */}
      <Dialog open={showNewTicket} onOpenChange={setShowNewTicket}>
        <DialogContent className="bg-[#0a1929] border-amber-500/30">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Ticket</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTicket}>
            <div className="space-y-4">
              <div>
                <label className="text-white text-sm mb-2 block">Subject *</label>
                <Input
                  name="subject"
                  required
                  className="bg-white/5 border-amber-500/30 text-white"
                  placeholder="Brief description of the issue"
                />
              </div>

              <div>
                <label className="text-white text-sm mb-2 block">Description *</label>
                <Textarea
                  name="body"
                  required
                  rows={4}
                  className="bg-white/5 border-amber-500/30 text-white"
                  placeholder="Detailed description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white text-sm mb-2 block">Category</label>
                  <Select name="category" defaultValue="general">
                    <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="devops">DevOps</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-white text-sm mb-2 block">Priority</label>
                  <Select name="priority" defaultValue="medium">
                    <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNewTicket(false)}
                className="border-amber-500/30 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createTicketMutation.isPending}
                className="bg-gradient-to-r from-amber-600 to-amber-500"
              >
                Create Ticket
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Ticket Details Dialog */}
      {selectedTicket && (
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent className="bg-[#0a1929] border-amber-500/30 max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Ticket className="w-5 h-5 text-blue-400" />
                {selectedTicket.ticket_number}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={statusColors[selectedTicket.status]}>
                  {selectedTicket.status.replace(/_/g, ' ')}
                </Badge>
                <Badge className={priorityColors[selectedTicket.priority]}>
                  {selectedTicket.priority}
                </Badge>
                {selectedTicket.category && (
                  <Badge variant="outline" className="text-white/60">
                    {selectedTicket.category}
                  </Badge>
                )}
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-2">{selectedTicket.subject}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{selectedTicket.description}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 p-3 bg-white/5 rounded-lg border border-white/10">
                <div>
                  <p className="text-white/50 text-xs mb-1">Created</p>
                  <p className="text-white text-sm">
                    {selectedTicket.created_date && format(new Date(selectedTicket.created_date), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
                {selectedTicket.sla_due_at && (
                  <div>
                    <p className="text-white/50 text-xs mb-1">SLA Due</p>
                    <p className="text-white text-sm">
                      {format(new Date(selectedTicket.sla_due_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-white text-sm mb-2 block">Update Status</label>
                <Select
                  value={selectedTicket.status}
                  onValueChange={(value) => {
                    updateTicketMutation.mutate({
                      id: selectedTicket.id,
                      data: { status: value }
                    });
                  }}
                >
                  <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="escalated">Escalated</SelectItem>
                    <SelectItem value="waiting_on_customer">Waiting on Customer</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedTicket(null)}
                className="border-amber-500/30 text-white hover:bg-white/10"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}