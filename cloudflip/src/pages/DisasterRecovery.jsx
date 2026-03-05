import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  Camera,
  Database,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  Loader2,
  Download,
  RotateCcw,
  Archive,
  TrendingUp
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
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

export default function DisasterRecovery() {
  const [user, setUser] = useState(null);
  const [showSnapshotDialog, setShowSnapshotDialog] = useState(false);
  const [snapshotType, setSnapshotType] = useState('manual');
  const [snapshotNotes, setSnapshotNotes] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: snapshots = [] } = useQuery({
    queryKey: ['baseline-snapshots'],
    queryFn: async () => {
      const all = await api.entities.BaselineSnapshot.list('-captured_at', 50);
      return all.filter(s => s.org_id === user.current_org_id);
    },
    enabled: !!user
  });

  const createSnapshotMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.functions.invoke('createSystemSnapshot', {
        snapshot_type: snapshotType,
        notes: snapshotNotes
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['baseline-snapshots'] });
      setShowSnapshotDialog(false);
      setSnapshotNotes('');
      toast.success("System snapshot created successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to create snapshot: ${error.message}`);
    }
  });

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-amber-400" />
            Disaster Recovery & <span className="text-amber-400">Snapshots</span>
          </h1>
          <p className="text-white/70 mt-2">
            Baseline management, system snapshots, and recovery planning
          </p>
        </div>
        <Button
          onClick={() => setShowSnapshotDialog(true)}
          className="bg-gradient-to-r from-green-600 to-green-500"
        >
          <Camera className="w-4 h-4 mr-2" />
          Create Snapshot
        </Button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-[#0a1929]/60 backdrop-blur border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Camera className="w-5 h-5 text-green-400" />
              <Badge className="bg-green-500/20 text-green-400">Total</Badge>
            </div>
            <p className="text-2xl font-bold text-green-400 mt-2">{snapshots.length}</p>
            <p className="text-white/60 text-xs">Snapshots</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Database className="w-5 h-5 text-blue-400" />
              <Badge className="bg-blue-500/20 text-blue-400">Storage</Badge>
            </div>
            <p className="text-2xl font-bold text-blue-400 mt-2">
              {(snapshots.reduce((sum, s) => sum + (s.storage_size_mb || 0), 0) / 1024).toFixed(1)}GB
            </p>
            <p className="text-white/60 text-xs">Total Size</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Clock className="w-5 h-5 text-purple-400" />
              <Badge className="bg-purple-500/20 text-purple-400">Latest</Badge>
            </div>
            <p className="text-lg font-bold text-purple-400 mt-2">
              {snapshots.length > 0 ? format(new Date(snapshots[0].captured_at), 'MMM d') : 'N/A'}
            </p>
            <p className="text-white/60 text-xs">Last Snapshot</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <Badge className="bg-amber-500/20 text-amber-400">Health</Badge>
            </div>
            <p className="text-2xl font-bold text-amber-400 mt-2">
              {snapshots.length > 0 ? (snapshots[0].system_health_pct || 0).toFixed(0) : 0}%
            </p>
            <p className="text-white/60 text-xs">System Health</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="snapshots">
        <TabsList className="grid grid-cols-3 bg-white/5">
          <TabsTrigger value="snapshots" className="data-[state=active]:bg-green-500/20 text-white">
            <Camera className="w-4 h-4 mr-2" />
            Snapshots
          </TabsTrigger>
          <TabsTrigger value="baseline" className="data-[state=active]:bg-blue-500/20 text-white">
            <Database className="w-4 h-4 mr-2" />
            Baseline
          </TabsTrigger>
          <TabsTrigger value="recovery" className="data-[state=active]:bg-purple-500/20 text-white">
            <RotateCcw className="w-4 h-4 mr-2" />
            Recovery Plans
          </TabsTrigger>
        </TabsList>

        <TabsContent value="snapshots" className="space-y-4">
          {snapshots.length === 0 ? (
            <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20 p-12 text-center">
              <Camera className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/60 mb-2">No snapshots yet</p>
              <p className="text-white/40 text-sm">Create your first system snapshot</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {snapshots.map((snapshot) => (
                <Card key={snapshot.id} className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-white font-semibold">Snapshot {snapshot.snapshot_id}</h3>
                          <Badge className={
                            snapshot.snapshot_type === 'manual' ? 'bg-blue-500/20 text-blue-400' :
                            snapshot.snapshot_type === 'scheduled' ? 'bg-green-500/20 text-green-400' :
                            'bg-red-500/20 text-red-400'
                          }>
                            {snapshot.snapshot_type}
                          </Badge>
                          {snapshot.tags?.map(tag => (
                            <Badge key={tag} className="bg-white/10 text-white/70 text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-white/60 text-sm mb-2">
                          Captured: {format(new Date(snapshot.captured_at), 'PPpp')}
                        </p>
                        {snapshot.notes && (
                          <p className="text-white/70 text-sm italic">"{snapshot.notes}"</p>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                          <div className="text-xs">
                            <span className="text-white/50">Services: </span>
                            <span className="text-white font-medium">{snapshot.services_state?.length || 0}</span>
                          </div>
                          <div className="text-xs">
                            <span className="text-white/50">SLAs: </span>
                            <span className="text-white font-medium">{snapshot.sla_state?.length || 0}</span>
                          </div>
                          <div className="text-xs">
                            <span className="text-white/50">Health: </span>
                            <span className="text-green-400 font-medium">{snapshot.system_health_pct?.toFixed(1) || 0}%</span>
                          </div>
                          <div className="text-xs">
                            <span className="text-white/50">Size: </span>
                            <span className="text-white font-medium">{snapshot.storage_size_mb || 0}MB</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="border-amber-500/30 text-white">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="baseline">
          <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20 p-8 text-center">
            <Database className="w-16 h-16 text-blue-400/40 mx-auto mb-4" />
            <h3 className="text-white text-xl font-semibold mb-2">Baseline Management</h3>
            <p className="text-white/60">Use snapshots to establish performance baselines</p>
          </Card>
        </TabsContent>

        <TabsContent value="recovery">
          <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20 p-8 text-center">
            <RotateCcw className="w-16 h-16 text-purple-400/40 mx-auto mb-4" />
            <h3 className="text-white text-xl font-semibold mb-2">Recovery Planning</h3>
            <p className="text-white/60">Define RTO/RPO objectives and recovery procedures</p>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Snapshot Dialog */}
      <Dialog open={showSnapshotDialog} onOpenChange={setShowSnapshotDialog}>
        <DialogContent className="bg-[#0a1929] border-amber-500/30">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-green-400" />
              Create System Snapshot
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-white">Snapshot Type</Label>
              <Select value={snapshotType} onValueChange={setSnapshotType}>
                <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="incident_triggered">Incident Triggered</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white">Notes (Optional)</Label>
              <Textarea
                value={snapshotNotes}
                onChange={(e) => setSnapshotNotes(e.target.value)}
                placeholder="e.g., Pre-deployment baseline, Monthly checkpoint..."
                className="bg-white/5 border-amber-500/30 text-white"
                rows={3}
              />
            </div>
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-blue-400 text-sm">
                <Shield className="w-4 h-4 inline mr-2" />
                Snapshot will capture current state of all services, SLAs, metrics, and incidents
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSnapshotDialog(false)}
              className="border-white/20 text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={() => createSnapshotMutation.mutate()}
              disabled={createSnapshotMutation.isPending}
              className="bg-gradient-to-r from-green-600 to-green-500"
            >
              {createSnapshotMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</>
              ) : (
                <><Camera className="w-4 h-4 mr-2" />Create Snapshot</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}