import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sparkles,
  Brain,
  Zap,
  Target
} from "lucide-react";
import AIAdminAssistant from "../components/AIAdminAssistant";

export default function AIAdminHub() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1929] via-[#0d1f3c] to-[#0a1929] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-400" />
            AI Admin Assistant
          </h1>
          <p className="text-white/60">Your intelligent business assistant for quotes, reminders, and insights</p>
        </div>

        {/* Features Overview */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
            <CardContent className="p-6 text-center">
              <Sparkles className="w-10 h-10 text-blue-400 mx-auto mb-3" />
              <h3 className="text-white font-bold mb-2">Draft Quotes</h3>
              <p className="text-white/60 text-sm">
                "Draft a quote for a 3-room carpet cleaning"
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
            <CardContent className="p-6 text-center">
              <Zap className="w-10 h-10 text-purple-400 mx-auto mb-3" />
              <h3 className="text-white font-bold mb-2">Set Reminders</h3>
              <p className="text-white/60 text-sm">
                "Remind me to follow up with Maria next Thursday"
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
            <CardContent className="p-6 text-center">
              <Target className="w-10 h-10 text-green-400 mx-auto mb-3" />
              <h3 className="text-white font-bold mb-2">Business Insights</h3>
              <p className="text-white/60 text-sm">
                "Summarize this week's jobs and revenue"
              </p>
            </CardContent>
          </Card>
        </div>

        {/* AI Assistant */}
        <AIAdminAssistant />
      </div>
    </div>
  );
}