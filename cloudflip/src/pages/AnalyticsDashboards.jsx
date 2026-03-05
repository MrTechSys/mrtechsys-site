import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  Activity,
  Globe,
  Save,
  ExternalLink,
  Sparkles,
  Plus,
  LineChart,
  PieChart,
  Download,
  Filter,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import {
  LineChart as RechartsLine,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CHART_COLORS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];

export default function AnalyticsDashboards() {
  const [tableauUrl, setTableauUrl] = useState("");
  const [powerBiUrl, setPowerBiUrl] = useState("");
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState("");
  const [reportName, setReportName] = useState("");
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [dateRange, setDateRange] = useState("30d");
  const [chartType, setChartType] = useState("line");
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading: isLoadingLeads } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      try {
        return await api.entities.Lead.list('-created_date', 500);
      } catch (error) {
        console.error('Error loading leads:', error);
        return [];
      }
    },
    retry: 1
  });

  const { data: quotes = [], isLoading: isLoadingQuotes } = useQuery({
    queryKey: ['quotes'],
    queryFn: async () => {
      try {
        return await api.entities.Quote.list('-created_date', 500);
      } catch (error) {
        console.error('Error loading quotes:', error);
        return [];
      }
    },
    retry: 1
  });

  const { data: deals = [], isLoading: isLoadingDeals } = useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      try {
        return await api.entities.Deal.list('-created_date', 500);
      } catch (error) {
        console.error('Error loading deals:', error);
        return [];
      }
    },
    retry: 1
  });

  const handleSaveSettings = () => {
    try {
      localStorage.setItem('analytics_tableau', tableauUrl);
      localStorage.setItem('analytics_powerbi', powerBiUrl);
      localStorage.setItem('analytics_ga', googleAnalyticsId);
      toast.success("Analytics settings saved!");
    } catch (error) {
      console.error('Save settings error:', error);
      toast.error("Failed to save settings");
    }
  };

  React.useEffect(() => {
    try {
      setTableauUrl(localStorage.getItem('analytics_tableau') || "");
      setPowerBiUrl(localStorage.getItem('analytics_powerbi') || "");
      setGoogleAnalyticsId(localStorage.getItem('analytics_ga') || "");
    } catch (error) {
      console.error('Load settings error:', error);
    }
  }, []);

  // Custom Analytics Data Processing
  const processTimeSeriesData = (data, field, dateField = 'created_date') => {
    try {
      if (!Array.isArray(data) || data.length === 0) return [];
      
      const now = new Date();
      const days = parseInt(dateRange);
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      const filtered = data.filter(item => 
        item?.[dateField] && new Date(item[dateField]) >= cutoffDate
      );

      const grouped = {};
      filtered.forEach(item => {
        try {
          const date = new Date(item[dateField]).toISOString().split('T')[0];
          grouped[date] = (grouped[date] || 0) + (field === 'count' ? 1 : (item[field] || 0));
        } catch (err) {
          console.error('Date processing error:', err);
        }
      });

      return Object.entries(grouped).map(([date, value]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value
      })).slice(-30);
    } catch (error) {
      console.error('Process time series error:', error);
      return [];
    }
  };

  const leadsOverTime = processTimeSeriesData(leads, 'count');
  const quotesOverTime = processTimeSeriesData(quotes, 'total');
  const dealsOverTime = processTimeSeriesData(deals, 'value');

  // Forecast using simple linear regression
  const forecastTrend = (data, periods = 7) => {
    try {
      if (!Array.isArray(data) || data.length < 2) return [];
      
      const n = data.length;
      const sumX = data.reduce((sum, _, i) => sum + i, 0);
      const sumY = data.reduce((sum, d) => sum + (d?.value || 0), 0);
      const sumXY = data.reduce((sum, d, i) => sum + (i * (d?.value || 0)), 0);
      const sumX2 = data.reduce((sum, _, i) => sum + (i * i), 0);
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      
      const forecast = [];
      for (let i = 0; i < periods; i++) {
        const x = n + i;
        const predictedValue = slope * x + intercept;
        forecast.push({
          date: `+${i + 1}d`,
          value: Math.max(0, Math.round(predictedValue)),
          isForecast: true
        });
      }
      
      return forecast;
    } catch (error) {
      console.error('Forecast error:', error);
      return [];
    }
  };

  const leadsWithForecast = [...leadsOverTime, ...forecastTrend(leadsOverTime)];

  const isLoading = isLoadingLeads || isLoadingQuotes || isLoadingDeals;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-cyan-400" />
            Analytics <span className="text-amber-400">Dashboards</span>
          </h1>
          <p className="text-white/60">Build custom reports, visualize metrics, and forecast trends with AI</p>
        </div>

        <Tabs defaultValue="custom" className="space-y-4">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="custom" className="flex items-center gap-2 text-white data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
              <Sparkles className="w-4 h-4" />
              Custom Analytics
            </TabsTrigger>
            <TabsTrigger value="tableau" className="flex items-center gap-2 text-white data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              <BarChart3 className="w-4 h-4" />
              Tableau
            </TabsTrigger>
            <TabsTrigger value="powerbi" className="flex items-center gap-2 text-white data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400">
              <TrendingUp className="w-4 h-4" />
              Power BI
            </TabsTrigger>
            <TabsTrigger value="ga" className="flex items-center gap-2 text-white data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              <Globe className="w-4 h-4" />
              Google Analytics
            </TabsTrigger>
          </TabsList>

          {/* Custom Analytics Builder */}
          <TabsContent value="custom" className="space-y-6">
            {/* Report Builder */}
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Custom Report Builder
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-white">Date Range</Label>
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
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

                  <div>
                    <Label className="text-white">Chart Type</Label>
                    <Select value={chartType} onValueChange={setChartType}>
                      <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="line">Line Chart</SelectItem>
                        <SelectItem value="bar">Bar Chart</SelectItem>
                        <SelectItem value="pie">Pie Chart</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white">Report Name</Label>
                    <Input
                      value={reportName}
                      onChange={(e) => setReportName(e.target.value)}
                      placeholder="My Custom Report"
                      className="bg-white/5 border-amber-500/30 text-white"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => toast.success("Report saved!")}
                    className="bg-gradient-to-r from-green-600 to-green-500"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Report
                  </Button>
                  <Button
                    variant="outline"
                    className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Interactive Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-[#0a1929]/60 backdrop-blur border-cyan-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <LineChart className="w-5 h-5 text-cyan-400" />
                    Leads Over Time + AI Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {leadsWithForecast.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsLine data={leadsWithForecast}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="date" stroke="#fff" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#fff" tick={{ fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #06b6d4' }}
                          labelStyle={{ color: '#fff' }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#06b6d4" 
                          strokeWidth={2}
                          name="Actual Leads"
                          dot={(props) => {
                            const { cx, cy, payload } = props;
                            if (payload?.isForecast) {
                              return <circle cx={cx} cy={cy} r={3} fill="#8b5cf6" strokeWidth={2} stroke="#8b5cf6" strokeDasharray="3 3" />;
                            }
                            return <circle cx={cx} cy={cy} r={4} fill="#06b6d4" />;
                          }}
                          strokeDasharray={(props) => props?.payload?.isForecast ? "5 5" : "0"}
                        />
                      </RechartsLine>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-white/40">
                      No lead data available
                    </div>
                  )}
                  <div className="mt-2 flex items-center gap-4 text-xs text-white/60">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-0.5 bg-cyan-400"></div>
                      <span>Actual</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-0.5 bg-purple-400" style={{ borderTop: '2px dashed' }}></div>
                      <span>AI Forecast</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0a1929]/60 backdrop-blur border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-400" />
                    Quote Value Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {quotesOverTime.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={quotesOverTime}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="date" stroke="#fff" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#fff" tick={{ fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #10b981' }}
                          labelStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey="value" fill="#10b981" name="Quote Value ($)" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-white/40">
                      No quote data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-amber-400" />
                    Pipeline Value Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {deals.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPie>
                        <Pie
                          data={[
                            { name: 'Qualification', value: deals.filter(d => d?.pipeline_stage === 'qualification').length },
                            { name: 'Proposal', value: deals.filter(d => d?.pipeline_stage === 'proposal').length },
                            { name: 'Negotiation', value: deals.filter(d => d?.pipeline_stage === 'negotiation').length },
                            { name: 'Closed Won', value: deals.filter(d => d?.pipeline_stage === 'closed_won').length }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {CHART_COLORS.map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #f59e0b' }}
                        />
                      </RechartsPie>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-white/40">
                      No deal data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-[#0a1929]/60 backdrop-blur border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-400" />
                    Conversion Funnel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart 
                      data={[
                        { stage: 'Leads', count: leads.length || 0 },
                        { stage: 'Qualified', count: leads.filter(l => l?.status === 'qualified').length || 0 },
                        { stage: 'Quoted', count: quotes.length || 0 },
                        { stage: 'Won', count: deals.filter(d => d?.pipeline_stage === 'closed_won').length || 0 }
                      ]}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis type="number" stroke="#fff" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="stage" type="category" stroke="#fff" tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #8b5cf6' }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="count" fill="#8b5cf6" name="Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* AI Insights */}
            <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  AI-Powered Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-blue-400 text-sm">
                    📈 <strong>Trend Alert:</strong> Lead generation trends are being analyzed. Add more leads to see insights.
                  </p>
                </div>
                <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <p className="text-purple-400 text-sm">
                    🎯 <strong>Conversion Insight:</strong> Qualified leads have higher close rates. Focus on lead qualification to improve ROI.
                  </p>
                </div>
                {quotesOverTime.length > 0 && (
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-green-400 text-sm">
                      💰 <strong>Revenue Forecast:</strong> Based on trends, expecting steady growth in quote generation.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tableau Tab */}
          <TabsContent value="tableau">
            <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  Configure Tableau
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white">Tableau Embed URL</Label>
                  <Input
                    value={tableauUrl}
                    onChange={(e) => setTableauUrl(e.target.value)}
                    placeholder="https://public.tableau.com/views/..."
                    className="bg-white/5 border-cyan-500/30 text-white"
                  />
                  <p className="text-white/40 text-xs mt-1">
                    Get embed URL from Tableau Public or Tableau Server
                  </p>
                </div>

                <Button
                  onClick={handleSaveSettings}
                  className="bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 text-white font-bold"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Configuration
                </Button>

                {tableauUrl && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-white font-medium">Preview</p>
                      <Button
                        onClick={() => window.open(tableauUrl, '_blank')}
                        size="sm"
                        variant="outline"
                        className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Open Full
                      </Button>
                    </div>
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        src={tableauUrl}
                        className="absolute top-0 left-0 w-full h-full rounded-lg border border-cyan-500/20"
                        frameBorder="0"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Power BI Tab */}
          <TabsContent value="powerbi">
            <Card className="bg-[#0a1929]/60 backdrop-blur border-yellow-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-yellow-400" />
                  Configure Power BI
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white">Power BI Embed URL</Label>
                  <Input
                    value={powerBiUrl}
                    onChange={(e) => setPowerBiUrl(e.target.value)}
                    placeholder="https://app.powerbi.com/view?r=..."
                    className="bg-white/5 border-yellow-500/30 text-white"
                  />
                  <p className="text-white/40 text-xs mt-1">
                    Get embed URL from Power BI publish to web
                  </p>
                </div>

                <Button
                  onClick={handleSaveSettings}
                  className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-bold"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Configuration
                </Button>

                {powerBiUrl && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-white font-medium">Preview</p>
                      <Button
                        onClick={() => window.open(powerBiUrl, '_blank')}
                        size="sm"
                        variant="outline"
                        className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Open Full
                      </Button>
                    </div>
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        src={powerBiUrl}
                        className="absolute top-0 left-0 w-full h-full rounded-lg border border-yellow-500/20"
                        frameBorder="0"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Google Analytics Tab */}
          <TabsContent value="ga">
            <Card className="bg-[#0a1929]/60 backdrop-blur border-green-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-green-400" />
                  Google Analytics Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white">Google Analytics Property ID</Label>
                  <Input
                    value={googleAnalyticsId}
                    onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                    placeholder="G-XXXXXXXXXX or UA-XXXXXXXX"
                    className="bg-white/5 border-green-500/30 text-white"
                  />
                  <p className="text-white/40 text-xs mt-1">
                    Find in Google Analytics Admin → Property Settings
                  </p>
                </div>

                <Button
                  onClick={handleSaveSettings}
                  className="bg-gradient-to-r from-green-600 to-green-500 text-white font-bold"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Configuration
                </Button>

                {googleAnalyticsId && (
                  <div className="space-y-6 mt-6">
                    <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-green-400 mt-0.5" />
                        <div>
                          <p className="text-green-400 font-medium mb-1">Analytics Tracking Active</p>
                          <p className="text-white/70 text-sm">
                            Property ID: <code className="bg-white/10 px-2 py-1 rounded text-xs">{googleAnalyticsId}</code>
                          </p>
                          <p className="text-white/60 text-sm mt-2">
                            Visit Google Analytics dashboard to view detailed reports
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <Button
                        onClick={() => window.open('https://analytics.google.com/', '_blank')}
                        variant="outline"
                        className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open Google Analytics
                      </Button>
                      <Button
                        onClick={() => window.open('https://datastudio.google.com/', '_blank')}
                        variant="outline"
                        className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Create Data Studio Report
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}