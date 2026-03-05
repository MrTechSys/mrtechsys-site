import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Shield,
  Search,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Calendar,
  User,
  Activity,
  Database,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AdvancedAuditLogViewer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7d');
  const [selectedLog, setSelectedLog] = useState(null);
  const [realTimeMode, setRealTimeMode] = useState(false);

  const { data: auditLogs = [], isLoading, refetch } = useQuery({
    queryKey: ['auditLogs', actionFilter, entityFilter, dateRange],
    queryFn: async () => {
      const user = await api.auth.me();
      const filters = { org_id: user.data.current_org_id };
      
      if (actionFilter !== 'all') filters.action = actionFilter;
      if (entityFilter !== 'all') filters.entity = entityFilter;
      
      const logs = await api.entities.AuditLog.filter(filters, '-created_date', 100);
      return logs;
    },
    refetchInterval: realTimeMode ? 5000 : false
  });

  const filteredLogs = auditLogs.filter(log => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      log.actor_name?.toLowerCase().includes(searchLower) ||
      log.entity?.toLowerCase().includes(searchLower) ||
      log.detail?.toLowerCase().includes(searchLower)
    );
  });

  const handleExport = () => {
    const csv = [
      ['Timestamp', 'Actor', 'Action', 'Entity', 'Record ID', 'Details', 'IP Address'].join(','),
      ...filteredLogs.map(log => [
        format(new Date(log.created_date), 'yyyy-MM-dd HH:mm:ss'),
        log.actor_name || 'System',
        log.action,
        log.entity,
        log.record_id || '',
        `"${log.detail || ''}"`,
        log.ip_address || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    toast.success('Audit logs exported');
  };

  const actionColors = {
    create: 'bg-green-500/20 text-green-400',
    update: 'bg-blue-500/20 text-blue-400',
    delete: 'bg-red-500/20 text-red-400',
    read: 'bg-gray-500/20 text-gray-400',
    approve: 'bg-purple-500/20 text-purple-400',
    reject: 'bg-orange-500/20 text-orange-400'
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#0a1929]/60 backdrop-blur border-cyan-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              Advanced Audit Log Viewer
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={realTimeMode ? 'default' : 'outline'}
                onClick={() => setRealTimeMode(!realTimeMode)}
                className={realTimeMode ? 'bg-cyan-500/20 text-cyan-400' : 'border-cyan-500/30 text-cyan-400'}
              >
                <Activity className={`w-4 h-4 mr-2 ${realTimeMode ? 'animate-pulse' : ''}`} />
                {realTimeMode ? 'Live' : 'Paused'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => refetch()}
                className="border-green-500/30 text-green-400"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleExport}
                className="border-amber-500/30 text-amber-400"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <Label className="text-white">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search logs..."
                  className="pl-10 bg-white/5 border-cyan-500/30 text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-white">Action</Label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="bg-white/5 border-cyan-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="approve">Approve</SelectItem>
                  <SelectItem value="reject">Reject</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white">Entity</Label>
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="bg-white/5 border-cyan-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  <SelectItem value="Lead">Lead</SelectItem>
                  <SelectItem value="Quote">Quote</SelectItem>
                  <SelectItem value="Invoice">Invoice</SelectItem>
                  <SelectItem value="User">User</SelectItem>
                  <SelectItem value="Organization">Organization</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white">Time Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="bg-white/5 border-cyan-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Audit Log Table */}
          <div className="bg-black/20 border border-cyan-500/20 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cyan-500/20 bg-cyan-500/10">
                    <th className="text-left p-3 text-cyan-400 text-sm font-semibold">Timestamp</th>
                    <th className="text-left p-3 text-cyan-400 text-sm font-semibold">Actor</th>
                    <th className="text-left p-3 text-cyan-400 text-sm font-semibold">Action</th>
                    <th className="text-left p-3 text-cyan-400 text-sm font-semibold">Entity</th>
                    <th className="text-left p-3 text-cyan-400 text-sm font-semibold">Details</th>
                    <th className="text-left p-3 text-cyan-400 text-sm font-semibold">IP</th>
                    <th className="text-left p-3 text-cyan-400 text-sm font-semibold"></th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-white/60">
                        Loading audit logs...
                      </td>
                    </tr>
                  ) : filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-white/60">
                        No audit logs found
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="border-b border-cyan-500/10 hover:bg-cyan-500/5 transition-colors">
                        <td className="p-3 text-white/80 text-sm">
                          {format(new Date(log.created_date), 'MMM dd, HH:mm:ss')}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-cyan-400" />
                            <span className="text-white text-sm">{log.actor_name || 'System'}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge className={actionColors[log.action] || 'bg-gray-500/20 text-gray-400'}>
                            {log.action}
                          </Badge>
                        </td>
                        <td className="p-3 text-white text-sm">{log.entity}</td>
                        <td className="p-3 text-white/70 text-sm max-w-xs truncate">{log.detail}</td>
                        <td className="p-3 text-white/60 text-xs font-mono">{log.ip_address}</td>
                        <td className="p-3">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedLog(log)}
                            className="text-cyan-400 hover:bg-cyan-500/10"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selectedLog && (
        <Card className="bg-[#0a1929]/90 backdrop-blur border-amber-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Audit Log Details</CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedLog(null)}
                className="text-white/60 hover:text-white"
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white/60 text-xs">Actor</Label>
                <p className="text-white">{selectedLog.actor_name || 'System'}</p>
              </div>
              <div>
                <Label className="text-white/60 text-xs">Timestamp</Label>
                <p className="text-white">{format(new Date(selectedLog.created_date), 'PPpp')}</p>
              </div>
              <div>
                <Label className="text-white/60 text-xs">Action</Label>
                <Badge className={actionColors[selectedLog.action]}>{selectedLog.action}</Badge>
              </div>
              <div>
                <Label className="text-white/60 text-xs">Entity</Label>
                <p className="text-white">{selectedLog.entity}</p>
              </div>
            </div>

            {selectedLog.before && (
              <div>
                <Label className="text-white/60 text-xs mb-2 block">Before</Label>
                <pre className="bg-black/40 border border-green-500/20 rounded p-3 text-green-400 text-xs overflow-x-auto">
                  {JSON.stringify(selectedLog.before, null, 2)}
                </pre>
              </div>
            )}

            {selectedLog.after && (
              <div>
                <Label className="text-white/60 text-xs mb-2 block">After</Label>
                <pre className="bg-black/40 border border-blue-500/20 rounded p-3 text-blue-400 text-xs overflow-x-auto">
                  {JSON.stringify(selectedLog.after, null, 2)}
                </pre>
              </div>
            )}

            {selectedLog.metadata && (
              <div>
                <Label className="text-white/60 text-xs mb-2 block">Metadata</Label>
                <pre className="bg-black/40 border border-cyan-500/20 rounded p-3 text-cyan-400 text-xs overflow-x-auto">
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}