
import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen,
  Sparkles,
  Code,
  Database,
  Zap,
  Search,
  Plus,
  CheckCircle,
  Copy,
  ExternalLink,
  FileText
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

const randomRadius = () => {
  const radiuses = ['rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-3xl'];
  return radiuses[Math.floor(Math.random() * radiuses.length)];
};

const docTypeColors = {
  api_endpoint: 'bg-blue-500/20 text-blue-400',
  entity_model: 'bg-purple-500/20 text-purple-400',
  function: 'bg-green-500/20 text-green-400',
  component: 'bg-orange-500/20 text-orange-400',
  workflow: 'bg-pink-500/20 text-pink-400',
  integration: 'bg-teal-500/20 text-teal-400'
};

export default function AutoDocumentation() {
  const [user, setUser] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: docs = [] } = useQuery({
    queryKey: ['auto-documentation', typeFilter],
    queryFn: async () => {
      const filter = {};
      if (typeFilter !== 'all') filter.doc_type = typeFilter;
      return api.entities.AutoDocumentation.filter(filter, '-generated_at', 100);
    },
    enabled: !!user
  });

  const generateDocMutation = useMutation({
    mutationFn: async (data) => {
      const { data: result } = await api.functions.invoke('autoDocGenerator', data);
      return result.documentation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auto-documentation'] });
      setShowGenerateModal(false);
      toast.success('Documentation generated!');
    }
  });

  const handleGenerate = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    generateDocMutation.mutate({
      docType: formData.get('docType'),
      targetName: formData.get('targetName'),
      sourceCode: formData.get('sourceCode'),
      entitySchema: formData.get('entitySchema') ? JSON.parse(formData.get('entitySchema')) : undefined
    });
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Copied to clipboard!');
  };

  const filteredDocs = docs.filter(doc =>
    !searchTerm || 
    doc.target_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.summary?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gradient-to-br from-[#06162a] to-[#0b213d] p-3 md:p-6 lg:p-8" style={{
      WebkitOverflowScrolling: 'touch'
    }}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <BookOpen className="w-7 h-7 md:w-8 md:h-8 text-[#f4d35e]" />
              AI-Generated <span className="text-[#f4d35e]">Documentation</span>
            </h1>
            <p className="text-white/70 mt-1 text-sm">Automatically documented APIs, entities, and functions</p>
          </div>
          <Button
            onClick={() => setShowGenerateModal(true)}
            className={`bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold ${randomRadius()}`}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Docs
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <Card className={`bg-white/5 border-[#f4d35e]/20 ${randomRadius()}`}>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs mb-1">Total Docs</p>
                <p className="text-xl md:text-2xl font-bold text-white">{docs.length}</p>
              </div>
              <BookOpen className="w-6 h-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className={`bg-white/5 border-[#f4d35e]/20 ${randomRadius()}`}>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs mb-1">API Endpoints</p>
                <p className="text-xl md:text-2xl font-bold text-blue-400">{docs.filter(d => d.doc_type === 'api_endpoint').length}</p>
              </div>
              <Code className="w-6 h-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className={`bg-white/5 border-[#f4d35e]/20 ${randomRadius()}`}>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs mb-1">Data Models</p>
                <p className="text-xl md:text-2xl font-bold text-purple-400">{docs.filter(d => d.doc_type === 'entity_model').length}</p>
              </div>
              <Database className="w-6 h-6 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        <Card className={`bg-white/5 border-[#f4d35e]/20 ${randomRadius()}`}>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs mb-1">Functions</p>
                <p className="text-xl md:text-2xl font-bold text-green-400">{docs.filter(d => d.doc_type === 'function').length}</p>
              </div>
              <Zap className="w-6 h-6 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className={`p-3 md:p-4 bg-white/5 border-cyan-500/20 mb-6 ${randomRadius()}`}>
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
            <Input
              placeholder="Search documentation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 bg-white/5 border-cyan-500/30 text-white text-sm ${randomRadius()}`}
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className={`w-full md:w-48 bg-white/5 border-cyan-500/30 text-white text-sm ${randomRadius()}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={`bg-[#0a1929] border-cyan-500/20 text-white ${randomRadius()}`}>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="api_endpoint">API Endpoints</SelectItem>
              <SelectItem value="entity_model">Data Models</SelectItem>
              <SelectItem value="function">Functions</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Documentation Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card
              className={`bg-white/5 border-cyan-500/20 hover:border-cyan-500/40 cursor-pointer transition-all h-full ${randomRadius()}`}
              onClick={() => setSelectedDoc(doc)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <Badge className={`${docTypeColors[doc.doc_type]} ${randomRadius()}`}>
                    {doc.doc_type.replace('_', ' ')}
                  </Badge>
                  {doc.reviewed && (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  )}
                </div>
                <CardTitle className="text-white text-base md:text-lg">{doc.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/70 text-sm line-clamp-3 mb-3">{doc.summary}</p>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/50">
                    {new Date(doc.generated_at).toLocaleDateString()}
                  </span>
                  {doc.accuracy_score && (
                    <Badge variant="outline" className={`text-xs ${randomRadius()}`}>
                      {(doc.accuracy_score * 100).toFixed(0)}% accurate
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Doc Detail Modal */}
      <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
        <DialogContent className={`bg-[#0a1929] border-cyan-500/30 max-w-4xl max-h-[90vh] overflow-y-auto ${randomRadius()}`}>
          {selectedDoc && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-white">{selectedDoc.title}</DialogTitle>
                  <Badge className={`${docTypeColors[selectedDoc.doc_type]} ${randomRadius()}`}>
                    {selectedDoc.doc_type.replace('_', ' ')}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <div className="p-3 bg-white/5 rounded">
                  <p className="text-white/80">{selectedDoc.summary}</p>
                </div>

                {selectedDoc.description && (
                  <div>
                    <h4 className="text-white font-semibold mb-2">Description</h4>
                    <p className="text-white/70 text-sm">{selectedDoc.description}</p>
                  </div>
                )}

                {selectedDoc.parameters && selectedDoc.parameters.length > 0 && (
                  <div>
                    <h4 className="text-white font-semibold mb-2">Parameters</h4>
                    <div className="space-y-2">
                      {selectedDoc.parameters.map((param, idx) => (
                        <div key={idx} className={`p-3 bg-white/5 rounded border border-cyan-500/20 ${randomRadius()}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <code className="text-cyan-400">{param.name}</code>
                                <Badge variant="outline" className={`text-xs ${randomRadius()}`}>{param.type}</Badge>
                                {param.required && (
                                  <Badge className={`bg-red-500/20 text-red-400 text-xs ${randomRadius()}`}>required</Badge>
                                )}
                              </div>
                              <p className="text-white/70 text-sm">{param.description}</p>
                              {param.example && (
                                <code className="text-green-400 text-xs block mt-1">
                                  Example: {param.example}
                                </code>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDoc.examples && selectedDoc.examples.length > 0 && (
                  <div>
                    <h4 className="text-white font-semibold mb-2">Examples</h4>
                    <div className="space-y-3">
                      {selectedDoc.examples.map((example, idx) => (
                        <div key={idx} className="relative">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-white/80 text-sm">{example.title}</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCopyCode(example.code)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <pre className={`bg-[#0a1929] p-3 rounded overflow-x-auto ${randomRadius()}`}>
                            <code className="text-cyan-400 text-xs">{example.code}</code>
                          </pre>
                          {example.description && (
                            <p className="text-white/60 text-xs mt-1">{example.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDoc.best_practices && selectedDoc.best_practices.length > 0 && (
                  <div className={`p-3 bg-green-500/10 rounded border border-green-500/30 ${randomRadius()}`}>
                    <h4 className="text-green-400 font-semibold text-sm mb-2">✅ Best Practices</h4>
                    <ul className="space-y-1">
                      {selectedDoc.best_practices.map((practice, idx) => (
                        <li key={idx} className="text-white/80 text-sm">• {practice}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedDoc.warnings && selectedDoc.warnings.length > 0 && (
                  <div className={`p-3 bg-red-500/10 rounded border border-red-500/30 ${randomRadius()}`}>
                    <h4 className="text-red-400 font-semibold text-sm mb-2">⚠️ Warnings</h4>
                    <ul className="space-y-1">
                      {selectedDoc.warnings.map((warning, idx) => (
                        <li key={idx} className="text-white/80 text-sm">• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSelectedDoc(null)}
                  className={`border-cyan-500/30 text-white hover:bg-white/10 ${randomRadius()}`}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Generate Modal */}
      <Dialog open={showGenerateModal} onOpenChange={setShowGenerateModal}>
        <DialogContent className={`bg-[#0a1929] border-cyan-500/30 max-w-2xl ${randomRadius()}`}>
          <DialogHeader>
            <DialogTitle className="text-white">Generate Documentation</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleGenerate}>
            <div className="space-y-4">
              <div>
                <Label className="text-white">Documentation Type</Label>
                <Select name="docType" required>
                  <SelectTrigger className={`bg-white/5 border-cyan-500/30 text-white ${randomRadius()}`}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className={`bg-[#0a1929] border-cyan-500/20 text-white ${randomRadius()}`}>
                    <SelectItem value="api_endpoint">API Endpoint</SelectItem>
                    <SelectItem value="entity_model">Entity Model</SelectItem>
                    <SelectItem value="function">Backend Function</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white">Target Name *</Label>
                <Input
                  name="targetName"
                  placeholder="e.g., scoreLeadAI, Lead, /api/quotes"
                  required
                  className={`bg-white/5 border-cyan-500/30 text-white ${randomRadius()}`}
                />
              </div>

              <div>
                <Label className="text-white">Source Code (optional)</Label>
                <Textarea
                  name="sourceCode"
                  placeholder="Paste function code or leave empty for AI to infer..."
                  rows={8}
                  className={`bg-white/5 border-cyan-500/30 text-white font-mono text-xs ${randomRadius()}`}
                />
              </div>

              <div>
                <Label className="text-white">Entity Schema (for data models, optional)</Label>
                <Textarea
                  name="entitySchema"
                  placeholder='{"properties": {...}}'
                  rows={4}
                  className={`bg-white/5 border-cyan-500/30 text-white font-mono text-xs ${randomRadius()}`}
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowGenerateModal(false)}
                className={`border-cyan-500/30 text-white hover:bg-white/10 ${randomRadius()}`}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={generateDocMutation.isPending}
                className={`bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold ${randomRadius()}`}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate with AI
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
