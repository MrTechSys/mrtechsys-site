
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Shield,
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  ArrowLeft,
  Eye,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const statusColors = {
  pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: Clock },
  approved: { bg: 'bg-green-500/20', text: 'text-green-400', icon: CheckCircle },
  rejected: { bg: 'bg-red-500/20', text: 'text-red-400', icon: XCircle }
};

export default function EvidenceVault() {
  const [user, setUser] = useState(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedControl, setSelectedControl] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    name: '',
    description: '',
    file_type: 'document',
    file: null
  });
  const [filterStatus, setFilterStatus] = useState('all');
  const [collectingEvidence, setCollectingEvidence] = useState(false);
  const [reviewingEvidence, setReviewingEvidence] = useState(false);
  const [userPermissions, setUserPermissions] = useState(null);
  
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);

      // Load user permissions
      const roles = await api.entities.UserRole.filter({
        org_id: currentUser.current_org_id,
        user_id: currentUser.id
      });

      if (roles.length > 0) {
        setUserPermissions(roles[0].permissions);
      } else if (currentUser.role === 'admin') {
        setUserPermissions({
          can_manage_compliance: true,
          can_approve_evidence: true
        });
      } else {
        setUserPermissions({
          can_manage_compliance: false,
          can_approve_evidence: false
        });
      }
    };
    loadUser();
  }, []);

  const { data: controls = [] } = useQuery({
    queryKey: ['compliance-controls'],
    queryFn: () => api.entities.ComplianceControl.filter({
      org_id: user?.current_org_id
    }),
    enabled: !!user
  });

  const { data: evidence = [] } = useQuery({
    queryKey: ['evidence-items', filterStatus],
    queryFn: () => {
      const filters = { org_id: user?.current_org_id };
      if (filterStatus !== 'all') {
        filters.status = filterStatus;
      }
      return api.entities.EvidenceItem.filter(filters, '-collected_at');
    },
    enabled: !!user
  });

  const uploadMutation = useMutation({
    mutationFn: async (data) => {
      const { file_url } = await api.integrations.Core.UploadFile({ file: data.file });
      
      return await api.entities.EvidenceItem.create({
        org_id: user.current_org_id,
        control_id: data.control_id,
        name: data.name,
        description: data.description,
        file_url,
        file_type: data.file_type,
        collected_by: user.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evidence-items'] });
      queryClient.invalidateQueries({ queryKey: ['compliance-controls'] });
      setShowUploadDialog(false);
      setUploadForm({ name: '', description: '', file_type: 'document', file: null });
      toast.success('Evidence uploaded successfully');
    },
    onError: (error) => {
      toast.error('Failed to upload evidence');
      console.error(error);
    }
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ evidenceId, status, notes }) => {
      return await api.entities.EvidenceItem.update(evidenceId, {
        status,
        reviewed_by: user.email,
        reviewed_at: new Date().toISOString(),
        notes
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evidence-items'] });
      toast.success('Evidence reviewed successfully');
    },
    onError: () => {
      toast.error('Failed to review evidence');
    }
  });

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadForm({ ...uploadForm, file });
    }
  };

  const handleUpload = () => {
    if (!uploadForm.file || !selectedControl || !uploadForm.name) {
      toast.error('Please fill all required fields');
      return;
    }

    uploadMutation.mutate({
      ...uploadForm,
      control_id: selectedControl
    });
  };

  const handleApprove = (evidenceId) => {
    reviewMutation.mutate({
      evidenceId,
      status: 'approved',
      notes: 'Approved by reviewer'
    });
  };

  const handleReject = (evidenceId) => {
    const notes = prompt('Please provide a reason for rejection:');
    if (notes) {
      reviewMutation.mutate({
        evidenceId,
        status: 'rejected',
        notes
      });
    }
  };

  const handleAutoCollect = async (controlId, source) => {
    setCollectingEvidence(true);
    try {
      const { data } = await api.functions.invoke('collectComplianceEvidence', {
        controlId,
        source
      });
      
      queryClient.invalidateQueries({ queryKey: ['evidence-items'] });
      toast.success(`Evidence collected: ${data.summary}`);
    } catch (error) {
      toast.error('Failed to collect evidence');
      console.error(error);
    } finally {
      setCollectingEvidence(false);
    }
  };

  const handleAIReview = async (evidenceId) => {
    setReviewingEvidence(true);
    try {
      const { data } = await api.functions.invoke('reviewEvidenceAI', {
        evidenceId
      });
      
      queryClient.invalidateQueries({ queryKey: ['evidence-items'] });
      
      if (data.auto_applied) {
        toast.success(
          `AI Review: ${data.review.recommendation} (${data.review.confidence}% confidence) - Auto-applied`
        );
      } else {
        toast.info(
          `AI Review: ${data.review.recommendation} (${data.review.confidence}% confidence) - Requires manual review`
        );
      }
    } catch (error) {
      toast.error('Failed to review evidence');
      console.error(error);
    } finally {
      setReviewingEvidence(false);
    }
  };

  const evidenceByControl = evidence.reduce((acc, item) => {
    if (!acc[item.control_id]) {
      acc[item.control_id] = [];
    }
    acc[item.control_id].push(item);
    return acc;
  }, {});

  const canApproveEvidence = userPermissions?.can_approve_evidence || user?.role === 'admin';
  const canManageCompliance = userPermissions?.can_manage_compliance || user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#06162a] to-[#0b213d] p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <Link to={createPageUrl("SOC2CommandCenter")}>
          <button className="flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to SOC 2 Center
          </button>
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Shield className="w-8 h-8 text-[#f4d35e]" />
              Evidence <span className="text-[#f4d35e]">Vault</span>
            </h1>
            <p className="text-white/70 mt-1">Manage compliance evidence and documentation</p>
          </div>
          <div className="flex gap-3">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40 bg-white/5 border-[#f4d35e]/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0a1929] border-[#f4d35e]/20 text-white">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => setShowUploadDialog(true)}
              className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Evidence
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {controls.map((control) => {
          const controlEvidence = evidenceByControl[control.id] || [];
          const approvedCount = controlEvidence.filter(e => e.status === 'approved').length;
          const pendingCount = controlEvidence.filter(e => e.status === 'pending').length;

          return (
            <motion.div
              key={control.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-white/5 border-[#f4d35e]/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        {control.control_id} - {control.name}
                      </CardTitle>
                      <p className="text-white/60 text-sm mt-1">{control.description}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge className="bg-green-500/20 text-green-400">
                        {approvedCount} Approved
                      </Badge>
                      {pendingCount > 0 && (
                        <Badge className="bg-yellow-500/20 text-yellow-400">
                          {pendingCount} Pending
                        </Badge>
                      )}
                      
                      {canManageCompliance && (
                        <>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={collectingEvidence}
                                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                              >
                                {collectingEvidence ? (
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                ) : (
                                  <Sparkles className="w-3 h-3 mr-1" />
                                )}
                                Auto-Collect
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-[#0a1929] border-[#f4d35e]/20 text-white">
                              <DropdownMenuItem onClick={() => handleAutoCollect(control.id, 'github')}>
                                From GitHub
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAutoCollect(control.id, 'cloudwatch')}>
                                From CloudWatch
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAutoCollect(control.id, 'datadog')}>
                                From Datadog
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAutoCollect(control.id, 'okta')}>
                                From Okta
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedControl(control.id);
                              setShowUploadDialog(true);
                            }}
                            className="border-[#f4d35e]/30 text-[#f4d35e] hover:bg-[#f4d35e]/10"
                          >
                            <Upload className="w-3 h-3 mr-1" />
                            Manual Upload
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {controlEvidence.length === 0 ? (
                    <p className="text-white/40 text-center py-4 text-sm">
                      No evidence uploaded yet
                    </p>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {controlEvidence.map((item) => {
                        const statusConfig = statusColors[item.status];
                        const StatusIcon = statusConfig.icon;

                        return (
                          <div
                            key={item.id}
                            className={`p-4 rounded-lg border ${statusConfig.bg} ${statusConfig.text.replace('text', 'border')}/30`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <FileText className="w-5 h-5 flex-shrink-0" />
                              <StatusIcon className="w-4 h-4" />
                            </div>
                            <h4 className="font-semibold text-white mb-1">{item.name}</h4>
                            <p className="text-xs text-white/60 mb-3">{item.description}</p>
                            <div className="flex items-center justify-between">
                              <Badge className={`${statusConfig.bg} border-0 text-xs`}>
                                {item.status}
                              </Badge>
                              <div className="flex gap-2">
                                <a href={item.file_url} target="_blank" rel="noopener noreferrer">
                                  <Button size="icon" variant="ghost" className="h-7 w-7">
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                </a>
                                {item.status === 'pending' && canApproveEvidence && (
                                  <>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7 text-purple-400 hover:bg-purple-500/10"
                                      onClick={() => handleAIReview(item.id)}
                                      disabled={reviewingEvidence}
                                      title="AI Review"
                                    >
                                      {reviewingEvidence ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <Sparkles className="w-3 h-3" />
                                      )}
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7 text-green-400 hover:bg-green-500/10"
                                      onClick={() => handleApprove(item.id)}
                                    >
                                      <CheckCircle className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7 text-red-400 hover:bg-red-500/10"
                                      onClick={() => handleReject(item.id)}
                                    >
                                      <XCircle className="w-3 h-3" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="text-xs text-white/40 mt-2">
                              Collected by {item.collected_by}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="bg-[#0a1929] border-[#f4d35e]/30">
          <DialogHeader>
            <DialogTitle className="text-white">Upload Evidence</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-white">Control</Label>
              <Select value={selectedControl || ''} onValueChange={setSelectedControl}>
                <SelectTrigger className="bg-white/5 border-[#f4d35e]/30 text-white">
                  <SelectValue placeholder="Select a control" />
                </SelectTrigger>
                <SelectContent className="bg-[#0a1929] border-[#f4d35e]/20 text-white">
                  {controls.map((control) => (
                    <SelectItem key={control.id} value={control.id}>
                      {control.control_id} - {control.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white">Evidence Name *</Label>
              <Input
                value={uploadForm.name}
                onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                placeholder="e.g., Q4 2024 Audit Report"
                className="bg-white/5 border-[#f4d35e]/30 text-white"
              />
            </div>

            <div>
              <Label className="text-white">Description</Label>
              <Textarea
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                placeholder="Brief description of this evidence..."
                className="bg-white/5 border-[#f4d35e]/30 text-white"
              />
            </div>

            <div>
              <Label className="text-white">File Type</Label>
              <Select
                value={uploadForm.file_type}
                onValueChange={(value) => setUploadForm({ ...uploadForm, file_type: value })}
              >
                <SelectTrigger className="bg-white/5 border-[#f4d35e]/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0a1929] border-[#f4d35e]/20 text-white">
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="screenshot">Screenshot</SelectItem>
                  <SelectItem value="log">Log</SelectItem>
                  <SelectItem value="report">Report</SelectItem>
                  <SelectItem value="certificate">Certificate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white">File *</Label>
              <input
                type="file"
                onChange={handleFileSelect}
                className="w-full text-white/70 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#f4d35e] file:text-[#0a1929] file:font-semibold hover:file:bg-[#f4d35e]/80 cursor-pointer"
              />
              {uploadForm.file && (
                <p className="text-white/60 text-xs mt-2">{uploadForm.file.name}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUploadDialog(false)}
              className="border-[#f4d35e]/30 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploadMutation.isPending}
              className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
            >
              {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <motion.div
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2"
        animate={{
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="px-4 py-2 rounded-full bg-gradient-to-r from-[#f4d35e]/90 to-[#f4d35e]/70 backdrop-blur border border-[#f4d35e]/50 shadow-lg">
          <div className="flex items-center gap-2">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/api-prod/public/68f9c68eee1c76fe83e7fbb0/4f2a625b6_MrTechSys-Naked-Logo.png"
              alt="MrTechSys"
              className="w-4 h-4 object-contain"
            />
            <span className="text-[#0a1929] font-bold text-xs">Powered by MrTechSys</span>
            <Sparkles className="w-3 h-3 text-[#0a1929]" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
