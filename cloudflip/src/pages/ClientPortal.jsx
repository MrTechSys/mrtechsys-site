import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building,
  Mail,
  Phone,
  MapPin,
  FileText,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  MessageSquare,
  Lock,
  Shield
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "sonner";
import CommentThread from "../components/CommentThread";

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  viewed: "bg-purple-100 text-purple-800",
  accepted: "bg-green-100 text-green-800",
  scheduled: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  paid: "bg-green-100 text-green-800",
  qualification: "bg-blue-100 text-blue-800",
  proposal: "bg-purple-100 text-purple-800",
  negotiation: "bg-orange-100 text-orange-800",
  closed_won: "bg-green-100 text-green-800"
};

export default function ClientPortal() {
  const [client, setClient] = useState(null);
  const [portalAccess, setPortalAccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedClient, setEditedClient] = useState({});

  useEffect(() => {
    loadClientData();
  }, []);

  const loadClientData = async () => {
    try {
      const user = await api.auth.me();
      
      // Check if user has client portal access
      const accessRecords = await api.entities.ClientPortalAccess.filter({
        email: user.email,
        is_active: true
      });

      if (accessRecords.length > 0) {
        const access = accessRecords[0];
        setPortalAccess(access);

        // Load client data
        const clients = await api.entities.Client.filter({
          id: access.client_id
        });

        if (clients.length > 0) {
          setClient(clients[0]);
          setEditedClient(clients[0]);

          // Update last login
          await api.entities.ClientPortalAccess.update(access.id, {
            last_login: new Date().toISOString(),
            login_count: (access.login_count || 0) + 1
          });
        }
      }
    } catch (error) {
      console.error('Failed to load client data:', error);
    }
  };

  const { data: deals = [] } = useQuery({
    queryKey: ['client-deals', client?.id],
    queryFn: () => client ? api.entities.Deal.filter({ 
      contact_id: client.id 
    }, '-created_date') : [],
    enabled: !!client && portalAccess?.permissions?.can_view_deals
  });

  const { data: quotes = [] } = useQuery({
    queryKey: ['client-quotes', client?.id],
    queryFn: () => client ? api.entities.Quote.filter({ 
      client_id: client.id 
    }, '-created_date') : [],
    enabled: !!client && portalAccess?.permissions?.can_view_quotes
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['client-invoices', client?.id],
    queryFn: () => client ? api.entities.Invoice.filter({ 
      client_id: client.id 
    }, '-created_date') : [],
    enabled: !!client && portalAccess?.permissions?.can_view_invoices
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['client-jobs', client?.id],
    queryFn: () => client ? api.entities.Job.filter({ 
      client_id: client.id 
    }, '-scheduled_start') : [],
    enabled: !!client && portalAccess?.permissions?.can_view_jobs
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['client-activities', client?.id],
    queryFn: () => client ? api.entities.CRMActivity.filter({
      entity_type: 'contact',
      entity_id: client.id
    }, '-created_date', 20) : [],
    enabled: !!client
  });

  const handleUpdateProfile = async () => {
    try {
      await api.entities.Client.update(client.id, {
        phone: editedClient.phone,
        address: editedClient.address,
        notes: editedClient.notes
      });

      setClient(editedClient);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    }
  };

  if (!client || !portalAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1929] to-[#1a1f3a] flex items-center justify-center p-6">
        <Card className="max-w-md w-full bg-white/10 backdrop-blur border-amber-500/30">
          <CardContent className="p-8 text-center">
            <Lock className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Access Required</h2>
            <p className="text-white/70 mb-4">
              You need client portal access to view this page. Please contact your service provider.
            </p>
            <Button
              onClick={() => api.auth.logout()}
              variant="outline"
              className="border-amber-500/30 text-white hover:bg-amber-500/10"
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1929] to-[#1a1f3a] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-start"
        >
          <div className="flex items-center gap-4">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/api-prod/public/68f9c68eee1c76fe83e7fbb0/4f2a625b6_MrTechSys-Naked-Logo.png"
              alt="MrTechSys"
              className="w-16 h-16 object-contain"
            />
            <div>
              <h1 className="text-3xl font-bold text-white">
                Welcome, <span className="text-amber-400">{client.name}</span>
              </h1>
              <p className="text-white/70 mt-1">Your secure client portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-400" />
            <span className="text-sm text-white/70">Secured Connection</span>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Active Deals</p>
                  <p className="text-2xl font-bold text-white">{deals.filter(d => !['closed_won', 'closed_lost'].includes(d.pipeline_stage)).length}</p>
                </div>
                <Target className="w-8 h-8 text-amber-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Open Quotes</p>
                  <p className="text-2xl font-bold text-white">{quotes.filter(q => ['sent', 'viewed'].includes(q.status)).length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Scheduled Jobs</p>
                  <p className="text-2xl font-bold text-white">{jobs.filter(j => j.status === 'scheduled').length}</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Total Paid</p>
                  <p className="text-2xl font-bold text-green-400">
                    ${invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0).toFixed(0)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-[#0a1929]/60 border border-amber-500/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
              Overview
            </TabsTrigger>
            {portalAccess.permissions.can_view_deals && (
              <TabsTrigger value="deals" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
                Deals ({deals.length})
              </TabsTrigger>
            )}
            {portalAccess.permissions.can_view_quotes && (
              <TabsTrigger value="quotes" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
                Quotes ({quotes.length})
              </TabsTrigger>
            )}
            {portalAccess.permissions.can_view_jobs && (
              <TabsTrigger value="jobs" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
                Projects ({jobs.length})
              </TabsTrigger>
            )}
            {portalAccess.permissions.can_update_profile && (
              <TabsTrigger value="profile" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
                My Profile
              </TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Contact Information */}
              <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Building className="w-5 h-5 text-amber-400" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-white/80">
                  {client.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-amber-400" />
                      {client.email}
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-amber-400" />
                      {client.phone}
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-amber-400 mt-1" />
                      <div>
                        <p>{client.address.street}</p>
                        <p>{client.address.city}, {client.address.state} {client.address.zip}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-400" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {activities.length === 0 ? (
                      <p className="text-white/60 text-sm text-center py-4">No recent activity</p>
                    ) : (
                      activities.slice(0, 10).map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 p-2 bg-white/5 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-1" />
                          <div>
                            <p className="text-sm text-white">{activity.action_type}</p>
                            <p className="text-xs text-white/60">
                              {format(new Date(activity.created_date), 'MMM d, h:mm a')}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Jobs */}
            {jobs.filter(j => j.status === 'scheduled').length > 0 && (
              <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-400" />
                    Upcoming Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {jobs.filter(j => j.status === 'scheduled').slice(0, 4).map((job) => (
                      <div key={job.id} className="p-4 bg-white/5 rounded-lg border border-amber-500/20">
                        <h4 className="font-medium text-white mb-2">{job.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-white/70">
                          <Calendar className="w-4 h-4 text-amber-400" />
                          {format(new Date(job.scheduled_start), 'MMM d, yyyy h:mm a')}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Deals Tab */}
          <TabsContent value="deals">
            <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white">Your Deals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {deals.length === 0 ? (
                    <p className="text-center py-8 text-white/60">No deals yet</p>
                  ) : (
                    deals.map((deal) => (
                      <div key={deal.id} className="p-4 bg-white/5 rounded-lg border border-amber-500/20">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-white">{deal.name}</h4>
                          <Badge className={statusColors[deal.pipeline_stage]}>
                            {deal.pipeline_stage.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-amber-400 font-semibold">${deal.value.toLocaleString()}</span>
                          {deal.close_date && (
                            <span className="text-sm text-white/60">
                              Expected: {format(new Date(deal.close_date), 'MMM d, yyyy')}
                            </span>
                          )}
                        </div>
                        {portalAccess.permissions.can_add_comments && (
                          <div className="mt-4 pt-4 border-t border-amber-500/20">
                            <CommentThread entityType="deal" entityId={deal.id} entityName={deal.name} />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quotes Tab */}
          <TabsContent value="quotes">
            <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white">Your Quotes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quotes.length === 0 ? (
                    <p className="text-center py-8 text-white/60">No quotes yet</p>
                  ) : (
                    quotes.map((quote) => (
                      <div key={quote.id} className="p-4 bg-white/5 rounded-lg border border-amber-500/20">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-white">Quote #{quote.number || quote.id.slice(0, 8)}</h4>
                            <p className="text-sm text-white/60">
                              Created {format(new Date(quote.created_date), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <Badge className={statusColors[quote.status]}>
                            {quote.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-amber-400 font-semibold text-lg">${quote.total?.toFixed(2)}</span>
                          {quote.valid_until && (
                            <span className="text-sm text-white/60">
                              Valid until: {format(new Date(quote.valid_until), 'MMM d, yyyy')}
                            </span>
                          )}
                        </div>
                        {quote.pdf_url && (
                          <Button
                            onClick={() => window.open(quote.pdf_url, '_blank')}
                            className="mt-3 w-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30"
                            size="sm"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            View Quote
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs">
            <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white">Your Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {jobs.length === 0 ? (
                    <p className="text-center py-8 text-white/60">No projects yet</p>
                  ) : (
                    jobs.map((job) => (
                      <div key={job.id} className="p-4 bg-white/5 rounded-lg border border-amber-500/20">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium text-white mb-1">{job.title}</h4>
                            {job.description && (
                              <p className="text-sm text-white/60">{job.description}</p>
                            )}
                          </div>
                          <Badge className={statusColors[job.status]}>
                            {job.status.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        {job.scheduled_start && (
                          <div className="flex items-center gap-2 text-sm text-white/70">
                            <Calendar className="w-4 h-4 text-amber-400" />
                            {format(new Date(job.scheduled_start), 'MMM d, yyyy h:mm a')}
                          </div>
                        )}
                        {job.address && (
                          <div className="flex items-center gap-2 text-sm text-white/70 mt-2">
                            <MapPin className="w-4 h-4 text-amber-400" />
                            {job.address.street}, {job.address.city}, {job.address.state}
                          </div>
                        )}
                        {portalAccess.permissions.can_add_comments && (
                          <div className="mt-4 pt-4 border-t border-amber-500/20">
                            <CommentThread entityType="job" entityId={job.id} entityName={job.title} />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white">My Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white">Name</Label>
                  <Input
                    value={client.name}
                    disabled
                    className="bg-white/5 border-amber-500/30 text-white/50"
                  />
                  <p className="text-xs text-white/50 mt-1">Contact support to change your name</p>
                </div>

                <div>
                  <Label className="text-white">Email</Label>
                  <Input
                    value={client.email}
                    disabled
                    className="bg-white/5 border-amber-500/30 text-white/50"
                  />
                  <p className="text-xs text-white/50 mt-1">Contact support to change your email</p>
                </div>

                <div>
                  <Label className="text-white">Phone</Label>
                  <Input
                    value={editedClient.phone || ''}
                    onChange={(e) => setEditedClient({...editedClient, phone: e.target.value})}
                    disabled={!isEditing}
                    className="bg-white/5 border-amber-500/30 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white">Address</Label>
                  <div className="space-y-2">
                    <Input
                      placeholder="Street"
                      value={editedClient.address?.street || ''}
                      onChange={(e) => setEditedClient({
                        ...editedClient,
                        address: {...editedClient.address, street: e.target.value}
                      })}
                      disabled={!isEditing}
                      className="bg-white/5 border-amber-500/30 text-white"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="City"
                        value={editedClient.address?.city || ''}
                        onChange={(e) => setEditedClient({
                          ...editedClient,
                          address: {...editedClient.address, city: e.target.value}
                        })}
                        disabled={!isEditing}
                        className="bg-white/5 border-amber-500/30 text-white"
                      />
                      <Input
                        placeholder="State"
                        value={editedClient.address?.state || ''}
                        onChange={(e) => setEditedClient({
                          ...editedClient,
                          address: {...editedClient.address, state: e.target.value}
                        })}
                        disabled={!isEditing}
                        className="bg-white/5 border-amber-500/30 text-white"
                      />
                      <Input
                        placeholder="ZIP"
                        value={editedClient.address?.zip || ''}
                        onChange={(e) => setEditedClient({
                          ...editedClient,
                          address: {...editedClient.address, zip: e.target.value}
                        })}
                        disabled={!isEditing}
                        className="bg-white/5 border-amber-500/30 text-white"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-white">Notes</Label>
                  <Textarea
                    value={editedClient.notes || ''}
                    onChange={(e) => setEditedClient({...editedClient, notes: e.target.value})}
                    disabled={!isEditing}
                    rows={4}
                    className="bg-white/5 border-amber-500/30 text-white"
                  />
                </div>

                <div className="flex gap-3">
                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={handleUpdateProfile}
                        className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
                      >
                        Save Changes
                      </Button>
                      <Button
                        onClick={() => {
                          setIsEditing(false);
                          setEditedClient(client);
                        }}
                        variant="outline"
                        className="border-amber-500/30 text-white hover:bg-white/10"
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}