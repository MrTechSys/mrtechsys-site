
import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Switch } from '@/components/ui/switch';
import {
  Calendar,
  Clock,
  Mail,
  FileText,
  Plus,
  Edit,
  Trash,
  Send,
  Sparkles,
  Shield,
  Activity,
  Download,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function ScheduledReports() {
  const [user, setUser] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    report_type: 'sales_summary',
    frequency: 'weekly',
    day_of_week: 1,
    day_of_month: 1,
    time: '09:00',
    recipients: '',
    format: 'pdf',
    filters: {},
    is_active: true
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: schedules = [] } = useQuery({
    queryKey: ['report-schedules'],
    queryFn: () => api.entities.ReportSchedule.filter({
      org_id: user?.current_org_id
    }, '-created_date'),
    enabled: !!user
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const recipients = data.recipients.split(',').map(e => e.trim()).filter(Boolean);
      return await api.entities.ReportSchedule.create({
        org_id: user.current_org_id,
        name: data.name,
        report_type: data.report_type,
        frequency: data.frequency,
        day_of_week: data.frequency === 'weekly' ? data.day_of_week : null,
        day_of_month: data.frequency === 'monthly' ? data.day_of_month : null,
        time: data.time,
        recipients,
        format: data.format,
        filters: data.filters,
        is_active: data.is_active,
        created_by: user.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-schedules'] });
      setShowCreateDialog(false);
      setFormData({
        name: '',
        report_type: 'sales_summary',
        frequency: 'weekly',
        day_of_week: 1,
        day_of_month: 1,
        time: '09:00',
        recipients: '',
        format: 'pdf',
        filters: {},
        is_active: true
      });
      toast.success('Report schedule created!');
    },
    onError: () => {
      toast.error('Failed to create schedule');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const recipients = data.recipients.split(',').map(e => e.trim()).filter(Boolean);
      return await api.entities.ReportSchedule.update(id, {
        ...data,
        recipients
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-schedules'] });
      setShowCreateDialog(false);
      setEditingSchedule(null);
      toast.success('Schedule updated!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.entities.ReportSchedule.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-schedules'] });
      toast.success('Schedule deleted');
    }
  });

  const testMutation = useMutation({
    mutationFn: async (scheduleId) => {
      const schedule = schedules.find(s => s.id === scheduleId);
      const { data } = await api.functions.invoke('generateScheduledReport', {
        scheduleId,
        testMode: true
      });
      return data;
    },
    onSuccess: () => {
      toast.success('Test report sent!');
    },
    onError: () => {
      toast.error('Failed to send test report');
    }
  });

  const handleSubmit = () => {
    if (editingSchedule) {
      updateMutation.mutate({ id: editingSchedule.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      name: schedule.name,
      report_type: schedule.report_type,
      frequency: schedule.frequency,
      day_of_week: schedule.day_of_week || 1,
      day_of_month: schedule.day_of_month || 1,
      time: schedule.time || '09:00',
      recipients: schedule.recipients.join(', '),
      format: schedule.format,
      filters: schedule.filters || {},
      is_active: schedule.is_active
    });
    setShowCreateDialog(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this schedule?')) {
      deleteMutation.mutate(id);
    }
  };

  const reportTypeConfig = {
    sales_summary: { icon: FileText, label: 'Sales Summary', color: 'text-blue-400' },
    financial_overview: { icon: FileText, label: 'Financial Overview', color: 'text-green-400' },
    lead_pipeline: { icon: FileText, label: 'Lead Pipeline', color: 'text-purple-400' },
    task_progress: { icon: FileText, label: 'Task Progress', color: 'text-amber-400' },
    soc2_compliance: { icon: Shield, label: 'SOC 2 Compliance', color: 'text-orange-400' },
    dora_metrics: { icon: Activity, label: 'DORA Metrics', color: 'text-cyan-400' },
    devops_performance: { icon: Activity, label: 'DevOps Performance', color: 'text-pink-400' }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#06162a] to-[#0b213d] p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Calendar className="w-8 h-8 text-[#f4d35e]" />
              Scheduled <span className="text-[#f4d35e]">Reports</span>
            </h1>
            <p className="text-white/70 mt-1">Automate report generation and delivery</p>
          </div>
          <Button
            onClick={() => {
              setEditingSchedule(null);
              setShowCreateDialog(true);
            }}
            className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Schedule
          </Button>
        </div>
      </div>

      {/* Schedules Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schedules.length === 0 ? (
          <div className="col-span-full">
            <Card className="bg-white/5 border-[#f4d35e]/20">
              <CardContent className="p-12 text-center">
                <Calendar className="w-16 h-16 text-white/40 mx-auto mb-4" />
                <p className="text-white/60">No scheduled reports yet</p>
                <p className="text-white/40 text-sm mt-2">Create your first automated report schedule</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          schedules.map((schedule) => {
            const config = reportTypeConfig[schedule.report_type];
            const Icon = config?.icon || FileText;

            return (
              <motion.div
                key={schedule.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-white/5 border-[#f4d35e]/20 hover:border-[#f4d35e]/40 transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-5 h-5 ${config?.color || 'text-white'}`} />
                        <CardTitle className="text-white text-lg">{schedule.name}</CardTitle>
                      </div>
                      <Switch
                        checked={schedule.is_active}
                        onCheckedChange={(checked) => {
                          updateMutation.mutate({
                            id: schedule.id,
                            data: { ...schedule, is_active: checked }
                          });
                        }}
                        className="data-[state=checked]:bg-green-500"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Badge className={`${config?.color.replace('text', 'bg')}/20 ${config?.color} border-0`}>
                        {config?.label || schedule.report_type}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-white/70">
                        <Clock className="w-4 h-4" />
                        <span>
                          {schedule.frequency === 'daily' && 'Daily'}
                          {schedule.frequency === 'weekly' && `Weekly on ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][schedule.day_of_week]}`}
                          {schedule.frequency === 'monthly' && `Monthly on day ${schedule.day_of_month}`}
                          {schedule.frequency === 'quarterly' && 'Quarterly'}
                          {' at '}{schedule.time}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-white/70">
                        <Mail className="w-4 h-4" />
                        <span>{schedule.recipients.length} recipients</span>
                      </div>

                      <div className="flex items-center gap-2 text-white/70">
                        <Download className="w-4 h-4" />
                        <span className="uppercase">{schedule.format}</span>
                      </div>

                      {schedule.last_run && (
                        <div className="flex items-center gap-2 text-white/70">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span>Last run: {new Date(schedule.last_run).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-white/10">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testMutation.mutate(schedule.id)}
                        disabled={testMutation.isPending}
                        className="flex-1 border-[#f4d35e]/30 text-[#f4d35e] hover:bg-[#f4d35e]/10"
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Test
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(schedule)}
                        className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(schedule.id)}
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-[#0a1929] border-[#f4d35e]/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingSchedule ? 'Edit' : 'New'} Report Schedule
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div>
              <Label className="text-white">Schedule Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Weekly SOC 2 Compliance Report"
                className="bg-white/5 border-[#f4d35e]/30 text-white"
              />
            </div>

            <div>
              <Label className="text-white">Report Type *</Label>
              <Select
                value={formData.report_type}
                onValueChange={(value) => setFormData({ ...formData, report_type: value })}
              >
                <SelectTrigger className="bg-white/5 border-[#f4d35e]/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0a1929] border-[#f4d35e]/20 text-white">
                  <SelectItem value="sales_summary">Sales Summary</SelectItem>
                  <SelectItem value="financial_overview">Financial Overview</SelectItem>
                  <SelectItem value="lead_pipeline">Lead Pipeline</SelectItem>
                  <SelectItem value="task_progress">Task Progress</SelectItem>
                  <SelectItem value="soc2_compliance">SOC 2 Compliance Report</SelectItem>
                  <SelectItem value="dora_metrics">DORA Metrics Report</SelectItem>
                  <SelectItem value="devops_performance">DevOps Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Frequency *</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                >
                  <SelectTrigger className="bg-white/5 border-[#f4d35e]/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a1929] border-[#f4d35e]/20 text-white">
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white">Time *</Label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="bg-white/5 border-[#f4d35e]/30 text-white"
                />
              </div>
            </div>

            {formData.frequency === 'weekly' && (
              <div>
                <Label className="text-white">Day of Week</Label>
                <Select
                  value={formData.day_of_week.toString()}
                  onValueChange={(value) => setFormData({ ...formData, day_of_week: parseInt(value) })}
                >
                  <SelectTrigger className="bg-white/5 border-[#f4d35e]/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a1929] border-[#f4d35e]/20 text-white">
                    <SelectItem value="0">Sunday</SelectItem>
                    <SelectItem value="1">Monday</SelectItem>
                    <SelectItem value="2">Tuesday</SelectItem>
                    <SelectItem value="3">Wednesday</SelectItem>
                    <SelectItem value="4">Thursday</SelectItem>
                    <SelectItem value="5">Friday</SelectItem>
                    <SelectItem value="6">Saturday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.frequency === 'monthly' && (
              <div>
                <Label className="text-white">Day of Month</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.day_of_month}
                  onChange={(e) => setFormData({ ...formData, day_of_month: parseInt(e.target.value) })}
                  className="bg-white/5 border-[#f4d35e]/30 text-white"
                />
              </div>
            )}

            <div>
              <Label className="text-white">Recipients (comma-separated emails) *</Label>
              <Textarea
                value={formData.recipients}
                onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                placeholder="admin@example.com, team@example.com"
                rows={2}
                className="bg-white/5 border-[#f4d35e]/30 text-white"
              />
            </div>

            <div>
              <Label className="text-white">Export Format</Label>
              <Select
                value={formData.format}
                onValueChange={(value) => setFormData({ ...formData, format: value })}
              >
                <SelectTrigger className="bg-white/5 border-[#f4d35e]/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0a1929] border-[#f4d35e]/20 text-white">
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <Label className="text-white">Active</Label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                className="data-[state=checked]:bg-green-500"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setEditingSchedule(null);
              }}
              className="border-[#f4d35e]/30 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
            >
              {editingSchedule ? 'Update' : 'Create'} Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Powered by MrTechSys */}
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
