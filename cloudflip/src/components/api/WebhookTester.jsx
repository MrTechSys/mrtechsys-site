import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Webhook,
  Send,
  Copy,
  Check,
  Loader2,
  Zap,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

export default function WebhookTester({ user }) {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [eventType, setEventType] = useState("lead.created");
  const [payload, setPayload] = useState(JSON.stringify({
    event: "lead.created",
    data: {
      id: "lead_123",
      name: "Test Lead",
      email: "test@example.com",
      status: "new"
    },
    timestamp: new Date().toISOString()
  }, null, 2));
  const [response, setResponse] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const testWebhookMutation = useMutation({
    mutationFn: async () => {
      try {
        const parsedPayload = JSON.parse(payload);
        
        const result = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CloudFlip-Event': eventType,
            'X-CloudFlip-Signature': 'test_signature_' + Date.now()
          },
          body: JSON.stringify(parsedPayload)
        });

        const responseData = await result.text();
        
        return {
          status: result.status,
          statusText: result.statusText,
          headers: Object.fromEntries(result.headers.entries()),
          body: responseData
        };
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data) => {
      setResponse(data);
      if (data.status >= 200 && data.status < 300) {
        toast.success(`Webhook delivered successfully! Status: ${data.status}`);
      } else {
        toast.warning(`Webhook responded with status: ${data.status}`);
      }
    },
    onError: (error) => {
      setResponse({
        status: 0,
        error: error.message
      });
      toast.error("Webhook test failed");
    }
  });

  const generateWebhookUrl = () => {
    if (!user?.current_org_id) {
      toast.error("Please select an organization first");
      return;
    }
    
    const generatedUrl = `https://api.cloudflip.com/webhooks/${user.current_org_id}/inbound`;
    setWebhookUrl(generatedUrl);
    toast.success("Webhook URL generated!");
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedUrl(true);
    toast.success("URL copied!");
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const eventTypes = [
    "lead.created",
    "lead.updated",
    "quote.accepted",
    "invoice.paid",
    "job.completed",
    "compliance.finding"
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Webhook className="w-5 h-5 text-amber-400" />
            Webhook Simulator & Debugger
          </CardTitle>
          <p className="text-white/60 text-sm">
            Test webhook integrations in real-time with payload simulation
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-white">Webhook URL</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://your-app.com/webhooks/cloudflip"
                className="bg-white/5 border-amber-500/30 text-white flex-1"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={generateWebhookUrl}
                className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
              >
                <Zap className="w-3 h-3 mr-1" />
                Generate
              </Button>
              {webhookUrl && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyUrl}
                  className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                >
                  {copiedUrl ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              )}
            </div>
          </div>

          <div>
            <Label className="text-white">Event Type</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {eventTypes.map((type) => (
                <Button
                  key={type}
                  size="sm"
                  variant="outline"
                  onClick={() => setEventType(type)}
                  className={`text-xs ${
                    eventType === type
                      ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                      : 'border-white/20 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-white">Webhook Payload (JSON)</Label>
            <Textarea
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              rows={12}
              className="bg-black/40 border-amber-500/30 text-white font-mono text-xs mt-2"
            />
          </div>

          <Button
            onClick={() => testWebhookMutation.mutate()}
            disabled={!webhookUrl || testWebhookMutation.isPending}
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600"
          >
            {testWebhookMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Test Webhook
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Webhook Response */}
      {response && (
        <Card className="bg-[#0a1929]/60 backdrop-blur border-green-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              Webhook Response
              <Badge className={response.status >= 200 && response.status < 300 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                {response.status || 'Error'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {response.error ? (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{response.error}</p>
                </div>
              ) : (
                <>
                  <div>
                    <Label className="text-white/60 text-xs">Response Body</Label>
                    <pre className="mt-2 bg-black/40 border border-green-500/20 rounded-lg p-4 text-green-400 text-xs overflow-x-auto">
                      {response.body || 'No response body'}
                    </pre>
                  </div>
                  
                  {response.headers && (
                    <details>
                      <summary className="text-cyan-400 text-sm cursor-pointer hover:text-cyan-300">
                        View Response Headers
                      </summary>
                      <pre className="mt-2 bg-black/40 border border-cyan-500/20 rounded-lg p-4 text-cyan-400 text-xs overflow-x-auto">
                        {JSON.stringify(response.headers, null, 2)}
                      </pre>
                    </details>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Webhook Setup Instructions */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-blue-400 font-semibold mb-2">Setting Up Webhooks</p>
              <ol className="space-y-1 text-white/70 text-sm list-decimal list-inside">
                <li>Create a webhook endpoint in your app that accepts POST requests</li>
                <li>Verify the X-CloudFlip-Signature header for security</li>
                <li>Parse the JSON payload and process the event</li>
                <li>Return a 200 status code to acknowledge receipt</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}