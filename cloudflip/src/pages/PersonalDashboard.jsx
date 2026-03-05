import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  LayoutGrid,
  Plus,
  Save,
  Settings as SettingsIcon,
  Trash2,
  GripVertical,
  Users,
  DollarSign,
  FileText,
  TrendingUp,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

// Import widgets
import GoalsWidget from "../components/widgets/GoalsWidget";
import RecentActivityWidget from "../components/widgets/RecentActivityWidget";
import MetricsWidget from "../components/widgets/MetricsWidget";
import QuickTasksWidget from "../components/widgets/QuickTasksWidget";
import PipelineWidget from "../components/widgets/PipelineWidget";
import PersonalizedRecommendations from "../components/PersonalizedRecommendations";

const AVAILABLE_WIDGETS = [
  { key: 'goals', label: 'Personal Goals', component: GoalsWidget },
  { key: 'activity', label: 'Recent Activity', component: RecentActivityWidget },
  { key: 'tasks', label: 'Quick Tasks', component: QuickTasksWidget },
  { key: 'pipeline', label: 'Pipeline', component: PipelineWidget },
  { key: 'leads_metric', label: 'New Leads', component: MetricsWidget, props: { title: 'New Leads', icon: Users, color: 'bg-blue-500' } },
  { key: 'revenue_metric', label: 'Revenue', component: MetricsWidget, props: { title: 'Revenue', icon: DollarSign, color: 'bg-green-500' } },
  { key: 'quotes_metric', label: 'Active Quotes', component: MetricsWidget, props: { title: 'Quotes', icon: FileText, color: 'bg-purple-500' } },
  { key: 'deals_metric', label: 'Pipeline Value', component: MetricsWidget, props: { title: 'Pipeline', icon: TrendingUp, color: 'bg-amber-500' } }
];

export default function PersonalDashboard() {
  const [user, setUser] = useState(null);
  const [currentLayout, setCurrentLayout] = useState(null);
  const [widgets, setWidgets] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showWidgetPicker, setShowWidgetPicker] = useState(false);
  const [layoutName, setLayoutName] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await api.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };
    loadUser();
  }, []);

  // Fetch metrics for metric widgets with error handling
  const { data: leads = [], isLoading: isLoadingLeads } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      try {
        return await api.entities.Lead.list('-created_date', 100);
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
        return await api.entities.Quote.list('-created_date', 100);
      } catch (error) {
        console.error('Error loading quotes:', error);
        return [];
      }
    },
    retry: 1
  });

  const { data: deals = [], isLoading: isLoadingDeals } = useQuery({
    queryKey: ['crm-deals'],
    queryFn: async () => {
      try {
        return await api.entities.Deal.list('-created_date', 100);
      } catch (error) {
        console.error('Error loading deals:', error);
        return [];
      }
    },
    retry: 1
  });

  const { data: invoices = [], isLoading: isLoadingInvoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      try {
        return await api.entities.Invoice.list('-created_date', 100);
      } catch (error) {
        console.error('Error loading invoices:', error);
        return [];
      }
    },
    retry: 1
  });

  const { data: layouts = [], isLoading: isLoadingLayouts } = useQuery({
    queryKey: ['dashboard-layouts'],
    queryFn: async () => {
      if (!user?.current_org_id) return [];
      try {
        return await api.entities.DashboardLayout.filter({ 
          user_id: user.id,
          org_id: user.current_org_id 
        });
      } catch (error) {
        console.error('Error loading layouts:', error);
        return [];
      }
    },
    enabled: !!user,
    retry: 1
  });

  useEffect(() => {
    if (layouts.length > 0) {
      const defaultLayout = layouts.find(l => l.is_default) || layouts[0];
      setCurrentLayout(defaultLayout);
      setWidgets(defaultLayout.widgets || []);
    } else if (!isLoadingLayouts && user) {
      // Default widgets
      setWidgets([
        { widget_key: 'goals', id: 'goals-1' },
        { widget_key: 'pipeline', id: 'pipeline-1' },
        { widget_key: 'activity', id: 'activity-1' },
        { widget_key: 'tasks', id: 'tasks-1' }
      ]);
    }
  }, [layouts, isLoadingLayouts, user]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      try {
        if (currentLayout) {
          return await api.entities.DashboardLayout.update(currentLayout.id, data);
        } else {
          return await api.entities.DashboardLayout.create({
            ...data,
            user_id: user.id,
            org_id: user.current_org_id
          });
        }
      } catch (error) {
        console.error('Save layout error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-layouts'] });
      toast.success("Dashboard saved!");
      setShowSaveDialog(false);
    },
    onError: (error) => {
      console.error('Failed to save layout:', error);
      toast.error("Failed to save dashboard layout");
    }
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(widgets);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);

    setWidgets(items);
  };

  const handleAddWidget = (widgetKey) => {
    const newWidget = {
      widget_key: widgetKey,
      id: `${widgetKey}-${Date.now()}`
    };
    setWidgets([...widgets, newWidget]);
    setShowWidgetPicker(false);
    toast.success("Widget added!");
  };

  const handleRemoveWidget = (widgetId) => {
    setWidgets(widgets.filter(w => w.id !== widgetId));
    toast.success("Widget removed!");
  };

  const handleSaveLayout = () => {
    if (!user?.current_org_id) {
      toast.error("Please select an organization first");
      return;
    }
    
    saveMutation.mutate({
      title: layoutName || currentLayout?.title || "My Dashboard",
      widgets: widgets,
      is_default: !currentLayout || currentLayout.is_default
    });
  };

  // Calculate metric values safely
  const newLeads = leads.filter(l => l?.status === 'new').length;
  const activeQuotes = quotes.filter(q => q?.status === 'sent' || q?.status === 'viewed').length;
  const totalRevenue = invoices.filter(i => i?.status === 'paid').reduce((sum, inv) => sum + (inv?.total || 0), 0);
  const pipelineValue = deals.reduce((sum, d) => sum + (d?.value || 0), 0);

  const getWidgetProps = (widgetKey) => {
    switch (widgetKey) {
      case 'leads_metric':
        return { value: newLeads, change: 12.5 };
      case 'revenue_metric':
        return { value: `$${(totalRevenue / 1000).toFixed(0)}k`, change: 8.3 };
      case 'quotes_metric':
        return { value: activeQuotes, change: -2.1 };
      case 'deals_metric':
        return { value: `$${(pipelineValue / 1000).toFixed(0)}k`, change: 15.7 };
      default:
        return {};
    }
  };

  const isLoading = isLoadingLeads || isLoadingQuotes || isLoadingDeals || isLoadingInvoices || isLoadingLayouts;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/60">Please log in to view your dashboard</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            <span className="text-amber-400">Personal</span> Dashboard
          </h1>
          <p className="text-white/70 mt-1">Customize your workspace</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowWidgetPicker(true)}
            variant="outline"
            className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Widget
          </Button>
          <Button
            onClick={() => {
              setLayoutName(currentLayout?.title || "");
              setShowSaveDialog(true);
            }}
            className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Layout
          </Button>
        </div>
      </div>

      {/* Personalized AI Recommendations - NEW */}
      <PersonalizedRecommendations compact={false} />

      {/* Layout Selector */}
      {layouts.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {layouts.map((layout) => (
            <Button
              key={layout.id}
              onClick={() => {
                setCurrentLayout(layout);
                setWidgets(layout.widgets || []);
              }}
              variant="outline"
              size="sm"
              className={`border-amber-500/30 ${
                currentLayout?.id === layout.id
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <LayoutGrid className="w-3 h-3 mr-2" />
              {layout.title}
              {layout.is_default && (
                <Badge className="ml-2 bg-green-500/20 text-green-400 text-xs">Default</Badge>
              )}
            </Button>
          ))}
        </div>
      )}

      {/* Drag and Drop Dashboard */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="dashboard">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {widgets.map((widget, index) => {
                const widgetConfig = AVAILABLE_WIDGETS.find(w => w.key === widget.widget_key);
                if (!widgetConfig) return null;

                const WidgetComponent = widgetConfig.component;
                const widgetProps = widgetConfig.props 
                  ? { ...widgetConfig.props, ...getWidgetProps(widget.widget_key) }
                  : {};

                return (
                  <Draggable key={widget.id} draggableId={widget.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`relative ${snapshot.isDragging ? 'opacity-50' : ''}`}
                      >
                        <div {...provided.dragHandleProps} className="absolute top-2 right-2 z-10 flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="w-6 h-6 text-white/50 hover:text-white hover:bg-white/10 cursor-grab active:cursor-grabbing"
                          >
                            <GripVertical className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleRemoveWidget(widget.id)}
                            className="w-6 h-6 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <WidgetComponent {...widgetProps} />
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {widgets.length === 0 && (
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20 p-12 text-center">
          <LayoutGrid className="w-16 h-16 text-amber-400/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Your Canvas Awaits</h3>
          <p className="text-white/70 mb-6">Add widgets to build your perfect dashboard</p>
          <Button
            onClick={() => setShowWidgetPicker(true)}
            className="bg-gradient-to-r from-amber-600 to-amber-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Widget
          </Button>
        </Card>
      )}

      {/* Widget Picker Dialog */}
      <Dialog open={showWidgetPicker} onOpenChange={setShowWidgetPicker}>
        <DialogContent className="bg-[#0a1929] border-amber-500/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Add Widget</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            {AVAILABLE_WIDGETS.map((widget) => {
              const isAdded = widgets.some(w => w.widget_key === widget.key);
              
              return (
                <motion.button
                  key={widget.key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => !isAdded && handleAddWidget(widget.key)}
                  disabled={isAdded}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    isAdded
                      ? 'bg-white/5 border-green-500/30 cursor-not-allowed'
                      : 'bg-white/5 border-amber-500/20 hover:border-amber-500/40 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">{widget.label}</h4>
                    {isAdded && (
                      <Badge className="bg-green-500/20 text-green-400 text-xs">Added</Badge>
                    )}
                  </div>
                  <p className="text-white/60 text-xs">
                    {widget.key.includes('metric') ? 'Key performance metric' : 
                     widget.key === 'goals' ? 'Track personal goals' :
                     widget.key === 'activity' ? 'Recent team activity' :
                     widget.key === 'tasks' ? 'Quick task management' :
                     'Pipeline overview'}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Layout Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="bg-[#0a1929] border-amber-500/30">
          <DialogHeader>
            <DialogTitle className="text-white">Save Dashboard Layout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-white">Layout Name</Label>
              <Input
                value={layoutName}
                onChange={(e) => setLayoutName(e.target.value)}
                placeholder="e.g., Sales Focus, Development View"
                className="bg-white/5 border-amber-500/30 text-white"
              />
            </div>
            <div className="p-3 bg-white/5 rounded-lg border border-amber-500/20">
              <p className="text-white/70 text-sm">
                <strong className="text-amber-400">{widgets.length}</strong> widgets configured
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSaveDialog(false)}
              className="border-amber-500/30 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveLayout}
              disabled={saveMutation.isPending}
              className="bg-gradient-to-r from-amber-600 to-amber-500"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Layout
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}