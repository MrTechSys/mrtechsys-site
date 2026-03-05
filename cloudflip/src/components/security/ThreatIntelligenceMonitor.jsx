
import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Shield,
  Globe,
  AlertTriangle,
  Search,
  Loader2,
  CheckCircle,
  Ban,
  MapPin,
  Activity
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function ThreatIntelligenceMonitor() {
  const [searchIp, setSearchIp] = useState("");
  const [enrichmentLoading, setEnrichmentLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: threats = [], isLoading } = useQuery({
    queryKey: ['threat-intelligence'],
    queryFn: async () => {
      return await api.entities.ThreatIntelligence.list('-last_seen', 50);
    }
  });

  const lookupMutation = useMutation({
    mutationFn: async (ipAddress) => {
      const { data } = await api.functions.invoke('threatIntelligenceLookup', {
        ipAddress
      });
      return data;
    },
    onSuccess: (data) => {
      if (data.threat.is_blacklisted) {
        toast.error(`Threat detected and blacklisted: ${data.analysis.reasoning}`);
      } else {
        toast.success(`IP analyzed: Reputation ${data.threat.reputation_score}/100`);
      }
      queryClient.invalidateQueries({ queryKey: ['threat-intelligence'] });
      setSearchIp("");
    },
    onError: () => {
      toast.error("Lookup failed");
    }
  });

  const whitelistMutation = useMutation({
    mutationFn: async (threatId) => {
      await api.entities.ThreatIntelligence.update(threatId, {
        whitelisted: true,
        is_blacklisted: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threat-intelligence'] });
      toast.success("IP whitelisted");
    }
  });

  const enrichMutation = useMutation({
    mutationFn: async (ipAddress) => {
      setEnrichmentLoading(true);
      const { data } = await api.functions.invoke('threatIntelEnrichment', {
        ipAddress,
        sources: ['abuseipdb', 'virustotal', 'alienvault']
      });
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Threat enrichment complete! Score: ${data.enrichment.aggregated_threat_score.toFixed(0)}/100`);
      queryClient.invalidateQueries({ queryKey: ['threat-intelligence'] });
      setSearchIp("");
      setEnrichmentLoading(false);
    },
    onError: (error) => {
      toast.error("Enrichment failed - check API keys are configured");
      setEnrichmentLoading(false);
    }
  });

  const blacklistedThreats = threats.filter(t => t.is_blacklisted);
  const highSeverityThreats = threats.filter(t => t.severity === 'high' || t.severity === 'critical');

  const handleSearch = () => {
    if (searchIp.trim()) {
      lookupMutation.mutate(searchIp.trim());
    }
  };

  const handleEnrich = () => {
    if (searchIp.trim()) {
      enrichMutation.mutate(searchIp.trim());
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-[#0a1929]/60 backdrop-blur border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Ban className="w-5 h-5 text-red-400" />
              <Badge className="bg-red-500/20 text-red-400">Blocked</Badge>
            </div>
            <p className="text-2xl font-bold text-red-400 mt-2">{blacklistedThreats.length}</p>
            <p className="text-white/60 text-xs">IPs Blacklisted</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-orange-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <Badge className="bg-orange-500/20 text-orange-400">High Risk</Badge>
            </div>
            <p className="text-2xl font-bold text-orange-400 mt-2">{highSeverityThreats.length}</p>
            <p className="text-white/60 text-xs">Critical Threats</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Globe className="w-5 h-5 text-blue-400" />
              <Badge className="bg-blue-500/20 text-blue-400">Total</Badge>
            </div>
            <p className="text-2xl font-bold text-blue-400 mt-2">{threats.length}</p>
            <p className="text-white/60 text-xs">IPs Tracked</p>
          </CardContent>
        </Card>
      </div>

      {/* IP Lookup with Enrichment */}
      <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
        <CardContent className="p-4">
          <Label className="text-white mb-2">Threat Intelligence Lookup & Enrichment</Label>
          <div className="flex gap-2">
            <Input
              value={searchIp}
              onChange={(e) => setSearchIp(e.target.value)}
              placeholder="Enter IP address (e.g., 192.168.1.1)"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="bg-white/5 border-purple-500/30 text-white"
            />
            <Button
              onClick={handleSearch}
              disabled={!searchIp.trim() || lookupMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {lookupMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Quick Scan
                </>
              )}
            </Button>
            <Button
              onClick={handleEnrich}
              disabled={!searchIp.trim() || enrichmentLoading}
              className="bg-gradient-to-r from-amber-600 to-orange-600"
            >
              {enrichmentLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Globe className="w-4 h-4 mr-2" />
                  Deep Enrich
                </>
              )}
            </Button>
          </div>
          <p className="text-white/50 text-xs mt-2">
            Quick Scan: Internal DB • Deep Enrich: AbuseIPDB + VirusTotal + AlienVault OTX
          </p>
        </CardContent>
      </Card>

      {/* Threats List */}
      <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            Threat Intelligence Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
            </div>
          ) : threats.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-green-400/40 mx-auto mb-3" />
              <p className="text-white/60">No threats detected</p>
            </div>
          ) : (
            <div className="space-y-3">
              {threats.map((threat) => (
                <div
                  key={threat.id}
                  className={`p-4 rounded-lg border ${
                    threat.is_blacklisted 
                      ? 'border-red-500/30 bg-red-500/10' 
                      : threat.severity === 'high' || threat.severity === 'critical'
                      ? 'border-orange-500/30 bg-orange-500/10'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <code className="text-amber-400 font-mono text-sm">{threat.ip_address}</code>
                        <Badge className={
                          threat.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                          threat.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                          threat.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }>
                          {threat.severity}
                        </Badge>
                        {threat.is_blacklisted && (
                          <Badge className="bg-red-600 text-white">
                            <Ban className="w-3 h-3 mr-1" />
                            Blocked
                          </Badge>
                        )}
                        {threat.whitelisted && (
                          <Badge className="bg-green-600 text-white">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Whitelisted
                          </Badge>
                        )}
                      </div>
                      <p className="text-white/70 text-sm mb-1">
                        Type: <span className="text-white font-medium">{threat.threat_type}</span>
                      </p>
                      {threat.geolocation?.country && (
                        <div className="flex items-center gap-2 text-xs text-white/60">
                          <MapPin className="w-3 h-3" />
                          {threat.geolocation.city}, {threat.geolocation.country}
                          {threat.geolocation.isp && ` • ${threat.geolocation.isp}`}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-white/60 text-xs mb-1">Reputation</p>
                      <p className={`text-2xl font-bold ${
                        threat.reputation_score < 30 ? 'text-red-400' :
                        threat.reputation_score < 60 ? 'text-orange-400' :
                        'text-green-400'
                      }`}>
                        {threat.reputation_score || 0}
                      </p>
                    </div>
                  </div>

                  {threat.blacklist_reason && (
                    <div className="bg-black/20 rounded p-2 mb-2">
                      <p className="text-red-400 text-xs">{threat.blacklist_reason}</p>
                    </div>
                  )}

                  {threat.is_blacklisted && !threat.whitelisted && (
                    <Button
                      onClick={() => whitelistMutation.mutate(threat.id)}
                      size="sm"
                      variant="outline"
                      className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Whitelist IP
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
