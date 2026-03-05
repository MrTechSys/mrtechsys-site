import React, { useState } from "react";
import { api } from "@/api/apiClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Sparkles, Send, Loader2, RefreshCw, Smile, Frown, Meh, CheckCircle, Mail, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function EmailComposer({ open, onClose, relatedType, relatedId, recipientEmail, recipientName }) {
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [purpose, setPurpose] = useState("follow-up");
  const [tone, setTone] = useState("professional");
  const [sentimentScore, setSentimentScore] = useState(null);
  const [draftId, setDraftId] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const generateEmail = async () => {
    setLoading(true);
    try {
      const response = await api.functions.invoke('generateAIEmail', {
        relatedType,
        relatedId,
        purpose,
        tone
      });

      if (response.data.success) {
        setSubject(response.data.email.subject);
        setBody(response.data.email.body);
        setSentimentScore(response.data.email.sentiment_score);
        setDraftId(response.data.draft.id);
        toast.success(response.data.fallback ? "Email template created" : "AI email generated!");
      } else {
        toast.error("Failed to generate email");
      }
    } catch (error) {
      console.error('Failed to generate email:', error);
      toast.error("Failed to generate email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = async () => {
    if (!subject || !body || !recipientEmail) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // First, send the actual email
      const emailResult = await api.integrations.Core.SendEmail({
        to: recipientEmail,
        subject,
        body
      });

      console.log('Email sent result:', emailResult);

      // Only update the draft status if email was actually sent
      const user = await api.auth.me();
      
      if (draftId) {
        // Update existing draft to sent status
        await api.entities.EmailDraft.update(draftId, {
          status: 'sent',
          sent_at: new Date().toISOString(),
          sent_by: user.id
        });
      } else {
        // Create new draft record marked as sent
        await api.entities.EmailDraft.create({
          org_id: user.current_org_id,
          related_type: relatedType,
          related_id: relatedId,
          recipient_email: recipientEmail,
          recipient_name: recipientName,
          subject,
          body,
          ai_generated: false,
          status: 'sent',
          sent_at: new Date().toISOString(),
          sent_by: user.id,
          sentiment_score: sentimentScore || 0
        });
      }

      // Show confirmation
      setShowConfirmation(true);
      toast.success("Email sent successfully!");
      
    } catch (error) {
      console.error('Failed to send email:', error);
      
      // Mark as failed if we have a draft
      if (draftId) {
        try {
          const user = await api.auth.me();
          await api.entities.EmailDraft.update(draftId, {
            status: 'failed'
          });
        } catch (updateError) {
          console.error('Failed to update draft status:', updateError);
        }
      }
      
      toast.error("Failed to send email: " + (error.message || "Please try again"));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowConfirmation(false);
    setSubject("");
    setBody("");
    setSentimentScore(null);
    setDraftId(null);
    onClose();
  };

  const getSentimentIcon = () => {
    if (sentimentScore === null) return null;
    if (sentimentScore > 0.3) return <Smile className="w-4 h-4 text-green-500" />;
    if (sentimentScore < -0.3) return <Frown className="w-4 h-4 text-red-500" />;
    return <Meh className="w-4 h-4 text-yellow-500" />;
  };

  const getSentimentColor = () => {
    if (sentimentScore === null) return "bg-gray-100 text-gray-800";
    if (sentimentScore > 0.3) return "bg-green-100 text-green-800";
    if (sentimentScore < -0.3) return "bg-red-100 text-red-800";
    return "bg-yellow-100 text-yellow-800";
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-[#0a1929] border-amber-500/30 max-w-3xl max-h-[90vh] overflow-y-auto">
        <AnimatePresence mode="wait">
          {!showConfirmation ? (
            <motion.div
              key="composer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  AI Email Assistant
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* AI Generation Controls */}
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white text-sm">Email Purpose</Label>
                      <Select value={purpose} onValueChange={setPurpose}>
                        <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="follow-up">Follow-up</SelectItem>
                          <SelectItem value="introduction">Introduction</SelectItem>
                          <SelectItem value="update">Status Update</SelectItem>
                          <SelectItem value="reminder">Reminder</SelectItem>
                          <SelectItem value="thank-you">Thank You</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white text-sm">Tone</Label>
                      <Select value={tone} onValueChange={setTone}>
                        <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="formal">Formal</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    onClick={generateEmail}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                </div>

                {/* Recipient */}
                <div>
                  <Label className="text-white">To</Label>
                  <Input
                    value={`${recipientName} <${recipientEmail}>`}
                    disabled
                    className="bg-white/5 border-amber-500/30 text-white"
                  />
                </div>

                {/* Subject */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-white">Subject *</Label>
                    {sentimentScore !== null && (
                      <Badge className={`${getSentimentColor()} flex items-center gap-1`}>
                        {getSentimentIcon()}
                        Sentiment: {(sentimentScore * 100).toFixed(0)}%
                      </Badge>
                    )}
                  </div>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Email subject..."
                    className="bg-white/5 border-amber-500/30 text-white"
                    required
                  />
                </div>

                {/* Body */}
                <div>
                  <Label className="text-white">Message *</Label>
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={12}
                    placeholder="Email content..."
                    className="bg-white/5 border-amber-500/30 text-white font-mono text-sm"
                    required
                  />
                </div>

                {/* Quick Actions */}
                {subject && body && (
                  <div className="flex gap-2">
                    <Button
                      onClick={generateEmail}
                      disabled={loading}
                      variant="outline"
                      className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate
                    </Button>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                  className="border-amber-500/30 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={sendEmail}
                  disabled={loading || !subject.trim() || !body.trim()}
                  className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Email
                    </>
                  )}
                </Button>
              </DialogFooter>
            </motion.div>
          ) : (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-10 h-10 text-white" />
              </motion.div>
              
              <h3 className="text-2xl font-bold text-white mb-2">Email Sent Successfully!</h3>
              <p className="text-white/70 mb-6">
                Your email to <span className="text-amber-400">{recipientName}</span> has been delivered
              </p>

              <Card className="p-4 bg-white/5 border border-amber-500/20 text-left mb-6">
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-white/50">Subject</p>
                    <p className="text-white font-medium">{subject}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Recipient</p>
                    <p className="text-white/80">{recipientEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Sent at</p>
                    <p className="text-white/80">{new Date().toLocaleString()}</p>
                  </div>
                </div>
              </Card>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={handleClose}
                  className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
                >
                  Done
                </Button>
                <Button
                  onClick={() => {
                    setShowConfirmation(false);
                    setSubject("");
                    setBody("");
                    setSentimentScore(null);
                    setDraftId(null);
                  }}
                  variant="outline"
                  className="border-amber-500/30 text-white hover:bg-white/10"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Another
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}