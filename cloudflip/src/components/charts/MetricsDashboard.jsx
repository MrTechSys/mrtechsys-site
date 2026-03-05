import React, { useState } from "react";
import DrilldownChart from "./DrilldownChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Zap } from "lucide-react";

export default function MetricsDashboard({
  title,
  metrics,
  timeRange = "7d",
  allowComparison = true,
  industry
}) {
  const [selectedMetric, setSelectedMetric] = useState(metrics[0]?.key);

  const currentMetric = metrics.find(m => m.key === selectedMetric);

  const handleDrilldown = (dataPoint) => {
    if (currentMetric?.getDrilldownData) {
      return currentMetric.getDrilldownData(dataPoint);
    }
    return null;
  };

  return (
    <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">{title}</CardTitle>
          <div className="flex items-center gap-2">
            {metrics.map((metric) => {
              const isSelected = metric.key === selectedMetric;
              const trend = metric.trend || 0;
              const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Zap;
              
              return (
                <button
                  key={metric.key}
                  onClick={() => setSelectedMetric(metric.key)}
                  className={`px-3 py-1.5 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium">{metric.label}</span>
                    {metric.trend !== undefined && (
                      <TrendIcon className={`w-3 h-3 ${
                        trend > 0 ? 'text-green-400' :
                        trend < 0 ? 'text-red-400' :
                        'text-amber-400'
                      }`} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {currentMetric && (
          <DrilldownChart
            title={currentMetric.label}
            data={currentMetric.data}
            type={currentMetric.chartType || "line"}
            dataKey={currentMetric.dataKey || "value"}
            xAxisKey={currentMetric.xAxisKey || "name"}
            benchmarkData={allowComparison ? currentMetric.benchmarkData : null}
            historicalData={currentMetric.historicalData}
            onDrilldown={handleDrilldown}
          />
        )}
      </CardContent>
    </Card>
  );
}