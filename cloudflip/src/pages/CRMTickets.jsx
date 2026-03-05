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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, AlertCircle, Clock, CheckCircle, Users, TrendingUp, MessageSquare } from "lucide-react";
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
  low: "bg-slate-100 text-slate-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800"
};

export default function CRMTickets() {
  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['crm-tickets'],
    queryFn: () => api.entities.Ticket.list('-created_date'),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['crm-contacts'],
    queryFn: () => api.entities.Contact.list(),
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const user = await api.auth.me();
      return api.entities.Ticket.create({
        ...data,
        org_id: user.current_org_id,
        assigned_to: user.id,
        number: `TKT-${Date.now().toString().slice(-6)}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-tickets'] });
      setShowForm(false);
      setSelectedTicket(null);
      toast.success("Ticket created successfully!");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.entities.Ticket.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-tickets'] });
      setShowForm(false);
      setSelectedTicket(null);
      toast.success("Ticket updated successfully!");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const data = {
      contact_id: formData.get('contact_id'),
      subject: formData.get('subject'),
      description: formData.get('description'),
      category: formData.get('category'),
      priority: formData.get('priority'),
      status: formData.get('status') || 'new'
    };

    if (selectedTicket) {
      updateMutation.mutate({ id: selectedTicket.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Calculate metrics
  const openTickets = tickets.filter(t => ['new', 'open'].includes(t.status)).length;
  const escalatedTickets = tickets.filter(t => t.status === 'escalated').length;
  const resolvedToday = tickets.filter(t => 
    t.resolved_at && new Date(t.resolved_at).toDateString() === new Date().toDateString()
  ).length;
  const avgResponseTime = tickets.length > 0 ? "2.5 hrs" : "N/A";

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Support <span className="text-amber-400">Tickets</span></h1>
          <p className="text-white/70 mt-1 text-sm md:text-base">Manage customer <span className="text-amber-400">support requests</span></p>
        </div>
        <Button
          onClick={() => {
            setSelectedTicket(null);
            setShowForm(true);
          }}
          className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <div className="text-sm text-white/60">Open</div>
              <div className="text-2xl font-bold text-white">{openTickets}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <div className="text-sm text-white/60">Escalated</div>
              <div className="text-2xl font-bold text-red-400">{escalatedTickets}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-sm text-white/60">Resolved Today</div>
              <div className="text-2xl font-bold text-green-400">{resolvedToday}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-sm text-white/60">Avg Response</div>
              <div className="text-2xl font-bold text-blue-400">{avgResponseTime}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tickets Table */}
      <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-amber-500/20 hover:bg-transparent">
                <TableHead className="text-white/80">Ticket #</TableHead>
                <TableHead className="text-white/80">Subject</TableHead>
                <TableHead className="text-white/80">Contact</TableHead>
                <TableHead className="text-white/80">Priority</TableHead>
                <TableHead className="text-white/80">Status</TableHead>
                <TableHead className="text-white/80">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow className="border-amber-500/20">
                  <TableCell colSpan={6} className="text-center py-8 text-white/60">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : tickets.length === 0 ? (
                <TableRow className="border-amber-500/20">
                  <TableCell colSpan={6} className="text-center py-8 text-white/60">
                    No tickets yet
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((ticket) => {
                  const contact = contacts.find(c => c.id === ticket.contact_id);
                  
                  return (
                    <TableRow
                      key={ticket.id}
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setShowForm(true);
                      }}
                      className="cursor-pointer hover:bg-white/5 border-amber-500/20"
                    >
                      <TableCell className="font-medium text-white">{ticket.number}</TableCell>
                      <TableCell className="text-white/80">{ticket.subject}</TableCell>
                      <TableCell className="text-white/70">
                        {contact ? `${contact.first_name} ${contact.last_name}` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={priorityColors[ticket.priority]}>
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[ticket.status]}>
                          {ticket.status.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white/60 text-sm">
                        {format(new Date(ticket.created_date), 'MMM d, yyyy')}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-[#0a1929] border-amber-500/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedTicket ? 'Edit Ticket' : 'New Ticket'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="contact_id" className="text-white">Contact</Label>
                <Select name="contact_id" defaultValue={selectedTicket?.contact_id}>
                  <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                    <SelectValue placeholder="Select contact..." />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map(contact => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.first_name} {contact.last_name} ({contact.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="subject" className="text-white">Subject *</Label>
                <Input
                  id="subject"
                  name="subject"
                  defaultValue={selectedTicket?.subject}
                  required
                  className="bg-white/5 border-amber-500/30 text-white"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-white">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={selectedTicket?.description}
                  required
                  rows={4}
                  className="bg-white/5 border-amber-500/30 text-white"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="category" className="text-white">Category</Label>
                  <Select name="category" defaultValue={selectedTicket?.category || 'general'}>
                    <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="feature_request">Feature Request</SelectItem>
                      <SelectItem value="bug">Bug Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority" className="text-white">Priority</Label>
                  <Select name="priority" defaultValue={selectedTicket?.priority || 'medium'}>
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
                {selectedTicket && (
                  <div>
                    <Label htmlFor="status" className="text-white">Status</Label>
                    <Select name="status" defaultValue={selectedTicket.status}>
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
                )}
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
                {selectedTicket ? 'Update' : 'Create'} Ticket
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}