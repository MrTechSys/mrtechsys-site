import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Sparkles,
  TrendingUp,
  Eye,
  Smile,
  Frown,
  Meh
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  scheduled: "bg-purple-100 text-purple-800",
  failed: "bg-red-100 text-red-800"
};

export default function EmailCenter() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const queryClient = useQueryClient();

  const { data: emails = [], isLoading } = useQuery({
    queryKey: ['email-drafts'],
    queryFn: () => api.entities.EmailDraft.list('-created_date', 100)
  });

  const { data: aiSuggestions = [] } = useQuery({
    queryKey: ['email-ai-suggestions'],
    queryFn: async () => {
      const sentEmails = emails.filter(e => e.status === 'sent');
      if (sentEmails.length === 0) return [];

      // Calculate email performance metrics
      const avgSentiment = sentEmails.reduce((sum, e) => sum + (e.sentiment_score || 0), 0) / sentEmails.length;
      const totalSent = sentEmails.length;

      return [
        {
          type: 'performance',
          title: 'Email Sentiment Analysis',
          message: `Your emails have an average sentiment score of ${(avgSentiment * 100).toFixed(0)}%. ${
            avgSentiment > 0.5 ? 'Great job maintaining positive tone!' :
            avgSentiment > 0 ? 'Consider adding more positive language.' :
            'Your emails may be too negative. Try a friendlier approach.'
          }`
        },
        {
          type: 'tip',
          title: 'Best Time to Send',
          message: 'Based on your industry, emails sent Tuesday-Thursday at 10 AM have the highest open rates.'
        },
        {
          type: 'automation',
          title: 'Automation Opportunity',
          message: `You've sent ${totalSent} similar follow-up emails. Consider creating a nurture workflow to automate this.`
        }
      ];
    },
    enabled: emails.length > 0
  });

  const filteredEmails = emails.filter(email => {
    const matchesSearch = 
      email.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.recipient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.recipient_email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || email.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getSentimentIcon = (score) => {
    if (score === null || score === undefined) return <Meh className="w-4 h-4 text-gray-400" />;
    if (score > 0.3) return <Smile className="w-4 h-4 text-green-500" />;
    if (score < -0.3) return <Frown className="w-4 h-4 text-red-500" />;
    return <Meh className="w-4 h-4 text-yellow-500" />;
  };

  const handlePreview = (email) => {
    setSelectedEmail(email);
    setShowPreview(true);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Email <span className="text-amber-400">Center</span></h1>
        <p className="text-white/70 mt-1 text-sm md:text-base">Track all your <span className="text-amber-400">email communications</span></p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Send className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-sm text-white/60">Total Sent</div>
              <div className="text-2xl font-bold text-white">
                {emails.filter(e => e.status === 'sent').length}
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <div className="text-sm text-white/60">Drafts</div>
              <div className="text-2xl font-bold text-white">
                {emails.filter(e => e.status === 'draft').length}
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Smile className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-sm text-white/60">Avg Sentiment</div>
              <div className="text-2xl font-bold text-green-400">
                {emails.length > 0 ? (
                  ((emails.reduce((sum, e) => sum + (e.sentiment_score || 0), 0) / emails.length) * 100).toFixed(0) + '%'
                ) : '0%'}
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-sm text-white/60">AI Generated</div>
              <div className="text-2xl font-bold text-purple-400">
                {emails.filter(e => e.ai_generated).length}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <div className="grid md:grid-cols-3 gap-4">
          {aiSuggestions.map((suggestion, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm mb-1">{suggestion.title}</h4>
                    <p className="text-white/70 text-xs">{suggestion.message}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Filters */}
      <Card className="p-4 bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
            <Input
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-amber-500/30 text-white placeholder:text-white/40"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48 bg-white/5 border-amber-500/30 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Emails Table */}
      <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
        <Table>
          <TableHeader>
            <TableRow className="border-amber-500/20 hover:bg-transparent">
              <TableHead className="text-white/80">Subject</TableHead>
              <TableHead className="text-white/80">Recipient</TableHead>
              <TableHead className="text-white/80">Related To</TableHead>
              <TableHead className="text-white/80">Status</TableHead>
              <TableHead className="text-white/80">Sentiment</TableHead>
              <TableHead className="text-white/80">Date</TableHead>
              <TableHead className="text-white/80">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="border-amber-500/20">
                <TableCell colSpan={7} className="text-center py-8 text-white/60">
                  Loading emails...
                </TableCell>
              </TableRow>
            ) : filteredEmails.length === 0 ? (
              <TableRow className="border-amber-500/20">
                <TableCell colSpan={7} className="text-center py-8">
                  <Mail className="w-12 h-12 text-amber-400/50 mx-auto mb-3" />
                  <p className="text-white font-medium">No emails found</p>
                  <p className="text-white/60 text-sm">Your sent and drafted emails will appear here</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredEmails.map((email) => (
                <TableRow 
                  key={email.id} 
                  className="hover:bg-white/5 border-amber-500/20 cursor-pointer"
                  onClick={() => handlePreview(email)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {email.ai_generated && (
                        <Sparkles className="w-3 h-3 text-amber-400 flex-shrink-0" />
                      )}
                      <span className="text-white font-medium line-clamp-1">
                        {email.subject}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-white/80">{email.recipient_name}</div>
                    <div className="text-xs text-white/50">{email.recipient_email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-amber-500/30 text-amber-400 capitalize">
                      {email.related_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[email.status]}>
                      {email.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getSentimentIcon(email.sentiment_score)}
                  </TableCell>
                  <TableCell className="text-sm text-white/60">
                    {email.sent_at 
                      ? format(new Date(email.sent_at), 'MMM d, h:mm a')
                      : format(new Date(email.created_date), 'MMM d, h:mm a')
                    }
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview(email);
                      }}
                      className="text-white/70 hover:text-white hover:bg-white/10"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Email Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="bg-[#0a1929] border-amber-500/30 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Email Preview</DialogTitle>
          </DialogHeader>
          {selectedEmail && (
            <div className="space-y-4">
              {/* Email Metadata */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-white/5 rounded-lg border border-amber-500/20">
                <div>
                  <p className="text-xs text-white/50">Status</p>
                  <Badge className={`${statusColors[selectedEmail.status]} mt-1`}>
                    {selectedEmail.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-white/50">Sentiment</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getSentimentIcon(selectedEmail.sentiment_score)}
                    <span className="text-white text-sm">
                      {selectedEmail.sentiment_score 
                        ? `${(selectedEmail.sentiment_score * 100).toFixed(0)}%`
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>
                {selectedEmail.ai_generated && (
                  <div>
                    <p className="text-xs text-white/50">Generation</p>
                    <Badge className="bg-purple-100 text-purple-800 mt-1 flex items-center gap-1 w-fit">
                      <Sparkles className="w-3 h-3" />
                      AI Generated
                    </Badge>
                  </div>
                )}
                <div>
                  <p className="text-xs text-white/50">
                    {selectedEmail.sent_at ? 'Sent' : 'Created'}
                  </p>
                  <p className="text-white text-sm mt-1">
                    {format(
                      new Date(selectedEmail.sent_at || selectedEmail.created_date), 
                      'MMM d, yyyy h:mm a'
                    )}
                  </p>
                </div>
              </div>

              {/* Email Content */}
              <div className="space-y-3">
                <div>
                  <Label className="text-white/60 text-xs">To</Label>
                  <p className="text-white mt-1">
                    {selectedEmail.recipient_name} &lt;{selectedEmail.recipient_email}&gt;
                  </p>
                </div>
                <div>
                  <Label className="text-white/60 text-xs">Subject</Label>
                  <p className="text-white font-medium mt-1">{selectedEmail.subject}</p>
                </div>
                <div>
                  <Label className="text-white/60 text-xs">Message</Label>
                  <div className="mt-2 p-4 bg-white/5 rounded-lg border border-amber-500/20">
                    <p className="text-white/80 whitespace-pre-wrap text-sm">
                      {selectedEmail.body}
                    </p>
                  </div>
                </div>
              </div>

              {/* Generation Context (if AI generated) */}
              {selectedEmail.ai_generated && selectedEmail.generation_context && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <h4 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    AI Generation Context
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {selectedEmail.generation_context.purpose && (
                      <div>
                        <span className="text-white/50">Purpose:</span>
                        <span className="text-amber-400 ml-2 capitalize">
                          {selectedEmail.generation_context.purpose}
                        </span>
                      </div>
                    )}
                    {selectedEmail.generation_context.tone && (
                      <div>
                        <span className="text-white/50">Tone:</span>
                        <span className="text-amber-400 ml-2 capitalize">
                          {selectedEmail.generation_context.tone}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Label({ className, children, ...props }) {
  return (
    <label className={`text-sm font-medium ${className}`} {...props}>
      {children}
    </label>
  );
}