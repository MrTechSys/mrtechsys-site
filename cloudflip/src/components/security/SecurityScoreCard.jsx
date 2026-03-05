import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SecurityScoreCard({ mfaEnabled, recentAttempts, trustedDevicesCount, hasRecoveryEmail }) {
  // Calculate security score
  let score = 0;
  const factors = [];

  if (mfaEnabled) {
    score += 50;
    factors.push({ label: "MFA Enabled", points: 50, status: "good" });
  } else {
    factors.push({ label: "MFA Disabled", points: 0, status: "bad" });
  }

  if (hasRecoveryEmail) {
    score += 15;
    factors.push({ label: "Recovery Email Set", points: 15, status: "good" });
  } else {
    factors.push({ label: "No Recovery Email", points: 0, status: "warning" });
  }

  if (trustedDevicesCount > 0) {
    score += 10;
    factors.push({ label: `${trustedDevicesCount} Trusted Device(s)`, points: 10, status: "good" });
  }

  // Success rate from recent attempts
  const failedCount = recentAttempts.filter(a => !a.success).length;
  const totalAttempts = recentAttempts.length;
  const successRate = totalAttempts > 0 ? ((totalAttempts - failedCount) / totalAttempts) : 1;

  if (successRate >= 0.9) {
    score += 15;
    factors.push({ label: "High Success Rate", points: 15, status: "good" });
  } else if (successRate >= 0.7) {
    score += 10;
    factors.push({ label: "Moderate Success Rate", points: 10, status: "warning" });
  } else if (totalAttempts > 0) {
    score += 0;
    factors.push({ label: "Low Success Rate", points: 0, status: "bad" });
  }

  if (failedCount === 0 && totalAttempts > 0) {
    score += 10;
    factors.push({ label: "No Failed Attempts", points: 10, status: "good" });
  } else if (failedCount > 5) {
    factors.push({ label: `${failedCount} Failed Attempts`, points: 0, status: "bad" });
  }

  const scoreColor = score >= 80 ? "text-green-400" : score >= 60 ? "text-yellow-400" : "text-red-400";
  const scoreLabel = score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Poor";
  const scoreBg = score >= 80 ? "from-green-500/20 to-emerald-500/20 border-green-500/30" : 
                  score >= 60 ? "from-yellow-500/20 to-orange-500/20 border-yellow-500/30" : 
                  "from-red-500/20 to-pink-500/20 border-red-500/30";

  return (
    <Card className={`bg-gradient-to-br ${scoreBg}`}>
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            Security Score
          </span>
          <Badge className={`${scoreColor.replace('text-', 'bg-')}/20 ${scoreColor}`}>
            {scoreLabel}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Display */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 1 }}
            className="relative inline-block"
          >
            <svg className="w-40 h-40 transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="12"
                fill="none"
              />
              <motion.circle
                cx="80"
                cy="80"
                r="70"
                stroke="url(#scoreGradient)"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDasharray: "439.6 439.6", strokeDashoffset: 439.6 }}
                animate={{ strokeDashoffset: 439.6 - (439.6 * score) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444"} />
                  <stop offset="100%" stopColor={score >= 80 ? "#059669" : score >= 60 ? "#d97706" : "#dc2626"} />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className={`text-5xl font-bold ${scoreColor}`}>{score}</p>
                <p className="text-white/60 text-xs">/ 100</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs text-white/60 mb-1">
            <span>Security Level</span>
            <span>{score}%</span>
          </div>
          <Progress value={score} className="h-2" />
        </div>

        {/* Score Factors */}
        <div className="space-y-2">
          <p className="text-xs text-white/60 uppercase tracking-wide font-medium">Score Breakdown:</p>
          {factors.map((factor, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {factor.status === "good" && <CheckCircle className="w-3 h-3 text-green-400" />}
                {factor.status === "warning" && <AlertTriangle className="w-3 h-3 text-yellow-400" />}
                {factor.status === "bad" && <XCircle className="w-3 h-3 text-red-400" />}
                <span className="text-white/80">{factor.label}</span>
              </div>
              <span className={`font-medium ${
                factor.status === "good" ? "text-green-400" : 
                factor.status === "warning" ? "text-yellow-400" : "text-red-400"
              }`}>
                +{factor.points}
              </span>
            </div>
          ))}
        </div>

        {score < 80 && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-amber-400 text-xs font-medium mb-1">💡 Improve Your Score:</p>
            <ul className="text-white/70 text-xs space-y-1">
              {!mfaEnabled && <li>• Enable MFA for +50 points</li>}
              {!hasRecoveryEmail && <li>• Add recovery email for +15 points</li>}
              {trustedDevicesCount === 0 && <li>• Register a trusted device for +10 points</li>}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}