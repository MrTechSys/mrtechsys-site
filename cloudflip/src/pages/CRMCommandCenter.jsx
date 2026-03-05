
import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Target,
  DollarSign,
  TrendingUp,
  Mic,
  MicOff,
  Sparkles,
  Globe,
  Zap,
  Activity,
  Shield, // NEW: Added Shield icon
  AlertTriangle // NEW: Added AlertTriangle icon
} from 'lucide-react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  FunnelChart,
  Funnel,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  LabelList
} from 'recharts';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
// Assuming `Link` comes from a routing library like react-router-dom
// If not installed, this import will cause an error.
// For the purpose of providing a functional file, it's included.
import { Link } from 'react-router-dom'; 


const COLORS = ['#f4d35e', '#3cf7d4', '#3b82f6', '#10b981', '#ef4444', '#a855f7'];

function HolographicOrb() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="absolute w-64 h-64 rounded-full bg-gradient-to-br from-[#f4d35e]/30 to-[#3cf7d4]/30 blur-3xl animate-pulse" />
      <div className="absolute w-48 h-48 rounded-full border-4 border-[#f4d35e]/50 animate-spin" style={{ animationDuration: '20s' }} />
      <div className="absolute w-40 h-40 rounded-full border-4 border-[#3cf7d4]/50 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
      <div className="absolute w-32 h-32 rounded-full border-4 border-blue-500/50 animate-spin" style={{ animationDuration: '10s' }} />
      <div className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-[#f4d35e] to-[#3cf7d4] opacity-80 animate-pulse" />
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-[#f4d35e] rounded-full"
          style={{
            left: '50%',
            top: '50%',
          }}
          animate={{
            x: [0, Math.cos(i * 30 * Math.PI / 180) * 100],
            y: [0, Math.sin(i * 30 * Math.PI / 180) * 100],
            scale: [1, 1.5, 1],
            opacity: [0.8, 0.3, 0.8],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.25,
          }}
        />
      ))}
    </div>
  );
}

export default function CRMCommandCenter() {
  const [user, setUser] = useState(null);
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceQuery, setVoiceQuery] = useState('');
  const [aiNarrative, setAiNarrative] = useState(null);
  const [securityRisks, setSecurityRisks] = useState(null); // NEW: State for security risks

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => api.entities.Contact.list('-created_date', 200),
    enabled: !!user
  });

  const { data: deals = [] } = useQuery({
    queryKey: ['deals'],
    queryFn: () => api.entities.Deal.list('-created_date', 200),
    enabled: !!user
  });

  const { data: leads = [] } = useQuery({
    queryKey: ['leads'],
    queryFn: () => api.entities.Lead.list('-created_date', 200),
    enabled: !!user
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['crm-activities'],
    queryFn: () => api.entities.CRMActivity.list('-created_date', 500),
    enabled: !!user
  });

  // NEW: Check for security risks in CRM data
  const checkSecurityRisks = async () => {
    try {
      const { data } = await api.functions.invoke('crossModuleCorrelation', {});
      if (data.success) {
        setSecurityRisks(data.ai_insights);
        toast.info('Security correlation check complete');
      } else {
        toast.error('Failed to retrieve security insights.');
      }
    } catch (error) {
      console.error('Failed to check security risks:', error);
      toast.error('Error checking security risks.');
    }
  };

  useEffect(() => {
    // Only check security risks once user is loaded and contacts data is available.
    // contacts.length is used as a proxy for initial data load.
    if (user && contacts.length > 0) {
      checkSecurityRisks();
    }
  }, [user, contacts.length]); // Dependency array includes user and contacts.length


  // Generate AI narrative
  const generateNarrative = async () => {
    try {
      const { data } = await api.integrations.Core.InvokeLLM({
        prompt: `You are a business intelligence analyst. Create an executive summary for this CRM data:

Total Contacts: ${contacts.length}
Total Deals: ${deals.length} (Value: $${deals.reduce((sum, d) => sum + d.value, 0).toLocaleString()})
Total Leads: ${leads.length}
Activities (Last 30d): ${activities.length}

Win Rate: ${contacts.length > 0 ? ((deals.filter(d => d.pipeline_stage === 'closed_won').length / contacts.length) * 100).toFixed(1) : 0}%
Avg Deal Size: $${deals.length > 0 ? (deals.reduce((sum, d) => sum + d.value, 0) / deals.length).toFixed(0) : 0}

Create a compelling narrative with specific insights, trends, and actionable recommendations.`,
        response_json_schema: {
          type: "object",
          properties: {
            narrative: { type: "string" },
            key_insights: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            trend_direction: { type: "string", enum: ["improving", "stable", "declining"] }
          }
        }
      });

      setAiNarrative(data);
      toast.success('AI narrative generated');
    } catch (error) {
      toast.error('Failed to generate narrative');
    }
  };

  // Voice command handler
  const handleVoiceCommand = () => {
    if (!voiceActive) {
      if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
        toast.error('Voice recognition not supported in this browser');
        return;
      }

      setVoiceActive(true);
      toast.info('Listening for voice command...');
      
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setVoiceQuery(transcript);
        processVoiceQuery(transcript);
        setVoiceActive(false);
      };

      recognition.onerror = () => {
        setVoiceActive(false);
        toast.error('Voice recognition failed');
      };

      recognition.start();
    } else {
      setVoiceActive(false);
    }
  };

  const processVoiceQuery = async (query) => {
    toast.info(`Processing: "${query}"`);
    // Future: Process natural language queries through AI
    // Placeholder for `createPageUrl` - assume it's defined elsewhere or mock it.
    // If running without a router, this will need to be adjusted or removed.
    const createPageUrl = (pageName) => `/app/${pageName.toLowerCase()}`;

  };

  // 3D Funnel Data
  const funnelData = [
    { value: contacts.length, name: 'Total Contacts', fill: '#f4d35e' },
    { value: contacts.filter(c => c.lifecycle_stage === 'mql' || c.lifecycle_stage === 'sql').length, name: 'Qualified', fill: '#3cf7d4' },
    { value: deals.length, name: 'In Pipeline', fill: '#3b82f6' },
    { value: deals.filter(d => d.pipeline_stage === 'closed_won').length, name: 'Closed Won', fill: '#10b981' }
  ];

  // Rep Performance Scatter (3D-style)
  const repPerformance = Object.entries(
    deals.reduce((acc, deal) => {
      const owner = deal.owner_id || 'Unassigned';
      if (!acc[owner]) {
        acc[owner] = { deals: 0, totalValue: 0, won: 0 };
      }
      acc[owner].deals++;
      acc[owner].totalValue += deal.value;
      if (deal.pipeline_stage === 'closed_won') acc[owner].won++;
      return acc;
    }, {})
  ).map(([rep, stats]) => ({
    rep: rep.slice(0, 8),
    deals: stats.deals,
    winRate: stats.deals > 0 ? (stats.won / stats.deals) * 100 : 0,
    avgDealSize: stats.deals > 0 ? stats.totalValue / stats.deals : 0
  }));

  // Time Series Heatmap Data (hourly activity)
  const activityHeatmap = Array.from({ length: 24 }, (_, hour) => ({
    hour: `${hour}:00`,
    count: activities.filter(a => {
      const actHour = new Date(a.created_date).getHours();
      return actHour === hour;
    }).length
  }));

  // Geo Conversion Data
  const geoData = Object.entries(
    leads.reduce((acc, lead) => {
      const region = lead.location?.state || 'Unknown';
      if (!acc[region]) {
        acc[region] = { total: 0, converted: 0 };
      }
      acc[region].total++;
      if (lead.status === 'won') acc[region].converted++;
      return acc;
    }, {})
  ).map(([region, stats]) => ({
    region,
    total: stats.total,
    conversionRate: stats.total > 0 ? (stats.converted / stats.total) * 100 : 0
  })).sort((a, b) => b.total - a.total).slice(0, 10);

  // Placeholder for `createPageUrl` - assume it's defined elsewhere or mock it.
  // This is used for the Link component.
  const createPageUrl = (pageName) => `/app/${pageName.toLowerCase()}`;


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#02050a] via-[#06162a] to-[#0a1929] p-4 md:p-6 lg:p-8 relative overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, #f4d35e10 1px, transparent 1px),
            linear-gradient(to bottom, #f4d35e10 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'gridMove 20s linear infinite'
        }} />
      </div>

      <style>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        @keyframes pulse3d {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
        }
      `}</style>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#f4d35e] rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              x: [0, Math.random() * 30 - 15, 0],
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <div className="w-12 h-12 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#f4d35e] to-[#3cf7d4] rounded-lg opacity-50 blur animate-pulse" />
                <Users className="w-12 h-12 text-[#f4d35e] relative z-10" />
              </div>
              CRM <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f4d35e] to-[#3cf7d4]">Command Center</span>
            </h1>
            <p className="text-white/70 mt-2 text-lg">AI-Powered Holographic Intelligence Platform</p>
          </div>

          <div className="flex gap-3">
            {/* NEW: Security Check Button */}
            <Button
              onClick={checkSecurityRisks}
              variant="outline"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <Shield className="w-4 h-4 mr-2" />
              Security Check
            </Button>

            <Button
              onClick={handleVoiceCommand}
              className={`${
                voiceActive 
                  ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 animate-pulse' 
                  : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600'
              } text-[#0a1929] font-bold`}
            >
              {voiceActive ? <Mic className="w-4 h-4 mr-2" /> : <MicOff className="w-4 h-4 mr-2" />}
              Voice Command
            </Button>

            <Button
              onClick={generateNarrative}
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-bold"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Narrative
            </Button>
          </div>
        </div>

        {voiceQuery && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg"
          >
            <p className="text-amber-400 text-sm">Voice Query: "{voiceQuery}"</p>
          </motion.div>
        )}

        {/* NEW: Security Risk Alert */}
        {securityRisks?.critical_alerts?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">Security Alert: CRM Data</h3>
                <p className="text-white/70 text-sm">
                  {securityRisks.critical_alerts[0].title} - {securityRisks.critical_alerts[0].description}
                </p>
              </div>
              <Link to={createPageUrl("SecurityCommandCenter")}>
                <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white">
                  Investigate
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>

      {/* AI Narrative Panel */}
      {aiNarrative && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="relative z-10 mb-6"
        >
          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-400" />
                AI Executive Summary
                <Badge className="bg-purple-500/30 text-purple-300 ml-auto">
                  {aiNarrative.trend_direction}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-white/90 leading-relaxed">{aiNarrative.narrative}</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-white/70 font-medium text-sm mb-2">Key Insights</h4>
                  <ul className="space-y-1">
                    {aiNarrative.key_insights.map((insight, idx) => (
                      <li key={idx} className="text-white/80 text-sm flex items-start gap-2">
                        <span className="text-[#3cf7d4] mt-1">▸</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-white/70 font-medium text-sm mb-2">Recommendations</h4>
                  <ul className="space-y-1">
                    {aiNarrative.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-white/80 text-sm flex items-start gap-2">
                        <span className="text-[#f4d35e] mt-1">⚡</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Holographic Stats */}
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Contacts', value: contacts.length, icon: Users, color: 'from-blue-500 to-cyan-500' },
          { label: 'Active Deals', value: deals.filter(d => d.pipeline_stage !== 'closed_won' && d.pipeline_stage !== 'closed_lost').length, icon: Target, color: 'from-amber-500 to-orange-500' },
          { label: 'Pipeline Value', value: `$${(deals.reduce((sum, d) => sum + d.value, 0) / 1000).toFixed(0)}K`, icon: DollarSign, color: 'from-green-500 to-emerald-500' },
          { label: 'Win Rate', value: `${contacts.length > 0 ? ((deals.filter(d => d.pipeline_stage === 'closed_won').length / contacts.length) * 100).toFixed(1) : 0}%`, icon: TrendingUp, color: 'from-purple-500 to-pink-500' }
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="bg-white/5 border-[#f4d35e]/30 backdrop-blur relative overflow-hidden group hover:border-[#3cf7d4]/50 transition-all">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className={`w-8 h-8 bg-gradient-to-br ${stat.color} text-transparent bg-clip-text`} />
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center animate-pulse" style={{ animation: 'pulse3d 2s infinite' }}>
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${stat.color}`} />
                  </div>
                </div>
                <p className="text-white/60 text-sm mb-1">{stat.label}</p>
                <p className="text-4xl font-bold text-white">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Dashboard Grid */}
      <div className="relative z-10 grid lg:grid-cols-2 gap-6 mb-6">
        {/* 3D Funnel Visualization */}
        <Card className="bg-white/5 border-[#f4d35e]/30 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#f4d35e]" />
              Conversion Funnel
              <Badge className="bg-[#f4d35e]/20 text-[#f4d35e] ml-auto">Real-Time</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <FunnelChart>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #f4d35e50' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Funnel dataKey="value" data={funnelData} isAnimationActive>
                  <LabelList position="right" fill="#fff" stroke="none" dataKey="name" />
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {funnelData.map((stage, idx) => {
                const conversionRate = idx > 0 ? ((stage.value / funnelData[idx - 1].value) * 100).toFixed(1) : 100;
                return (
                  <div key={stage.name} className="p-2 bg-white/5 rounded text-center">
                    <p className="text-white/60 text-xs">{stage.name}</p>
                    <p className="text-[#3cf7d4] font-bold">{conversionRate}%</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Rep Performance 3D Scatter */}
        <Card className="bg-white/5 border-[#3cf7d4]/30 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#3cf7d4]" />
              Rep Performance Matrix
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4d35e20" />
                <XAxis 
                  dataKey="deals" 
                  name="Deal Volume" 
                  tick={{ fill: '#fff', fontSize: 11 }}
                  label={{ value: 'Deals Closed', position: 'bottom', fill: '#fff', fontSize: 12 }}
                />
                <YAxis 
                  dataKey="winRate" 
                  name="Win Rate %" 
                  tick={{ fill: '#fff' }}
                  label={{ value: 'Win Rate %', angle: -90, position: 'left', fill: '#fff', fontSize: 12 }}
                />
                <ZAxis dataKey="avgDealSize" name="Avg Deal Size" range={[50, 400]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #3cf7d450' }}
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(value, name) => {
                    if (name === 'Avg Deal Size') return `$${value.toFixed(0)}`;
                    return value.toFixed(1);
                  }}
                />
                <Legend />
                <Scatter data={repPerformance} fill="#3cf7d4">
                  {repPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity Heatmap */}
        <Card className="bg-white/5 border-purple-500/30 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              Activity Heatmap (24hr)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-12 gap-1">
              {activityHeatmap.map((data, idx) => {
                const intensity = data.count > 0 ? Math.min(data.count / Math.max(...activityHeatmap.map(d => d.count)), 1) : 0;
                return (
                  <div
                    key={idx}
                    className="aspect-square rounded transition-all hover:scale-110 cursor-pointer relative group"
                    style={{
                      backgroundColor: `rgba(244, 211, 94, ${intensity * 0.8})`,
                      border: `1px solid rgba(244, 211, 94, ${intensity})`
                    }}
                    title={`${data.hour}: ${data.count} activities`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-bold">{data.count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-4 text-xs text-white/60">
              <span>00:00</span>
              <span>Peak Activity Hours</span>
              <span>23:00</span>
            </div>
          </CardContent>
        </Card>

        {/* Geo Conversion Map */}
        <Card className="bg-white/5 border-green-500/30 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-400" />
              Geographic Conversion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[350px] overflow-y-auto">
              {geoData.map((region, idx) => (
                <div key={region.region} className="p-3 bg-white/5 rounded-lg border border-green-500/20 hover:border-green-500/50 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{region.region}</span>
                    <Badge className="bg-green-500/20 text-green-400">
                      {region.conversionRate.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${region.conversionRate}%` }}
                        transition={{ delay: idx * 0.05, duration: 0.8 }}
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                      />
                    </div>
                    <span className="text-white/60 text-xs">{region.total} leads</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3D Holographic Orb */}
      <div className="relative z-10">
        <Card className="bg-white/5 border-[#f4d35e]/30 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#f4d35e]" />
              Holographic Data Visualization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] bg-gradient-to-br from-[#0a1929] to-[#06162a] rounded-lg overflow-hidden relative">
              <HolographicOrb />
            </div>
            <p className="text-center text-white/60 text-sm mt-3">
              Interactive holographic data orb - Pure CSS animation
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
