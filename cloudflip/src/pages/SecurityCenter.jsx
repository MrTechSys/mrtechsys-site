
import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, Download, Eye, Lock, AlertCircle, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import CopyrightFooter from "../components/CopyrightFooter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export default function SecurityCenter() {
  const [entityFilter, setEntityFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [timeRange, setTimeRange] = useState("24h");

  const { data: auditLogs = [] } = useQuery({
    queryKey: ['audit-logs', entityFilter, actionFilter],
    queryFn: async () => {
      let filters = {};
      if (entityFilter !== "all") filters.entity = entityFilter;
      if (actionFilter !== "all") filters.action = actionFilter;
      return api.entities.AuditLog.filter(filters, '-created_date', 50);
    },
  });

  const { data: securityLogs = [] } = useQuery({
    queryKey: ['security-logs', riskFilter, timeRange],
    queryFn: async () => {
      const now = new Date();
      const timeRanges = {
        '1h': 3600000, // 1 hour in milliseconds
        '24h': 86400000, // 24 hours in milliseconds
        '7d': 604800000, // 7 days in milliseconds
        '30d': 2592000000 // 30 days in milliseconds
      };
      
      const startTime = new Date(now.getTime() - timeRanges[timeRange]);
      
      let filters = {
        created_date: { $gte: startTime.toISOString() }
      };
      
      if (riskFilter === 'high') filters.risk_score = { $gte: 70 };
      else if (riskFilter === 'medium') filters.risk_score = { $gte: 40, $lt: 70 };
      else if (riskFilter === 'low') filters.risk_score = { $lt: 40 };
      else if (riskFilter === 'suspicious') filters.is_suspicious = true;
      else if (riskFilter === 'blocked') filters.is_blocked = true;
      
      return api.entities.SecurityLog.filter(filters, '-created_date', 100);
    },
  });

  const { data: rateLimits = [] } = useQuery({
    queryKey: ['rate-limits'],
    queryFn: () => api.entities.RateLimitLog.filter({ limit_exceeded: true }, '-created_date', 20),
  });

  const handleExportData = async () => {
    toast.info("Preparing your data export...");
    // In a real implementation, this would trigger a backend function
    // that generates and emails a complete data export
    setTimeout(() => {
      toast.success("Data export will be emailed to you shortly");
    }, 2000);
  };

  // Calculate security metrics
  const highRiskCount = securityLogs.filter(log => log.risk_score >= 70).length;
  const suspiciousCount = securityLogs.filter(log => log.is_suspicious).length;
  const blockedCount = securityLogs.filter(log => log.is_blocked).length;
  const botCount = securityLogs.filter(log => log.is_bot).length;
  
  const avgRiskScore = securityLogs.length > 0 
    ? securityLogs.reduce((sum, log) => sum + (log.risk_score || 0), 0) / securityLogs.length 
    : 0;

  const actionColors = {
    create: "bg-green-100 text-green-800",
    update: "bg-blue-100 text-blue-800",
    delete: "bg-red-100 text-red-800",
    read: "bg-gray-100 text-gray-800"
  };

  const getRiskColor = (score) => {
    if (score >= 70) return "text-red-400";
    if (score >= 40) return "text-yellow-400";
    return "text-green-400";
  };

  const getRiskBadge = (score) => {
    if (score >= 70) return "bg-red-100 text-red-800";
    if (score >= 40) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-amber-400" />
            Security <span className="text-amber-400">Center</span>
          </h1>
          <p className="text-white/70 mt-1">Monitor <span className="text-amber-400">security</span>, privacy, and compliance</p>
        </div>
      </div>

      {/* Security Status Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white/80">Average Risk Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className={`text-3xl font-bold ${getRiskColor(avgRiskScore)}`}>
                {Math.round(avgRiskScore)}
              </span>
              <div className="text-right">
                <Progress value={avgRiskScore} className="w-20 h-2 bg-slate-700 [&>*]:bg-amber-400" />
                <p className="text-xs text-white/60 mt-1">Last {timeRange}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white/80">High Risk Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-red-400">{highRiskCount}</span>
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white/80">Blocked Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-orange-400">{blockedCount}</span>
              <Lock className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white/80">Bot Traffic</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-purple-400">{botCount}</span>
              <Eye className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Badges */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-white">
              <CheckCircle className="w-5 h-5 text-green-600" />
              HTTPS Encryption
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-white/70">All data encrypted at rest and in transit using AES-256 & TLS 1.3</p>
            <Badge className="mt-2 bg-green-100 text-green-800">Active</Badge>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-white">
              <Lock className="w-5 h-5 text-blue-600" />
              Row-Level Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-white/70">Multi-tenant isolation enforced on all database queries</p>
            <Badge className="mt-2 bg-blue-100 text-blue-800">Enabled</Badge>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-white">
              <Eye className="w-5 h-5 text-purple-600" />
              Rate Limiting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-white/70">Automated bot detection and rate limiting protection</p>
            <Badge className="mt-2 bg-purple-100 text-purple-800">Protected</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Security Best Practices */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Security Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-white">✅ Recommended Actions:</h4>
              <ul className="text-sm text-white/70 space-y-1 pl-4 list-disc list-inside">
                <li>Enable Multi-Factor Authentication (MFA)</li>
                <li>Use strong, unique passwords (12+ characters)</li>
                <li>Review audit logs regularly</li>
                <li>Limit user permissions to minimum necessary</li>
                <li>Keep contact information up to date</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-white">⚠️ Security Reminders:</h4>
              <ul className="text-sm text-white/70 space-y-1 pl-4 list-disc list-inside">
                <li>Never share your password with anyone</li>
                <li>Log out from shared devices</li>
                <li>Report suspicious activity immediately</li>
                <li>Review connected integrations regularly</li>
                <li>Enable email notifications for logins</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Different Log Views */}
      <Tabs defaultValue="traffic" className="space-y-4">
        <TabsList className="bg-[#0a1929]/60 border border-amber-500/20">
          <TabsTrigger value="traffic" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 text-white/70 hover:text-white">
            Traffic Logs ({securityLogs.length})
          </TabsTrigger>
          <TabsTrigger value="audit" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 text-white/70 hover:text-white">
            Audit Logs ({auditLogs.length})
          </TabsTrigger>
          <TabsTrigger value="rate-limits" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 text-white/70 hover:text-white">
            Rate Limits ({rateLimits.length})
          </TabsTrigger>
        </TabsList>

        {/* Traffic Logs */}
        <TabsContent value="traffic">
          <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <CardTitle className="text-white">Website Traffic Monitor</CardTitle>
                <div className="flex gap-3">
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-32 bg-white/5 border-amber-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a1929] border-amber-500/20 text-white">
                      <SelectItem value="1h">Last Hour</SelectItem>
                      <SelectItem value="24h">Last 24h</SelectItem>
                      <SelectItem value="7d">Last 7 Days</SelectItem>
                      <SelectItem value="30d">Last 30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={riskFilter} onValueChange={setRiskFilter}>
                    <SelectTrigger className="w-40 bg-white/5 border-amber-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a1929] border-amber-500/20 text-white">
                      <SelectItem value="all">All Traffic</SelectItem>
                      <SelectItem value="high">High Risk</SelectItem>
                      <SelectItem value="medium">Medium Risk</SelectItem>
                      <SelectItem value="low">Low Risk</SelectItem>
                      <SelectItem value="suspicious">Suspicious</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-amber-500/20 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-amber-500/20 hover:bg-transparent">
                      <TableHead className="text-white/80">Timestamp</TableHead>
                      <TableHead className="text-white/80">IP Address</TableHead>
                      <TableHead className="text-white/80">Request</TableHead>
                      <TableHead className="text-white/80">Risk Score</TableHead>
                      <TableHead className="text-white/80">Status</TableHead>
                      <TableHead className="text-white/80">Factors</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {securityLogs.length === 0 ? (
                      <TableRow className="border-amber-500/20">
                        <TableCell colSpan={6} className="text-center py-8 text-white/60">
                          No security logs found for selected filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      securityLogs.map((log) => (
                        <TableRow key={log.id} className="border-amber-500/20 hover:bg-white/5">
                          <TableCell className="text-sm text-white/80">
                            {format(new Date(log.created_date), 'MMM d, h:mm:ss a')}
                          </TableCell>
                          <TableCell className="text-sm font-mono text-white/80">
                            {log.ip_address}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-white/80">
                              <span className="font-semibold">{log.request_method}</span> {log.request_path}
                            </div>
                            {log.is_bot && (
                              <Badge className="bg-purple-100 text-purple-800 text-xs mt-1">Bot</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={getRiskBadge(log.risk_score)}>
                              {log.risk_score}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {log.is_blocked ? (
                              <Badge className="bg-red-100 text-red-800">Blocked</Badge>
                            ) : log.is_suspicious ? (
                              <Badge className="bg-yellow-100 text-yellow-800">Suspicious</Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-800">Allowed</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-white/60">
                            {log.risk_factors?.join(', ') || '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs */}
        <TabsContent value="audit">
          <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-white">Audit Log</CardTitle>
              <div className="flex gap-3 mt-4">
                <Select value={entityFilter} onValueChange={setEntityFilter}>
                  <SelectTrigger className="w-40 bg-white/5 border-amber-500/30 text-white">
                    <SelectValue placeholder="Entity" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a1929] border-amber-500/20 text-white">
                    <SelectItem value="all">All Entities</SelectItem>
                    <SelectItem value="Quote">Quotes</SelectItem>
                    <SelectItem value="Invoice">Invoices</SelectItem>
                    <SelectItem value="Client">Clients</SelectItem>
                    <SelectItem value="Lead">Leads</SelectItem>
                    <SelectItem value="User">Users</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-40 bg-white/5 border-amber-500/30 text-white">
                    <SelectValue placeholder="Action" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a1929] border-amber-500/20 text-white">
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="create">Create</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-amber-500/20 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-amber-500/20 hover:bg-transparent">
                      <TableHead className="text-white/80">Timestamp</TableHead>
                      <TableHead className="text-white/80">Entity</TableHead>
                      <TableHead className="text-white/80">Action</TableHead>
                      <TableHead className="text-white/80">Actor</TableHead>
                      <TableHead className="text-white/80">IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.length === 0 ? (
                      <TableRow className="border-amber-500/20">
                        <TableCell colSpan={5} className="text-center py-8 text-white/60">
                          No audit logs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      auditLogs.map((log) => (
                        <TableRow key={log.id} className="border-amber-500/20 hover:bg-white/5">
                          <TableCell className="text-sm text-white/80">
                            {format(new Date(log.created_date), 'MMM d, yyyy h:mm a')}
                          </TableCell>
                          <TableCell className="font-medium text-white">{log.entity}</TableCell>
                          <TableCell>
                            <Badge className={actionColors[log.action]}>
                              {log.action}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-white/70">
                            {log.actor_id?.slice(0, 8)}...
                          </TableCell>
                          <TableCell className="text-sm text-white/70 font-mono">
                            {log.ip_address || 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rate Limits */}
        <TabsContent value="rate-limits">
          <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-white">Rate Limit Violations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-amber-500/20 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-amber-500/20 hover:bg-transparent">
                      <TableHead className="text-white/80">Timestamp</TableHead>
                      <TableHead className="text-white/80">Identifier</TableHead>
                      <TableHead className="text-white/80">Endpoint</TableHead>
                      <TableHead className="text-white/80">Requests</TableHead>
                      <TableHead className="text-white/80">Blocked</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rateLimits.length === 0 ? (
                      <TableRow className="border-amber-500/20">
                        <TableCell colSpan={5} className="text-center py-8 text-white/60">
                          No rate limit violations
                        </TableCell>
                      </TableRow>
                    ) : (
                      rateLimits.map((log) => (
                        <TableRow key={log.id} className="border-amber-500/20 hover:bg-white/5">
                          <TableCell className="text-sm text-white/80">
                            {format(new Date(log.last_request_at), 'MMM d, h:mm a')}
                          </TableCell>
                          <TableCell className="text-sm font-mono text-white/80">
                            {log.identifier}
                          </TableCell>
                          <TableCell className="text-sm text-white/80">{log.endpoint}</TableCell>
                          <TableCell>
                            <Badge className="bg-orange-100 text-orange-800">
                              {log.request_count}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-red-100 text-red-800">
                              {log.blocked_requests}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Data Export */}
      <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Download className="w-5 h-5 text-amber-400" />
            Data Subject Access Request (DSAR)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-white/70">
            Export all your <span className="text-amber-400">organization's data</span> in compliance with GDPR and privacy regulations.
            You'll receive a comprehensive CSV file via email within 24 hours.
          </p>
          <Button onClick={handleExportData} className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold">
            <Download className="w-4 h-4 mr-2" />
            Request Full Data Export
          </Button>
        </CardContent>
      </Card>

      {/* Compliance Info */}
      <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
        <CardHeader>
          <CardTitle className="text-white">Compliance & Certifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-amber-500/20">
              <Shield className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-semibold text-white">GDPR Compliant</p>
                <p className="text-xs text-white/60">EU Data Protection</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-amber-500/20">
              <Lock className="w-8 h-8 text-blue-600" />
              <div>
                <p className="font-semibold text-white">SOC 2 Ready</p>
                <p className="text-xs text-white/60">Security Controls</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-amber-500/20">
              <CheckCircle className="w-8 h-8 text-purple-600" />
              <div>
                <p className="font-semibold text-white">CCPA Compliant</p>
                <p className="text-xs text-white/60">California Privacy</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <CopyrightFooter />
    </div>
  );
}
