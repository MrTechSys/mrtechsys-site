import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code, AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";

export default function MFADiagnosticsPanel({ recentAttempts = [] }) {
  const [expanded, setExpanded] = useState(false);

  const failedAttempts = recentAttempts.filter(a => !a.success);
  const lastFailed = failedAttempts[0];

  if (!lastFailed) {
    return (
      <Card className="bg-[#0a1929]/60 backdrop-blur border-green-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            MFA Diagnostics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-400 text-sm">
            ✅ No recent failed attempts detected. MFA system is operating normally.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-amber-400" />
            MFA Diagnostics (Developer)
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setExpanded(!expanded)}
            className="text-amber-400"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-start gap-2">
            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-400 font-medium text-sm mb-1">
                Last Failed Attempt
              </p>
              <p className="text-white/70 text-xs">
                {lastFailed.created_date && format(new Date(lastFailed.created_date), 'MMM d, yyyy h:mm:ss a')}
              </p>
            </div>
            <Badge className="bg-red-500/20 text-red-400">
              {lastFailed.attempt_type}
            </Badge>
          </div>
        </div>

        {expanded && (
          <>
            {lastFailed.backend_error && (
              <div>
                <Label className="text-white/80 text-xs font-medium mb-1 block">
                  Backend Error Message:
                </Label>
                <div className="bg-black/40 rounded-lg p-3 border border-red-500/20">
                  <code className="text-red-400 text-xs font-mono break-all">
                    {lastFailed.backend_error}
                  </code>
                </div>
              </div>
            )}

            {lastFailed.payload_validation && (
              <div>
                <Label className="text-white/80 text-xs font-medium mb-1 block">
                  Payload Validation:
                </Label>
                <div className="bg-black/40 rounded-lg p-3 border border-amber-500/20">
                  <pre className="text-amber-400 text-xs font-mono overflow-x-auto">
                    {JSON.stringify(lastFailed.payload_validation, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            <div>
              <Label className="text-white/80 text-xs font-medium mb-1 block">
                Request Details:
              </Label>
              <div className="bg-black/40 rounded-lg p-3 border border-amber-500/20 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/60">IP Address:</span>
                  <span className="text-white font-mono">{lastFailed.ip_address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">User Agent:</span>
                  <span className="text-white/80 text-right ml-2 break-all">{lastFailed.user_agent}</span>
                </div>
                {lastFailed.geolocation?.city && (
                  <div className="flex justify-between">
                    <span className="text-white/60">Location:</span>
                    <span className="text-white">{lastFailed.geolocation.city}, {lastFailed.geolocation.country}</span>
                  </div>
                )}
                {lastFailed.risk_score && (
                  <div className="flex justify-between">
                    <span className="text-white/60">Risk Score:</span>
                    <Badge className={
                      lastFailed.risk_score > 70 
                        ? "bg-red-500/20 text-red-400"
                        : lastFailed.risk_score > 40
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-green-500/20 text-green-400"
                    }>
                      {lastFailed.risk_score}/100
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {failedAttempts.length > 1 && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-yellow-400 text-xs">
                    <strong>Warning:</strong> {failedAttempts.length} failed attempts detected in recent history.
                    {failedAttempts.filter(a => a.ip_address === lastFailed.ip_address).length > 1 && (
                      <span className="block mt-1">
                        Multiple failures from IP: {lastFailed.ip_address}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Label({ children, className, ...props }) {
  return (
    <label className={`text-sm font-medium ${className}`} {...props}>
      {children}
    </label>
  );
}