import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { BarChart, LineChart, PieChart, Table, Save, Play, Download } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ResponsiveContainer, BarChart as RechartsBar, Bar, LineChart as RechartsLine, Line, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const ENTITY_OPTIONS = [
  { value: "Lead", label: "Leads" },
  { value: "Quote", label: "Quotes" },
  { value: "Invoice", label: "Invoices" },
  { value: "Client", label: "Clients" },
  { value: "Deal", label: "Deals" },
  { value: "Ticket", label: "Tickets" }
];

const CHART_TYPES = [
  { value: "bar", label: "Bar Chart", icon: BarChart },
  { value: "line", label: "Line Chart", icon: LineChart },
  { value: "pie", label: "Pie Chart", icon: PieChart },
  { value: "table", label: "Table", icon: Table }
];

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6'];

export default function ReportBuilder() {
  const [reportName, setReportName] = useState("");
  const [selectedEntities, setSelectedEntities] = useState(["Lead"]);
  const [chartType, setChartType] = useState("bar");
  const [groupBy, setGroupBy] = useState("status");
  const [dateRange, setDateRange] = useState("30");
  const [reportData, setReportData] = useState(null);

  const runReportMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.functions.invoke('runCustomReport', {
        entities: selectedEntities,
        groupBy,
        dateRange: Number(dateRange),
        chartType
      });
      return data;
    },
    onSuccess: (data) => {
      setReportData(data);
      toast.success("Report generated successfully");
    },
    onError: (error) => {
      toast.error(`Report failed: ${error.message}`);
    }
  });

  const saveReportMutation = useMutation({
    mutationFn: async () => {
      await api.entities.ReportView.create({
        name: reportName,
        config: {
          entities: selectedEntities,
          groupBy,
          dateRange,
          chartType
        }
      });
    },
    onSuccess: () => {
      toast.success("Report saved successfully");
    }
  });

  const renderChart = () => {
    if (!reportData?.chartData) return null;

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBar data={reportData.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="name" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #f59e0b' }} />
              <Legend />
              <Bar dataKey="value" fill="#f59e0b" />
            </RechartsBar>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLine data={reportData.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="name" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #f59e0b' }} />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} />
            </RechartsLine>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPie>
              <Pie
                data={reportData.chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {reportData.chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #f59e0b' }} />
              <Legend />
            </RechartsPie>
          </ResponsiveContainer>
        );
      
      case 'table':
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 border-b border-amber-500/20">
                <tr>
                  <th className="text-left p-3 text-amber-400">Name</th>
                  <th className="text-right p-3 text-amber-400">Value</th>
                </tr>
              </thead>
              <tbody>
                {reportData.chartData.map((row, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-3 text-white">{row.name}</td>
                    <td className="p-3 text-right text-white font-semibold">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#0a1929]/80 backdrop-blur border-amber-500/20">
        <CardHeader>
          <CardTitle className="text-white">Custom Report Builder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Report Name</Label>
              <Input
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="e.g., Q4 Sales Performance"
                className="bg-white/5 border-cyan-500/30 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="bg-white/5 border-cyan-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Group By</Label>
              <Select value={groupBy} onValueChange={setGroupBy}>
                <SelectTrigger className="bg-white/5 border-cyan-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="source">Source</SelectItem>
                  <SelectItem value="created_date">Date Created</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Visualization</Label>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="bg-white/5 border-cyan-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHART_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Data Sources</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ENTITY_OPTIONS.map(entity => (
                <div key={entity.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={entity.value}
                    checked={selectedEntities.includes(entity.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedEntities([...selectedEntities, entity.value]);
                      } else {
                        setSelectedEntities(selectedEntities.filter(e => e !== entity.value));
                      }
                    }}
                  />
                  <label htmlFor={entity.value} className="text-sm text-white cursor-pointer">
                    {entity.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => runReportMutation.mutate()}
              disabled={runReportMutation.isPending || selectedEntities.length === 0}
              className="bg-gradient-to-r from-amber-600 to-amber-500"
            >
              <Play className="w-4 h-4 mr-2" />
              Run Report
            </Button>
            <Button
              onClick={() => saveReportMutation.mutate()}
              disabled={!reportName || selectedEntities.length === 0}
              variant="outline"
              className="border-cyan-500/30 text-cyan-400"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {reportData && (
        <Card className="bg-[#0a1929]/80 backdrop-blur border-green-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">{reportName || "Report Results"}</CardTitle>
              <Button
                size="sm"
                variant="outline"
                className="border-amber-500/30 text-amber-400"
                onClick={() => {
                  const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${reportName || 'report'}_${Date.now()}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success('Report exported');
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {renderChart()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}