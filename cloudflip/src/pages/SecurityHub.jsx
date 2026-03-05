import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Activity, AlertTriangle, FileText } from 'lucide-react';
import AdvancedAuditLogViewer from '../components/security/AdvancedAuditLogViewer';
import SecurityScannerDashboard from '../components/security/SecurityScannerDashboard';

export default function SecurityHub() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Shield className="w-8 h-8 text-purple-400" />
          Security & Compliance <span className="text-purple-400">Hub</span>
        </h1>
        <p className="text-white/60">
          Advanced security monitoring, audit logs, and compliance management
        </p>
      </div>

      <Tabs defaultValue="scanner" className="space-y-6">
        <TabsList className="bg-white/5 border border-purple-500/20 p-1">
          <TabsTrigger value="scanner" className="text-xs md:text-sm data-[state=active]:bg-purple-500/20">
            <Shield className="w-4 h-4 mr-2" />
            Security Scanner
          </TabsTrigger>
          <TabsTrigger value="audit" className="text-xs md:text-sm data-[state=active]:bg-cyan-500/20">
            <Activity className="w-4 h-4 mr-2" />
            Audit Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scanner">
          <SecurityScannerDashboard />
        </TabsContent>

        <TabsContent value="audit">
          <AdvancedAuditLogViewer />
        </TabsContent>
      </Tabs>
    </div>
  );
}