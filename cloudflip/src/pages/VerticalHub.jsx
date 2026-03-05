import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Cloud,
  Zap,
  Settings,
  Building,
  Sparkles,
  TrendingUp,
  Shield,
  Calendar,
  Database,
  Workflow
} from 'lucide-react';
import { motion } from 'framer-motion';
import VerticalComplianceHub from '../components/verticals/VerticalComplianceHub';
import OperationalForecast from '../components/verticals/OperationalForecast';
import ComplianceAlerts from '../components/compliance/ComplianceAlerts';
import RegulatoryChangeLog from '../components/compliance/RegulatoryChangeLog';

export default function VerticalHub() {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
      
      if (currentUser.current_org_id) {
        const orgs = await api.entities.Organization.filter({ id: currentUser.current_org_id });
        if (orgs.length > 0) {
          setOrganization(orgs[0]);
        }
      }
    };
    loadData();
  }, []);

  if (!organization) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Card className="bg-white/5 border-amber-500/30 p-8">
          <p className="text-white/70">Loading...</p>
        </Card>
      </div>
    );
  }

  const vertical = organization.industry;
  const location = `${user?.data?.city || ''}, ${user?.data?.state || ''}`.trim();

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Cloud className="w-8 h-8 text-[#f4d35e]" />
            {organization.settings?.brand_name || organization.name}
            <span className="text-[#f4d35e]">Hub</span>
          </h1>
          <p className="text-white/70 mt-1">
            Cloud Migration Consulting & Automated Workflow Solutions
          </p>
          <p className="text-white/50 text-sm mt-1">
            Helping small businesses modernize and automate
          </p>
        </div>
        <Badge className="bg-[#3cf7d4]/20 text-[#3cf7d4] px-4 py-2">
          Cloud Solutions Provider
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
          <CardContent className="p-4 text-center">
            <Cloud className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-white/60 text-xs">Migration Projects</p>
            <p className="text-2xl font-bold text-blue-400">Active</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <CardContent className="p-4 text-center">
            <Workflow className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-white/60 text-xs">Automation Workflows</p>
            <p className="text-2xl font-bold text-purple-400">Deployed</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-white/60 text-xs">Client Success Rate</p>
            <p className="text-2xl font-bold text-green-400">High</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
          <CardContent className="p-4 text-center">
            <Zap className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="text-white/60 text-xs">Solutions</p>
            <p className="text-2xl font-bold text-amber-400">Custom</p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Alerts - Top Priority */}
      <ComplianceAlerts />

      {/* Regulatory Change Log */}
      <RegulatoryChangeLog />

      {/* Tabs */}
      <Tabs defaultValue="solutions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-amber-500/20">
          <TabsTrigger 
            value="solutions" 
            className="data-[state=active]:bg-[#3cf7d4]/20 data-[state=active]:text-[#3cf7d4]"
          >
            <Cloud className="w-4 h-4 mr-2" />
            Solutions
          </TabsTrigger>
          <TabsTrigger 
            value="compliance" 
            className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400"
          >
            <Shield className="w-4 h-4 mr-2" />
            Compliance
          </TabsTrigger>
          <TabsTrigger 
            value="forecast" 
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Business Forecast
          </TabsTrigger>
        </TabsList>

        <TabsContent value="solutions">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-blue-400" />
                  Cloud Migration Services
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-white/5 rounded-lg">
                  <h4 className="text-white font-medium text-sm mb-2">Infrastructure Assessment</h4>
                  <p className="text-white/70 text-xs">
                    Evaluate current IT infrastructure and create migration roadmaps
                  </p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <h4 className="text-white font-medium text-sm mb-2">Cloud Platform Setup</h4>
                  <p className="text-white/70 text-xs">
                    AWS, Azure, Google Cloud deployment and configuration
                  </p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <h4 className="text-white font-medium text-sm mb-2">Data Migration</h4>
                  <p className="text-white/70 text-xs">
                    Secure transfer of databases, files, and applications to cloud
                  </p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <h4 className="text-white font-medium text-sm mb-2">Post-Migration Support</h4>
                  <p className="text-white/70 text-xs">
                    Ongoing optimization, monitoring, and technical assistance
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Workflow className="w-5 h-5 text-purple-400" />
                  Automation Solutions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-white/5 rounded-lg">
                  <h4 className="text-white font-medium text-sm mb-2">Business Process Automation</h4>
                  <p className="text-white/70 text-xs">
                    Automate repetitive tasks, approvals, and data entry workflows
                  </p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <h4 className="text-white font-medium text-sm mb-2">Integration Services</h4>
                  <p className="text-white/70 text-xs">
                    Connect disparate systems (CRM, accounting, inventory, etc.)
                  </p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <h4 className="text-white font-medium text-sm mb-2">AI-Powered Workflows</h4>
                  <p className="text-white/70 text-xs">
                    Implement intelligent automation using AI and machine learning
                  </p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <h4 className="text-white font-medium text-sm mb-2">Custom Development</h4>
                  <p className="text-white/70 text-xs">
                    Build tailored solutions for unique business requirements
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-amber-400" />
                  DevOps & Infrastructure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-white/5 rounded-lg">
                  <h4 className="text-white font-medium text-sm mb-2">CI/CD Pipeline Setup</h4>
                  <p className="text-white/70 text-xs">
                    Automated deployment pipelines for faster releases
                  </p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <h4 className="text-white font-medium text-sm mb-2">Monitoring & Observability</h4>
                  <p className="text-white/70 text-xs">
                    Real-time application and infrastructure monitoring
                  </p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <h4 className="text-white font-medium text-sm mb-2">Security Hardening</h4>
                  <p className="text-white/70 text-xs">
                    Implement security best practices and compliance controls
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-green-400" />
                  Small Business Packages
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-white/5 rounded-lg">
                  <h4 className="text-white font-medium text-sm mb-2">Starter Package</h4>
                  <p className="text-white/70 text-xs">
                    Basic cloud setup and essential automations for growing businesses
                  </p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <h4 className="text-white font-medium text-sm mb-2">Growth Package</h4>
                  <p className="text-white/70 text-xs">
                    Advanced integrations, custom workflows, and ongoing support
                  </p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <h4 className="text-white font-medium text-sm mb-2">Enterprise Package</h4>
                  <p className="text-white/70 text-xs">
                    Full-service migration, DevOps, and dedicated consulting
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance">
          <VerticalComplianceHub vertical="cloud_consulting" location={location} />
        </TabsContent>

        <TabsContent value="forecast">
          <OperationalForecast vertical="cloud_consulting" />
        </TabsContent>
      </Tabs>
    </div>
  );
}