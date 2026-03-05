import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  TrendingUp,
  MapPin,
  Star,
  Sparkles,
  Plus,
  Eye,
  MousePointer,
  Zap,
  Calendar,
  Target
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function LocalSEOManager() {
  const [showNewKeyword, setShowNewKeyword] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [showContentGen, setShowContentGen] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState(null);
  const [generatedContent, setGeneratedContent] = useState(null);

  const queryClient = useQueryClient();

  const { data: keywords = [] } = useQuery({
    queryKey: ['local-seo'],
    queryFn: () => api.entities.LocalSEO.list('-search_volume'),
    initialData: []
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews'],
    queryFn: () => api.entities.Review.filter({ status: 'published' }),
    initialData: []
  });

  const createKeywordMutation = useMutation({
    mutationFn: async (data) => {
      const user = await api.auth.me();
      return api.entities.LocalSEO.create({
        org_id: user.current_org_id,
        keyword: data.keyword,
        location: data.location,
        competition: 'medium',
        current_rank: 999,
        target_rank: 3
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['local-seo'] });
      toast.success("Keyword added for tracking!");
      setShowNewKeyword(false);
      setKeyword("");
      setLocation("");
    }
  });

  const generateContentMutation = useMutation({
    mutationFn: async (keywordData) => {
      const response = await api.integrations.Core.InvokeLLM({
        prompt: `Generate 3 Google Business Profile post ideas for a local service business targeting the keyword "${keywordData.keyword}" in ${keywordData.location || 'local area'}.\n\nFor each post, provide:\n1. A catchy title (60 chars max)\n2. Post body (1500 chars max)\n3. Call-to-action\n4. Optimal posting time\n5. Season/timing recommendation\n\nFocus on local SEO optimization and customer engagement.`,
        response_json_schema: {
          type: "object",
          properties: {
            posts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  body: { type: "string" },
                  cta: { type: "string" },
                  optimal_time: { type: "string" },
                  season: { type: "string" }
                }
              }
            }
          }
        }
      });
      return response;
    },
    onSuccess: (data) => {
      setGeneratedContent(data);
      toast.success("Content ideas generated!");
    }
  });

  const safeKeywords = Array.isArray(keywords) ? keywords : [];
  const safeReviews = Array.isArray(reviews) ? reviews : [];

  const totalImpressions = safeKeywords.reduce((sum, k) => sum + (k.impressions_30d || 0), 0);
  const totalClicks = safeKeywords.reduce((sum, k) => sum + (k.clicks_30d || 0), 0);
  const avgRating = safeReviews.length > 0
    ? (safeReviews.reduce((sum, r) => sum + r.rating, 0) / safeReviews.length).toFixed(1)
    : 0;
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1929] via-[#0d1f3c] to-[#0a1929] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Search className="w-8 h-8 text-green-400" />
              Local SEO Manager
            </h1>
            <p className="text-white/60">Boost visibility with keyword tracking & Google Business updates</p>
          </div>
          <Button
            onClick={() => setShowNewKeyword(true)}
            className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Track Keyword
          </Button>
        </div>

        {/* SEO Metrics */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
            <CardContent className="p-6 text-center">
              <Eye className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white mb-1">{totalImpressions.toLocaleString()}</p>
              <p className="text-white/60 text-sm">Search Impressions (30d)</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
            <CardContent className="p-6 text-center">
              <MousePointer className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white mb-1">{totalClicks.toLocaleString()}</p>
              <p className="text-white/60 text-sm">Clicks (30d)</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white mb-1">{ctr}%</p>
              <p className="text-white/60 text-sm">Click-Through Rate</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
            <CardContent className="p-6 text-center">
              <Star className="w-8 h-8 text-amber-400 mx-auto mb-2 fill-amber-400" />
              <p className="text-3xl font-bold text-white mb-1">{avgRating}</p>
              <p className="text-white/60 text-sm">Average Review Rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Keywords Tracking */}
        <Card className="bg-[#0a1929]/60 backdrop-blur border-green-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Tracked Keywords
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {safeKeywords.map(kw => {
                const competitionColors = {
                  low: "bg-green-500/20 text-green-400",
                  medium: "bg-amber-500/20 text-amber-400",
                  high: "bg-red-500/20 text-red-400"
                };

                return (
                  <div
                    key={kw.id}
                    className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-green-500/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-white font-medium">{kw.keyword}</h4>
                          <Badge className={competitionColors[kw.competition]}>
                            {kw.competition} competition
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-white/60">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {kw.location || 'All locations'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Search className="w-3 h-3" />
                            {kw.search_volume || 0}/mo searches
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white/60 text-xs mb-1">Current Rank</p>
                        <p className="text-2xl font-bold text-blue-400">#{kw.current_rank}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2 bg-blue-500/10 rounded border border-blue-500/20">
                        <p className="text-blue-400 text-xs mb-1">Impressions (30d)</p>
                        <p className="text-white font-bold">{kw.impressions_30d || 0}</p>
                      </div>
                      <div className="p-2 bg-green-500/10 rounded border border-green-500/20">
                        <p className="text-green-400 text-xs mb-1">Clicks (30d)</p>
                        <p className="text-white font-bold">{kw.clicks_30d || 0}</p>
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        setSelectedKeyword(kw);
                        setShowContentGen(true);
                        generateContentMutation.mutate(kw);
                      }}
                      size="sm"
                      variant="outline"
                      className="mt-3 border-purple-500/30 text-purple-400 hover:bg-purple-500/10 w-full"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      Generate Content Ideas
                    </Button>
                  </div>
                );
              })}

              {safeKeywords.length === 0 && (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60">No keywords tracked yet</p>
                  <p className="text-white/40 text-sm mt-2">Add keywords to monitor your local SEO performance</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reviews Overview */}
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              Recent Reviews ({safeReviews.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {safeReviews.slice(0, 4).map(review => (
                <div key={review.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-white/20'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-white/80 text-sm line-clamp-3">{review.comment}</p>
                  {review.published_to && review.published_to.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {review.published_to.map(platform => (
                        <Badge key={platform} className="bg-green-500/20 text-green-400 text-xs">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Keyword Modal */}
      <Dialog open={showNewKeyword} onOpenChange={setShowNewKeyword}>
        <DialogContent className="bg-[#0a1929] border-green-500/30">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl">Track New Keyword</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="text-white">Keyword *</Label>
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g., 'HVAC repair near me'"
                className="bg-white/5 border-green-500/30 text-white"
              />
            </div>

            <div>
              <Label className="text-white">Location</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., 'Austin, TX'"
                className="bg-white/5 border-green-500/30 text-white"
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowNewKeyword(false)}
              className="border-white/30 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => createKeywordMutation.mutate({ keyword, location })}
              disabled={createKeywordMutation.isPending}
              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Track Keyword
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Content Generator Modal */}
      <Dialog open={showContentGen} onOpenChange={setShowContentGen}>
        <DialogContent className="max-w-4xl bg-[#0a1929] border-purple-500/30 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              AI Content Ideas for "{selectedKeyword?.keyword}"
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {generateContentMutation.isPending && (
              <div className="text-center py-12">
                <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-pulse" />
                <p className="text-white/60">Generating SEO-optimized content...</p>
              </div>
            )}

            {generatedContent?.posts && generatedContent.posts.map((post, idx) => (
              <Card key={idx} className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white text-lg">{post.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-white/80 text-sm leading-relaxed">{post.body}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2 bg-blue-500/10 rounded border border-blue-500/20">
                      <p className="text-blue-400 text-xs mb-1">Call to Action</p>
                      <p className="text-white text-sm">{post.cta}</p>
                    </div>
                    <div className="p-2 bg-green-500/10 rounded border border-green-500/20">
                      <p className="text-green-400 text-xs mb-1">Best Time</p>
                      <p className="text-white text-sm">{post.optimal_time}</p>
                    </div>
                  </div>

                  {post.season && (
                    <Badge className="bg-amber-500/20 text-amber-400">
                      <Calendar className="w-3 h-3 mr-1" />
                      {post.season}
                    </Badge>
                  )}

                  <Button
                    size="sm"
                    className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold"
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Post to Google Business
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}