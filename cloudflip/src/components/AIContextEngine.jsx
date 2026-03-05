import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, ThumbsUp, ThumbsDown, Code, Lightbulb, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIContextEngine({ module, entity, userIntent, isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [context, setContext] = useState({});

  useEffect(() => {
    setContext({
      module: module || 'Unknown',
      entity: entity || 'N/A',
      intent: userIntent || 'General',
      timestamp: new Date().toISOString()
    });
  }, [module, entity, userIntent]);

  const aiQueryMutation = useMutation({
    mutationFn: async (userQuery) => {
      const contextPrompt = `
Context:
- Module: ${context.module}
- Entity: ${context.entity}
- User Intent: ${context.intent}

User Question: ${userQuery}

Provide a helpful, contextual response tailored to this specific module and entity. Include:
1. Direct answer
2. Code snippet if relevant (JavaScript preferred)
3. Best practices
4. Security considerations if applicable

Keep the response concise and actionable.
`;

      const { data } = await api.integrations.Core.InvokeLLM({
        prompt: contextPrompt,
        add_context_from_internet: false
      });

      return data;
    },
    onSuccess: (data) => {
      setResponse({
        content: data,
        timestamp: new Date().toISOString(),
        rating: null
      });
    },
    onError: () => {
      toast.error('Failed to get AI response');
    }
  });

  const feedbackMutation = useMutation({
    mutationFn: async ({ rating, feedback }) => {
      return await api.entities.AISuggestion.create({
        context,
        query,
        response: response.content,
        rating,
        feedback,
        user_id: (await api.auth.me()).id
      });
    },
    onSuccess: () => {
      toast.success('Feedback recorded');
    }
  });

  const handleSubmit = () => {
    if (!query.trim()) return;
    aiQueryMutation.mutate(query);
  };

  const quickPrompts = [
    'Show me code example',
    'What are best practices?',
    'Security considerations',
    'Common mistakes to avoid',
    'How to optimize performance?'
  ];

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <Card
        className="bg-[#0a1929] border-purple-500/30 max-w-3xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            AI Context Assistant
          </CardTitle>
          <div className="flex gap-2 mt-2">
            <Badge className="bg-blue-500/20 text-blue-400">
              {context.module}
            </Badge>
            <Badge className="bg-green-500/20 text-green-400">
              {context.entity}
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-400">
              {context.intent}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-white text-sm mb-2 block">Ask AI Assistant</label>
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="How do I...?"
              className="bg-white/5 border-purple-500/30 text-white"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleSubmit();
                }
              }}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-white/60 text-xs">Quick prompts:</span>
            {quickPrompts.map((prompt, idx) => (
              <Button
                key={idx}
                size="sm"
                variant="outline"
                onClick={() => {
                  setQuery(prompt);
                  aiQueryMutation.mutate(prompt);
                }}
                className="border-purple-500/30 text-purple-400 text-xs"
              >
                {prompt}
              </Button>
            ))}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={aiQueryMutation.isPending || !query.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-500"
          >
            {aiQueryMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Thinking...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Ask AI
              </>
            )}
          </Button>

          <AnimatePresence>
            {response && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-purple-400" />
                    <p className="text-purple-400 font-semibold text-sm">AI Response</p>
                  </div>
                  <div className="text-white/90 text-sm whitespace-pre-wrap">
                    {response.content}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-white/60 text-xs">Was this helpful?</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setResponse({ ...response, rating: 'positive' });
                        feedbackMutation.mutate({ rating: 'positive', feedback: null });
                      }}
                      className={`border-green-500/30 ${
                        response.rating === 'positive' ? 'bg-green-500/20 text-green-400' : 'text-white'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setResponse({ ...response, rating: 'negative' });
                        feedbackMutation.mutate({ rating: 'negative', feedback: null });
                      }}
                      className={`border-red-500/30 ${
                        response.rating === 'negative' ? 'bg-red-500/20 text-red-400' : 'text-white'
                      }`}
                    >
                      <ThumbsDown className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}