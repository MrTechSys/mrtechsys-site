import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Database,
  Play,
  History,
  CheckCircle,
  AlertTriangle,
  Download,
  Upload,
  RefreshCw,
  Clock,
  HardDrive
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export default function BackupManager() {
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);
  const queryClient = useQueryClient();

  const { data: snapshots = [] } = useQuery({
    queryKey: ['baseline-snapshots'],
    queryFn: () => api.entities.BaselineSnapshot.list('-captured_at', 50),
  });

  const createSnapshotMutation = useMutation({
    mutationFn: async () => {
      const response = await api.functions.invoke('baselineManager', {
        action: 'create_snapshot',
        snapshot_type: 'manual'
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['baseline-snapshots'] });
      toast.success("Snapshot created successfully!");
    },
    onError: (error) => {
      toast.error(`Snapshot failed: ${error.message}`);
    }
  });

  const restoreSnapshotMutation = useMutation({
    mutationFn: async (snapshotId) => {
      const response = await api.functions.invoke('baselineManager', {
        action: 'restore_snapshot',
        snapshot_id: snapshotId,
        dry_run: false
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      setShowRestoreDialog(false);
      toast.success("System restored from snapshot!");
    },
    onError: (error) => {
      toast.error(`Restore failed: ${error.message}`);
    }
  });

  const verifySnapshotMutation = useMutation({
    mutationFn: async (snapshotId) => {
      const response = await api.functions.invoke('baselineManager', {
        action: 'verify_snapshot',
        snapshot_id: snapshotId
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Snapshot verified: ${data.integrity ? 'Valid' : 'Corrupted'}`);
    }
  });

  const latestSnapshot = snapshots[0];
  const totalSize = snapshots.reduce((sum, s) => sum + (s.storage_size_mb || 0), 0);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Database className="w-8 h-8 text-cyan-400" />
            Backup <span className="text-amber-400">Manager</span>
          </h1>
          <p className="text-white/70 mt-1">System snapshots and disaster recovery</p>
        </div>
        <Button
          onClick={() => createSnapshotMutation.mutate()}
          disabled={createSnapshotMutation.isPending}
          className="bg-gradient-to-r from-cyan-600 to-cyan-500"
        >
          <Download className="w-4 h-4 mr-2" />
          {createSnapshotMutation.isPending ? 'Creating...' : 'Create Snapshot'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Database className="w-5 h-5 text-cyan-400" />
              <Badge className="bg-cyan-500/20 text-cyan-400">Total</Badge>
            </div>
            <p className="text-3xl font-bold text-cyan-400">{snapshots.length}</p>
            <p className="text-white/60 text-xs mt-1">Snapshots</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <HardDrive className="w-5 h-5 text-purple-400" />
              <Badge className="bg-purple-500/20 text-purple-400">Storage</Badge>
            </div>
            <p className="text-3xl font-bold text-purple-400">
              {(totalSize / 1024).toFixed(1)}GB
            </p>
            <p className="text-white/60 text-xs mt-1">Total size</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-green-400" />
              <Badge className="bg-green-500/20 text-green-400">Latest</Badge>
            </div>
            <p className="text-lg font-bold text-green-400">
              {latestSnapshot ? formatDistanceToNow(new Date(latestSnapshot.captured_at), { addSuffix: true }) : 'N/A'}
            </p>
            <p className="text-white/60 text-xs mt-1">Last backup</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-blue-400" />
              <Badge className="bg-blue-500/20 text-blue-400">Health</Badge>
            </div>
            <p className="text-3xl font-bold text-blue-400">
              {latestSnapshot?.system_health_pct || 0}%
            </p>
            <p className="text-white/60 text-xs mt-1">System health</p>
          </CardContent>
        </Card>
      </div>

      {/* Snapshots List */}
      <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
        <CardHeader>
          <CardTitle className="text-white">Backup Snapshots</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {snapshots.map((snapshot) => (
              <div
                key={snapshot.id}
                className="p-4 bg-white/5 rounded-lg border border-amber-500/20 hover:border-amber-500/40 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={
                        snapshot.snapshot_type === 'manual' ? 'bg-blue-500/20 text-blue-400' :
                        snapshot.snapshot_type === 'scheduled' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-red-500/20 text-red-400'
                      }>
                        {snapshot.snapshot_type}
                      </Badge>
                      {snapshot.tags?.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-white/60">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <h3 className="text-white font-medium mb-1">
                      Snapshot {snapshot.snapshot_id}
                    </h3>
                    
                    <div className="grid md:grid-cols-3 gap-4 mt-2 text-sm">
                      <div>
                        <p className="text-white/50 text-xs">Captured</p>
                        <p className="text-white">
                          {format(new Date(snapshot.captured_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/50 text-xs">Size</p>
                        <p className="text-white">
                          {(snapshot.storage_size_mb / 1024).toFixed(2)} GB
                        </p>
                      </div>
                      <div>
                        <p className="text-white/50 text-xs">System Health</p>
                        <p className="text-green-400 font-bold">
                          {snapshot.system_health_pct || 0}%
                        </p>
                      </div>
                    </div>

                    {snapshot.notes && (
                      <p className="text-white/60 text-xs mt-2 italic">{snapshot.notes}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => verifySnapshotMutation.mutate(snapshot.snapshot_id)}
                      disabled={verifySnapshotMutation.isPending}
                      className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verify
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedSnapshot(snapshot);
                        setShowRestoreDialog(true);
                      }}
                      className="bg-gradient-to-r from-orange-600 to-orange-500"
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      Restore
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Restore Confirmation Dialog */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent className="bg-[#0a1929] border-amber-500/30">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              Confirm System Restore
            </DialogTitle>
          </DialogHeader>

          {selectedSnapshot && (
            <div className="space-y-4">
              <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                <p className="text-orange-400 font-medium text-sm mb-2">
                  ⚠️ This will restore your system to a previous state
                </p>
                <p className="text-white/70 text-xs">
                  Any changes made after this snapshot will be lost. This action cannot be undone.
                </p>
              </div>

              <div className="p-3 bg-white/5 rounded border border-white/10">
                <h4 className="text-white font-medium text-sm mb-2">Snapshot Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">ID:</span>
                    <span className="text-white">{selectedSnapshot.snapshot_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Captured:</span>
                    <span className="text-white">
                      {format(new Date(selectedSnapshot.captured_at), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">System Health:</span>
                    <span className="text-green-400 font-bold">
                      {selectedSnapshot.system_health_pct}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRestoreDialog(false);
                setSelectedSnapshot(null);
              }}
              className="border-amber-500/30 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={() => restoreSnapshotMutation.mutate(selectedSnapshot.snapshot_id)}
              disabled={restoreSnapshotMutation.isPending}
              className="bg-gradient-to-r from-orange-600 to-orange-500"
            >
              {restoreSnapshotMutation.isPending ? 'Restoring...' : 'Confirm Restore'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}