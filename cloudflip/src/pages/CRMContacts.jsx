
import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
// Removed Sheet imports as Sheet component is no longer used for profile display
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Mail,
  Phone,
  Building,
  Tag,
  TrendingUp,
  Smile,
  Frown,
  Meh,
  Heart,
  MessageSquare // Added MessageSquare for comments section
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion } from "framer-motion";

// New imports for additional components
import CommentThread from "../components/CommentThread";
import TeamActivityFeed from "../components/TeamActivityFeed";
import AIActionSuggestions from "../components/AIActionSuggestions";

const lifecycleColors = {
  subscriber: "bg-gray-100 text-gray-800",
  lead: "bg-blue-100 text-blue-800",
  mql: "bg-purple-100 text-purple-800",
  sql: "bg-indigo-100 text-indigo-800",
  opportunity: "bg-yellow-100 text-yellow-800",
  customer: "bg-green-100 text-green-800",
  evangelist: "bg-pink-100 text-pink-800"
};

const emotionIcons = {
  neutral: Meh,
  happy: Smile,
  frustrated: Frown,
  angry: Frown,
  confused: Meh,
  excited: Heart
};

const emotionColors = {
  neutral: "text-gray-400",
  happy: "text-green-500",
  frustrated: "text-orange-500",
  angry: "text-red-500",
  confused: "text-yellow-500",
  excited: "text-pink-500"
};

export default function CRMContacts() {
  const [showForm, setShowForm] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null); // Used for the edit/create dialog
  // Removed showProfile state, as the detailed profile is now rendered directly
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const queryClient = useQueryClient();

  // New state to control which contact's details are being viewed
  const [viewingContact, setViewingContact] = useState(null);

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['crm-contacts'],
    queryFn: () => api.entities.Contact.list('-last_interaction_at'),
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const user = await api.auth.me();
      return api.entities.Contact.create({
        ...data,
        org_id: user.current_org_id,
        owner_id: user.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-contacts'] });
      setShowForm(false);
      toast.success("Contact created successfully!");
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      await api.entities.Contact.update(id, data);
      return api.entities.Contact.get(id); // Re-fetch updated contact to ensure viewingContact is fresh
    },
    onSuccess: (updatedContact) => {
      queryClient.invalidateQueries({ queryKey: ['crm-contacts'] });
      setShowForm(false);
      // If the currently viewed contact was updated, update viewingContact state as well
      if (viewingContact && viewingContact.id === updatedContact.id) {
        setViewingContact(updatedContact);
      }
      toast.success("Contact updated successfully!");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const data = {
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      company: formData.get('company'),
      title: formData.get('title'),
      lifecycle_stage: formData.get('lifecycle_stage') || 'lead',
      notes: formData.get('notes')
    };

    if (selectedContact) {
      updateMutation.mutate({ id: selectedContact.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStage = stageFilter === 'all' || contact.lifecycle_stage === stageFilter;
    
    return matchesSearch && matchesStage;
  });

  const getSentimentColor = (score) => {
    if (score === null || score === undefined) return 'bg-gray-200';
    if (score > 0.3) return 'bg-green-500';
    if (score < -0.3) return 'bg-red-500';
    return 'bg-yellow-500';
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">CRM <span className="text-amber-400">Contacts</span></h1>
          <p className="text-white/70 mt-1 text-sm md:text-base">Manage your customer <span className="text-amber-400">relationships</span></p>
        </div>
        {/* Show 'New Contact' button only when not viewing a specific contact */}
        {!viewingContact && (
          <Button
            onClick={() => {
              setSelectedContact(null);
              setShowForm(true);
            }}
            className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Contact
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <div className="text-sm text-white/60">Total Contacts</div>
          <div className="text-2xl font-bold text-white mt-1">{contacts.length}</div>
        </Card>
        <Card className="p-4 bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <div className="text-sm text-white/60">Customers</div>
          <div className="text-2xl font-bold text-green-400 mt-1">
            {contacts.filter(c => c.lifecycle_stage === 'customer').length}
          </div>
        </Card>
        <Card className="p-4 bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <div className="text-sm text-white/60">Opportunities</div>
          <div className="text-2xl font-bold text-yellow-400 mt-1">
            {contacts.filter(c => c.lifecycle_stage === 'opportunity').length}
          </div>
        </Card>
        <Card className="p-4 bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <div className="text-sm text-white/60">Positive Sentiment</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            {contacts.filter(c => c.sentiment_score > 0.3).length}
          </div>
        </Card>
      </div>

      {/* Filters (Show only when not viewing a specific contact) */}
      {!viewingContact && (
        <Card className="p-4 bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-amber-500/30 text-white placeholder:text-white/40"
              />
            </div>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-full md:w-48 bg-white/5 border-amber-500/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="subscriber">Subscriber</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="mql">MQL</SelectItem>
                <SelectItem value="sql">SQL</SelectItem>
                <SelectItem value="opportunity">Opportunity</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="evangelist">Evangelist</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
      )}

      {/* Contacts Table (Show only when not viewing a specific contact) */}
      {!viewingContact && (
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-amber-500/20 hover:bg-transparent">
                  <TableHead className="text-white/80">Name</TableHead>
                  <TableHead className="text-white/80">Contact Info</TableHead>
                  <TableHead className="text-white/80">Company</TableHead>
                  <TableHead className="text-white/80">Stage</TableHead>
                  <TableHead className="text-white/80">Sentiment</TableHead>
                  <TableHead className="text-white/80">Last Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow className="border-amber-500/20">
                    <TableCell colSpan={6} className="text-center py-8 text-white/60">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredContacts.length === 0 ? (
                  <TableRow className="border-amber-500/20">
                    <TableCell colSpan={6} className="text-center py-8 text-white/60">
                      No contacts found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContacts.map((contact) => {
                    const EmotionIcon = emotionIcons[contact.emotion_state] || Meh;
                    
                    return (
                      <TableRow
                        key={contact.id}
                        onClick={() => setViewingContact(contact)} // Changed to set viewingContact
                        className="cursor-pointer hover:bg-white/5 border-amber-500/20"
                      >
                        <TableCell>
                          <div className="font-medium text-white">
                            {contact.first_name} {contact.last_name}
                          </div>
                          {contact.title && (
                            <div className="text-sm text-white/60">{contact.title}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {contact.email && (
                              <div className="flex items-center gap-1 text-sm text-white/70">
                                <Mail className="w-3 h-3" />
                                {contact.email}
                              </div>
                            )}
                            {contact.phone && (
                              <div className="flex items-center gap-1 text-sm text-white/70">
                                <Phone className="w-3 h-3" />
                                {contact.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {contact.company && (
                            <div className="flex items-center gap-1 text-white/70">
                              <Building className="w-3 h-3" />
                              {contact.company}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={lifecycleColors[contact.lifecycle_stage]}>
                            {contact.lifecycle_stage}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${getSentimentColor(contact.sentiment_score)}`}
                            />
                            <EmotionIcon className={`w-4 h-4 ${emotionColors[contact.emotion_state]}`} />
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-white/60">
                          {contact.last_interaction_at
                            ? format(new Date(contact.last_interaction_at), 'MMM d, yyyy')
                            : 'Never'}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Viewing Contact Detail (NEW SECTION) */}
      {viewingContact && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid lg:grid-cols-3 gap-6"
        >
          {/* Main Contact Info - Left 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Details Card (Adapted from previous Sheet content) */}
            <Card className="p-4 bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {viewingContact.first_name} {viewingContact.last_name}
                  </h3>
                  {viewingContact.title && (
                    <p className="text-white/60">{viewingContact.title}</p>
                  )}
                  {viewingContact.company && (
                    <p className="text-white/70 flex items-center gap-2 mt-1">
                      <Building className="w-4 h-4" />
                      {viewingContact.company}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewingContact(null)} // Back to list button
                  className="border-amber-500/30 text-white hover:bg-white/10"
                >
                  Back to List
                </Button>
              </div>

              <div className="space-y-3 mt-4 border-t border-amber-500/20 pt-4">
                {viewingContact.email && (
                  <div className="flex items-center gap-2 text-white/80">
                    <Mail className="w-4 h-4" />
                    {viewingContact.email}
                  </div>
                )}
                {viewingContact.phone && (
                  <div className="flex items-center gap-2 text-white/80">
                    <Phone className="w-4 h-4" />
                    {viewingContact.phone}
                  </div>
                )}
              </div>

              <div className="mt-4">
                <Label className="text-white/60 text-sm">Lifecycle Stage</Label>
                <Badge className={`${lifecycleColors[viewingContact.lifecycle_stage]} mt-2`}>
                  {viewingContact.lifecycle_stage}
                </Badge>
              </div>

              {viewingContact.sentiment_score !== null && (
                <div className="mt-4">
                  <Label className="text-white/60 text-sm">Sentiment Analysis</Label>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex-1">
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${((viewingContact.sentiment_score + 1) / 2) * 100}%` }}
                          className={`h-full ${getSentimentColor(viewingContact.sentiment_score)}`}
                        />
                      </div>
                    </div>
                    <span className="text-white font-semibold">
                      {(viewingContact.sentiment_score * 100).toFixed(0)}%
                    </span>
                  </div>
                  {viewingContact.emotion_state && (
                    <div className="mt-2 flex items-center gap-2">
                      {React.createElement(emotionIcons[viewingContact.emotion_state], {
                        className: `w-5 h-5 ${emotionColors[viewingContact.emotion_state]}`
                      })}
                      <span className="text-white/70 capitalize">{viewingContact.emotion_state}</span>
                    </div>
                  )}
                </div>
              )}

              {viewingContact.notes && (
                <div className="mt-4">
                  <Label className="text-white/60 text-sm">Notes</Label>
                  <p className="text-white/80 mt-2">{viewingContact.notes}</p>
                </div>
              )}

              <div className="pt-4 mt-4 border-t border-amber-500/20">
                <Button
                  onClick={() => {
                    setSelectedContact(viewingContact); // Set for edit dialog
                    setShowForm(true); // Open edit dialog
                  }}
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
                >
                  Edit Contact
                </Button>
              </div>
            </Card>

            {/* Comments Section */}
            <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-amber-400" />
                  Team Comments
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <CommentThread 
                  entityType="contact"
                  entityId={viewingContact.id}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - AI & Activity */}
          <div className="space-y-6">
            {/* AI Action Suggestions */}
            <AIActionSuggestions 
              entityType="contact"
              entityId={viewingContact.id}
            />

            {/* Team Activity Feed */}
            <TeamActivityFeed 
              entityType="contact"
              entityId={viewingContact.id}
              limit={15}
            />
          </div>
        </motion.div>
      )}

      {/* Create/Edit Dialog (Remains the same, now opened by 'New Contact' or 'Edit Contact' buttons) */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-[#0a1929] border-amber-500/30 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedContact ? 'Edit Contact' : 'New Contact'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name" className="text-white">First Name *</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    defaultValue={selectedContact?.first_name}
                    required
                    className="bg-white/5 border-amber-500/30 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="last_name" className="text-white">Last Name</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    defaultValue={selectedContact?.last_name}
                    className="bg-white/5 border-amber-500/30 text-white"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email" className="text-white">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={selectedContact?.email}
                  required
                  className="bg-white/5 border-amber-500/30 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone" className="text-white">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    defaultValue={selectedContact?.phone}
                    className="bg-white/5 border-amber-500/30 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="company" className="text-white">Company</Label>
                  <Input
                    id="company"
                    name="company"
                    defaultValue={selectedContact?.company}
                    className="bg-white/5 border-amber-500/30 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title" className="text-white">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={selectedContact?.title}
                    className="bg-white/5 border-amber-500/30 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="lifecycle_stage" className="text-white">Lifecycle Stage</Label>
                  <Select name="lifecycle_stage" defaultValue={selectedContact?.lifecycle_stage || 'lead'}>
                    <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="subscriber">Subscriber</SelectItem>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="mql">MQL</SelectItem>
                      <SelectItem value="sql">SQL</SelectItem>
                      <SelectItem value="opportunity">Opportunity</SelectItem>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="evangelist">Evangelist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="notes" className="text-white">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  defaultValue={selectedContact?.notes}
                  rows={4}
                  className="bg-white/5 border-amber-500/30 text-white"
                />
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
                {selectedContact ? 'Update' : 'Create'} Contact
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
