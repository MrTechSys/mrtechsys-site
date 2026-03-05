import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Shield,
  UserPlus,
  Edit,
  Trash2,
  Lock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import SecurityBanner from '../components/SecurityBanner';

const roleDefinitions = {
  admin: {
    name: 'Administrator',
    description: 'Full system access and user management',
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    permissions: 'all'
  },
  operator: {
    name: 'Operator',
    description: 'Manage operations, deployments, and incidents',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    permissions: 'operational'
  },
  developer: {
    name: 'Developer',
    description: 'Access developer tools, API playground, CI/CD',
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    permissions: 'development'
  },
  analyst: {
    name: 'Analyst',
    description: 'View analytics, reports, and metrics',
    color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    permissions: 'read_only'
  },
  compliance_manager: {
    name: 'Compliance Manager',
    description: 'Manage compliance controls and evidence',
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    permissions: 'compliance'
  },
  viewer: {
    name: 'Viewer',
    description: 'Read-only access to dashboards',
    color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    permissions: 'view_only'
  }
};

export default function RoleManagement() {
  const [user, setUser] = useState(null);
  const [authorized, setAuthorized] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('viewer');
  const [customPermissions, setCustomPermissions] = useState({});
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
      
      // Only admins can access role management
      setAuthorized(currentUser.role === 'admin');
    };
    loadUser();
  }, []);

  const { data: userRoles = [] } = useQuery({
    queryKey: ['user-roles'],
    queryFn: () => api.entities.UserRole.filter({ org_id: user?.current_org_id }),
    enabled: !!user && authorized
  });

  const { data: orgUsers = [] } = useQuery({
    queryKey: ['org-users'],
    queryFn: async () => {
      // Get all users in organization
      const users = await api.entities.User.list();
      return users.filter(u => 
        u.organization_memberships?.some(m => m.org_id === user?.current_org_id)
      );
    },
    enabled: !!user && authorized
  });

  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, role, permissions }) => {
      // Check if role already exists
      const existing = await api.entities.UserRole.filter({
        user_id: userId,
        org_id: user.current_org_id
      });

      if (existing.length > 0) {
        return await api.entities.UserRole.update(existing[0].id, {
          role,
          permissions,
          assigned_by: user.id,
          assigned_at: new Date().toISOString()
        });
      } else {
        return await api.entities.UserRole.create({
          org_id: user.current_org_id,
          user_id: userId,
          role,
          permissions,
          assigned_by: user.id,
          assigned_at: new Date().toISOString()
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      setShowAssignModal(false);
      toast.success('Role assigned successfully!');
    }
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (roleId) => api.entities.UserRole.delete(roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast.success('Role removed');
    }
  });

  const handleAssignRole = () => {
    if (!selectedUserId) {
      toast.error('Please select a user');
      return;
    }

    const defaultPermissions = getDefaultPermissions(selectedRole);
    const finalPermissions = { ...defaultPermissions, ...customPermissions };

    assignRoleMutation.mutate({
      userId: selectedUserId,
      role: selectedRole,
      permissions: finalPermissions
    });
  };

  const getDefaultPermissions = (role) => {
    const permissions = {
      admin: {
        can_manage_leads: true,
        can_create_quotes: true,
        can_manage_jobs: true,
        can_view_billing: true,
        can_manage_billing: true,
        can_manage_users: true,
        can_manage_sla: true,
        can_manage_incidents: true,
        can_manage_compliance: true,
        can_view_compliance: true,
        can_approve_evidence: true,
        can_deploy: true,
        can_manage_pipelines: true,
        can_view_metrics: true,
        can_manage_integrations: true
      },
      operator: {
        can_manage_leads: true,
        can_create_quotes: true,
        can_manage_jobs: true,
        can_view_billing: true,
        can_manage_incidents: true,
        can_view_compliance: true,
        can_deploy: true,
        can_view_metrics: true
      },
      developer: {
        can_view_metrics: true,
        can_manage_pipelines: true,
        can_deploy: true,
        can_view_compliance: true
      },
      analyst: {
        can_view_metrics: true,
        can_view_billing: true,
        can_view_compliance: true
      },
      compliance_manager: {
        can_manage_compliance: true,
        can_view_compliance: true,
        can_approve_evidence: true,
        can_view_metrics: true
      },
      viewer: {
        can_view_metrics: true
      }
    };

    return permissions[role] || permissions.viewer;
  };

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#06162a] to-[#0b213d] flex items-center justify-center p-6">
        <Card className="max-w-md bg-red-500/10 border-red-500/30">
          <CardContent className="p-8 text-center">
            <Lock className="w-20 h-20 text-red-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">Admin Access Required</h2>
            <p className="text-white/70">
              Only administrators can manage user roles and permissions.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 bg-gradient-to-br from-[#06162a] to-[#0b213d]">
      <SecurityBanner
        variant="info"
        message="🔐 Secure Admin Area"
        details="All role changes are logged and audited for compliance. Modify user permissions carefully."
      />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-amber-400" />
            Role <span className="text-amber-400">Management</span>
          </h1>
          <p className="text-white/70 mt-1">Manage user roles and permissions</p>
        </div>
        <Button
          onClick={() => setShowAssignModal(true)}
          className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Assign Role
        </Button>
      </div>

      {/* Role Definitions */}
      <div className="grid md:grid-cols-3 gap-4">
        {Object.entries(roleDefinitions).map(([key, role]) => (
          <Card key={key} className="bg-white/5 border-cyan-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-base">{role.name}</CardTitle>
                <Badge className={role.color}>{key}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-white/60 text-sm">{role.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Current Role Assignments */}
      <Card className="bg-white/5 border-cyan-500/20">
        <CardHeader>
          <CardTitle className="text-white">Current Role Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-cyan-500/20">
                <TableHead className="text-white/80">User</TableHead>
                <TableHead className="text-white/80">Role</TableHead>
                <TableHead className="text-white/80">Assigned By</TableHead>
                <TableHead className="text-white/80">Assigned At</TableHead>
                <TableHead className="text-white/80">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userRoles.map((roleAssignment) => {
                const roleUser = orgUsers.find(u => u.id === roleAssignment.user_id);
                const roleConfig = roleDefinitions[roleAssignment.role] || roleDefinitions.viewer;

                return (
                  <TableRow key={roleAssignment.id} className="border-cyan-500/20">
                    <TableCell className="text-white">{roleUser?.full_name || 'Unknown'}</TableCell>
                    <TableCell>
                      <Badge className={roleConfig.color}>
                        {roleConfig.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white/70 text-sm">
                      {roleAssignment.assigned_by?.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="text-white/70 text-sm">
                      {roleAssignment.assigned_at ? 
                        new Date(roleAssignment.assigned_at).toLocaleDateString() : 
                        '-'}
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => deleteRoleMutation.mutate(roleAssignment.id)}
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Assign Role Dialog */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent className="bg-[#0a1929] border-cyan-500/30">
          <DialogHeader>
            <DialogTitle className="text-white">Assign User Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-white">Select User</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="bg-white/5 border-cyan-500/30 text-white">
                  <SelectValue placeholder="Choose a user..." />
                </SelectTrigger>
                <SelectContent className="bg-[#0a1929] border-cyan-500/20 text-white">
                  {orgUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.full_name} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white">Select Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="bg-white/5 border-cyan-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0a1929] border-cyan-500/20 text-white">
                  {Object.entries(roleDefinitions).map(([key, role]) => (
                    <SelectItem key={key} value={key}>
                      {role.name} - {role.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedRole && (
              <div className="p-4 bg-white/5 rounded-lg border border-cyan-500/20">
                <p className="text-white font-semibold text-sm mb-3">Default Permissions:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(getDefaultPermissions(selectedRole))
                    .filter(([_, value]) => value)
                    .map(([perm, _]) => (
                      <div key={perm} className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span className="text-white/70">{perm.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAssignModal(false)}
              className="border-cyan-500/30 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignRole}
              disabled={assignRoleMutation.isPending || !selectedUserId}
              className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
            >
              Assign Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}