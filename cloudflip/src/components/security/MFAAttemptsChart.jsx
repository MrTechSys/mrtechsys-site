import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity } from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";

export default function MFAAttemptsChart({ attempts }) {
  // Group attempts by day for the last 30 days
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = startOfDay(subDays(new Date(), 29 - i));
    return {
      date,
      dateStr: format(date, 'MMM d'),
      success: 0,
      failed: 0,
      total: 0
    };
  });

  attempts.forEach(attempt => {
    const attemptDate = startOfDay(new Date(attempt.created_date));
    const dayData = last30Days.find(d => d.date.getTime() === attemptDate.getTime());
    
    if (dayData) {
      dayData.total++;
      if (attempt.success) {
        dayData.success++;
      } else {
        dayData.failed++;
      }
    }
  });

  return (
    <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          MFA Activity Trend (30 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={last30Days}>
            <defs>
              <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="failedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis 
              dataKey="dateStr" 
              stroke="#fff" 
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis stroke="#fff" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ 
                backgroundColor: '#0a1929', 
                border: '1px solid rgba(6, 182, 212, 0.3)',
                borderRadius: '8px'
              }}
              labelStyle={{ color: '#fff' }}
            />
            <Area 
              type="monotone" 
              dataKey="success" 
              stackId="1"
              stroke="#10b981" 
              fill="url(#successGradient)"
              name="Successful"
            />
            <Area 
              type="monotone" 
              dataKey="failed" 
              stackId="1"
              stroke="#ef4444" 
              fill="url(#failedGradient)"
              name="Failed"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}