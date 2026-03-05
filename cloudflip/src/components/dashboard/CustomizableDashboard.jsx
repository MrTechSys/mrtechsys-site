import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Settings,
  Plus,
  X,
  GripVertical,
  BarChart,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Activity,
  Calendar,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const WIDGET_LIBRARY = [
  {
    key: 'lead_source_performance',
    title: 'Lead Source Performance',
    icon: Users,
    category: 'crm',
    chartType: 'bar',
    description: 'Lead volume and conversion by source'
  },
  {
    key: 'conversion_funnel',
    title: 'Conversion Funnel',
    icon: TrendingUp,
    category: 'crm',
    chartType: 'area',
    description: 'Pipeline stages and drop-off rates'
  },
  {
    key: 'pipeline_value',
    title: 'Pipeline Value Trend',
    icon: DollarSign,
    category: 'business',
    chartType: 'line',
    description: 'Total pipeline value over time'
  },
  {
    key: 'sales_velocity',
    title: 'Sales Velocity',
    icon: Activity,
    category: 'business',
    chartType: 'line',
    description: 'Deal progression speed'
  },
  {
    key: 'industry_breakdown',
    title: 'Industry Breakdown',
    icon: Target,
    category: 'crm',
    chartType: 'pie',
    description: 'Leads by industry vertical'
  },
  {
    key: 'activity_timeline',
    title: 'Activity Timeline',
    icon: Calendar,
    category: 'crm',
    chartType: 'area',
    description: 'Team activity over time'
  }
];

const CHART_COLORS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#ec4899'];

export default function CustomizableDashboard({ orgId, userId }) {
  const [layout, setLayout] = useState(null);
  const [showWidgetPicker, setShowWidgetPicker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const queryClient = useQueryClient();

  const { data: savedLayout } = useQuery({
    queryKey: ['dashboard-layout', userId],
    queryFn: async () => {
      const layouts = await api.entities.DashboardLayout.filter({
        org_id: orgId,
        user_id: userId
      });
      
      if (layouts.length > 0) {
        return layouts[0];
      }
      
      // Default layout
      return {
        widgets: [
          { widget_key: 'lead_source_performance', config: {} },
          { widget_key: 'conversion_funnel', config: {} },
          { widget_key: 'pipeline_value', config: {} }
        ]
      };
    },
    enabled: !!orgId && !!userId
  });

  useEffect(() => {
    if (savedLayout) {
      setLayout(savedLayout);
    }
  }, [savedLayout]);

  const saveLayoutMutation = useMutation({
    mutationFn: async (widgets) => {
      if (savedLayout?.id) {
        return await api.entities.DashboardLayout.update(savedLayout.id, {
          widgets,
          last_modified: new Date().toISOString()
        });
      } else {
        return await api.entities.DashboardLayout.create({
          org_id: orgId,
          user_id: userId,
          title: 'My Dashboard',
          widgets,
          is_default: true,
          share_scope: 'private'
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-layout'] });
      toast.success('Dashboard saved!');
    }
  });

  const handleAddWidget = (widgetKey) => {
    const newWidgets = [
      ...(layout?.widgets || []),
      { widget_key: widgetKey, config: {} }
    ];
    setLayout({ ...layout, widgets: newWidgets });
    saveLayoutMutation.mutate(newWidgets);
    setShowWidgetPicker(false);
  };

  const handleRemoveWidget = (index) => {
    const newWidgets = layout.widgets.filter((_, i) => i !== index);
    setLayout({ ...layout, widgets: newWidgets });
    saveLayoutMutation.mutate(newWidgets);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(layout.widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setLayout({ ...layout, widgets: items });
    saveLayoutMutation.mutate(items);
  };

  if (!layout) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart className="w-6 h-6 text-cyan-400" />
          My Dashboard
        </h2>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowWidgetPicker(true)}
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-purple-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Widget
          </Button>
          <Button
            onClick={() => setShowSettings(true)}
            size="sm"
            variant="outline"
            className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="widgets">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid lg:grid-cols-2 gap-4"
            >
              {layout.widgets.map((widget, index) => (
                <Draggable key={`${widget.widget_key}-${index}`} draggableId={`${widget.widget_key}-${index}`} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <WidgetRenderer
                        widgetKey={widget.widget_key}
                        config={widget.config}
                        dragHandleProps={provided.dragHandleProps}
                        onRemove={() => handleRemoveWidget(index)}
                        orgId={orgId}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Widget Picker */}
      <Dialog open={showWidgetPicker} onOpenChange={setShowWidgetPicker}>
        <DialogContent className="bg-[#0a1929] border-amber-500/30 max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-white">Add Widget</DialogTitle>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-3">
            {WIDGET_LIBRARY.map(widget => {
              const Icon = widget.icon;
              const alreadyAdded = layout.widgets.some(w => w.widget_key === widget.key);
              
              return (
                <Card
                  key={widget.key}
                  onClick={() => !alreadyAdded && handleAddWidget(widget.key)}
                  className={`cursor-pointer transition-all ${
                    alreadyAdded
                      ? 'opacity-50 cursor-not-allowed bg-white/5 border-white/10'
                      : 'bg-white/5 border-cyan-500/20 hover:border-cyan-500/40 hover:scale-105'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-cyan-500/20 rounded">
                        <Icon className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-sm">{widget.title}</h3>
                        <p className="text-white/60 text-xs mt-1">{widget.description}</p>
                        <Badge className="mt-2 bg-purple-500/20 text-purple-400 text-xs">
                          {widget.chartType}
                        </Badge>
                        {alreadyAdded && (
                          <Badge className="ml-1 bg-green-500/20 text-green-400 text-xs">
                            Added
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowWidgetPicker(false)}
              className="border-amber-500/30 text-white hover:bg-white/10"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function WidgetRenderer({ widgetKey, config, dragHandleProps, onRemove, orgId }) {
  const widgetDef = WIDGET_LIBRARY.find(w => w.key === widgetKey);
  const Icon = widgetDef?.icon || BarChart;

  const { data: widgetData } = useQuery({
    queryKey: ['widget-data', widgetKey, orgId],
    queryFn: async () => {
      const { data } = await api.functions.invoke('widgetRunner', {
        widgetKey,
        orgId,
        config
      });
      return data;
    },
    enabled: !!orgId
  });

  return (
    <Card className="bg-[#0a1929]/60 backdrop-blur border-cyan-500/20 relative group">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div {...dragHandleProps} className="cursor-move opacity-50 group-hover:opacity-100 transition-opacity">
              <GripVertical className="w-4 h-4 text-cyan-400" />
            </div>
            <Icon className="w-4 h-4 text-cyan-400" />
            <CardTitle className="text-white text-sm">{widgetDef?.title}</CardTitle>
          </div>
          <Button
            onClick={onRemove}
            size="sm"
            variant="ghost"
            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!widgetData ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse text-cyan-400">Loading...</div>
          </div>
        ) : (
          <WidgetChart
            type={widgetDef?.chartType}
            data={widgetData.data}
            widgetKey={widgetKey}
          />
        )}
      </CardContent>
    </Card>
  );
}

function WidgetChart({ type, data, widgetKey }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-white/60">
        No data available
      </div>
    );
  }

  if (type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={250}>
        <RechartsBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis dataKey="name" stroke="#06b6d4" tick={{ fontSize: 12 }} />
          <YAxis stroke="#06b6d4" tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #06b6d4' }}
            labelStyle={{ color: '#fff' }}
          />
          <Bar dataKey="value" fill="#06b6d4" />
          {data[0]?.conversion !== undefined && (
            <Bar dataKey="conversion" fill="#8b5cf6" />
          )}
        </RechartsBarChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis dataKey="date" stroke="#06b6d4" tick={{ fontSize: 12 }} />
          <YAxis stroke="#06b6d4" tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #06b6d4' }}
            labelStyle={{ color: '#fff' }}
          />
          <Line type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4' }} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'area') {
    return (
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis dataKey="stage" stroke="#06b6d4" tick={{ fontSize: 12 }} />
          <YAxis stroke="#06b6d4" tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #8b5cf6' }}
            labelStyle={{ color: '#fff' }}
          />
          <Area type="monotone" dataKey="count" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorValue)" />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'pie') {
    return (
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #06b6d4' }}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return <div className="h-64 flex items-center justify-center text-white/60">Chart type not supported</div>;
}