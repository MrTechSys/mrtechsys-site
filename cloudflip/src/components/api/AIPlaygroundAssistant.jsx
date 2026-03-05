import React, { useState } from 'react';
import { api } from '@/api/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Send, Loader2, Copy, Code } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export default function AIPlaygroundAssistant({ user, documentation }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState([
    {
      role: 'assistant',
      content: `👋 Hi! I'm your API Playground AI assistant. I can help you:

• Explore API endpoints and methods
• Generate code snippets for any operation
• Explain entity relationships and data models
• Debug webhook issues
• Suggest best practices for API integration

Try asking me questions like:
- "How do I create a quote with line items?"
- "Show me how to filter leads by score"
- "Generate Python code to list all compliance controls"
- "How do I upload evidence for a SOC 2 control?"

What would you like to know?`
    }
  ]);

  const examplePrompts = [
    "How do I create a lead and score it with AI?",
    "Show me code to list all active compliance controls",
    "Explain how to upload evidence for SOC 2",
    "Generate a webhook handler for new leads"
  ];

  const handleSend = async () => {
    if (!prompt.trim()) return;

    const userMessage = { role: 'user', content: prompt };
    setConversation([...conversation, userMessage]);
    setPrompt('');
    setLoading(true);

    try {
      const response = await api.integrations.Core.InvokeLLM({
        prompt: `You are an API documentation expert helping developers use the CloudFlip API. 

Available Entities: ${JSON.stringify(documentation.entities.map(e => e.name))}
Available Functions: ${JSON.stringify(documentation.functions.map(f => f.name))}

Entity Documentation:
${JSON.stringify(documentation.entities, null, 2)}

Function Documentation:
${JSON.stringify(documentation.functions, null, 2)}

User Question: ${prompt}

Provide a helpful, concise answer with:
1. Clear explanation
2. Code examples when relevant
3. Best practices
4. Links to relevant entities/functions

Format your response in markdown.`,
        add_context_from_internet: false
      });

      const assistantMessage = { role: 'assistant', content: response };
      setConversation([...conversation, userMessage, assistantMessage]);
    } catch (error) {
      toast.error('Failed to get response');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example) => {
    setPrompt(example);
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Chat Panel */}
      <div className="lg:col-span-2">
        <Card className="bg-white/5 border-[#f4d35e]/20 h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#f4d35e]" />
              AI Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {conversation.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-[#f4d35e] text-[#0a1929]'
                        : 'bg-white/10 text-white'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <ReactMarkdown
                        className="prose prose-sm prose-invert max-w-none"
                        components={{
                          code: ({ inline, className, children, ...props }) => {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <div className="relative group">
                                <pre className="bg-[#0a1929] text-[#3cf7d4] rounded-lg p-3 overflow-x-auto my-2">
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                </pre>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 h-6 w-6"
                                  onClick={() => copyCode(String(children).replace(/\n$/, ''))}
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <code className="px-1 py-0.5 rounded bg-white/20 text-[#3cf7d4] text-xs">
                                {children}
                              </code>
                            );
                          },
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 rounded-lg p-4">
                    <Loader2 className="w-5 h-5 text-[#f4d35e] animate-spin" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask me anything about the API..."
                rows={2}
                className="bg-white/5 border-[#f4d35e]/30 text-white placeholder:text-white/40"
              />
              <Button
                onClick={handleSend}
                disabled={loading || !prompt.trim()}
                className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Examples & Quick Actions */}
      <div className="space-y-6">
        <Card className="bg-white/5 border-[#f4d35e]/20">
          <CardHeader>
            <CardTitle className="text-white text-sm">Example Prompts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="w-full text-left p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-[#f4d35e]/10 hover:border-[#f4d35e]/30 transition-all text-sm text-white"
              >
                {example}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-[#f4d35e]/20">
          <CardHeader>
            <CardTitle className="text-white text-sm">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm">Entities</span>
              <Badge className="bg-[#f4d35e]/20 text-[#f4d35e]">
                {documentation.entities.length}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm">Functions</span>
              <Badge className="bg-[#f4d35e]/20 text-[#f4d35e]">
                {documentation.functions.length}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm">SOC 2 Entities</span>
              <Badge className="bg-green-500/20 text-green-400">
                4
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}