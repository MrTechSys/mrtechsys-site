import React, { useState } from 'react';
import { api } from '@/api/apiClient';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sparkles,
  Code,
  Copy,
  Check,
  Loader2,
  Zap,
  Shield,
  Play,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const languages = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'go', label: 'Go' }
];

const codePatterns = [
  { value: 'basic', label: 'Basic', desc: 'Simple, minimal code' },
  { value: 'async', label: 'Async/Await', desc: 'Asynchronous patterns' },
  { value: 'error_handling', label: 'Error Handling', desc: 'With try-catch' },
  { value: 'pagination', label: 'Pagination', desc: 'With paging support' },
  { value: 'production', label: 'Production', desc: 'Full featured code' }
];

const entities = ['Lead', 'Contact', 'Deal', 'Quote', 'Invoice', 'Ticket', 'Task'];
const operations = ['create', 'read', 'update', 'delete', 'list', 'filter'];

export default function AICodeAssistant({ defaultEntity, defaultOperation }) {
  const [prompt, setPrompt] = useState('');
  const [entity, setEntity] = useState(defaultEntity || 'Lead');
  const [operation, setOperation] = useState(defaultOperation || 'create');
  const [language, setLanguage] = useState('javascript');
  const [pattern, setPattern] = useState('basic');
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [executionResult, setExecutionResult] = useState(null);
  const [showExecuteConfirm, setShowExecuteConfirm] = useState(false);

  const generateCodeMutation = useMutation({
    mutationFn: async () => {
      const fullPrompt = prompt || `Generate ${language} code to ${operation} a ${entity}`;
      
      const { data } = await api.integrations.Core.InvokeLLM({
        prompt: `You are a code generation assistant. Generate ${language} code for the following request:

Request: ${fullPrompt}
Entity: ${entity}
Operation: ${operation}
Pattern: ${pattern}

Requirements:
- Generate clean, well-commented code
- Use CloudFlip SDK patterns: api.entities.${entity}.${operation}()
- ${pattern === 'async' ? 'Use async/await' : ''}
- ${pattern === 'error_handling' ? 'Include comprehensive error handling' : ''}
- ${pattern === 'pagination' ? 'Include pagination logic' : ''}
- ${pattern === 'production' ? 'Include logging, validation, and error handling' : ''}
- Return ONLY the code without explanation

Output format:
\`\`\`${language}
[generated code here]
\`\`\``,
        add_context_from_internet: false
      });

      return data;
    },
    onSuccess: (data) => {
      const codeMatch = data.match(/```[\w]*\n([\s\S]*?)```/);
      const code = codeMatch ? codeMatch[1] : data;
      setGeneratedCode(code);
      generateSuggestions(code);
      toast.success('Code generated');
    },
    onError: () => {
      toast.error('Failed to generate code');
    }
  });

  const generateSuggestions = (code) => {
    const suggestions = [];
    
    if (!code.includes('try') && !code.includes('catch')) {
      suggestions.push({ type: 'warning', text: 'Consider adding error handling' });
    }
    if (!code.includes('async') && operation !== 'delete') {
      suggestions.push({ type: 'info', text: 'API calls should be asynchronous' });
    }
    if (code.length < 100) {
      suggestions.push({ type: 'info', text: 'Code might be too minimal for production' });
    }
    if (!code.includes('org_id') && ['create', 'update'].includes(operation)) {
      suggestions.push({ type: 'warning', text: 'Remember to include org_id for multi-tenancy' });
    }

    setSuggestions(suggestions);
  };

  const refineCodeMutation = useMutation({
    mutationFn: async (refinement) => {
      const { data } = await api.integrations.Core.InvokeLLM({
        prompt: `Refine the following ${language} code based on this request: "${refinement}"

Current code:
\`\`\`${language}
${generatedCode}
\`\`\`

Return ONLY the refined code without explanation in the same format.`,
        add_context_from_internet: false
      });

      return data;
    },
    onSuccess: (data) => {
      const codeMatch = data.match(/```[\w]*\n([\s\S]*?)```/);
      const code = codeMatch ? codeMatch[1] : data;
      setGeneratedCode(code);
      generateSuggestions(code);
      toast.success('Code refined');
    }
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecute = async () => {
    if (language !== 'javascript') {
      toast.error('Execution only supported for JavaScript');
      return;
    }

    try {
      const result = await eval(`(async () => { ${generatedCode} })()`);
      setExecutionResult({ success: true, data: result });
      toast.success('Code executed successfully');
    } catch (error) {
      setExecutionResult({ success: false, error: error.message });
      toast.error('Execution failed: ' + error.message);
    }
    setShowExecuteConfirm(false);
  };

  const quickPrompts = [
    'Create a lead with validation',
    'Update deal stage with notification',
    'Fetch recent tickets with pagination',
    'Bulk create contacts from array',
    'Filter leads by score and status'
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            AI Code Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-white text-sm mb-2 block">Entity</label>
              <Select value={entity} onValueChange={setEntity}>
                <SelectTrigger className="bg-white/5 border-purple-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {entities.map(e => (
                    <SelectItem key={e} value={e}>{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-white text-sm mb-2 block">Operation</label>
              <Select value={operation} onValueChange={setOperation}>
                <SelectTrigger className="bg-white/5 border-purple-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {operations.map(op => (
                    <SelectItem key={op} value={op}>{op}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-white text-sm mb-2 block">Language</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="bg-white/5 border-purple-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(lang => (
                    <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-white text-sm mb-2 block">Pattern</label>
              <Select value={pattern} onValueChange={setPattern}>
                <SelectTrigger className="bg-white/5 border-purple-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {codePatterns.map(p => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label} - {p.desc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-white text-sm mb-2 block">Custom Prompt (Optional)</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe any specific requirements..."
              className="bg-white/5 border-purple-500/30 text-white"
              rows={3}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-white/60 text-sm">Quick prompts:</span>
            {quickPrompts.map((quick, idx) => (
              <Button
                key={idx}
                size="sm"
                variant="outline"
                onClick={() => setPrompt(quick)}
                className="border-purple-500/30 text-purple-400"
              >
                {quick}
              </Button>
            ))}
          </div>

          <Button
            onClick={() => generateCodeMutation.mutate()}
            disabled={generateCodeMutation.isPending}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-500"
          >
            {generateCodeMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Code
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <AnimatePresence>
        {generatedCode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="bg-white/5 border-green-500/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Code className="w-5 h-5 text-green-400" />
                    Generated Code
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopy}
                      className="border-green-500/30 text-green-400"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    {language === 'javascript' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowExecuteConfirm(true)}
                        className="border-amber-500/30 text-amber-400"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Execute
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <pre className="bg-black/40 p-4 rounded-lg text-green-400 text-sm overflow-x-auto">
                  {generatedCode}
                </pre>

                {suggestions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-white/60 text-sm font-semibold">AI Suggestions:</p>
                    {suggestions.map((suggestion, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-2 p-2 rounded-lg ${
                          suggestion.type === 'warning' 
                            ? 'bg-yellow-500/10 border border-yellow-500/30'
                            : 'bg-blue-500/10 border border-blue-500/30'
                        }`}
                      >
                        {suggestion.type === 'warning' ? (
                          <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Zap className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                        )}
                        <p className="text-white/80 text-sm">{suggestion.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    placeholder="Refine code: 'Add error handling', 'Make it shorter', etc."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value) {
                        refineCodeMutation.mutate(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="bg-white/5 border-purple-500/30 text-white"
                  />
                  <Button
                    onClick={(e) => {
                      const input = e.target.previousSibling;
                      if (input.value) {
                        refineCodeMutation.mutate(input.value);
                        input.value = '';
                      }
                    }}
                    disabled={refineCodeMutation.isPending}
                    className="bg-gradient-to-r from-purple-600 to-purple-500"
                  >
                    {refineCodeMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>Refine</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {showExecuteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowExecuteConfirm(false)}
        >
          <Card
            className="bg-[#0a1929] border-amber-500/30 max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                Confirm Execution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-white/80">
                This will execute the generated code in your environment. Make sure you've reviewed it carefully.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowExecuteConfirm(false)}
                  className="flex-1 border-white/20 text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleExecute}
                  className="flex-1 bg-gradient-to-r from-amber-600 to-amber-500"
                >
                  Execute Safely
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {executionResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className={`${
            executionResult.success 
              ? 'bg-green-500/10 border-green-500/30' 
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            <CardHeader>
              <CardTitle className={`${
                executionResult.success ? 'text-green-400' : 'text-red-400'
              } flex items-center gap-2`}>
                {executionResult.success ? (
                  <><Check className="w-5 h-5" /> Execution Result</>
                ) : (
                  <><AlertTriangle className="w-5 h-5" /> Execution Error</>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-black/40 p-4 rounded-lg text-white text-sm overflow-x-auto">
                {JSON.stringify(executionResult.success ? executionResult.data : executionResult.error, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}