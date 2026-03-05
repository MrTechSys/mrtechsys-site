
import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Shield,
  Database,
  Trash2,
  Download,
  Eye,
  Lock,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import CopyrightFooter from "../components/CopyrightFooter";
import { Link } from "react-router-dom"; // Added Link import

export default function DataPrivacy() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteType, setDeleteType] = useState(null);
  const queryClient = useQueryClient();

  // Helper function to generate legal page URLs
  const createPageUrl = (pageName) => {
    switch (pageName) {
      case "DataPrivacy":
        return "/privacy-policy"; // Example route for Privacy Policy
      case "TermsOfService":
        return "/terms-of-service"; // Example route for Terms of Service
      default:
        return "#"; // Fallback for unknown page names
    }
  };

  const { data: connectedAccounts = [] } = useQuery({
    queryKey: ['connected-accounts'],
    queryFn: () => api.entities.ConnectedAccount.list(),
  });

  const { data: leads = [] } = useQuery({
    queryKey: ['social-leads'],
    queryFn: () => api.entities.Lead.filter({
      source: { $in: ['facebook', 'nextdoor', 'instagram', 'tiktok'] }
    }),
  });

  const deleteLeadsMutation = useMutation({
    mutationFn: async () => {
      const deletePromises = leads.map(lead =>
        api.entities.Lead.delete(lead.id)
      );
      return Promise.all(deletePromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-leads'] });
      toast.success("All social media leads deleted successfully");
      setShowDeleteDialog(false);
    },
    onError: () => {
      toast.error("Failed to delete leads");
    }
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (accountId) => {
      return api.entities.ConnectedAccount.delete(accountId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connected-accounts'] });
      toast.success("Connected account deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete account");
    }
  });

  const handleDeleteAll = () => {
    setDeleteType('all');
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (deleteType === 'all') {
      deleteLeadsMutation.mutate();
    }
  };

  const exportData = async () => {
    toast.info("Preparing your data export...");
    try {
      const { data } = await api.functions.invoke('exportSocialData');
      toast.success("Data export ready for download");
      // Trigger download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cloudflip-social-data-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      toast.error("Failed to export data");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1929] to-[#1a2942] p-4 md:p-6 lg:p-8 space-y-8 max-w-full overflow-x-hidden">
      <div className="max-w-5xl mx-auto space-y-8 w-full">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl md:text-4xl font-bold text-white flex flex-col sm:flex-row items-center justify-center gap-3">
            <Shield className="w-8 h-8 md:w-10 md:h-10 text-amber-500" />
            <span>Data <span className="text-amber-400">Privacy</span> & <span className="text-amber-400">Control</span></span>
          </h1>
          <p className="text-white/80 mt-3 text-sm md:text-lg max-w-3xl mx-auto px-4">
            Your data, your <span className="text-amber-400">control</span>. Understand how we use <span className="text-amber-400">social media</span> data and manage your <span className="text-amber-400">information</span>.
          </p>
        </div>

        {/* How We Use Social Media Data */}
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-amber-500" />
              How We Use Your <span className="text-amber-400">Social Media Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-white/80">
            <div className="space-y-3">
              <h3 className="font-semibold text-white">What <span className="text-amber-400">Data</span> We Collect:</h3>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                  <span><span className="text-amber-400">Public posts</span> and <span className="text-amber-400">comments</span> from platforms you authorize (Facebook, Nextdoor, Instagram, TikTok)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                  <span><span className="text-amber-400">Contact information</span> (name, email, phone) when provided in posts or lead forms</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                  <span><span className="text-amber-400">Location data</span> (city, state) for local lead matching</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                  <span><span className="text-amber-400">Post content</span> and metadata (timestamps, engagement metrics)</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3 pt-4 border-t border-amber-500/20">
              <h3 className="font-semibold text-white">How We Use This <span className="text-amber-400">Data</span>:</h3>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
                  <span><span className="font-semibold text-white">Lead Generation:</span> Identify potential <span className="text-amber-400">customers</span> seeking services in your area</span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
                  <span><span className="font-semibold text-white">AI Scoring:</span> Analyze post <span className="text-amber-400">content</span> to score lead quality and urgency</span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
                  <span><span className="font-semibold text-white">Suggested Responses:</span> Generate personalized <span className="text-amber-400">outreach messages</span></span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
                  <span><span className="font-semibold text-white">Lead Management:</span> Store <span className="text-amber-400">leads</span> in your CRM for follow-up</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3 pt-4 border-t border-amber-500/20">
              <h3 className="font-semibold text-white">What We <span className="text-amber-400">DON'T</span> Do:</h3>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <Lock className="w-4 h-4 text-red-400 mt-1 flex-shrink-0" />
                  <span>We <span className="font-semibold text-white">never</span> share your data with third parties</span>
                </li>
                <li className="flex items-start gap-2">
                  <Lock className="w-4 h-4 text-red-400 mt-1 flex-shrink-0" />
                  <span>We <span className="font-semibold text-white">never</span> post on your behalf without explicit permission</span>
                </li>
                <li className="flex items-start gap-2">
                  <Lock className="w-4 h-4 text-red-400 mt-1 flex-shrink-0" />
                  <span>We <span className="font-semibold text-white">never</span> access private messages or non-public data</span>
                </li>
                <li className="flex items-start gap-2">
                  <Lock className="w-4 h-4 text-red-400 mt-1 flex-shrink-0" />
                  <span>We <span className="font-semibold text-white">never</span> sell or monetize your social media connections</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">Consent & Authorization</h4>
                  <p className="text-sm text-white/70 mt-1">
                    All <span className="text-amber-400">data collection</span> occurs only after you explicitly authorize CloudFlip through official <span className="text-amber-400">OAuth</span> flows.
                    You can revoke access at any time by disconnecting your <span className="text-amber-400">accounts</span> below.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Data Summary */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-white text-base">Connected <span className="text-amber-400">Accounts</span></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-400">{connectedAccounts.length}</div>
              <p className="text-sm text-white/60 mt-1">Active platform connections</p>
            </CardContent>
          </Card>

          <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-white text-base">Social <span className="text-amber-400">Leads</span></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-400">{leads.length}</div>
              <p className="text-sm text-white/60 mt-1">Leads from social platforms</p>
            </CardContent>
          </Card>

          <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-white text-base">Data <span className="text-amber-400">Storage</span></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-400">
                {(leads.length * 0.005).toFixed(2)} MB
              </div>
              <p className="text-sm text-white/60 mt-1">Estimated storage used</p>
            </CardContent>
          </Card>
        </div>

        {/* Connected Accounts Management */}
        {connectedAccounts.length > 0 && (
          <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-white">Connected <span className="text-amber-400">Accounts</span></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {connectedAccounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-amber-500/20">
                    <div>
                      <p className="font-medium text-white capitalize">{account.platform}</p>
                      <p className="text-sm text-white/60">{account.platform_username || 'Connected'}</p>
                      <p className="text-xs text-white/40 mt-1">
                        Last synced: {account.last_synced ? format(new Date(account.last_synced), 'MMM d, yyyy h:mm a') : 'Never'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {account.status === 'active' ? (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
                      ) : (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">{account.status}</Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAccountMutation.mutate(account.id)}
                        className="text-red-400 hover:text-white hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Management Actions */}
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-amber-500" />
              Data <span className="text-amber-400">Management</span> Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-amber-500/20">
              <Download className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-white">Export Your <span className="text-amber-400">Data</span></h4>
                <p className="text-sm text-white/70 mt-1">
                  Download all your <span className="text-amber-400">social media leads</span> and <span className="text-amber-400">connected account</span> information in JSON format.
                </p>
                <Button
                  onClick={exportData}
                  className="mt-3 w-full sm:w-auto bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-red-500/5 rounded-lg border border-red-500/20">
              <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h4 className="font-semibold text-white">Delete All Social <span className="text-amber-400">Leads</span></h4>
                <p className="text-sm text-white/70 mt-1">
                  Permanently delete all <span className="text-amber-400">leads</span> imported from <span className="text-amber-400">social media platforms</span>. This action cannot be undone.
                </p>
                <Button
                  onClick={handleDeleteAll}
                  variant="outline"
                  className="mt-3 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-white"
                  disabled={leads.length === 0}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete All Social Leads ({leads.length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal & Compliance */}
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white">Legal & <span className="text-amber-400">Compliance</span></CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-white/80">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span><span className="font-semibold text-white">GDPR Compliant:</span> Full data portability and right to deletion</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span><span className="font-semibold text-white">CCPA Compliant:</span> California Consumer Privacy Act adherence</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span><span className="font-semibold text-white">Platform ToS:</span> Compliant with Facebook, Instagram, TikTok, and Nextdoor terms</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span><span className="font-semibold text-white">Encryption:</span> All data encrypted at rest (AES-256) and in transit (TLS 1.3)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span><span className="font-semibold text-white">Audit Logs:</span> 7-year retention for compliance and security</span>
            </div>

            <div className="mt-6 pt-4 border-t border-amber-500/20">
              <p className="text-sm text-white/60">
                For more information, please review our{' '}
                <Link to={createPageUrl("DataPrivacy")} className="text-amber-400 hover:text-amber-300 underline">
                  Privacy Policy
                </Link>
                {' '}and{' '}
                <Link to={createPageUrl("TermsOfService")} className="text-amber-400 hover:text-amber-300 underline">
                  Terms of Service
                </Link>.
              </p>
              <p className="text-sm text-white/60 mt-2">
                Questions? Contact us at{' '}
                <a href="mailto:support@mrtechsys.com" className="text-amber-400 hover:text-amber-300 underline">
                  support@mrtechsys.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-[#0a1929] border-amber-500/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              This will permanently delete <span className="text-amber-400 font-semibold">{leads.length} social media leads</span> from your account.
              This action cannot be undone and you will need to re-import them if you change your mind.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 text-white border-amber-500/30">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Yes, Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CopyrightFooter />
    </div>
  );
}
