import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Shield,
  Smartphone,
  Key,
  AlertTriangle,
  CheckCircle,
  Copy,
  Download,
  XCircle,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import SecurityScoreCard from "../components/security/SecurityScoreCard";
import MFAAttemptsChart from "../components/security/MFAAttemptsChart";
import TrustedDevicesManager from "../components/security/TrustedDevicesManager";
import RecoveryEmailManager from "../components/security/RecoveryEmailManager";
import ActivityLogViewer from "../components/security/ActivityLogViewer";
import SecurityQuestionsManager from "../components/security/SecurityQuestionsManager";
import MFADiagnosticsPanel from "../components/security/MFADiagnosticsPanel";
import MFAMonitoringDashboard from "../components/security/MFAMonitoringDashboard";

export default function MFASettings() {
  const [user, setUser] = useState(null);
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState(null);
  const secretRef = React.useRef(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState(null);
  const [step, setStep] = useState(1);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await api.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to load user:", error);
        toast.error("Failed to load user data");
      }
    };
    loadUser();
  }, []);

  const { data: mfaSettings } = useQuery({
    queryKey: ['mfa-settings', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const settings = await api.entities.MFASettings.filter({ user_id: user.id });
      return settings.length > 0 ? settings[0] : null;
    },
    enabled: !!user?.id
  });

  const { data: recentAttempts = [] } = useQuery({
    queryKey: ['mfa-attempts', user?.id],
    queryFn: () => {
      if (!user?.id) return [];
      return api.entities.MFAAttempt.filter({ 
        user_id: user.id 
      }, '-created_date', 100);
    },
    enabled: !!user?.id
  });

  const { data: activityLogs = [] } = useQuery({
    queryKey: ['user-activity-logs', user?.id],
    queryFn: () => {
      if (!user?.id) return [];
      return api.entities.UserActivityLog.filter({ 
        user_id: user.id 
      }, '-created_date', 50);
    },
    enabled: !!user?.id
  });

  const { data: securityQuestions } = useQuery({
    queryKey: ['security-questions', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const questions = await api.entities.MFASecurityQuestions.filter({ user_id: user.id });
      return questions.length > 0 ? questions[0] : null;
    },
    enabled: !!user?.id
  });

  const generateSecretMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.functions.invoke('mfaEnroll', {
        action: 'generate_secret'
      });
      return data;
    },
    onSuccess: (data) => {
      // SECURITY: Store secret in both state and ref for reliability
      setSecret(data.secret);
      secretRef.current = data.secret;
      setQrCode(data.qrCode);
      setStep(2);
    },
    onError: (error) => {
      console.error("Failed to generate QR code");
      toast.error("Failed to generate QR code");
      setShowEnrollDialog(false);
    }
  });

  const verifyAndEnableMutation = useMutation({
    mutationFn: async ({ savedSecret, code }) => {
      const { data } = await api.functions.invoke('mfaEnroll', {
        action: 'verify_and_enable',
        secret: savedSecret,
        token: code
      });
      return data;
    },
    onSuccess: (data) => {
      setBackupCodes(data.backup_codes);
      setStep(3);
      
      queryClient.invalidateQueries({ queryKey: ['mfa-settings'] });
      queryClient.invalidateQueries({ queryKey: ['mfa-attempts'] });
      queryClient.invalidateQueries({ queryKey: ['user-activity-logs'] });
      toast.success("MFA enabled successfully!");
    },
    onError: (error) => {
      const errorData = error?.response?.data;
      const msg = errorData?.message || "Verification failed - please try again";
      toast.error(msg);
    }
  });

  const disableMFAMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.functions.invoke('mfaEnroll', {
        action: 'disable'
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mfa-settings'] });
      queryClient.invalidateQueries({ queryKey: ['user-activity-logs'] });
      setShowDisableDialog(false);
      toast.success("MFA disabled");
    },
    onError: (error) => {
      console.error("Failed to disable MFA");
      toast.error("Failed to disable MFA");
    }
  });

  const updateMFASettingsMutation = useMutation({
    mutationFn: async (updates) => {
      if (!mfaSettings?.id) {
        throw new Error("No MFA settings found");
      }
      return await api.entities.MFASettings.update(mfaSettings.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mfa-settings'] });
    },
    onError: (error) => {
      toast.error("Failed to update settings");
    }
  });

  const handleStartEnrollment = () => {
    setStep(1);
    setShowEnrollDialog(true);
    setVerificationCode("");
    setSecret(null);
    secretRef.current = null;
    setQrCode(null);
    setBackupCodes(null);
    generateSecretMutation.mutate();
  };

  const handleVerify = () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }
    
    // Use ref as primary source, fallback to state
    const currentSecret = secretRef.current || secret;
    
    if (!currentSecret || typeof currentSecret !== 'string' || currentSecret.trim() === '') {
      console.error('❌ No secret available - ref:', secretRef.current, 'state:', secret);
      toast.error("Session expired. Please restart enrollment.");
      setShowEnrollDialog(false);
      return;
    }
    
    console.log('✅ Sending verification - code length:', verificationCode.length, 'secret length:', currentSecret.length);
    
    verifyAndEnableMutation.mutate({ 
      savedSecret: currentSecret, 
      code: verificationCode 
    });
  };

  const handleCompleteSetup = () => {
    setShowEnrollDialog(false);
    setQrCode(null);
    setSecret(null);
    secretRef.current = null;
    setVerificationCode("");
    setBackupCodes(null);
    setStep(1);
  };

  const handleAddDevice = async (device) => {
    try {
      const currentDevices = mfaSettings?.trusted_devices || [];
      await updateMFASettingsMutation.mutateAsync({
        trusted_devices: [...currentDevices, device]
      });
      
      await api.entities.UserActivityLog.create({
        user_id: user.id,
        action_type: 'trusted_device_added',
        details: { device_name: device.device_name },
        success: true
      });
      
      queryClient.invalidateQueries({ queryKey: ['user-activity-logs'] });
      toast.success("Device added");
    } catch (error) {
      toast.error("Failed to add device");
    }
  };

  const handleRemoveDevice = async (deviceId) => {
    try {
      const currentDevices = mfaSettings?.trusted_devices || [];
      const updatedDevices = currentDevices.filter(d => d.device_id !== deviceId);
      
      await updateMFASettingsMutation.mutateAsync({
        trusted_devices: updatedDevices
      });
      
      await api.entities.UserActivityLog.create({
        user_id: user.id,
        action_type: 'trusted_device_removed',
        details: { device_id: deviceId },
        success: true
      });
      
      queryClient.invalidateQueries({ queryKey: ['user-activity-logs'] });
      toast.success("Device removed");
    } catch (error) {
      toast.error("Failed to remove device");
    }
  };

  const handleUpdateRecoveryEmail = async (email) => {
    try {
      await updateMFASettingsMutation.mutateAsync({
        recovery_email: email,
        recovery_email_verified: false
      });
      
      await api.entities.UserActivityLog.create({
        user_id: user.id,
        action_type: 'recovery_email_updated',
        details: { email },
        success: true
      });
      
      queryClient.invalidateQueries({ queryKey: ['user-activity-logs'] });
      toast.success("Recovery email updated - verification email sent");
    } catch (error) {
      toast.error("Failed to update recovery email");
    }
  };

  const isMFAEnabled = mfaSettings?.mfa_enabled;
  const failedAttempts = recentAttempts.filter(a => !a.success).length;
  const successRate = recentAttempts.length > 0 
    ? ((recentAttempts.filter(a => a.success).length / recentAttempts.length) * 100).toFixed(0)
    : 100;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-green-400" />
            Multi-Factor <span className="text-amber-400">Authentication</span>
          </h1>
          <p className="text-white/70 mt-1">Secure your account with an extra layer of protection</p>
        </div>
        <Badge className={isMFAEnabled ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}>
          {isMFAEnabled ? (
            <>
              <CheckCircle className="w-3 h-3 mr-1" />
              Enabled
            </>
          ) : (
            <>
              <XCircle className="w-3 h-3 mr-1" />
              Disabled
            </>
          )}
        </Badge>
      </div>

      {/* Security Score + Status */}
      <div className="grid lg:grid-cols-3 gap-6">
        <SecurityScoreCard
          mfaEnabled={isMFAEnabled}
          recentAttempts={recentAttempts}
          trustedDevicesCount={mfaSettings?.trusted_devices?.length || 0}
          hasRecoveryEmail={!!mfaSettings?.recovery_email}
        />

        <div className="lg:col-span-2">
          <Card className={`bg-gradient-to-br ${
            isMFAEnabled 
              ? 'from-green-500/10 to-emerald-500/10 border-green-500/30' 
              : 'from-yellow-500/10 to-orange-500/10 border-yellow-500/30'
          } h-full`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {isMFAEnabled ? "MFA is Active" : "MFA is Not Enabled"}
                  </h2>
                  <p className="text-white/70 text-sm mb-4">
                    {isMFAEnabled 
                      ? "Your account is protected with two-factor authentication"
                      : "Enable MFA to add an extra layer of security to your CloudFlip account"
                    }
                  </p>
                  
                  {isMFAEnabled ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-white/80">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Enrolled {mfaSettings?.enrolled_at && format(new Date(mfaSettings.enrolled_at), 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-white/80">
                        <Smartphone className="w-4 h-4 text-green-400" />
                        Authenticator app configured
                      </div>
                      <div className="flex items-center gap-2 text-sm text-white/80">
                        <Key className="w-4 h-4 text-green-400" />
                        {mfaSettings?.backup_codes_encrypted?.length || 0} backup codes available
                      </div>
                    </div>
                  ) : (
                    <ul className="space-y-2 text-sm text-white/70">
                      <li className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-amber-400" />
                        Protect against unauthorized access
                      </li>
                      <li className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-amber-400" />
                        Secure sensitive operations
                      </li>
                      <li className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-amber-400" />
                        Backup codes for account recovery
                      </li>
                    </ul>
                  )}
                </div>

                <div>
                  {isMFAEnabled ? (
                    <Button
                      onClick={() => setShowDisableDialog(true)}
                      variant="outline"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      Disable MFA
                    </Button>
                  ) : (
                    <Button
                      onClick={handleStartEnrollment}
                      className="bg-gradient-to-r from-green-600 to-green-500"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Enable MFA
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Security Stats Row */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Key className="w-5 h-5 text-blue-400" />
              <Badge className="bg-blue-500/20 text-blue-400">Total</Badge>
            </div>
            <p className="text-3xl font-bold text-blue-400">{recentAttempts.length}</p>
            <p className="text-white/60 text-xs mt-1">Verification attempts</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <Badge className="bg-red-500/20 text-red-400">Failed</Badge>
            </div>
            <p className="text-3xl font-bold text-red-400">{failedAttempts}</p>
            <p className="text-white/60 text-xs mt-1">Failed attempts</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <Badge className="bg-green-500/20 text-green-400">Success</Badge>
            </div>
            <p className="text-3xl font-bold text-green-400">{successRate}%</p>
            <p className="text-white/60 text-xs mt-1">Success rate</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Smartphone className="w-5 h-5 text-purple-400" />
              <Badge className="bg-purple-500/20 text-purple-400">Devices</Badge>
            </div>
            <p className="text-3xl font-bold text-purple-400">
              {mfaSettings?.trusted_devices?.length || 0}
            </p>
            <p className="text-white/60 text-xs mt-1">Trusted devices</p>
          </CardContent>
        </Card>
      </div>

      {/* MFA Monitoring Dashboard */}
      {recentAttempts.length > 0 && (
        <MFAMonitoringDashboard attempts={recentAttempts} />
      )}

      {/* MFA Diagnostics Panel */}
      <MFADiagnosticsPanel recentAttempts={recentAttempts} />

      {/* Recovery Options */}
      {isMFAEnabled && (
        <>
          <div className="grid lg:grid-cols-2 gap-6">
            <RecoveryEmailManager
              currentEmail={mfaSettings?.recovery_email}
              isVerified={mfaSettings?.recovery_email_verified}
              onUpdateEmail={handleUpdateRecoveryEmail}
            />
            
            <TrustedDevicesManager
              trustedDevices={mfaSettings?.trusted_devices || []}
              onAddDevice={handleAddDevice}
              onRemoveDevice={handleRemoveDevice}
            />
          </div>

          <SecurityQuestionsManager
            currentQuestions={securityQuestions?.questions || []}
            onUpdate={() => {
              queryClient.invalidateQueries({ queryKey: ['security-questions'] });
              queryClient.invalidateQueries({ queryKey: ['user-activity-logs'] });
            }}
          />
        </>
      )}

      {/* Recent Attempts */}
      <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            Recent Verification Attempts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentAttempts.length === 0 ? (
            <p className="text-white/60 text-center py-8">No verification attempts yet</p>
          ) : (
            <div className="space-y-2">
              {recentAttempts.slice(0, 10).map((attempt) => (
                <div
                  key={attempt.id}
                  className="p-3 bg-white/5 rounded-lg border border-amber-500/20 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={attempt.success ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                        {attempt.success ? 'Success' : 'Failed'}
                      </Badge>
                      <Badge variant="outline" className="text-white/60">
                        {attempt.attempt_type}
                      </Badge>
                      {attempt.risk_score > 50 && (
                        <Badge className="bg-orange-500/20 text-orange-400">
                          Risk: {attempt.risk_score}
                        </Badge>
                      )}
                    </div>
                    <p className="text-white/60 text-xs">
                      {attempt.created_date && format(new Date(attempt.created_date), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  <div className="text-right text-xs text-white/50">
                    <p>{attempt.ip_address}</p>
                    {attempt.geolocation?.city && (
                      <p>{attempt.geolocation.city}, {attempt.geolocation.country}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Log */}
      <ActivityLogViewer activities={activityLogs} />

      {/* Enrollment Dialog */}
      <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
        <DialogContent className="bg-[#0a1929] border-amber-500/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              Enable MFA - Step {step} of 3
            </DialogTitle>
            <DialogDescription className="text-white/60">
              {step === 1 && "Setting up your authenticator app"}
              {step === 2 && "Verify your authenticator is working"}
              {step === 3 && "Save your backup codes"}
            </DialogDescription>
          </DialogHeader>

          {step === 1 && (
            <div className="text-center py-6">
              <Smartphone className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-pulse" />
              <p className="text-white/70">Generating your secure QR code...</p>
            </div>
          )}

          {step === 2 && qrCode && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-blue-400 text-sm">
                  <strong>Step 1:</strong> Open Google Authenticator, Authy, or Microsoft Authenticator
                </p>
              </div>

              <div className="text-center">
                <p className="text-white/80 text-sm mb-4">
                  <strong>Step 2:</strong> Scan this QR code
                </p>
                <div className="bg-white p-4 rounded-lg inline-block">
                  <img src={qrCode} alt="MFA QR Code" className="w-64 h-64" />
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <p className="text-amber-400 text-xs">
                  ⚠️ <strong>Security Note:</strong> This QR code is shown only once. Do not share screenshots of this screen.
                </p>
              </div>

              <div>
                <label className="text-white text-sm mb-2 block">
                  <strong>Step 3:</strong> Enter the 6-digit code from your app
                </label>
                <Input
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && verificationCode.length === 6 && !verifyAndEnableMutation.isPending) {
                      e.preventDefault();
                      handleVerify();
                    }
                  }}
                  placeholder="000000"
                  className="bg-white/5 border-amber-500/30 text-white text-center text-2xl tracking-widest"
                  maxLength={6}
                  autoFocus
                />
                <p className="text-white/50 text-xs mt-2 text-center">
                  The code refreshes every 30 seconds - enter the current code
                </p>
              </div>

              <Button
                onClick={handleVerify}
                disabled={verificationCode.length !== 6 || verifyAndEnableMutation.isPending}
                className="w-full bg-gradient-to-r from-green-600 to-green-500"
              >
                {verifyAndEnableMutation.isPending ? 'Verifying...' : 'Verify & Enable MFA'}
              </Button>

              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <p className="text-purple-400 text-xs">
                  💡 <strong>Tip:</strong> Ensure your phone's time is set to automatic. Clock drift can cause verification issues.
                </p>
              </div>
            </div>
          )}

          {step === 3 && backupCodes && (
            <div className="space-y-4">
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-400 font-medium text-sm mb-1">
                      Critical: Save Your Backup Codes Now
                    </p>
                    <p className="text-white/70 text-xs">
                      These codes will only be shown once. Store them securely - you'll need them if you lose your authenticator device.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-black/40 rounded-lg p-4 border border-amber-500/20">
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {backupCodes.map((code, idx) => (
                    <div key={idx} className="text-amber-400 p-1 bg-white/5 rounded text-center">
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(backupCodes.join('\n'));
                    toast.success("Backup codes copied to clipboard!");
                  }}
                  variant="outline"
                  className="flex-1 border-amber-500/30 text-white"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy All
                </Button>
                <Button
                  onClick={() => {
                    const content = `CloudFlip MFA Backup Codes
Generated: ${new Date().toLocaleString()}
User: ${user?.email}

${backupCodes.map((code, i) => `${i + 1}. ${code}`).join('\n')}

⚠️ KEEP THESE SECURE - Each code can only be used once.`;
                    
                    const blob = new Blob([content], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `cloudflip-mfa-backup-codes-${Date.now()}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                    toast.success("Backup codes downloaded securely!");
                  }}
                  variant="outline"
                  className="flex-1 border-amber-500/30 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>

              <Button
                onClick={handleCompleteSetup}
                className="w-full bg-gradient-to-r from-green-600 to-green-500"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Setup
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Disable Confirmation Dialog */}
      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent className="bg-[#0a1929] border-amber-500/30">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Disable MFA
            </DialogTitle>
            <DialogDescription className="text-white/60">
              This will reduce your account security
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 font-medium text-sm mb-2">
              ⚠️ Your account will only be protected by password
            </p>
            <p className="text-white/70 text-xs">
              Are you sure you want to disable two-factor authentication?
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDisableDialog(false)}
              className="border-amber-500/30 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={() => disableMFAMutation.mutate()}
              disabled={disableMFAMutation.isPending}
              className="bg-gradient-to-r from-red-600 to-red-500"
            >
              {disableMFAMutation.isPending ? 'Disabling...' : 'Confirm Disable'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}