
import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Globe,
  Search,
  Download,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  Building,
  CheckCircle,
  XCircle,
  Loader2,
  DollarSign,
  Target,
  TrendingUp,
  Zap,
  Filter,
  Map,
  BarChart3,
  Layers,
  Linkedin,
  Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis
} from "recharts";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const verticalOptions = [
  { id: 'dentist', label: 'Dentists', icon: '🦷' },
  { id: 'restaurant', label: 'Restaurants', icon: '🍽️' },
  { id: 'bbq', label: 'BBQ & Catering', icon: '🍖' },
  { id: 'plumbing', label: 'Plumbers', icon: '🔧' },
  { id: 'hvac', label: 'HVAC', icon: '❄️' },
  { id: 'electrical', label: 'Electricians', icon: '⚡' },
  { id: 'roofing', label: 'Roofers', icon: '🏠' },
  { id: 'landscaping', label: 'Landscaping', icon: '🌳' },
  { id: 'auto_repair', label: 'Auto Repair', icon: '🚗' },
  { id: 'cleaning', label: 'Cleaning Services', icon: '🧹' },
  { id: 'salon', label: 'Salons & Spas', icon: '💇' },
  { id: 'av_events', label: 'AV & Events', icon: '🎵' },
  { id: 'real_estate', label: 'Real Estate', icon: '🏘️' },
  { id: 'other', label: 'Other', icon: '📋' }
];

const DATA_SOURCES = [
  { id: 'yellowpages', name: 'YellowPages', icon: '📒', active: true },
  { id: 'google', name: 'Google Maps', icon: '🗺️', active: false, comingSoon: true },
  { id: 'yelp', name: 'Yelp Business', icon: '⭐', active: false, comingSoon: true },
  { id: 'linkedin', name: 'LinkedIn Sales Nav', icon: '💼', active: false, comingSoon: true }
];

const CHART_COLORS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];

export default function LeadScraper() {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [searchParams, setSearchParams] = useState({
    vertical: '',
    location: '',
    limit: 20,
    source: 'yellowpages'
  });
  const [scrapedLeads, setScrapedLeads] = useState([]);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid, list, map
  const [filters, setFilters] = useState({ minScore: 0, maxScore: 100 });
  const [searching, setSearching] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await api.auth.me();
        setUser(currentUser);

        if (currentUser?.current_org_id) {
          const orgs = await api.entities.Organization.filter({ id: currentUser.current_org_id });
          if (orgs.length > 0) {
            setOrganization(orgs[0]);
            
            if (orgs[0].industry) {
              const matchedVertical = verticalOptions.find(v => 
                orgs[0].industry.toLowerCase().includes(v.id.toLowerCase())
              );
              if (matchedVertical) {
                setSearchParams(prev => ({ ...prev, vertical: matchedVertical.id }));
              }
            }
          }
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
        toast.error("Failed to load user data");
      }
    };
    loadData();
  }, []);

  const { data: leads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ['all-leads'],
    queryFn: async () => {
      // Ensure user.current_org_id is available before fetching
      if (!user?.current_org_id) return [];
      const all = await api.entities.Lead.list('-created_date', 500);
      return all.filter(l => l.org_id === user.current_org_id);
    },
    enabled: !!user?.current_org_id // Only enable query if user and org_id exist
  });

  const scrapeMutation = useMutation({
    mutationFn: async (params) => {
      const { data } = await api.functions.invoke('yellowPagesScraperAI', params);
      return data;
    },
    onSuccess: (data) => {
      const newScrapedLeads = data.leads || [];
      if (newScrapedLeads.length > 0) {
        setScrapedLeads(newScrapedLeads);
        setSelectedLeads(newScrapedLeads.map(l => l.name)); // Pre-select all scraped leads
        setShowResults(true);
        toast.success(`Discovered ${newScrapedLeads.length} qualified leads!`);
      } else {
        setScrapedLeads([]);
        setSelectedLeads([]);
        setShowResults(false);
        toast.info("No leads found for this search. Try a different location or vertical.");
      }
      setSearching(false);
    },
    onError: (error) => {
      console.error('Scrape error:', error);
      const msg = error?.response?.data?.message || "Scraping failed";
      toast.error(`Search failed: ${msg}`);
      setSearching(false);
    }
  });

  const importLeadsMutation = useMutation({
    mutationFn: async (leadsToImport) => {
      const leadsWithOrg = leadsToImport.map(lead => ({
        ...lead,
        org_id: user.current_org_id,
        status: 'new',
        stage: 'new',
        source: 'import'
      }));

      return await api.entities.Lead.bulkCreate(leadsWithOrg);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['all-leads'] }); // Invalidate for 'all-leads' to refresh CRM leads
      toast.success(`Imported ${data?.length || 0} leads into your CRM!`);
      setShowResults(false);
      setScrapedLeads([]);
      setSelectedLeads([]);
      setSearchParams(prev => ({ ...prev, location: '' })); // Clear location after import
    },
    onError: (error) => {
      console.error('Import error:', error);
      toast.error("Failed to import leads");
    }
  });

  const handleSearch = () => {
    if (!searchParams.vertical) {
      toast.error("Please select a business vertical");
      return;
    }
    if (!searchParams.location) {
      toast.error("Please enter a location");
      return;
    }

    setSearching(true);
    setScrapedLeads([]);
    setSelectedLeads([]);
    setShowResults(false); // Hide previous results
    scrapeMutation.mutate(searchParams);
  };

  const handleImportSelected = () => {
    const leadsToImport = scrapedLeads.filter(lead => 
      selectedLeads.includes(lead.name)
    );

    if (leadsToImport.length === 0) {
      toast.error("Please select at least one lead");
      return;
    }

    importLeadsMutation.mutate(leadsToImport);
  };

  const toggleLead = (leadName) => {
    setSelectedLeads(prev => 
      prev.includes(leadName) 
        ? prev.filter(n => n !== leadName)
        : [...prev, leadName]
    );
  };

  const toggleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map(l => l.name));
    }
  };

  // Filtering & Analytics for NEWLY SCRAPED leads
  const filteredLeads = scrapedLeads.filter(lead => {
    const score = lead.score || 0;
    return score >= filters.minScore && score <= filters.maxScore;
  });

  const totalEstimatedValue = filteredLeads
    .filter(lead => selectedLeads.includes(lead.name))
    .reduce((sum, lead) => sum + (lead.expected_value || 0), 0);

  const avgScore = filteredLeads.length > 0
    ? filteredLeads.reduce((sum, lead) => sum + (lead.score || 0), 0) / filteredLeads.length
    : 0;

  // Score distribution for newly scraped leads chart
  const scoreDistribution = [
    { range: '0-20', count: filteredLeads.filter(l => (l.score || 0) >= 0 && (l.score || 0) < 20).length },
    { range: '20-40', count: filteredLeads.filter(l => (l.score || 0) >= 20 && (l.score || 0) < 40).length },
    { range: '40-60', count: filteredLeads.filter(l => (l.score || 0) >= 40 && (l.score || 0) < 60).length },
    { range: '60-80', count: filteredLeads.filter(l => (l.score || 0) >= 60 && (l.score || 0) < 80).length },
    { range: '80-100', count: filteredLeads.filter(l => (l.score || 0) >= 80 && (l.score || 0) <= 100).length }
  ];

  // Category breakdown for newly scraped leads
  const categoryBreakdown = Object.entries(
    filteredLeads.reduce((acc, lead) => {
      const cat = lead.metadata?.category || 'Other';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Analytics data from REAL leads only (CRM Leads)
  const qualityDistribution = leads.reduce((acc, lead) => {
    const score = lead.score || 0;
    if (score >= 75) acc.high++;
    else if (score >= 50) acc.medium++;
    else acc.low++;
    return acc;
  }, { high: 0, medium: 0, low: 0 });

  const crmChartData = [
    { name: 'High (75+)', value: qualityDistribution.high, color: '#10b981' },
    { name: 'Medium (50-74)', value: qualityDistribution.medium, color: '#f59e0b' },
    { name: 'Low (<50)', value: qualityDistribution.low, color: '#ef4444' }
  ];

  // Map data (mock coordinates for demo - real impl would geocode)
  const mapCenter = [30.2672, -97.7431]; // Austin, TX default

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Globe className="w-8 h-8 text-cyan-400" />
            AI Lead <span className="text-amber-400">Discovery & Enrichment</span>
          </h1>
          <p className="text-white/70 mt-1">
            Multi-source lead generation with intelligent deduplication and AI enrichment
          </p>
        </div>
        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
          <Sparkles className="w-3 h-3 mr-1" />
          AI-Powered
        </Badge>
      </div>

      {/* Search Form */}
      <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-cyan-400" />
            Configure Your Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-white mb-3 block">Data Sources</Label>
            <div className="grid md:grid-cols-4 gap-3">
              {DATA_SOURCES.map((source) => (
                <Card
                  key={source.id}
                  onClick={() => !source.comingSoon && setSearchParams(prev => ({ ...prev, source: source.id }))}
                  className={`cursor-pointer transition-all relative ${
                    searchParams.source === source.id && !source.comingSoon
                      ? 'bg-cyan-500/20 border-cyan-500'
                      : source.comingSoon
                      ? 'bg-white/5 border-white/10 opacity-50'
                      : 'bg-white/5 border-amber-500/20 hover:border-amber-500/40'
                  }`}
                >
                  <CardContent className="p-3">
                    <div className="text-center">
                      <div className="text-2xl mb-2">{source.icon}</div>
                      <p className="text-white text-sm font-medium">{source.name}</p>
                      {source.comingSoon && (
                        <Badge className="bg-amber-500/20 text-amber-400 text-xs mt-2">
                          Coming Soon
                        </Badge>
                      )}
                      {searchParams.source === source.id && !source.comingSoon && (
                        <CheckCircle className="w-4 h-4 text-cyan-400 mx-auto mt-1" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label className="text-white">Business Vertical</Label>
              <Select 
                value={searchParams.vertical} 
                onValueChange={(value) => setSearchParams(prev => ({ ...prev, vertical: value }))}
              >
                <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                  <SelectValue placeholder="Select industry..." />
                </SelectTrigger>
                <SelectContent>
                  {verticalOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      <span className="flex items-center gap-2">
                        <span>{option.icon}</span>
                        <span>{option.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {organization?.industry && (
                <p className="text-white/50 text-xs mt-1">
                  💡 Detected from your org: {organization.industry}
                </p>
              )}
            </div>

            <div>
              <Label className="text-white">Location</Label>
              <Input
                value={searchParams.location}
                onChange={(e) => setSearchParams(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., Austin, TX or 78701"
                className="bg-white/5 border-amber-500/30 text-white"
              />
              <p className="text-white/50 text-xs mt-1">
                City, State or ZIP code
              </p>
            </div>

            <div>
              <Label className="text-white">Maximum Results</Label>
              <Input
                type="number"
                value={searchParams.limit}
                onChange={(e) => setSearchParams(prev => ({ ...prev, limit: parseInt(e.target.value) || 20 }))}
                min={5}
                max={100}
                className="bg-white/5 border-amber-500/30 text-white"
              />
              <p className="text-white/50 text-xs mt-1">
                5-100 leads per search
              </p>
            </div>
          </div>

          <Button
            onClick={handleSearch}
            disabled={searching || !searchParams.vertical || !searchParams.location}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
            size="lg"
          >
            {searching ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Discovering Leads from {DATA_SOURCES.find(s => s.id === searchParams.source)?.name}...
              </>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                Find Leads with AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* CRM Leads Overview or How It Works */}
      {!showResults && (
        (leadsLoading || leads.length === 0) ? (
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                How AI Lead Discovery & Enrichment Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="p-4 bg-white/5 rounded-lg border border-purple-500/20">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center mb-3">
                    <Layers className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">1. Multi-Source Search</h3>
                  <p className="text-white/70 text-sm">
                    Query multiple data sources simultaneously (YellowPages, Google Maps, Yelp) for comprehensive coverage
                  </p>
                </div>

                <div className="p-4 bg-white/5 rounded-lg border border-purple-500/20">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center mb-3">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">2. AI Enrichment</h3>
                  <p className="text-white/70 text-sm">
                    Each lead analyzed with firmographic/technographic data, quality scoring, and personalized outreach
                  </p>
                </div>

                <div className="p-4 bg-white/5 rounded-lg border border-purple-500/20">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center mb-3">
                    <Filter className="w-5 h-5 text-amber-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">3. Smart Deduplication</h3>
                  <p className="text-white/70 text-sm">
                    Intelligent matching across sources prevents duplicates and enriches data from multiple listings
                  </p>
                </div>

                <div className="p-4 bg-white/5 rounded-lg border border-purple-500/20">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center mb-3">
                    <Download className="w-5 h-5 text-green-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">4. CRM Integration</h3>
                  <p className="text-white/70 text-sm">
                    Import qualified leads with AI-generated outreach campaigns ready to launch
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-400 text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <strong>Pro Tip:</strong> Specific locations yield better results. Try "Downtown Austin, TX" instead of just "Texas"
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-[#0a1929]/60 backdrop-blur border-emerald-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-base">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                Your CRM Leads Quality Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leadsLoading ? (
                <div className="flex items-center justify-center h-[200px] text-white/50">
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  Loading CRM leads...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={crmChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {crmChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #10b981' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="mt-4 grid grid-cols-3 gap-2">
                {crmChartData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="text-white/70 text-sm">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      )}

      {/* Results */}
      <AnimatePresence>
        {showResults && filteredLeads.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Stats Bar */}
            <div className="grid md:grid-cols-5 gap-4">
              <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Building className="w-5 h-5 text-cyan-400" />
                    <Badge className="bg-cyan-500/20 text-cyan-400">Found</Badge>
                  </div>
                  <p className="text-3xl font-bold text-cyan-400">{scrapedLeads.length}</p>
                  <p className="text-white/60 text-xs mt-1">Businesses discovered</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <Badge className="bg-green-500/20 text-green-400">Selected</Badge>
                  </div>
                  <p className="text-3xl font-bold text-green-400">{selectedLeads.length}</p>
                  <p className="text-white/60 text-xs mt-1">Ready to import</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="w-5 h-5 text-amber-400" />
                    <Badge className="bg-amber-500/20 text-amber-400">Value</Badge>
                  </div>
                  <p className="text-3xl font-bold text-amber-400">
                    ${Math.round(totalEstimatedValue).toLocaleString()}
                  </p>
                  <p className="text-white/60 text-xs mt-1">Potential pipeline</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Target className="w-5 h-5 text-purple-400" />
                    <Badge className="bg-purple-500/20 text-purple-400">Quality</Badge>
                  </div>
                  <p className="text-3xl font-bold text-purple-400">{Math.round(avgScore)}</p>
                  <p className="text-white/60 text-xs mt-1">Average score</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Star className="w-5 h-5 text-red-400" />
                    <Badge className="bg-red-500/20 text-red-400">Hot</Badge>
                  </div>
                  <p className="text-3xl font-bold text-red-400">
                    {filteredLeads.filter(l => (l.score || 0) >= 75).length}
                  </p>
                  <p className="text-white/60 text-xs mt-1">High-quality leads</p>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2 text-base">
                    <BarChart3 className="w-4 h-4 text-cyan-400" />
                    Lead Quality Distribution (Scraped)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={scoreDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis dataKey="range" stroke="#fff" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#fff" tick={{ fontSize: 12 }} />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #06b6d4' }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="count" fill="#06b6d4" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2 text-base">
                    <Layers className="w-4 h-4 text-purple-400" />
                    Category Breakdown (Scraped)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: '#0a1929', border: '1px solid #8b5cf6' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Filters & View Controls */}
            <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <Checkbox
                      checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                      onCheckedChange={toggleSelectAll}
                      className="border-white/30"
                    />
                    <span className="text-white text-sm">
                      Select All ({filteredLeads.length})
                    </span>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Filter className="w-4 h-4 text-amber-400" />
                      <span className="text-white/60 text-xs">Score:</span>
                      <Input
                        type="number"
                        value={filters.minScore}
                        onChange={(e) => setFilters({...filters, minScore: parseInt(e.target.value) || 0})}
                        className="w-16 bg-white/5 border-amber-500/30 text-white text-xs h-8"
                        placeholder="Min"
                      />
                      <span className="text-white/60">-</span>
                      <Input
                        type="number"
                        value={filters.maxScore}
                        onChange={(e) => setFilters({...filters, maxScore: parseInt(e.target.value) || 100})}
                        className="w-16 bg-white/5 border-amber-500/30 text-white text-xs h-8"
                        placeholder="Max"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 w-full md:w-auto">
                    <div className="flex border border-amber-500/30 rounded-lg p-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className={viewMode === 'grid' ? 'bg-amber-500/20 text-amber-400' : 'text-white/60'}
                      >
                        <Layers className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode('map')}
                        className={viewMode === 'map' ? 'bg-amber-500/20 text-amber-400' : 'text-white/60'}
                      >
                        <Map className="w-4 h-4" />
                      </Button>
                    </div>

                    <Button
                      onClick={() => {
                        setShowResults(false);
                        setScrapedLeads([]);
                        setSelectedLeads([]);
                      }}
                      variant="outline"
                      size="sm"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Clear Results
                    </Button>
                    <Button
                      onClick={handleImportSelected}
                      disabled={selectedLeads.length === 0 || importLeadsMutation.isPending}
                      className="bg-gradient-to-r from-green-600 to-green-500"
                      size="sm"
                    >
                      {importLeadsMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Import {selectedLeads.length}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* View Modes */}
            {viewMode === 'map' ? (
              <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
                <CardContent className="p-4">
                  <div style={{ height: '500px', borderRadius: '8px', overflow: 'hidden' }}>
                    <MapContainer center={mapCenter} zoom={11} style={{ height: '100%', width: '100%' }}>
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      {filteredLeads.map((lead, idx) => (
                        // Mock coordinates for demo. In real scenario, geocode lead.location
                        <Marker
                          key={idx}
                          position={[
                            mapCenter[0] + (Math.random() - 0.5) * 0.2,
                            mapCenter[1] + (Math.random() - 0.5) * 0.2
                          ]}
                        >
                          <Popup>
                            <div className="text-sm">
                              <p className="font-bold">{lead.name}</p>
                              {lead.phone && <p className="text-xs">{lead.phone}</p>}
                              <Badge className="text-xs mt-1">Score: {lead.score}</Badge>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredLeads.map((lead, idx) => {
                  const isSelected = selectedLeads.includes(lead.name);
                  const verticalInfo = verticalOptions.find(v => v.id === searchParams.vertical);

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card 
                        className={`bg-white/5 backdrop-blur border transition-all cursor-pointer ${
                          isSelected 
                            ? 'border-green-500/50 bg-green-500/5' 
                            : 'border-amber-500/20 hover:border-amber-500/40'
                        }`}
                        onClick={() => toggleLead(lead.name)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleLead(lead.name)}
                              className="mt-1 border-white/30"
                              onClick={(e) => e.stopPropagation()}
                            />

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex-1">
                                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    {verticalInfo?.icon}
                                    {lead.name}
                                  </h3>
                                  {lead.metadata?.category && (
                                    <Badge className="bg-white/10 text-white/70 mt-1">
                                      {lead.metadata.category}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  {lead.score && (
                                    <Badge className={`${
                                      lead.score >= 70 ? 'bg-green-500/20 text-green-400' :
                                      lead.score >= 50 ? 'bg-yellow-500/20 text-yellow-400' :
                                      'bg-red-500/20 text-red-400'
                                    }`}>
                                      <Target className="w-3 h-3 mr-1" />
                                      {lead.score}
                                    </Badge>
                                  )}
                                  {lead.expected_value && (
                                    <Badge className="bg-amber-500/20 text-amber-400">
                                      <DollarSign className="w-3 h-3 mr-1" />
                                      ${Math.round(lead.expected_value)}
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <div className="grid md:grid-cols-2 gap-3 mb-3">
                                {lead.phone && (
                                  <div className="flex items-center gap-2 text-white/70 text-sm">
                                    <Phone className="w-4 h-4 text-cyan-400" />
                                    <a 
                                      href={`tel:${lead.phone}`}
                                      className="hover:text-cyan-400 transition-colors"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {lead.phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')}
                                    </a>
                                  </div>
                                )}

                                {lead.location && (
                                  <div className="flex items-center gap-2 text-white/70 text-sm">
                                    <MapPin className="w-4 h-4 text-green-400" />
                                    <span>
                                      {lead.location.city}, {lead.location.state} {lead.location.zip}
                                    </span>
                                  </div>
                                )}

                                {lead.metadata?.website && (
                                  <div className="flex items-center gap-2 text-white/70 text-sm">
                                    <Globe className="w-4 h-4 text-purple-400" />
                                    <a 
                                      href={lead.metadata.website}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="hover:text-purple-400 transition-colors truncate"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      Website
                                    </a>
                                  </div>
                                )}

                                {lead.metadata?.street && (
                                  <div className="flex items-center gap-2 text-white/70 text-sm">
                                    <Building className="w-4 h-4 text-blue-400" />
                                    <span className="truncate">{lead.metadata.street}</span>
                                  </div>
                                )}
                              </div>

                              {lead.ai_summary && (
                                <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg mb-3">
                                  <p className="text-purple-400 text-xs font-semibold mb-1 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    AI Insight:
                                  </p>
                                  <p className="text-white/80 text-sm">{lead.ai_summary}</p>
                                </div>
                              )}

                              {lead.ai_suggested_response && (
                                <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                                  <p className="text-cyan-400 text-xs font-semibold mb-1 flex items-center gap-1">
                                    <Zap className="w-3 h-3" />
                                    Suggested Outreach:
                                  </p>
                                  <p className="text-white/70 text-sm italic">
                                    "{lead.ai_suggested_response}"
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
