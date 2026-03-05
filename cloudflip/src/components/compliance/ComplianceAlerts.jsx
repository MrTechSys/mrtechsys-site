
import React, { useState } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertTriangle,
  Clock,
  Shield,
  CheckCircle,
  Upload,
  RefreshCw,
  Bell,
  FileText,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function ComplianceAlerts() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showChangesDialog, setShowChangesDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: complianceItems = [], isLoading } = useQuery({
    queryKey: ['compliance-tracker'],
    queryFn: async () => {
      const user = await api.auth.me();
      return api.entities.ComplianceTracker.filter({ 
        org_id: user.current_org_id 
      }, '-expiry_date');
    }
  });

  const checkRegulatoryChanges = useMutation({
    mutationFn: async () => {
      const user = await api.auth.me();
      const org = await api.entities.Organization.filter({ id: user.current_org_id });
      
      return await api.functions.invoke('monitorRegulatoryChanges', {
        orgId: user.current_org_id,
        vertical: org[0]?.industry,
        location: `${user.data?.city || ''}, ${user.data?.state || ''}`
      });
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['compliance-tracker'] });
      toast.success('Regulatory check complete');
    }
  });

  const uploadDocument = useMutation({
    mutationFn: async ({ itemId, file }) => {
      const { file_url } = await api.integrations.Core.UploadFile({ file });
      return api.entities.ComplianceTracker.update(itemId, {
        document_url: file_url
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-tracker'] });
      toast.success('Document uploaded successfully');
    }
  });

  const createItem = useMutation({
    mutationFn: async (data) => {
      const user = await api.auth.me();
      return api.entities.ComplianceTracker.create({
        ...data,
        org_id: user.current_org_id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-tracker'] });
      setShowAddDialog(false);
      toast.success('Compliance item added');
    }
  });

  // Calculate urgency
  const getUrgency = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const daysUntil = Math.floor((expiry.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    
    if (daysUntil < 0) return { level: 'expired', days: Math.abs(daysUntil), color: 'bg-black text-white' };
    if (daysUntil <= 7) return { level: 'critical', days: daysUntil, color: 'bg-red-500/20 text-red-400 border-red-500/30' };
    if (daysUntil <= 30) return { level: 'urgent', days: daysUntil, color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
    if (daysUntil <= 60) return { level: 'soon', days: daysUntil, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    return { level: 'ok', days: daysUntil, color: 'bg-green-500/20 text-green-400 border-green-500/30' };
  };

  const safeComplianceItems = complianceItems || [];
  
  const expiringItems = safeComplianceItems.filter(item => {
    const urgency = getUrgency(item?.expiry_date);
    return ['critical', 'urgent', 'soon'].includes(urgency.level);
  }).sort((a, b) => new Date(a?.expiry_date) - new Date(b?.expiry_date));

  const expiredItems = safeComplianceItems.filter(item => getUrgency(item?.expiry_date).level === 'expired');

  const itemsWithChanges = safeComplianceItems.filter(item => 
    item?.regulatory_changes_detected && item.regulatory_changes_detected.length > 0
  );

  return (
    <div className="space-y-6">
      {/* Alert Summary */}
      <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 backdrop-blur border-red-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Bell className="w-6 h-6 text-red-400 animate-pulse" />
              Compliance Alerts
              {(expiredItems.length + expiringItems.length + itemsWithChanges.length) > 0 && (
                <Badge className="bg-red-500 text-white ml-2">
                  {expiredItems.length + expiringItems.length + itemsWithChanges.length}
                </Badge>
              )}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={() => checkRegulatoryChanges.mutate()}
                disabled={checkRegulatoryChanges.isPending}
                size="sm"
                variant="outline"
                className="border-[#3cf7d4]/30 text-[#3cf7d4] hover:bg-[#3cf7d4]/10"
              >
                {checkRegulatoryChanges.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
              <Button
                onClick={() => setShowAddDialog(true)}
                size="sm"
                className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
              >
                Add Item
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-black/30 rounded-lg text-center">
              <p className="text-red-400 text-3xl font-bold">{expiredItems.length}</p>
              <p className="text-white/70 text-sm mt-1">Expired</p>
            </div>
            <div className="p-4 bg-orange-500/10 rounded-lg text-center">
              <p className="text-orange-400 text-3xl font-bold">{expiringItems.length}</p>
              <p className="text-white/70 text-sm mt-1">Expiring Soon</p>
            </div>
            <div className="p-4 bg-purple-500/10 rounded-lg text-center">
              <p className="text-purple-400 text-3xl font-bold">{itemsWithChanges.length}</p>
              <p className="text-white/70 text-sm mt-1">Regulatory Changes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expired Items */}
      {expiredItems.length > 0 && (
        <Card className="bg-black/40 border-2 border-red-500">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
              EXPIRED - Immediate Action Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {expiredItems.map((item, idx) => {
              const urgency = getUrgency(item?.expiry_date);
              return (
                <motion.div
                  key={item?.id || idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-4 bg-red-500/20 rounded-lg border-2 border-red-500"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="text-white font-bold text-sm">{item?.name || 'Item'}</h4>
                      <p className="text-red-400 text-xs mt-1">
                        Expired {urgency.days} days ago on {item?.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : 'N/A'}
                      </p>
                      <p className="text-white/70 text-xs mt-1">{item?.issuing_agency || 'N/A'}</p>
                    </div>
                    <Badge className="bg-black text-red-400 border-red-500">
                      EXPIRED
                    </Badge>
                  </div>
                  <div className="mt-3 p-3 bg-amber-500/20 rounded border border-amber-500/30">
                    <p className="text-amber-400 text-xs font-medium">
                      ⚠️ Operating without valid {item?.item_type || 'compliance item'} may result in fines or shutdown
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Expiring Soon */}
      {expiringItems.length > 0 && (
        <Card className="bg-white/5 border-orange-500/30 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-400" />
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {expiringItems.map((item, idx) => {
              const urgency = getUrgency(item?.expiry_date);
              return (
                <motion.div
                  key={item?.id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-4 rounded-lg border ${urgency.color}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="text-white font-medium text-sm">{item?.name || 'Item'}</h4>
                      <p className="text-white/60 text-xs mt-1 capitalize">{item?.item_type || 'compliance'}</p>
                    </div>
                    <Badge className={urgency.color}>
                      {urgency.days} days
                    </Badge>
                  </div>
                  <div className="grid md:grid-cols-2 gap-2 text-xs text-white/70 mb-3">
                    <div>Expires: {item?.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : 'N/A'}</div>
                    <div>Agency: {item?.issuing_agency || 'N/A'}</div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      id={`upload-${item?.id}`}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && item?.id) { // Ensure item.id exists before calling mutate
                          uploadDocument.mutate({ itemId: item.id, file });
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => document.getElementById(`upload-${item?.id}`)?.click()}
                      className="flex-1 border-green-500/30 text-green-400 hover:bg-green-500/10"
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      Upload Renewed
                    </Button>
                    {item?.document_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                        className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                      >
                        <a href={item.document_url} target="_blank" rel="noopener noreferrer">
                          <FileText className="w-3 h-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Regulatory Changes Detected */}
      {itemsWithChanges.length > 0 && (
        <Card className="bg-white/5 border-purple-500/30 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              Regulatory Changes Detected
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {itemsWithChanges.map((item, idx) => (
              <motion.div
                key={item?.id || idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-white font-medium text-sm">{item?.name || 'Item'}</h4>
                    <Badge className="bg-purple-500/20 text-purple-400 mt-1 text-xs">
                      {item?.regulatory_changes_detected?.length || 0} change(s) detected
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedItem(item);
                      setShowChangesDialog(true);
                    }}
                    className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                  >
                    View Details
                  </Button>
                </div>
                <div className="space-y-2">
                  {(item?.regulatory_changes_detected || []).slice(-2).map((change, i) => (
                    <div key={i} className="p-2 bg-white/5 rounded text-xs">
                      <p className="text-white/80 font-medium mb-1">{change?.change_description || 'Change detected'}</p>
                      <p className="text-purple-400">→ {change?.action_required || 'Action required'}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* All Items Status */}
      {!isLoading && safeComplianceItems.length > 0 && (
        <Card className="bg-white/5 border-[#3cf7d4]/30 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#3cf7d4]" />
              All Compliance Items ({safeComplianceItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {safeComplianceItems.map(item => {
                const urgency = getUrgency(item?.expiry_date);
                return (
                  <div key={item?.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">{item?.name || 'Item'}</p>
                      <p className="text-white/60 text-xs">Expires: {item?.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <Badge className={urgency.color}>
                      {urgency.level === 'expired' ? 'EXPIRED' : `${urgency.days}d`}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Items State */}
      {!isLoading && safeComplianceItems.length === 0 && (
        <Card className="bg-white/5 border-amber-500/30">
          <CardContent className="p-12 text-center">
            <Shield className="w-16 h-16 text-amber-400/50 mx-auto mb-4" />
            <p className="text-white/70 mb-4">No compliance items tracked yet</p>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
            >
              Add Your First Item
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-[#0a1929] border-amber-500/30">
          <DialogHeader>
            <DialogTitle className="text-white">Add Compliance Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            createItem.mutate({
              item_type: formData.get('item_type'),
              name: formData.get('name'),
              issuing_agency: formData.get('issuing_agency'),
              expiry_date: formData.get('expiry_date'),
              cost: parseFloat(formData.get('cost') || '0'),
              reference_number: formData.get('reference_number')
            });
          }}>
            <div className="space-y-4">
              <div>
                <Label className="text-white">Type</Label>
                <select name="item_type" className="w-full p-2 bg-white/5 border border-amber-500/30 rounded text-white">
                  <option value="permit">Permit</option>
                  <option value="license">License</option>
                  <option value="certification">Certification</option>
                  <option value="inspection">Inspection</option>
                  <option value="insurance">Insurance</option>
                  <option value="registration">Registration</option>
                </select>
              </div>
              <div>
                <Label className="text-white">Name</Label>
                <Input name="name" required className="bg-white/5 border-amber-500/30 text-white" />
              </div>
              <div>
                <Label className="text-white">Issuing Agency</Label>
                <Input name="issuing_agency" className="bg-white/5 border-amber-500/30 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Expiry Date</Label>
                  <Input name="expiry_date" type="date" required className="bg-white/5 border-amber-500/30 text-white" />
                </div>
                <div>
                  <Label className="text-white">Cost ($)</Label>
                  <Input name="cost" type="number" step="0.01" className="bg-white/5 border-amber-500/30 text-white" />
                </div>
              </div>
              <div>
                <Label className="text-white">Reference Number</Label>
                <Input name="reference_number" className="bg-white/5 border-amber-500/30 text-white" />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button variant="outline" type="button" onClick={() => setShowAddDialog(false)} className="border-amber-500/30 text-white">
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-amber-600 to-amber-500 text-[#0a1929] font-bold">
                Add Item
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Changes Detail Dialog */}
      <Dialog open={showChangesDialog} onOpenChange={setShowChangesDialog}>
        <DialogContent className="bg-[#0a1929] border-purple-500/30 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              Regulatory Changes: {selectedItem?.name || 'Item'}
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              {(selectedItem?.regulatory_changes_detected || []).map((change, idx) => (
                <div key={idx} className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-white font-medium text-sm">{change?.change_description || 'Change detected'}</h4>
                    <span className="text-white/50 text-xs">
                      {change?.change_date ? new Date(change.change_date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <p className="text-white/70 text-sm mb-3">{change?.impact || ''}</p>
                  <div className="p-3 bg-amber-500/10 rounded border border-amber-500/20">
                    <p className="text-amber-400 text-xs font-medium mb-1">Action Required:</p>
                    <p className="text-white/80 text-xs">{change?.action_required || 'Review required'}</p>
                  </div>
                  {change?.source_url && (
                    <a 
                      href={change.source_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-400 text-xs mt-2 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View Source
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
