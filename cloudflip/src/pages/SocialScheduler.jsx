import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Facebook,
  Instagram,
  Twitter,
  Calendar as CalendarIcon,
  Hash,
  Image as ImageIcon,
  Sparkles,
  Send,
  Plus,
  BarChart3
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, setHours, setMinutes } from "date-fns";
import { toast } from "sonner";

export default function SocialScheduler() {
  const [showNewPost, setShowNewPost] = useState(false);
  const [content, setContent] = useState("");
  const [platforms, setPlatforms] = useState([]);
  const [hashtags, setHashtags] = useState("");
  const [postType, setPostType] = useState("promotional");
  const [scheduleDate, setScheduleDate] = useState(new Date());
  const [scheduleHour, setScheduleHour] = useState("09");
  const [scheduleMinute, setScheduleMinute] = useState("00");

  const queryClient = useQueryClient();

  const { data: posts = [] } = useQuery({
    queryKey: ['social-posts'],
    queryFn: () => api.entities.SocialPost.list('-created_date'),
    initialData: []
  });

  const createPostMutation = useMutation({
    mutationFn: async (data) => {
      const user = await api.auth.me();
      const scheduledFor = setMinutes(
        setHours(scheduleDate, parseInt(scheduleHour)), 
        parseInt(scheduleMinute)
      );

      return api.entities.SocialPost.create({
        org_id: user.current_org_id,
        platforms: data.platforms,
        content: data.content,
        hashtags: data.hashtags,
        post_type: data.postType,
        scheduled_for: scheduledFor.toISOString(),
        status: 'scheduled'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
      toast.success("Post scheduled!");
      handleCloseModal();
    }
  });

  const generateContentMutation = useMutation({
    mutationFn: async ({ type, topic }) => {
      const response = await api.integrations.Core.InvokeLLM({
        prompt: `Generate an engaging social media post for a ${topic} business. Type: ${type}.\n\nInclude:\n- Compelling caption (100-150 chars)\n- 5-8 relevant hashtags\n- Call to action\n\nMake it professional yet friendly.`,
      });
      return response;
    },
    onSuccess: (aiContent) => {
      setContent(aiContent);
      toast.success("AI content generated!");
    }
  });

  const handlePlatformToggle = (platform) => {
    setPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleSubmit = () => {
    if (!content || platforms.length === 0) {
      toast.error("Please add content and select at least one platform");
      return;
    }

    const hashtagArray = hashtags
      .split(',')
      .map(h => h.trim())
      .filter(h => h.length > 0)
      .map(h => h.startsWith('#') ? h : `#${h}`);

    createPostMutation.mutate({
      content,
      platforms,
      hashtags: hashtagArray,
      postType
    });
  };

  const handleCloseModal = () => {
    setShowNewPost(false);
    setContent("");
    setPlatforms([]);
    setHashtags("");
    setPostType("promotional");
  };

  const safePosts = Array.isArray(posts) ? posts : [];

  const platformIcons = {
    facebook: Facebook,
    instagram: Instagram,
    twitter: Twitter,
    tiktok: ImageIcon
  };

  const statusColors = {
    draft: "bg-gray-500/20 text-gray-400",
    scheduled: "bg-blue-500/20 text-blue-400",
    posted: "bg-green-500/20 text-green-400",
    failed: "bg-red-500/20 text-red-400"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1929] via-[#0d1f3c] to-[#0a1929] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Send className="w-8 h-8 text-blue-400" />
              Social Media Scheduler
            </h1>
            <p className="text-white/60">Schedule and manage social media content</p>
          </div>
          <Button
            onClick={() => setShowNewPost(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </div>

        {/* Scheduled Posts */}
        <Card className="bg-[#0a1929]/60 backdrop-blur border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-white">Scheduled & Posted Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {safePosts.map(post => (
                <div
                  key={post.id}
                  className="p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={statusColors[post.status]}>
                          {post.status}
                        </Badge>
                        <Badge className="bg-purple-500/20 text-purple-400 capitalize">
                          {post.post_type}
                        </Badge>
                      </div>
                      <p className="text-white/80 text-sm leading-relaxed mb-2">{post.content}</p>
                      {post.hashtags && post.hashtags.length > 0 && (
                        <p className="text-blue-400 text-xs">
                          {post.hashtags.join(' ')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {(post.platforms || []).map(platform => {
                        const Icon = platformIcons[platform] || Send;
                        return (
                          <div key={platform} className="p-1.5 bg-white/10 rounded">
                            <Icon className="w-4 h-4 text-white/60" />
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-right">
                      <p className="text-white/50 text-xs">
                        {post.status === 'scheduled' 
                          ? `Scheduled: ${format(new Date(post.scheduled_for), 'PPp')}`
                          : post.posted_at 
                          ? `Posted: ${format(new Date(post.posted_at), 'PPp')}`
                          : 'Draft'
                        }
                      </p>
                    </div>
                  </div>

                  {post.engagement && post.status === 'posted' && (
                    <div className="mt-3 grid grid-cols-4 gap-2 pt-3 border-t border-white/10">
                      <div className="text-center">
                        <p className="text-white font-bold">{post.engagement.likes || 0}</p>
                        <p className="text-white/50 text-xs">Likes</p>
                      </div>
                      <div className="text-center">
                        <p className="text-white font-bold">{post.engagement.comments || 0}</p>
                        <p className="text-white/50 text-xs">Comments</p>
                      </div>
                      <div className="text-center">
                        <p className="text-white font-bold">{post.engagement.shares || 0}</p>
                        <p className="text-white/50 text-xs">Shares</p>
                      </div>
                      <div className="text-center">
                        <p className="text-white font-bold">{post.engagement.reach || 0}</p>
                        <p className="text-white/50 text-xs">Reach</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {safePosts.length === 0 && (
                <div className="text-center py-12">
                  <Send className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60">No posts scheduled yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Post Modal */}
      <Dialog open={showNewPost} onOpenChange={setShowNewPost}>
        <DialogContent className="max-w-3xl bg-[#0a1929] border-blue-500/30 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl">Create Social Post</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="text-white mb-2 block">Select Platforms *</Label>
              <div className="grid grid-cols-2 gap-3">
                {['facebook', 'instagram', 'twitter', 'tiktok'].map(platform => (
                  <div
                    key={platform}
                    onClick={() => handlePlatformToggle(platform)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      platforms.includes(platform)
                        ? 'bg-blue-500/20 border-blue-500/50'
                        : 'bg-white/5 border-white/10 hover:border-blue-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox checked={platforms.includes(platform)} />
                      <span className="text-white capitalize">{platform}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-white">Content *</Label>
                <Button
                  onClick={() => generateContentMutation.mutate({ type: postType, topic: 'home services' })}
                  disabled={generateContentMutation.isPending}
                  size="sm"
                  variant="outline"
                  className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Generate
                </Button>
              </div>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's happening?"
                rows={5}
                className="bg-white/5 border-blue-500/30 text-white"
              />
            </div>

            <div>
              <Label className="text-white">Hashtags (comma-separated)</Label>
              <Input
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="#homeservices, #local, #quality"
                className="bg-white/5 border-blue-500/30 text-white"
              />
            </div>

            <div>
              <Label className="text-white">Post Type</Label>
              <Select value={postType} onValueChange={setPostType}>
                <SelectTrigger className="bg-white/5 border-blue-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="promotional">Promotional</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                  <SelectItem value="behind_the_scenes">Behind the Scenes</SelectItem>
                  <SelectItem value="testimonial">Testimonial</SelectItem>
                  <SelectItem value="seasonal">Seasonal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white mb-2 block">Schedule For</Label>
              <div className="grid md:grid-cols-2 gap-4">
                <Calendar
                  mode="single"
                  selected={scheduleDate}
                  onSelect={(d) => d && setScheduleDate(d)}
                  className="rounded-md border border-blue-500/20 bg-white/5"
                />
                <div className="space-y-3">
                  <div>
                    <Label className="text-white text-sm">Time</Label>
                    <div className="flex gap-2">
                      <Select value={scheduleHour} onValueChange={setScheduleHour}>
                        <SelectTrigger className="bg-white/5 border-blue-500/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => (
                            <SelectItem key={h} value={h}>{h}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={scheduleMinute} onValueChange={setScheduleMinute}>
                        <SelectTrigger className="bg-white/5 border-blue-500/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {['00', '15', '30', '45'].map(m => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <p className="text-white/60 text-sm">
                    Will post on {format(scheduleDate, 'PPP')} at {scheduleHour}:{scheduleMinute}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={handleCloseModal}
              className="border-white/30 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createPostMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold"
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Schedule Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}