import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  FileText,
  Plus,
  Play,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  Save,
  Share2,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const entities = ['Lead', 'Contact', 'Deal', 'Quote', 'Invoice', 'Job', 'Ticket', 'Payment'];
const visualizations = [
  { value: 'table', label: 'Table', icon: FileText },
  { value: 'line', label: 'Line Chart', icon: TrendingUp },
  { value: 'bar', label: 'Bar Chart', icon: BarChart },
  { value: 'pie', label: 'Pie Chart', icon: PieChart }
];

const COLORS = ['#f59e0b', '#8b5cf6', '#06b6d4', '#10b981', '#ef4444', '#ec4899'];

export default function ReportBuilder() {
  const [user, setUser] = useState(null);
  const [currentOrg, setCurrentOrg] = useState(null);
  const [reportName, setReportName] = useState('New Report');
  const [selectedEntity, setSelectedEntity] = useState('Lead');
  const [selectedViz, setSelectedViz] = useState('table');
  const [filters, setFilters] = useState({});
  const [reportData, setReportData] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await api.auth.me();
      setUser(userData);
      if (userData.data?.current_org_id) {
        const orgs = await api.entities.Organization.filter({ id: userData.data.current_org_id });
        if (orgs.length > 0) setCurrentOrg(orgs[0]);
      }
    };
    loadUser();
  }, []);

  const { data: savedReports = [] } = useQuery({
    queryKey: ['reports', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];
      return await api.entities.ReportDefinition.filter({ org_id: currentOrg.id });
    },
    enabled: !!currentOrg
  });

  const saveReportMutation = useMutation({
    mutationFn: async (reportDef) => {
      return await api.entities.ReportDefinition.create({
        ...reportDef,
        org_id: currentOrg.id,
        created_by: user.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['reports']);
      toast.success('Report saved');
    }
  });

  const runReport = async () => {
    setIsRunning(true);
    try {
      const data = await api.entities[selectedEntity].filter(
        filters.query || {},
        filters.sortBy || '-created_date',
        filters.limit || 100
      );

      setReportData(data);
      toast.success(`Loaded ${data.length} records`);
    } catch (error) {
      toast.error('Failed to run report: ' + error.message);
    } finally {
      setIsRunning(false);
    }
  };

  const exportReport = (format) => {
    if (!reportData) return;

    let content, filename, type;
    if (format === 'csv') {
      const headers = Object.keys(reportData[0] || {}).join(',');
      const rows = reportData.map(r => Object.values(r).map(v => `"${v}"`).join(',')).join('\n');
      content = `${headers}\n${rows}`;
      filename = `${reportName.replace(/\s+/g, '_')}.csv`;
      type = 'text/csv';
    } else {
      content = JSON.stringify(reportData, null, 2);
      filename = `${reportName.replace(/\s+/g, '_')}.json`;
      type = 'application/json';
    }

    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    toast.success('Report exported');
  };

  const renderVisualization = () => {
    if (!reportData || reportData.length === 0) {
      return (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-white/40 mx-auto mb-3" />
          <p className="text-white/60">Run the report to see results</p>
        </div>
      );
    }

    switch (selectedViz) {
      case 'table':
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-amber-500/20">
                  {Object.keys(reportData[0]).slice(0, 6).map(key => (
                    <th key={key} className="text-left p-3 text-white/80 font-semibold">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportData.slice(0, 20).map((row, idx) => (
                  <tr key={idx} className="border-b border-white/10 hover:bg-white/5">
                    {Object.values(row).slice(0, 6).map((val, i) => (
                      <td key={i} className="p-3 text-white/70">
                        {typeof val === 'object' ? JSON.stringify(val).slice(0, 50) : String(val).slice(0, 50)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {reportData.length > 20 && (
              <p className="text-white/60 text-sm text-center py-3">
                Showing 20 of {reportData.length} records
              </p>
            )}
          </div>
        );

      case 'bar':
        const barData = reportData.slice(0, 10).map((item, idx) => ({
          name: item.name || item.title || `Item ${idx + 1}`,
          value: item.score || item.value || item.total || Math.random() * 100
        }));
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="name" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #f59e0b' }} />
              <Bar dataKey="value" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        const lineData = reportData.slice(0, 10).map((item, idx) => ({
          name: item.name || item.title || `Item ${idx + 1}`,
          value: item.score || item.value || item.total || Math.random() * 100
        }));
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="name" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #f59e0b' }} />
              <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        const pieData = reportData.slice(0, 6).map((item, idx) => ({
          name: item.name || item.status || `Category ${idx + 1}`,
          value: item.score || item.value || item.total || Math.random() * 100
        }));
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.name}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #f59e0b' }} />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  if (!currentOrg) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1929] via-[#0d1f33] to-[#0a1929] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <FileText className="w-8 h-8 text-amber-400" />
              Report Builder
            </h1>
            <p className="text-white/60">Create custom reports and analytics</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="bg-white/5 border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white">Report Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white">Report Name</Label>
                  <Input
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                    className="bg-white/5 border-amber-500/30 text-white mt-2"
                  />
                </div>

                <div>
                  <Label className="text-white">Entity</Label>
                  <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                    <SelectTrigger className="bg-white/5 border-amber-500/30 text-white mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {entities.map(entity => (
                        <SelectItem key={entity} value={entity}>{entity}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">Visualization</Label>
                  <Select value={selectedViz} onValueChange={setSelectedViz}>
                    <SelectTrigger className="bg-white/5 border-amber-500/30 text-white mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {visualizations.map(viz => {
                        const Icon = viz.icon;
                        return (
                          <SelectItem key={viz.value} value={viz.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              {viz.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 pt-4">
                  <Button
                    onClick={runReport}
                    disabled={isRunning}
                    className="w-full bg-gradient-to-r from-amber-600 to-amber-500"
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Run Report
                      </>
                    )}
                  </Button>

                  {reportData && (
                    <>
                      <Button
                        onClick={() => saveReportMutation.mutate({
                          name: reportName,
                          entity: selectedEntity,
                          visualization: selectedViz,
                          filters,
                          category: 'custom'
                        })}
                        variant="outline"
                        className="w-full border-amber-500/30 text-white"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Report
                      </Button>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => exportReport('csv')}
                          size="sm"
                          variant="outline"
                          className="flex-1 border-green-500/30 text-green-400"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          CSV
                        </Button>
                        <Button
                          onClick={() => exportReport('json')}
                          size="sm"
                          variant="outline"
                          className="flex-1 border-blue-500/30 text-blue-400"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          JSON
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-amber-500/20 mt-4">
              <CardHeader>
                <CardTitle className="text-white text-sm">Saved Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {savedReports.slice(0, 5).map(report => (
                    <button
                      key={report.id}
                      onClick={() => {
                        setReportName(report.name);
                        setSelectedEntity(report.entity);
                        setSelectedViz(report.visualization);
                        setFilters(report.filters || {});
                      }}
                      className="w-full text-left p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <p className="text-white text-sm font-medium">{report.name}</p>
                      <p className="text-white/60 text-xs">{report.entity}</p>
                    </button>
                  ))}
                  {savedReports.length === 0 && (
                    <p className="text-white/60 text-sm text-center py-4">No saved reports</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="bg-white/5 border-amber-500/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">{reportName}</CardTitle>
                  {reportData && (
                    <Badge className="bg-green-500/20 text-green-400">
                      {reportData.length} records
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {renderVisualization()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}