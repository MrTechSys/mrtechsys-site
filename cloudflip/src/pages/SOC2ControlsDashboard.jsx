
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  Activity,
  CheckCircle,
  Lock,
  Eye,
  ArrowLeft,
  RefreshCw,
  Download,
  Sparkles,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';

const categoryColors = {
  security: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', icon: Shield },
  availability: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', icon: Activity },
  integrity: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', icon: CheckCircle },
  confidentiality: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', icon: Lock },
  privacy: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/30', icon: Eye }
};

export default function SOC2ControlsDashboard() {
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('integrity');
  const [userPermissions, setUserPermissions] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);

      // Check permissions
      if (currentUser) {
        const roles = await api.entities.UserRole.filter({
          org_id: currentUser.current_org_id,
          user_id: currentUser.id
        });

        if (roles.length > 0) {
          setUserPermissions(roles[0].permissions);
        } else if (currentUser.role === 'admin') {
          // Admins by default have all compliance permissions
          setUserPermissions({ can_manage_compliance: true, can_view_compliance: true });
        } else {
          // Non-admin, non-role users can only view by default
          setUserPermissions({ can_manage_compliance: false, can_view_compliance: true });
        }
      } else {
        // No current user, no permissions
        setUserPermissions({ can_manage_compliance: false, can_view_compliance: false });
      }
    };
    loadUser();
  }, []);

  const canManageCompliance = userPermissions?.can_manage_compliance || user?.role === 'admin';
  const canViewCompliance = userPermissions?.can_view_compliance !== false; // Default to true if not explicitly false

  const { data: controls = [] } = useQuery({
    queryKey: ['compliance-controls'],
    queryFn: () => api.entities.ComplianceControl.filter({
      org_id: user?.current_org_id
    }),
    enabled: !!user && canViewCompliance
  });

  const { data: metrics = [] } = useQuery({
    queryKey: ['compliance-metrics'],
    queryFn: () => api.entities.ComplianceMetric.filter({
      org_id: user?.current_org_id
    }, '-timestamp', 10),
    enabled: !!user && canViewCompliance
  });

  const getLatestMetric = (type) => {
    const metric = metrics.find(m => m.metric_type === type);
    return metric?.value || 0;
  };

  const securityControls = controls.filter(c => c.category === 'security');
  const uptimeMetric = getLatestMetric('uptime');
  const mfaAdoption = getLatestMetric('mfa_adoption');
  const privacyRequests = getLatestMetric('privacy_requests');

  const filteredControls = controls.filter(c => c.category === selectedCategory);

  if (!canViewCompliance) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#06162a] to-[#0b213d] p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <Card className="bg-red-500/10 border-red-500/30 max-w-md">
          <CardContent className="p-12 text-center">
            <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-white text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-white/60">You don't have permission to view compliance data</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#06162a] to-[#0b213d] p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <Link to={createPageUrl("SOC2CommandCenter")}>
          <Button variant="outline" className="border-[#f4d35e]/30 text-white hover:bg-white/10 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to SOC 2 Center
          </Button>
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Shield className="w-8 h-8 text-[#f4d35e]" />
              SOC 2 Controls <span className="text-[#f4d35e]">Dashboard</span>
            </h1>
            <p className="text-white/70 mt-1">Comprehensive Trust Services Criteria Compliance</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-[#f4d35e]/30 text-white hover:bg-white/10">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
              disabled={!canManageCompliance}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white/5 border-[#f4d35e]/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-white/60">Security Controls</CardTitle>
              <Badge className="bg-green-500/20 text-green-400">Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">
              {securityControls.filter(c => c.status === 'active').length}/{securityControls.length}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-[#f4d35e]/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-white/60">Avg Uptime (30d)</CardTitle>
              <Badge className="bg-green-500/20 text-green-400">Excellent</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{uptimeMetric}%</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-[#f4d35e]/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-white/60">MFA Adoption</CardTitle>
              <Badge className="bg-yellow-500/20 text-yellow-400">In Progress</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{mfaAdoption}%</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-[#f4d35e]/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-white/60">Privacy Requests</CardTitle>
              <Badge className="bg-blue-500/20 text-blue-400">Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{privacyRequests} Pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Tabs */}
      <Card className="bg-white/5 border-[#f4d35e]/20 mb-6">
        <CardContent className="p-0">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="w-full grid grid-cols-5 bg-transparent border-b border-[#f4d35e]/20 rounded-none">
              {Object.entries(categoryColors).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className={`data-[state=active]:bg-white/10 ${config.text} capitalize`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {key}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Compliance Controls List */}
      <Card className="bg-white/5 border-[#f4d35e]/20">
        <CardHeader>
          <CardTitle className="text-white">Compliance Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredControls.length === 0 ? (
              <p className="text-white/60 text-center py-8">No controls found for this category</p>
            ) : (
              filteredControls.map((control) => (
                <motion.div
                  key={control.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-[#f4d35e]/10 hover:border-[#f4d35e]/30 transition-all"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-white font-bold">{control.control_id}</span>
                      <span className="text-white/60">-</span>
                      <span className="text-white font-medium">{control.name}</span>
                    </div>
                    <p className="text-xs text-white/60">
                      Owner: {control.owner}
                    </p>
                  </div>
                  <Badge className={`${
                    control.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    control.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                    control.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {control.status}
                  </Badge>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

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
