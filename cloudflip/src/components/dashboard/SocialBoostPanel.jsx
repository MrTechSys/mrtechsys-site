
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Share2, Instagram, Facebook, Loader2 } from "lucide-react";
import { api } from "@/api/apiClient";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function SocialBoostPanel({ recentJobs = [] }) {
  const [caption, setCaption] = useState("");
  const [generating, setGenerating] = useState(false);
  const [suggestedHashtags, setSuggestedHashtags] = useState([]);
  const [organization, setOrganization] = useState(null);

  useEffect(() => {
    const loadOrg = async () => {
      try {
        const user = await api.auth.me();
        if (user.current_org_id) {
          const orgs = await api.entities.Organization.filter({ id: user.current_org_id });
          if (orgs.length > 0) {
            setOrganization(orgs[0]);
          }
        }
      } catch (error) {
        console.error('Failed to load organization:', error);
      }
    };
    loadOrg();
  }, []);

  const generateCaption = async () => {
    setGenerating(true);
    try {
      const safeJobs = recentJobs || [];
      const latestJob = safeJobs.find(j => j?.status === 'completed') || safeJobs[0];
      
      const businessName = organization?.settings?.brand_name || organization?.name || 'our business';
      const industry = organization?.industry || 'service';
      
      let prompt = `Create a social media caption for a local ${industry} business called "${businessName}".`;
      
      if (latestJob) {
        prompt += ` They just completed: "${latestJob.title}".`;
      } else {
        prompt += ` They want to promote their services.`;
      }
      
      prompt += ` Make it engaging, friendly, and include relevant hashtags for the ${industry} industry. Keep it under 150 characters.`;

      const result = await api.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            caption: { type: "string" },
            hashtags: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setCaption(result.caption || '');
      setSuggestedHashtags(result.hashtags || []);
      toast.success("Caption generated!");
    } catch (error) {
      console.error('Failed to generate caption:', error);
      
      // Industry-specific fallback captions
      const fallbacks = {
        hvac: "Just wrapped up another HVAC installation! 💨 Your comfort is our priority. Call us for all your heating & cooling needs!",
        landscaping: "Another beautiful yard transformation complete! 🌿 Transform your outdoor space today!",
        default: "Just wrapped up another successful project! 💪 Thanks to our amazing clients for trusting us!"
      };
      
      const fallbackHashtags = {
        hvac: ["#HVAC", "#HeatingAndCooling", "#LocalBusiness", "#HomeComfort"],
        landscaping: ["#Landscaping", "#YardTransformation", "#LocalBusiness", "#OutdoorLiving"],
        default: ["#LocalBusiness", "#SmallBusiness", "#CommunityFirst", "#QualityService"]
      };
      
      const industry = organization?.industry || 'default';
      setCaption(fallbacks[industry] || fallbacks.default);
      setSuggestedHashtags(fallbackHashtags[industry] || fallbackHashtags.default);
    } finally {
      setGenerating(false);
    }
  };

  const shareToSocial = (platform) => {
    const safeTags = suggestedHashtags || [];
    const text = encodeURIComponent(`${caption}\n\n${safeTags.map(h => h?.startsWith('#') ? h : '#' + h).join(' ')}`);
    
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${text}`,
      instagram: 'https://www.instagram.com/',
      twitter: `https://twitter.com/intent/tweet?text=${text}`
    };

    if (platform === 'instagram') {
      navigator.clipboard.writeText(caption + '\n\n' + safeTags.map(h => h?.startsWith('#') ? h : '#' + h).join(' '));
      toast.success("Caption copied! Open Instagram to paste and post.");
    } else {
      window.open(urls[platform], '_blank');
    }
  };

  return (
    <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Share2 className="w-5 h-5 text-amber-400" />
          Social Boost
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Your post caption will appear here..."
            rows={4}
            className="bg-white/5 border-amber-500/30 text-white placeholder:text-white/40 resize-none"
          />
          
          {(suggestedHashtags || []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {suggestedHashtags.map((tag, idx) => (
                <Badge key={idx} className="bg-blue-500/20 text-blue-400">
                  {tag?.startsWith('#') ? tag : '#' + tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Button
            onClick={generateCaption}
            disabled={generating}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate AI Caption
              </>
            )}
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => shareToSocial('facebook')}
              disabled={!caption}
              variant="outline"
              className="border-blue-500/30 text-white hover:bg-blue-500/10"
            >
              <Facebook className="w-4 h-4 mr-2" />
              Facebook
            </Button>
            <Button
              onClick={() => shareToSocial('instagram')}
              disabled={!caption}
              variant="outline"
              className="border-pink-500/30 text-white hover:bg-pink-500/10"
            >
              <Instagram className="w-4 h-4 mr-2" />
              Instagram
            </Button>
          </div>
        </div>

        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-blue-300">
            💡 <span className="font-medium">Tip:</span> Post consistently to grow your local reach and attract more customers!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
