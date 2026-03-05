import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Download, Calendar } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CustomDashboard() {
  const [showWidgetModal, setShowWidgetModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: widgets = [] } = useQuery({
    queryKey: ['dashboard-widgets'],
    queryFn: async () => {
      const user = await api.auth.me();
      return api.entities.DashboardWidget.filter({ user_id: user.id });
    }
  });

  const { data: schedules = [] } = useQuery({
    queryKey: ['report-schedules'],
    queryFn: () => api.entities.ReportSchedule.list('-created_date')
  });

  const createWidgetMutation = useMutation({
    mutationFn: async (data) => {
      const user = await api.auth.me();
      return api.entities.DashboardWidget.create({
        ...data,
        org_id: user.current_org_id,
        user_id: user.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-widgets'] });
      setShowWidgetModal(false);
      toast.success("Widget added!");
    }
  });

  const createScheduleMutation = useMutation({
    mutationFn: async (data) => {
      const user = await api.auth.me();
      return api.entities.ReportSchedule.create({
        ...data,
        org_id: user.current_org_id,
        created_by: user.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-schedules'] });
      setShowScheduleModal(false);
      toast.success("Report schedule created!");
    }
  });

  const handleExport = async (format) => {
    try {
      const response = await api.functions.invoke('exportReport', {
        reportType: 'sales_summary',
        format,
        filters: {}
      });

      toast.success(`Report exported as ${format.toUpperCase()}!`);
    } catch (error) {
      toast.error("Failed to export report");
    }
  };

  const handleWidgetSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    createWidgetMutation.mutate({
      widget_type: formData.get('widget_type'),
      title: formData.get('title'),
      data_source: formData.get('data_source'),
      config: {
        time_range: formData.get('time_range') || '30d'
      },
      position: { x: 0, y: 0, width: 4, height: 2 }
    });
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    createScheduleMutation.mutate({
      name: formData.get('name'),
      report_type: formData.get('report_type'),
      frequency: formData.get('frequency'),
      recipients: [formData.get('recipients')],
      format: formData.get('format'),
      is_active: true
    });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Custom <span className="text-amber-400">Dashboard</span></h1>
          <p className="text-white/70 mt-1 text-sm md:text-base">Build your personalized <span className="text-amber-400">analytics view</span></p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowScheduleModal(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Report
          </Button>
          <Button
            onClick={() => setShowWidgetModal(true)}
            className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Widget
          </Button>
        </div>
      </div>

      {/* Export Options */}
      <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold">Quick Export</h3>
            <p className="text-white/60 text-sm">Download current dashboard data</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => handleExport('pdf')}
              variant="outline"
              size="sm"
              className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
            >
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button
              onClick={() => handleExport('csv')}
              variant="outline"
              size="sm"
              className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
            >
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
          </div>
        </div>
      </Card>

      {/* Scheduled Reports */}
      {schedules.length > 0 && (
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white">Scheduled <span className="text-amber-400">Reports</span></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {schedules.map(schedule => (
                <div key={schedule.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">{schedule.name}</h4>
                    <p className="text-white/60 text-sm capitalize">
                      {schedule.frequency} • {schedule.format.toUpperCase()} • {schedule.recipients.length} recipient(s)
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      schedule.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {schedule.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white/60 hover:text-white"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Widgets Grid */}
      {widgets.length === 0 ? (
        <Card className="p-12 text-center bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <Plus className="w-16 h-16 text-amber-400/50 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Widgets Yet</h3>
          <p className="text-white/60 mb-6">Add your first widget to start customizing your dashboard</p>
          <Button
            onClick={() => setShowWidgetModal(true)}
            className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Widget
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {widgets.map(widget => (
            <Card key={widget.id} className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white text-lg">{widget.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/60 text-sm">
                  Data source: <span className="text-amber-400 capitalize">{widget.data_source}</span>
                </p>
                <p className="text-white/60 text-sm mt-1">
                  Type: <span className="capitalize">{widget.widget_type.replace('_', ' ')}</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Widget Modal */}
      <Dialog open={showWidgetModal} onOpenChange={setShowWidgetModal}>
        <DialogContent className="bg-[#0a1929] border-amber-500/30">
          <DialogHeader>
            <DialogTitle className="text-white">Add Dashboard Widget</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleWidgetSubmit}>
            <div className="space-y-4">
              <div>
                <Label className="text-white">Widget Title</Label>
                <Input
                  name="title"
                  placeholder="e.g., Monthly Revenue"
                  required
                  className="bg-white/5 border-amber-500/30 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Widget Type</Label>
                <Select name="widget_type" defaultValue="metric_card">
                  <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="metric_card">Metric Card</SelectItem>
                    <SelectItem value="line_chart">Line Chart</SelectItem>
                    <SelectItem value="bar_chart">Bar Chart</SelectItem>
                    <SelectItem value="pie_chart">Pie Chart</SelectItem>
                    <SelectItem value="table">Table</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white">Data Source</Label>
                <Select name="data_source" defaultValue="leads">
                  <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="leads">Leads</SelectItem>
                    <SelectItem value="contacts">Contacts</SelectItem>
                    <SelectItem value="deals">Deals</SelectItem>
                    <SelectItem value="quotes">Quotes</SelectItem>
                    <SelectItem value="invoices">Invoices</SelectItem>
                    <SelectItem value="tasks">Tasks</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white">Time Range</Label>
                <Select name="time_range" defaultValue="30d">
                  <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowWidgetModal(false)}
                className="border-amber-500/30 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
              >
                Add Widget
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Schedule Report Modal */}
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent className="bg-[#0a1929] border-amber-500/30">
          <DialogHeader>
            <DialogTitle className="text-white">Schedule Automated Report</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleScheduleSubmit}>
            <div className="space-y-4">
              <div>
                <Label className="text-white">Report Name</Label>
                <Input
                  name="name"
                  placeholder="e.g., Weekly Sales Summary"
                  required
                  className="bg-white/5 border-amber-500/30 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Report Type</Label>
                <Select name="report_type" defaultValue="sales_summary">
                  <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales_summary">Sales Summary</SelectItem>
                    <SelectItem value="financial_overview">Financial Overview</SelectItem>
                    <SelectItem value="lead_pipeline">Lead Pipeline</SelectItem>
                    <SelectItem value="task_progress">Task Progress</SelectItem>
                    <SelectItem value="crm_analytics">CRM Analytics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white">Frequency</Label>
                <Select name="frequency" defaultValue="weekly">
                  <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white">Format</Label>
                <Select name="format" defaultValue="pdf">
                  <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white">Send To (Email)</Label>
                <Input
                  name="recipients"
                  type="email"
                  placeholder="email@example.com"
                  required
                  className="bg-white/5 border-amber-500/30 text-white"
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowScheduleModal(false)}
                className="border-amber-500/30 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
              >
                Create Schedule
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}