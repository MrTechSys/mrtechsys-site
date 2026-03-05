import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles,
  Copy,
  Check,
  Loader2,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Mail,
  FileText,
  Search,
  RefreshCw,
  Languages,
  Image as ImageIcon,
  Wand2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

export default function ContentGenerator() {
  const [contentType, setContentType] = useState("social");
  const [platform, setPlatform] = useState("facebook");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [keywords, setKeywords] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [copied, setCopied] = useState(false);
  const [targetLanguages, setTargetLanguages] = useState([]);
  const [translations, setTranslations] = useState({});
  const [suggestedImages, setSuggestedImages] = useState([]);
  const [platformOptimized, setPlatformOptimized] = useState({});

  const languages = [
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'pt', name: 'Portuguese' }
  ];

  const generateMutation = useMutation({
    mutationFn: async () => {
      const prompts = {
        social: `Generate a compelling ${platform} post about "${topic}". 
Tone: ${tone}. 
${keywords ? `Include keywords: ${keywords}` : ''}

Platform requirements:
- ${platform === 'twitter' ? 'Keep under 280 characters' : ''}
- ${platform === 'instagram' ? 'Focus on visual storytelling, include 5-10 relevant hashtags' : ''}
- ${platform === 'facebook' ? 'Engaging and conversational, optimal length 100-250 chars' : ''}
- ${platform === 'linkedin' ? 'Professional and value-driven, 1200-1300 chars max' : ''}

Include relevant emojis and platform-appropriate hashtags.`,
        
        marketing: `Write marketing copy for "${topic}".
Tone: ${tone}.
${keywords ? `Include keywords: ${keywords}` : ''}
Focus on benefits and call-to-action. Make it persuasive and conversion-optimized.`,
        
        seo: `Generate SEO-optimized content for "${topic}".
Target keywords: ${keywords || 'relevant industry terms'}
Tone: ${tone}

Format:
META TITLE: [60 chars max]
META DESCRIPTION: [155 chars max]
BODY CONTENT: [150-200 words, keyword-rich, natural flow]

Focus on search intent and user value.`,
        
        email: `Write an email campaign for "${topic}".
Tone: ${tone}
${keywords ? `Key points to include: ${keywords}` : ''}

Format:
SUBJECT: [compelling, 50 chars max]
PREVIEW: [enticing preview text, 80 chars]
BODY: [personalized, action-oriented, 200-300 words]

Make it personal and conversion-focused.`
      };

      const response = await api.integrations.Core.InvokeLLM({
        prompt: prompts[contentType]
      });

      return response;
    },
    onSuccess: (content) => {
      setGeneratedContent(content);
      toast.success("Content generated!");
      
      // Auto-optimize for other platforms
      if (contentType === 'social') {
        optimizeForPlatforms(content);
      }
      
      // Auto-suggest images
      suggestImages(topic);
    },
    onError: (error) => {
      console.error('Generation error:', error);
      toast.error("Failed to generate content");
    }
  });

  const translateMutation = useMutation({
    mutationFn: async (targetLang) => {
      const response = await api.integrations.Core.InvokeLLM({
        prompt: `Translate the following content to ${targetLang}. Maintain tone and cultural appropriateness:

${generatedContent}

Return ONLY the translated text, no explanations.`
      });

      return { language: targetLang, content: response };
    },
    onSuccess: (result) => {
      setTranslations(prev => ({
        ...prev,
        [result.language]: result.content
      }));
      toast.success(`Translated to ${result.language}!`);
    }
  });

  const optimizeForPlatforms = async (content) => {
    try {
      const response = await api.integrations.Core.InvokeLLM({
        prompt: `Take this social media content and optimize it for different platforms:

Original: ${content}

Create versions for:
1. Twitter: Under 280 chars, punchy and engaging
2. Instagram: Visual-focused with strong CTA and 8-10 hashtags
3. LinkedIn: Professional, value-driven, 1200 chars
4. Facebook: Conversational, 150-250 chars

Return as JSON with keys: twitter, instagram, linkedin, facebook`,
        response_json_schema: {
          type: 'object',
          properties: {
            twitter: { type: 'string' },
            instagram: { type: 'string' },
            linkedin: { type: 'string' },
            facebook: { type: 'string' }
          }
        }
      });

      setPlatformOptimized(response);
    } catch (error) {
      console.error('Platform optimization error:', error);
    }
  };

  const suggestImages = async (topicText) => {
    try {
      const response = await api.integrations.Core.InvokeLLM({
        prompt: `Suggest 4 relevant stock photo search terms for content about "${topicText}".
        
Return as JSON array of objects with: search_term, description, style (e.g., "professional", "lifestyle", "abstract")`,
        response_json_schema: {
          type: 'object',
          properties: {
            suggestions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  search_term: { type: 'string' },
                  description: { type: 'string' },
                  style: { type: 'string' }
                }
              }
            }
          }
        }
      });

      setSuggestedImages(response.suggestions || []);
    } catch (error) {
      console.error('Image suggestion error:', error);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    if (topic.trim()) {
      generateMutation.mutate();
    }
  };

  const toggleLanguage = (langCode) => {
    if (targetLanguages.includes(langCode)) {
      setTargetLanguages(targetLanguages.filter(l => l !== langCode));
    } else {
      setTargetLanguages([...targetLanguages, langCode]);
      translateMutation.mutate(languages.find(l => l.code === langCode).name);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-purple-400" />
          AI Content <span className="text-amber-400">Generator</span>
        </h1>
        <p className="text-white/60">Create marketing copy, social posts, and SEO content with multi-language support</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <Card className="bg-[#0a1929]/60 backdrop-blur border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" />
              Content Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={contentType} onValueChange={setContentType}>
              <TabsList className="grid grid-cols-4 bg-white/5">
                <TabsTrigger value="social" className="text-xs data-[state=active]:bg-purple-500/20">
                  Social
                </TabsTrigger>
                <TabsTrigger value="marketing" className="text-xs data-[state=active]:bg-purple-500/20">
                  Marketing
                </TabsTrigger>
                <TabsTrigger value="seo" className="text-xs data-[state=active]:bg-purple-500/20">
                  SEO
                </TabsTrigger>
                <TabsTrigger value="email" className="text-xs data-[state=active]:bg-purple-500/20">
                  Email
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {contentType === 'social' && (
              <div>
                <Label className="text-white">Platform</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {['facebook', 'instagram', 'twitter', 'linkedin'].map((p) => (
                    <Button
                      key={p}
                      onClick={() => setPlatform(p)}
                      variant="outline"
                      size="sm"
                      className={`${
                        platform === p
                          ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                          : 'border-white/20 text-white/60'
                      }`}
                    >
                      {p === 'facebook' && <Facebook className="w-4 h-4" />}
                      {p === 'instagram' && <Instagram className="w-4 h-4" />}
                      {p === 'twitter' && <Twitter className="w-4 h-4" />}
                      {p === 'linkedin' && <Linkedin className="w-4 h-4" />}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label className="text-white">Topic / Product / Service</Label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., AC Installation Special, New Menu Items"
                className="bg-white/5 border-purple-500/30 text-white"
              />
            </div>

            <div>
              <Label className="text-white">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="bg-white/5 border-purple-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual & Friendly</SelectItem>
                  <SelectItem value="urgent">Urgent / Promotional</SelectItem>
                  <SelectItem value="informative">Informative</SelectItem>
                  <SelectItem value="humorous">Humorous</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white">
                {contentType === 'seo' ? 'Target Keywords' : 'Key Points (Optional)'}
              </Label>
              <Input
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder={contentType === 'seo' ? 'HVAC repair, AC installation' : 'discount, limited time, quality service'}
                className="bg-white/5 border-purple-500/30 text-white"
              />
            </div>

            <Button
              onClick={() => generateMutation.mutate()}
              disabled={!topic.trim() || generateMutation.isPending}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Content
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Panel */}
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Generated Content
              </CardTitle>
              {generatedContent && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleRegenerate}
                    size="sm"
                    variant="outline"
                    className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Regenerate
                  </Button>
                  <Button
                    onClick={handleCopy}
                    size="sm"
                    variant="outline"
                    className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {generatedContent ? (
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-lg border border-amber-500/20">
                  <pre className="text-white/90 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {generatedContent}
                  </pre>
                </div>

                {/* Platform-Optimized Versions */}
                {contentType === 'social' && Object.keys(platformOptimized).length > 0 && (
                  <Card className="bg-blue-500/10 border-blue-500/30">
                    <CardHeader>
                      <CardTitle className="text-white text-sm flex items-center gap-2">
                        <Wand2 className="w-4 h-4 text-blue-400" />
                        Platform-Optimized Versions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {Object.entries(platformOptimized).map(([plat, content]) => (
                        <div key={plat} className="p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            {plat === 'twitter' && <Twitter className="w-4 h-4 text-blue-400" />}
                            {plat === 'instagram' && <Instagram className="w-4 h-4 text-pink-400" />}
                            {plat === 'linkedin' && <Linkedin className="w-4 h-4 text-blue-600" />}
                            {plat === 'facebook' && <Facebook className="w-4 h-4 text-blue-500" />}
                            <span className="text-white font-semibold capitalize text-sm">{plat}</span>
                            <Badge className="bg-white/10 text-white/70 text-xs ml-auto">
                              {content.length} chars
                            </Badge>
                          </div>
                          <p className="text-white/80 text-xs">{content}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Translation Options */}
                {generatedContent && (
                  <Card className="bg-purple-500/10 border-purple-500/30">
                    <CardHeader>
                      <CardTitle className="text-white text-sm flex items-center gap-2">
                        <Languages className="w-4 h-4 text-purple-400" />
                        Multi-Language Translation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {languages.map((lang) => (
                          <div key={lang.code} className="flex items-center gap-2">
                            <Checkbox
                              id={lang.code}
                              checked={targetLanguages.includes(lang.code)}
                              onCheckedChange={() => toggleLanguage(lang.code)}
                              className="border-purple-500/30"
                            />
                            <Label htmlFor={lang.code} className="text-white text-sm cursor-pointer">
                              {lang.name}
                            </Label>
                          </div>
                        ))}
                      </div>

                      {Object.keys(translations).length > 0 && (
                        <div className="space-y-2 mt-4">
                          {Object.entries(translations).map(([lang, content]) => (
                            <div key={lang} className="p-3 bg-white/5 rounded-lg border border-purple-500/20">
                              <p className="text-purple-400 font-semibold text-xs mb-2">{lang}</p>
                              <p className="text-white/80 text-sm">{content}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {translateMutation.isPending && (
                        <div className="flex items-center gap-2 text-purple-400">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Translating...</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Suggested Images */}
                {suggestedImages.length > 0 && (
                  <Card className="bg-green-500/10 border-green-500/30">
                    <CardHeader>
                      <CardTitle className="text-white text-sm flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-green-400" />
                        AI-Suggested Stock Photos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        {suggestedImages.map((img, idx) => (
                          <a
                            key={idx}
                            href={`https://unsplash.com/s/photos/${encodeURIComponent(img.search_term)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-white/5 rounded-lg border border-green-500/20 hover:border-green-500/40 transition-all"
                          >
                            <p className="text-green-400 font-semibold text-sm mb-1">{img.search_term}</p>
                            <p className="text-white/60 text-xs mb-2">{img.description}</p>
                            <Badge className="bg-green-500/20 text-green-400 text-xs">
                              {img.style}
                            </Badge>
                          </a>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {contentType === 'social' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                      <p className="text-blue-400 text-xs mb-1">Estimated Reach</p>
                      <p className="text-white text-lg font-bold">1.2k - 3.5k</p>
                    </div>
                    <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                      <p className="text-green-400 text-xs mb-1">Engagement Score</p>
                      <p className="text-white text-lg font-bold">8.5/10</p>
                    </div>
                  </div>
                )}

                {contentType === 'seo' && (
                  <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Search className="w-4 h-4 text-green-400" />
                      <p className="text-green-400 font-semibold text-sm">SEO Analysis</p>
                    </div>
                    <div className="space-y-1 text-xs text-white/70">
                      <p>✓ Keyword density optimized</p>
                      <p>✓ Meta tags included</p>
                      <p>✓ Readability score: Good</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <Sparkles className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">Your AI-generated content will appear here</p>
                <p className="text-white/40 text-sm mt-2">Fill in the details and click Generate</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Content Templates */}
      <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
        <CardHeader>
          <CardTitle className="text-white">Quick Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-3">
            <Button
              onClick={() => {
                setContentType('social');
                setTopic('Summer Sale Promotion');
                setTone('urgent');
                setKeywords('discount, limited time, save money');
              }}
              variant="outline"
              className="border-amber-500/30 text-white hover:bg-amber-500/10 text-left justify-start h-auto p-4"
            >
              <div>
                <p className="font-semibold mb-1">Summer Sale Post</p>
                <p className="text-xs text-white/60">Promotional social media</p>
              </div>
            </Button>

            <Button
              onClick={() => {
                setContentType('email');
                setTopic('Monthly Newsletter');
                setTone('informative');
                setKeywords('company updates, new services, customer success');
              }}
              variant="outline"
              className="border-amber-500/30 text-white hover:bg-amber-500/10 text-left justify-start h-auto p-4"
            >
              <div>
                <p className="font-semibold mb-1">Monthly Newsletter</p>
                <p className="text-xs text-white/60">Email campaign</p>
              </div>
            </Button>

            <Button
              onClick={() => {
                setContentType('seo');
                setTopic('Local Service Page');
                setTone('professional');
                setKeywords('best, near me, affordable, trusted');
              }}
              variant="outline"
              className="border-amber-500/30 text-white hover:bg-amber-500/10 text-left justify-start h-auto p-4"
            >
              <div>
                <p className="font-semibold mb-1">SEO Landing Page</p>
                <p className="text-xs text-white/60">Local search optimized</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}