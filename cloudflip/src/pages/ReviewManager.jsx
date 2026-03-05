import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Star,
  ThumbsUp,
  MessageSquare,
  Eye,
  EyeOff,
  Send,
  Sparkles,
  TrendingUp,
  Award
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ReviewManager() {
  const [selectedReview, setSelectedReview] = useState(null);
  const [response, setResponse] = useState("");
  const queryClient = useQueryClient();

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews'],
    queryFn: () => api.entities.Review.list('-created_date'),
    initialData: []
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.entities.Client.list(),
    initialData: []
  });

  const updateReviewMutation = useMutation({
    mutationFn: ({ id, data }) => api.entities.Review.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast.success("Review updated!");
      setSelectedReview(null);
      setResponse("");
    }
  });

  const generateResponseMutation = useMutation({
    mutationFn: async (review) => {
      const client = clients.find(c => c.id === review.client_id);
      const response = await api.integrations.Core.InvokeLLM({
        prompt: `Generate a professional, friendly response to this ${review.rating}-star review:\n\n"${review.comment}"\n\nFrom client: ${client?.name || 'Customer'}\n\nThe response should be warm, address their specific points, and maintain brand voice.`,
      });
      return response;
    },
    onSuccess: (aiResponse) => {
      setResponse(aiResponse);
      toast.success("AI response generated!");
    }
  });

  const handlePublish = (review) => {
    updateReviewMutation.mutate({
      id: review.id,
      data: {
        status: 'published',
        published_at: new Date().toISOString(),
        published_to: ['website']
      }
    });
  };

  const handleRespond = () => {
    if (!response) {
      toast.error("Please write a response");
      return;
    }

    updateReviewMutation.mutate({
      id: selectedReview.id,
      data: {
        response,
        response_at: new Date().toISOString()
      }
    });
  };

  const safeReviews = Array.isArray(reviews) ? reviews : [];
  const safeClients = Array.isArray(clients) ? clients : [];

  const stats = {
    total: safeReviews.length,
    avgRating: safeReviews.length > 0 
      ? (safeReviews.reduce((sum, r) => sum + r.rating, 0) / safeReviews.length).toFixed(1)
      : 0,
    fiveStars: safeReviews.filter(r => r.rating === 5).length,
    pending: safeReviews.filter(r => r.status === 'pending').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1929] via-[#0d1f3c] to-[#0a1929] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
            Review Manager
          </h1>
          <p className="text-white/60">Collect, manage, and showcase customer testimonials</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
            <CardContent className="p-6 text-center">
              <Star className="w-8 h-8 text-amber-400 mx-auto mb-2 fill-amber-400" />
              <p className="text-3xl font-bold text-white mb-1">{stats.avgRating}</p>
              <p className="text-white/60 text-sm">Average Rating</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
            <CardContent className="p-6 text-center">
              <Award className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white mb-1">{stats.fiveStars}</p>
              <p className="text-white/60 text-sm">5-Star Reviews</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
            <CardContent className="p-6 text-center">
              <MessageSquare className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white mb-1">{stats.total}</p>
              <p className="text-white/60 text-sm">Total Reviews</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
            <CardContent className="p-6 text-center">
              <ThumbsUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white mb-1">{stats.pending}</p>
              <p className="text-white/60 text-sm">Pending Review</p>
            </CardContent>
          </Card>
        </div>

        {/* Reviews List */}
        <Card className="bg-[#0a1929]/60 backdrop-blur border-white/10">
          <CardHeader>
            <CardTitle className="text-white">All Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {safeReviews.map(review => {
                const client = safeClients.find(c => c.id === review.client_id);
                const statusColors = {
                  pending: "bg-amber-500/20 text-amber-400",
                  approved: "bg-blue-500/20 text-blue-400",
                  published: "bg-green-500/20 text-green-400",
                  flagged: "bg-red-500/20 text-red-400",
                  hidden: "bg-gray-500/20 text-gray-400"
                };

                return (
                  <div
                    key={review.id}
                    className="p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-white/20'
                                }`}
                              />
                            ))}
                          </div>
                          <Badge className={statusColors[review.status]}>
                            {review.status}
                          </Badge>
                        </div>
                        <p className="text-white font-medium mb-1">{client?.name || 'Anonymous'}</p>
                        {review.title && (
                          <p className="text-white/80 text-sm font-medium mb-1">{review.title}</p>
                        )}
                        <p className="text-white/70 text-sm leading-relaxed">{review.comment}</p>
                        <p className="text-white/40 text-xs mt-2">
                          {format(new Date(review.created_date), 'PPp')}
                        </p>
                      </div>
                    </div>

                    {review.response && (
                      <div className="mt-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <p className="text-blue-400 text-xs font-medium mb-1">Your Response:</p>
                        <p className="text-white/80 text-sm">{review.response}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-3">
                      {review.status === 'pending' && (
                        <>
                          <Button
                            onClick={() => handlePublish(review)}
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Publish
                          </Button>
                          <Button
                            onClick={() => setSelectedReview(review)}
                            size="sm"
                            variant="outline"
                            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                          >
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Respond
                          </Button>
                        </>
                      )}
                      {review.status === 'published' && !review.response && (
                        <Button
                          onClick={() => setSelectedReview(review)}
                          size="sm"
                          variant="outline"
                          className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                        >
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Add Response
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}

              {safeReviews.length === 0 && (
                <div className="text-center py-12">
                  <Star className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60">No reviews yet</p>
                  <p className="text-white/40 text-sm mt-2">Reviews will appear here after jobs are completed</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Response Dialog */}
      {selectedReview && (
        <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
          <DialogContent className="bg-[#0a1929] border-blue-500/30">
            <DialogHeader>
              <DialogTitle className="text-white text-xl">Respond to Review</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < selectedReview.rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-white/20'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-white/80 text-sm">{selectedReview.comment}</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-white">Your Response</Label>
                  <Button
                    onClick={() => generateResponseMutation.mutate(selectedReview)}
                    disabled={generateResponseMutation.isPending}
                    size="sm"
                    variant="outline"
                    className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Generate
                  </Button>
                </div>
                <Textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Write your response..."
                  rows={5}
                  className="bg-white/5 border-blue-500/30 text-white"
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setSelectedReview(null)}
                className="border-white/30 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleRespond}
                disabled={updateReviewMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold"
              >
                <Send className="w-4 h-4 mr-2" />
                Post Response
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}