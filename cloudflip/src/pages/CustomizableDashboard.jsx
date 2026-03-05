import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Plus,
  Settings,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Shield,
  Clock,
  Target,
  Zap,
  BarChart,
  AlertTriangle,
  CheckCircle,
  Mail,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const availableWidgets = [
  { id: 'recent_leads', name: 'Recent Leads', icon: Users, color: 'blue' },
  { id: 'active_deals', name: 'Active Deals', icon: Target, color: 'green' },
  { id: 'open_tickets', name: 'Open Tickets', icon: AlertTriangle, color: 'orange' },
  { id: 'revenue', name: 'Revenue Snapshot', icon: DollarSign, color: 'emerald' },
  { id: 'tasks', name: 'Tasks & Reminders', icon: CheckCircle, color: 'purple' },
  { id: 'compliance', name: 'Compliance Status', icon: Shield, color: 'red' },
  { id: 'automation', name: 'Automation Runs', icon: Zap, color: 'amber' },
  { id: 'activity', name: 'Team Activity', icon: Activity, color: 'cyan' },
  { id: 'calendar', name: 'Calendar', icon: Calendar, color: 'pink' },
  { id: 'performance', name: 'Performance', icon: BarChart, color: 'indigo' },
  { id: 'security', name: 'Security Alerts', icon: Shield, color: 'red' },
  { id: 'emails', name: 'Recent Emails', icon: Mail, color: 'blue' }
];

const rolePresets = {
  admin: ['compliance', 'security', 'performance', 'activity', 'automation'],
  sales: ['recent_leads', 'active_deals', 'revenue', 'tasks', 'calendar'],
  support: ['open_tickets', 'activity', 'calendar', 'emails'],
  finance: ['revenue', 'active_deals', 'performance'],
  developer: ['performance', 'automation', 'activity', 'security']
};

export default function CustomizableDashboard() {
  const [user, setUser] = useState(null);
  const [currentOrg, setCurrentOrg] = useState(null);
  const [selectedWidgets, setSelectedWidgets] = useState([]);
  const [editMode, setEditMode] = useState(false);

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

  const { data: dashboardLayout } = useQuery({
    queryKey: ['dashboard-layout', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const layouts = await api.entities.DashboardLayout.filter({ user_id: user.id });
      return layouts[0] || null;
    },
    enabled: !!user
  });

  useEffect(() => {
    if (dashboardLayout?.widgets) {
      setSelectedWidgets(dashboardLayout.widgets);
    } else if (user?.role) {
      const preset = rolePresets[user.role] || rolePresets.sales;
      setSelectedWidgets(preset);
    }
  }, [dashboardLayout, user]);

  const saveDashboardMutation = useMutation({
    mutationFn: async (widgets) => {
      if (dashboardLayout) {
        return await api.entities.DashboardLayout.update(dashboardLayout.id, {
          widgets,
          layout_config: { columns: 3 }
        });
      } else {
        return await api.entities.DashboardLayout.create({
          user_id: user.id,
          org_id: currentOrg?.id,
          widgets,
          layout_config: { columns: 3 }
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['dashboard-layout']);
      toast.success('Dashboard saved');
      setEditMode(false);
    }
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(selectedWidgets);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);

    setSelectedWidgets(items);
  };

  const addWidget = (widgetId) => {
    if (!selectedWidgets.includes(widgetId)) {
      setSelectedWidgets([...selectedWidgets, widgetId]);
    }
  };

  const removeWidget = (widgetId) => {
    setSelectedWidgets(selectedWidgets.filter(id => id !== widgetId));
  };

  const loadRolePreset = (role) => {
    const preset = rolePresets[role];
    if (preset) {
      setSelectedWidgets(preset);
      toast.success(`Loaded ${role} preset`);
    }
  };

  const renderWidget = (widgetId, index) => {
    const widget = availableWidgets.find(w => w.id === widgetId);
    if (!widget) return null;

    const Icon = widget.icon;

    return (
      <Card className="bg-white/5 border-amber-500/20 h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className={`w-5 h-5 text-${widget.color}-400`} />
              <CardTitle className="text-white text-lg">{widget.name}</CardTitle>
            </div>
            {editMode && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeWidget(widgetId)}
                className="text-red-400 hover:text-red-300"
              >
                ×
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-white/60 text-sm">
            Widget content for {widget.name}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!user || !currentOrg) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1929] via-[#0d1f33] to-[#0a1929] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <LayoutDashboard className="w-8 h-8 text-amber-400" />
              My Dashboard
            </h1>
            <p className="text-white/60">Customize your workspace</p>
          </div>
          <div className="flex gap-2">
            {editMode ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditMode(false);
                    if (dashboardLayout?.widgets) {
                      setSelectedWidgets(dashboardLayout.widgets);
                    }
                  }}
                  className="border-amber-500/30 text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => saveDashboardMutation.mutate(selectedWidgets)}
                  className="bg-gradient-to-r from-amber-600 to-amber-500"
                >
                  Save Layout
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setEditMode(true)}
                className="bg-gradient-to-r from-amber-600 to-amber-500"
              >
                <Settings className="w-4 h-4 mr-2" />
                Customize
              </Button>
            )}
          </div>
        </div>

        {editMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-white/5 border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white">Available Widgets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2 flex-wrap">
                    {Object.keys(rolePresets).map(role => (
                      <Button
                        key={role}
                        size="sm"
                        variant="outline"
                        onClick={() => loadRolePreset(role)}
                        className="border-amber-500/30 text-amber-400"
                      >
                        Load {role} preset
                      </Button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {availableWidgets.map(widget => {
                      const Icon = widget.icon;
                      const isSelected = selectedWidgets.includes(widget.id);
                      return (
                        <Button
                          key={widget.id}
                          variant="outline"
                          onClick={() => isSelected ? removeWidget(widget.id) : addWidget(widget.id)}
                          className={`border-${widget.color}-500/30 text-white justify-start ${
                            isSelected ? 'bg-amber-500/20' : ''
                          }`}
                        >
                          <Icon className={`w-4 h-4 mr-2 text-${widget.color}-400`} />
                          {widget.name}
                          {isSelected && <CheckCircle className="w-4 h-4 ml-auto text-green-400" />}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="dashboard" isDropDisabled={!editMode}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                <AnimatePresence>
                  {selectedWidgets.map((widgetId, index) => (
                    <Draggable
                      key={widgetId}
                      draggableId={widgetId}
                      index={index}
                      isDragDisabled={!editMode}
                    >
                      {(provided, snapshot) => (
                        <motion.div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className={snapshot.isDragging ? 'opacity-50' : ''}
                        >
                          {renderWidget(widgetId, index)}
                        </motion.div>
                      )}
                    </Draggable>
                  ))}
                </AnimatePresence>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {selectedWidgets.length === 0 && (
          <Card className="bg-white/5 border-amber-500/20">
            <CardContent className="text-center py-12">
              <LayoutDashboard className="w-12 h-12 text-white/40 mx-auto mb-3" />
              <p className="text-white/60 mb-4">Your dashboard is empty</p>
              <Button
                onClick={() => setEditMode(true)}
                className="bg-gradient-to-r from-amber-600 to-amber-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Widgets
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}