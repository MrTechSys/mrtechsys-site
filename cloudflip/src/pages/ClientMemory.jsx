import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Heart,
  Star,
  Plus,
  Trash2,
  Sparkles,
  Calendar,
  MessageCircle,
  Gift,
  Clock
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ClientMemory() {
  const [selectedClient, setSelectedClient] = useState("");
  const [newPrefKey, setNewPrefKey] = useState("");
  const [newPrefValue, setNewPrefValue] = useState("");
  const [newPrefType, setNewPrefType] = useState("personal");
  const [newPrefImportance, setNewPrefImportance] = useState("medium");

  const queryClient = useQueryClient();

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.entities.Client.list(),
    initialData: []
  });

  const { data: preferences = [] } = useQuery({
    queryKey: ['client-preferences', selectedClient],
    queryFn: () => selectedClient 
      ? api.entities.ClientPreference.filter({ client_id: selectedClient })
      : [],
    enabled: !!selectedClient,
    initialData: []
  });

  const createPrefMutation = useMutation({
    mutationFn: async (data) => {
      const user = await api.auth.me();
      return api.entities.ClientPreference.create({
        org_id: user.current_org_id,
        client_id: selectedClient,
        preference_type: data.type,
        key: data.key,
        value: data.value,
        importance: data.importance,
        auto_learned: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-preferences'] });
      toast.success("Preference saved!");
      setNewPrefKey("");
      setNewPrefValue("");
    }
  });

  const deletePrefMutation = useMutation({
    mutationFn: (id) => api.entities.ClientPreference.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-preferences'] });
      toast.success("Preference deleted!");
    }
  });

  const handleAddPreference = () => {
    if (!newPrefKey || !newPrefValue) {
      toast.error("Please enter both key and value");
      return;
    }

    createPrefMutation.mutate({
      key: newPrefKey,
      value: newPrefValue,
      type: newPrefType,
      importance: newPrefImportance
    });
  };

  const safeClients = Array.isArray(clients) ? clients : [];
  const safePreferences = Array.isArray(preferences) ? preferences : [];
  const selectedClientData = safeClients.find(c => c.id === selectedClient);

  const preferencesByType = safePreferences.reduce((acc, pref) => {
    const type = pref.preference_type || 'personal';
    if (!acc[type]) acc[type] = [];
    acc[type].push(pref);
    return acc;
  }, {});

  const typeIcons = {
    scheduling: Clock,
    communication: MessageCircle,
    service: Star,
    personal: Heart,
    payment: Gift
  };

  const importanceColors = {
    critical: "bg-red-500/20 text-red-400 border-red-500/30",
    high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    medium: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    low: "bg-gray-500/20 text-gray-400 border-gray-500/30"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1929] via-[#0d1f3c] to-[#0a1929] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-400" />
            Client Memory Capsule
          </h1>
          <p className="text-white/60">Store and recall important client preferences & details</p>
        </div>

        {/* Client Selector */}
        <Card className="bg-[#0a1929]/60 backdrop-blur border-purple-500/30">
          <CardContent className="p-6">
            <Label className="text-white mb-2 block">Select Client</Label>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="bg-white/5 border-purple-500/30 text-white">
                <SelectValue placeholder="Choose a client to view their preferences" />
              </SelectTrigger>
              <SelectContent>
                {safeClients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name} {client.email ? `(${client.email})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedClient && selectedClientData && (
          <>
            {/* Client Overview */}
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">{selectedClientData.name}</h3>
                    <p className="text-white/60">{selectedClientData.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-purple-500/20 text-purple-400 mb-2">
                      {safePreferences.length} Preferences
                    </Badge>
                    <p className="text-white/50 text-xs">
                      Member since {format(new Date(selectedClientData.created_date), 'MMM yyyy')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add New Preference */}
            <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-amber-400" />
                  Add Preference
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Type</Label>
                    <Select value={newPrefType} onValueChange={setNewPrefType}>
                      <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduling">Scheduling</SelectItem>
                        <SelectItem value="communication">Communication</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="payment">Payment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white">Importance</Label>
                    <Select value={newPrefImportance} onValueChange={setNewPrefImportance}>
                      <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white">Preference Name</Label>
                    <Input
                      value={newPrefKey}
                      onChange={(e) => setNewPrefKey(e.target.value)}
                      placeholder="e.g., 'Preferred Time', 'Likes Coffee'"
                      className="bg-white/5 border-amber-500/30 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Value</Label>
                    <Input
                      value={newPrefValue}
                      onChange={(e) => setNewPrefValue(e.target.value)}
                      placeholder="e.g., 'Morning appointments', 'Yes'"
                      className="bg-white/5 border-amber-500/30 text-white"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleAddPreference}
                  disabled={createPrefMutation.isPending}
                  className="mt-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Save Preference
                </Button>
              </CardContent>
            </Card>

            {/* Preferences by Type */}
            <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(preferencesByType).map(([type, prefs]) => {
                const Icon = typeIcons[type] || Heart;
                
                return (
                  <Card key={type} className="bg-[#0a1929]/60 backdrop-blur border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2 capitalize">
                        <Icon className="w-5 h-5 text-amber-400" />
                        {type.replace('_', ' ')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {prefs.map(pref => (
                          <div
                            key={pref.id}
                            className="p-3 bg-white/5 rounded-lg border border-white/10 hover:border-amber-500/20 transition-all"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h5 className="text-white font-medium text-sm">{pref.key}</h5>
                                  <Badge className={importanceColors[pref.importance]}>
                                    {pref.importance}
                                  </Badge>
                                  {pref.auto_learned && (
                                    <Badge className="bg-purple-500/20 text-purple-400">
                                      <Sparkles className="w-3 h-3 mr-1" />
                                      AI
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-white/70 text-sm">{pref.value}</p>
                                {pref.notes && (
                                  <p className="text-white/50 text-xs mt-1 italic">{pref.notes}</p>
                                )}
                              </div>
                              <Button
                                onClick={() => deletePrefMutation.mutate(pref.id)}
                                size="icon"
                                variant="ghost"
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {!selectedClient && (
          <Card className="bg-[#0a1929]/60 backdrop-blur border-white/10">
            <CardContent className="p-12 text-center">
              <Brain className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">Select a client to view and manage their preferences</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}