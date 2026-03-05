import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, TrendingUp, Target, Sparkles } from "lucide-react";
import AIDataAnalyzer from "../components/analytics/AIDataAnalyzer";
import TrendPredictor from "../components/analytics/TrendPredictor";
import CrossModuleInsights from "../components/analytics/CrossModuleInsights";

export default function AIAnalytics() {
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-purple-400" />
          AI-Powered <span className="text-amber-400">Analytics</span>
        </h1>
        <p className="text-white/70 mt-1">Deep insights, trend predictions, and actionable recommendations</p>
      </div>

      <Tabs defaultValue="analyzer" className="space-y-6">
        <TabsList className="bg-white/5 border border-amber-500/20">
          <TabsTrigger value="analyzer" className="data-[state=active]:bg-amber-500/20">
            <BarChart className="w-4 h-4 mr-2" />
            Data Analysis
          </TabsTrigger>
          <TabsTrigger value="predictions" className="data-[state=active]:bg-amber-500/20">
            <TrendingUp className="w-4 h-4 mr-2" />
            Trend Predictions
          </TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-amber-500/20">
            <Target className="w-4 h-4 mr-2" />
            Cross-Module Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analyzer" className="space-y-6">
          <div className="grid gap-6">
            <AIDataAnalyzer defaultModule="sales" />
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <TrendPredictor defaultEntity="leads" />
            <TrendPredictor defaultEntity="revenue" />
          </div>
          <TrendPredictor defaultEntity="quotes" />
        </TabsContent>

        <TabsContent value="insights">
          <CrossModuleInsights />
        </TabsContent>
      </Tabs>
    </div>
  );
}