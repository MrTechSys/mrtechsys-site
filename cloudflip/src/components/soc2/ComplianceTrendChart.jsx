import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import { format } from "date-fns";

export default function ComplianceTrendChart({ metrics }) {
  const chartData = [...metrics]
    .reverse()
    .slice(0, 30)
    .map(m => ({
      date: format(new Date(m.timestamp), 'MMM d'),
      score: m.value,
      status: m.status
    }));

  return (
    <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          30-Day Compliance Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis 
                dataKey="date" 
                stroke="#fff" 
                tick={{ fontSize: 11 }} 
              />
              <YAxis 
                stroke="#fff" 
                tick={{ fontSize: 11 }} 
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#0a1929', 
                  border: '1px solid #06b6d4',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#fff' }}
              />
              
              {/* Target Lines */}
              <ReferenceLine 
                y={90} 
                stroke="#10b981" 
                strokeDasharray="3 3" 
                label={{ value: 'Excellent (90)', fill: '#10b981', fontSize: 10 }}
              />
              <ReferenceLine 
                y={75} 
                stroke="#06b6d4" 
                strokeDasharray="3 3" 
                label={{ value: 'Good (75)', fill: '#06b6d4', fontSize: 10 }}
              />
              <ReferenceLine 
                y={60} 
                stroke="#f59e0b" 
                strokeDasharray="3 3" 
                label={{ value: 'Needs Work (60)', fill: '#f59e0b', fontSize: 10 }}
              />

              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#06b6d4" 
                strokeWidth={3}
                dot={{ fill: '#06b6d4', r: 4 }}
                activeDot={{ r: 6 }}
                name="Compliance Score"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12">
            <p className="text-white/60">No trend data available yet</p>
            <p className="text-white/40 text-sm mt-1">Run control tests to start tracking</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}