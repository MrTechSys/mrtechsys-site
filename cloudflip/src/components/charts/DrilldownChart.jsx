import React, { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";

export default function DrilldownChart({
  title,
  data,
  type = "line",
  dataKey,
  xAxisKey = "name",
  benchmarkData,
  historicalData,
  onDrilldown,
  allowExport = true
}) {
  const [viewMode, setViewMode] = useState("current"); // current, benchmark, historical
  const [drilldownLevel, setDrilldownLevel] = useState(0);
  const [drilldownData, setDrilldownData] = useState(null);

  const handleDrilldown = (item) => {
    if (onDrilldown && item) {
      const drilled = onDrilldown(item);
      if (drilled) {
        setDrilldownData(drilled);
        setDrilldownLevel(drilldownLevel + 1);
      }
    }
  };

  const handleBackToDrilldown = () => {
    setDrilldownLevel(drilldownLevel - 1);
    setDrilldownData(null);
  };

  const exportData = () => {
    const csvContent = [
      [xAxisKey, dataKey].join(','),
      ...currentData.map(row => [row[xAxisKey], row[dataKey]].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  const currentData = drilldownData || data;
  
  const displayData = viewMode === "benchmark" ? benchmarkData :
                      viewMode === "historical" ? historicalData :
                      currentData;

  // Calculate trend
  const trend = displayData && displayData.length > 1
    ? displayData[displayData.length - 1][dataKey] - displayData[0][dataKey]
    : 0;

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? "text-green-400" : trend < 0 ? "text-red-400" : "text-amber-400";

  const ChartComponent = type === "bar" ? BarChart : type === "area" ? AreaChart : LineChart;
  const DataComponent = type === "bar" ? Bar : type === "area" ? Area : Line;

  const colors = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444'];

  return (
    <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {drilldownLevel > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToDrilldown}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <CardTitle className="text-white">{title}</CardTitle>
            <TrendIcon className={`w-4 h-4 ${trendColor}`} />
          </div>
          <div className="flex items-center gap-2">
            {(benchmarkData || historicalData) && (
              <Select value={viewMode} onValueChange={setViewMode}>
                <SelectTrigger className="w-32 h-8 bg-white/5 border-amber-500/30 text-white text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current</SelectItem>
                  {benchmarkData && <SelectItem value="benchmark">vs Benchmark</SelectItem>}
                  {historicalData && <SelectItem value="historical">Historical</SelectItem>}
                </SelectContent>
              </Select>
            )}
            {allowExport && (
              <Button
                variant="outline"
                size="icon"
                onClick={exportData}
                className="h-8 w-8 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
              >
                <Download className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <ChartComponent
            data={displayData}
            onClick={(e) => e && e.activePayload && handleDrilldown(e.activePayload[0].payload)}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey={xAxisKey}
              stroke="#fff"
              style={{ fontSize: '12px', fill: '#fff' }}
            />
            <YAxis
              stroke="#fff"
              style={{ fontSize: '12px', fill: '#fff' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(10, 25, 41, 0.95)',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', color: '#fff' }}
            />
            {viewMode === "benchmark" && benchmarkData ? (
              <>
                <DataComponent
                  type="monotone"
                  dataKey={dataKey}
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  strokeWidth={2}
                  name="Your Data"
                />
                <DataComponent
                  type="monotone"
                  dataKey="benchmark"
                  stroke="#6b7280"
                  fill="#6b7280"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Industry Benchmark"
                />
              </>
            ) : (
              <DataComponent
                type="monotone"
                dataKey={dataKey}
                stroke="#f59e0b"
                fill={type === "area" ? "url(#colorGradient)" : "#f59e0b"}
                strokeWidth={2}
              >
                {type === "bar" && displayData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </DataComponent>
            )}
            {type === "area" && (
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
            )}
          </ChartComponent>
        </ResponsiveContainer>

        {viewMode === "benchmark" && benchmarkData && (
          <div className="mt-3 p-2 bg-white/5 rounded-lg border border-amber-500/20">
            <p className="text-xs text-white/70">
              <strong className="text-amber-400">Comparison:</strong> You're{' '}
              {trend > 0 ? (
                <span className="text-green-400">outperforming</span>
              ) : trend < 0 ? (
                <span className="text-red-400">below</span>
              ) : (
                <span className="text-amber-400">matching</span>
              )}{' '}
              industry averages by {Math.abs(trend).toFixed(1)}%
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}