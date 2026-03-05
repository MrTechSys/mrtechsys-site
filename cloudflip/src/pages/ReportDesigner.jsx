
import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LayoutGrid,
  Save,
  Trash,
  Sparkles,
  Eye,
  ArrowUp,
  ArrowDown,
  Loader2 // Added Loader2 icon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function ReportDesigner() {
  const [user, setUser] = useState(null);
  const [reportView, setReportView] = useState({
    title: '',
    description: '',
    widgets: [],
    filters: {},
    share_scope: 'private'
  });
  const [previewData, setPreviewData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [aiInsights, setAiInsights] = useState(null); // New state for AI insights
  const [loadingInsights, setLoadingInsights] = useState(false); // New state for AI insights loading

  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: widgetRegistry = [] } = useQuery({
    queryKey: ['widget-registry'],
    queryFn: () => api.entities.WidgetRegistry.list(),
    enabled: !!user
  });

  const saveMutation = useMutation({
    mutationFn: async (viewData) => {
      return await api.entities.ReportView.create({
        org_id: user.current_org_id,
        owner_id: user.id,
        ...viewData
      });
    },
    onSuccess: () => {
      toast.success('Report view saved!');
      queryClient.invalidateQueries({ queryKey: ['report-views'] });
    },
    onError: () => {
      toast.error('Failed to save report view');
    }
  });

  const handleAddWidget = (widgetDef) => {
    const newWidget = {
      id: `${widgetDef.key}-${Date.now()}`,
      widget_key: widgetDef.key,
      description: widgetDef.description,
      config: {},
      order: reportView.widgets.length
    };

    setReportView({
      ...reportView,
      widgets: [...reportView.widgets, newWidget]
    });
  };

  const handleRemoveWidget = (widgetId) => {
    setReportView({
      ...reportView,
      widgets: reportView.widgets.filter(w => w.id !== widgetId)
    });
  };

  const handleMoveWidget = (widgetId, direction) => {
    const currentIndex = reportView.widgets.findIndex(w => w.id === widgetId);
    if (direction === 'up' && currentIndex > 0) {
      const newWidgets = [...reportView.widgets];
      [newWidgets[currentIndex], newWidgets[currentIndex - 1]] = [newWidgets[currentIndex - 1], newWidgets[currentIndex]];
      setReportView({ ...reportView, widgets: newWidgets });
    } else if (direction === 'down' && currentIndex < reportView.widgets.length - 1) {
      const newWidgets = [...reportView.widgets];
      [newWidgets[currentIndex], newWidgets[currentIndex + 1]] = [newWidgets[currentIndex + 1], newWidgets[currentIndex]];
      setReportView({ ...reportView, widgets: newWidgets });
    }
  };

  const handlePreview = async () => {
    if (reportView.widgets.length === 0) {
      toast.error('Add widgets first');
      return;
    }

    setLoadingPreview(true);
    try {
      const { data } = await api.functions.invoke('widgetRunner', {
        widgetKey: reportView.widgets[0]?.widget_key,
        config: reportView.widgets[0]?.config || {},
        timeframe: '30d'
      });
      setPreviewData(data.dataset);
      toast.success('Preview loaded');
    } catch (error) {
      toast.error('Preview failed');
      console.error(error);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleSave = () => {
    if (!reportView.title) {
      toast.error('Please enter a title');
      return;
    }
    if (reportView.widgets.length === 0) {
      toast.error('Add at least one widget');
      return;
    }
    saveMutation.mutate(reportView);
  };

  const handleGenerateInsights = async () => {
    if (!reportView.title) {
      toast.error('Please enter a title for the report first.');
      return;
    }
    if (reportView.widgets.length === 0) {
      toast.error('Add widgets to the report first.');
      return;
    }

    setLoadingInsights(true);
    try {
      // First save the report to get an ID for insight generation
      const savedReport = await api.entities.ReportView.create({
        org_id: user.current_org_id,
        owner_id: user.id,
        ...reportView
      });

      // Then generate insights using the saved report's ID
      const { data } = await api.functions.invoke('reportAIInsights', {
        reportViewId: savedReport.id,
        generateNarrative: true,
        suggestWidgets: true
      });

      setAiInsights(data.insights);
      toast.success('AI insights generated!');
    } catch (error) {
      toast.error('Failed to generate insights');
      console.error('Error generating AI insights:', error);
    } finally {
      setLoadingInsights(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#06162a] to-[#0b213d] p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <LayoutGrid className="w-8 h-8 text-[#f4d35e]" />
              Report <span className="text-[#f4d35e]">Designer</span>
            </h1>
            <p className="text-white/70 mt-1">Build custom reports with widgets</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleGenerateInsights}
              disabled={loadingInsights || !reportView.title || reportView.widgets.length === 0}
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600"
            >
              {loadingInsights ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Insights
                </>
              )}
            </Button>
            <Button
              onClick={handlePreview}
              disabled={loadingPreview || reportView.widgets.length === 0}
              variant="outline"
              className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
            >
              {loadingPreview ? (
                <>Loading...</>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </>
              )}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
            >
              <Save className="w-4 h-4 mr-2" />
              Save View
            </Button>
          </div>
        </div>
      </div>

      {/* AI Insights Panel */}
      {aiInsights && (
        <Card className="bg-white/5 border-purple-500/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              AI-Generated Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Narrative Summary */}
            {aiInsights.narrative && (
              <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                <h4 className="text-purple-400 font-medium mb-3">Executive Summary</h4>
                <p className="text-white/80 text-sm leading-relaxed">{aiInsights.narrative.executive_summary}</p>

                {aiInsights.narrative.key_findings?.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h5 className="text-white/70 text-xs font-medium">Key Findings:</h5>
                    {aiInsights.narrative.key_findings.map((finding, idx) => (
                      <div key={idx} className={`p-2 rounded text-xs ${
                        finding.significance === 'critical' ? 'bg-red-500/20 text-red-400' :
                        finding.significance === 'concerning' ? 'bg-yellow-500/20 text-yellow-400' :
                        finding.significance === 'positive' ? 'bg-green-500/20 text-green-400' :
                        'bg-white/5 text-white/70'
                      }`}>
                        <p className="font-medium">{finding.finding}</p>
                        <p className="text-xs opacity-80 mt-1">{finding.recommendation}</p>
                      </div>
                    ))}
                  </div>
                )}

                {aiInsights.narrative.anomalies?.length > 0 && (
                  <div className="mt-4 p-3 bg-red-500/10 rounded border border-red-500/30">
                    <h5 className="text-red-400 font-medium text-xs mb-2">Anomalies Detected:</h5>
                    <ul className="space-y-1 text-xs text-white/70">
                      {aiInsights.narrative.anomalies.map((anomaly, idx) => (
                        <li key={idx}>• {anomaly.anomaly} - {anomaly.suggested_action}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Widget Suggestions */}
            {aiInsights.widget_suggestions?.length > 0 && (
              <div>
                <h4 className="text-white/80 font-medium mb-3 text-sm">Suggested Widgets</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {aiInsights.widget_suggestions.map((sug, idx) => (
                    <div key={idx} className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                          {sug.widget_type}
                        </Badge>
                        <Badge className={`text-xs ${
                          sug.priority === 'must_have' ? 'bg-red-500/20 text-red-400' :
                          sug.priority === 'should_have' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {sug.priority.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-white/80 text-sm mb-2">{sug.reasoning}</p>
                      <p className="text-white/60 text-xs">{sug.expected_value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-white/5 border-[#f4d35e]/20">
            <CardHeader>
              <CardTitle className="text-white text-sm">Report Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white">Title *</Label>
                <Input
                  value={reportView.title}
                  onChange={(e) => setReportView({ ...reportView, title: e.target.value })}
                  placeholder="e.g., Weekly DevOps Report"
                  className="bg-white/5 border-[#f4d35e]/30 text-white"
                />
              </div>

              <div>
                <Label className="text-white">Description</Label>
                <Textarea
                  value={reportView.description}
                  onChange={(e) => setReportView({ ...reportView, description: e.target.value })}
                  placeholder="Brief description..."
                  rows={3}
                  className="bg-white/5 border-[#f4d35e]/30 text-white"
                />
              </div>

              <div>
                <Label className="text-white">Share Scope</Label>
                <Select
                  value={reportView.share_scope}
                  onValueChange={(value) => setReportView({ ...reportView, share_scope: value })}
                >
                  <SelectTrigger className="bg-white/5 border-[#f4d35e]/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a1929] border-[#f4d35e]/20 text-white">
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="org">Organization</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-[#f4d35e]/20">
            <CardHeader>
              <CardTitle className="text-white text-sm">Available Widgets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {widgetRegistry.map((widget) => (
                  <button
                    key={widget.key}
                    onClick={() => handleAddWidget(widget)}
                    className="w-full p-3 text-left bg-white/5 hover:bg-white/10 rounded-lg border border-[#f4d35e]/10 hover:border-[#f4d35e]/30 transition-all"
                  >
                    <p className="text-white text-sm font-medium">{widget.title}</p>
                    <p className="text-white/60 text-xs mt-1">{widget.description}</p>
                    <Badge className="mt-2 bg-blue-500/20 text-blue-400 text-xs">
                      {widget.chart_type}
                    </Badge>
                  </button>
                ))}

                {widgetRegistry.length === 0 && (
                  <p className="text-white/60 text-center py-4 text-sm">
                    No widgets available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Canvas Area */}
        <div className="lg:col-span-2">
          <Card className="bg-white/5 border-[#f4d35e]/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Report Canvas</CardTitle>
                <Badge className="bg-[#f4d35e]/20 text-[#f4d35e]">
                  {reportView.widgets.length} widgets
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {reportView.widgets.length === 0 ? (
                <div className="text-center py-16">
                  <LayoutGrid className="w-16 h-16 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60">Add widgets to start building your report</p>
                  <p className="text-white/40 text-sm mt-2">Click widgets from the left panel to add them</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reportView.widgets.map((widget, index) => (
                    <div key={widget.id} className="p-4 bg-white/5 rounded-lg border border-[#f4d35e]/20">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{widget.widget_key}</h4>
                          <p className="text-white/60 text-xs">{widget.description || 'No description'}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleMoveWidget(widget.id, 'up')}
                            disabled={index === 0}
                            className="h-8 w-8 text-white/60 hover:text-white disabled:opacity-30"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleMoveWidget(widget.id, 'down')}
                            disabled={index === reportView.widgets.length - 1}
                            className="h-8 w-8 text-white/60 hover:text-white disabled:opacity-30"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleRemoveWidget(widget.id)}
                            className="h-8 w-8 text-red-400"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {previewData && (
                <div className="mt-6 p-4 bg-[#0a1929] rounded-lg border border-[#f4d35e]/20">
                  <h4 className="text-white font-medium mb-3">Preview Data</h4>
                  <pre className="text-white/80 text-xs overflow-x-auto max-h-64">
                    {JSON.stringify(previewData, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
