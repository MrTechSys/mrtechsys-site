
import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Database,
  Search,
  Plus,
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const healthColors = {
  healthy: "bg-green-100 text-green-800 border-green-500",
  degraded: "bg-yellow-100 text-yellow-800 border-yellow-500",
  down: "bg-red-100 text-red-800 border-red-500",
  unknown: "bg-gray-100 text-gray-800 border-gray-500"
};

const tierColors = {
  critical: "bg-red-100 text-red-800",
  high: "bg-orange-100 text-orange-800",
  medium: "bg-blue-100 text-blue-800",
  low: "bg-gray-100 text-gray-800"
};

export default function AssetInventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [healthFilter, setHealthFilter] = useState("all");

  const queryClient = useQueryClient(); // Initialize useQueryClient

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => api.entities.Service.list('-created_date'),
  });

  const refreshHealthMutation = useMutation({
    mutationFn: async (serviceId) => {
      const response = await api.functions.invoke('sentinelHealthCheck', { serviceId });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success(`Health check completed: ${data.status}`);
    },
    onError: (error) => {
      toast.error(`Health check failed: ${error.message}`);
    }
  });

  const filteredServices = services.filter(service => {
    const matchesSearch = 
      service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.service_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesHealth = healthFilter === 'all' || service.health_status === healthFilter;
    return matchesSearch && matchesHealth;
  });

  const healthySvcs = services.filter(s => s.health_status === 'healthy').length;
  const degradedSvcs = services.filter(s => s.health_status === 'degraded').length;
  const downSvcs = services.filter(s => s.health_status === 'down').length;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Database className="w-8 h-8 text-cyan-400" />
            Asset <span className="text-amber-400">Inventory</span>
          </h1>
          <p className="text-white/70 mt-1">Monitor and manage service infrastructure</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Database className="w-5 h-5 text-cyan-400" />
              <Badge className="bg-cyan-500/20 text-cyan-400">Total</Badge>
            </div>
            <p className="text-3xl font-bold text-cyan-400">{services.length}</p>
            <p className="text-white/60 text-xs mt-1">Services</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <Badge className="bg-green-500/20 text-green-400">Healthy</Badge>
            </div>
            <p className="text-3xl font-bold text-green-400">{healthySvcs}</p>
            <p className="text-white/60 text-xs mt-1">Operational</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <Badge className="bg-yellow-500/20 text-yellow-400">Degraded</Badge>
            </div>
            <p className="text-3xl font-bold text-yellow-400">{degradedSvcs}</p>
            <p className="text-white/60 text-xs mt-1">Needs attention</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="w-5 h-5 text-red-400" />
              <Badge className="bg-red-500/20 text-red-400">Down</Badge>
            </div>
            <p className="text-3xl font-bold text-red-400">{downSvcs}</p>
            <p className="text-white/60 text-xs mt-1">Critical</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-amber-500/30 text-white placeholder:text-white/40"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'healthy', 'degraded', 'down'].map(status => (
                <Button
                  key={status}
                  variant={healthFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setHealthFilter(status)}
                  className={healthFilter === status ? '' : 'border-amber-500/30 text-white'}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((service) => (
          <Card key={service.id} className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Badge className={tierColors[service.tier]}>
                    {service.tier} tier
                  </Badge>
                  <h3 className="text-white font-bold mt-2">{service.name}</h3>
                  <p className="text-white/60 text-xs mt-1">{service.service_id}</p>
                </div>
                <Badge className={healthColors[service.health_status]}>
                  {service.health_status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {service.description && (
                <p className="text-white/70 text-sm">{service.description}</p>
              )}

              {service.tech_stack?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {service.tech_stack.slice(0, 3).map((tech, idx) => (
                    <Badge key={idx} variant="outline" className="text-white/60 text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              )}

              {service.last_deployed && (
                <p className="text-white/50 text-xs">
                  Last deployed: {format(new Date(service.last_deployed), 'MMM d, h:mm a')}
                </p>
              )}

              <Button
                onClick={() => refreshHealthMutation.mutate(service.service_id)}
                disabled={refreshHealthMutation.isPending}
                size="sm"
                variant="outline"
                className="w-full border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
              >
                <RefreshCw className={`w-3 h-3 mr-2 ${refreshHealthMutation.isPending ? 'animate-spin' : ''}`} />
                Check Health
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
