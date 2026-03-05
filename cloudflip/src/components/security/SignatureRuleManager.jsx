import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Shield,
  Plus,
  Loader2,
  CheckCircle,
  XCircle,
  Play,
  Pause
} from "lucide-react";
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
import { toast } from "sonner";

export default function SignatureRuleManager() {
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    category: 'sql_injection',
    severity: 'medium',
    pattern: '',
    action: 'alert'
  });

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['signature-rules'],
    queryFn: async () => {
      const currentUser = await api.auth.me();
      return await api.entities.SignatureRule.filter({
        org_id: currentUser.current_org_id
      }, '-created_date');
    }
  });

  const createMutation = useMutation({
    mutationFn: async (ruleData) => {
      const currentUser = await api.auth.me();
      return await api.entities.SignatureRule.create({
        org_id: currentUser.current_org_id,
        rule_id: `SIG-${Date.now()}`,
        ...ruleData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signature-rules'] });
      setShowCreateDialog(false);
      setNewRule({ name: '', category: 'sql_injection', severity: 'medium', pattern: '', action: 'alert' });
      toast.success("Signature rule created!");
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ ruleId, isActive }) => {
      await api.entities.SignatureRule.update(ruleId, {
        is_active: !isActive
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signature-rules'] });
    }
  });

  const activeRules = rules.filter(r => r.is_active);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-[#0a1929]/60 backdrop-blur border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Shield className="w-5 h-5 text-green-400" />
              <Badge className="bg-green-500/20 text-green-400">Active</Badge>
            </div>
            <p className="text-2xl font-bold text-green-400 mt-2">{activeRules.length}</p>
            <p className="text-white/60 text-xs">Rules Enabled</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <CheckCircle className="w-5 h-5 text-blue-400" />
              <Badge className="bg-blue-500/20 text-blue-400">Matches</Badge>
            </div>
            <p className="text-2xl font-bold text-blue-400 mt-2">
              {rules.reduce((sum, r) => sum + (r.match_count || 0), 0)}
            </p>
            <p className="text-white/60 text-xs">Total Detections</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-purple-500/30">
          <CardContent className="p-4">
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Rule
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Rules List */}
      <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            Signature Detection Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
            </div>
          ) : rules.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/60">No signature rules configured</p>
            </div>
          ) : (
            <div className="space-y-2">
              {rules.map((rule) => (
                <div key={rule.id} className={`p-4 rounded-lg border ${
                  rule.is_active ? 'border-green-500/30 bg-green-500/5' : 'border-white/10 bg-white/5'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-white font-semibold">{rule.name}</h3>
                        <Badge className={
                          rule.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                          rule.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                          rule.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }>
                          {rule.severity}
                        </Badge>
                        <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                          {rule.category}
                        </Badge>
                        {rule.is_active ? (
                          <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                        ) : (
                          <Badge className="bg-gray-500/20 text-gray-400">Paused</Badge>
                        )}
                      </div>
                      <code className="text-xs text-white/70 bg-black/30 px-2 py-1 rounded">
                        {rule.pattern}
                      </code>
                    </div>
                    <div className="text-right">
                      <p className="text-white/60 text-xs mb-1">Matches</p>
                      <p className="text-2xl font-bold text-amber-400">{rule.match_count || 0}</p>
                      <Button
                        onClick={() => toggleMutation.mutate({ ruleId: rule.id, isActive: rule.is_active })}
                        size="sm"
                        variant="outline"
                        className="mt-2 border-amber-500/30"
                      >
                        {rule.is_active ? (
                          <>
                            <Pause className="w-3 h-3 mr-1" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 mr-1" />
                            Enable
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Rule Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-[#0a1929] border-amber-500/30">
          <DialogHeader>
            <DialogTitle className="text-white">Create Signature Rule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-white">Rule Name</Label>
              <Input
                value={newRule.name}
                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                placeholder="SQL Injection Detection"
                className="bg-white/5 border-amber-500/30 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Category</Label>
                <Select value={newRule.category} onValueChange={(v) => setNewRule({ ...newRule, category: v })}>
                  <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sql_injection">SQL Injection</SelectItem>
                    <SelectItem value="xss">Cross-Site Scripting</SelectItem>
                    <SelectItem value="malware">Malware</SelectItem>
                    <SelectItem value="exploit">Exploit Attempt</SelectItem>
                    <SelectItem value="dos">DoS Attack</SelectItem>
                    <SelectItem value="reconnaissance">Reconnaissance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white">Severity</Label>
                <Select value={newRule.severity} onValueChange={(v) => setNewRule({ ...newRule, severity: v })}>
                  <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-white">Pattern (Regex or String)</Label>
              <Textarea
                value={newRule.pattern}
                onChange={(e) => setNewRule({ ...newRule, pattern: e.target.value })}
                placeholder="(?i)(union.*select|exec.*sp_|<script)"
                className="bg-white/5 border-amber-500/30 text-white font-mono text-xs"
                rows={3}
              />
            </div>
            <div>
              <Label className="text-white">Action on Match</Label>
              <Select value={newRule.action} onValueChange={(v) => setNewRule({ ...newRule, action: v })}>
                <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alert">Alert Only</SelectItem>
                  <SelectItem value="block">Block & Alert</SelectItem>
                  <SelectItem value="log">Log Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              className="border-white/20 text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate(newRule)}
              disabled={!newRule.name || !newRule.pattern || createMutation.isPending}
              className="bg-gradient-to-r from-green-600 to-green-500"
            >
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Create Rule'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}