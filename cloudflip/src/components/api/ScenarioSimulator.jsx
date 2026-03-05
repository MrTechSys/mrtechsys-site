import React, { useState } from 'react';
import { api } from '@/api/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Sparkles,
  Clock,
  ArrowRight,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function ScenarioSimulator() {
  const [scenario, setScenario] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);

  const exampleScenarios = [
    {
      title: "Lead Nurture Sequence",
      description: "A new lead signs up for a newsletter, gets a welcome email, then a sales rep updates their status to 'Qualified' after a call.",
      scenario: "Create a new lead named 'Sarah Johnson' with email sarah@example.com. Send her a welcome email. Wait 2 seconds. Update her status to 'contacted'. Wait 1 second. Update her status to 'qualified'."
    },
    {
      title: "Quote to Invoice Flow",
      description: "Generate a quote for a client, client accepts it, convert to invoice, then process payment.",
      scenario: "Create a quote for client with ID {{clientId}} for $5000. Update the quote status to 'accepted'. Create an invoice from the quote. Mark the invoice as paid."
    },
    {
      title: "Job Scheduling Workflow",
      description: "Schedule a job, assign team members, create tasks, and track completion.",
      scenario: "Create a new job titled 'Office Network Setup' for tomorrow. Assign it to 2 team members. Create 3 tasks: 'Configure router', 'Install switches', 'Test connectivity'. Mark first task as completed."
    }
  ];

  const runScenario = async () => {
    if (!scenario.trim()) {
      toast.error('Please enter a scenario description');
      return;
    }

    setIsRunning(true);
    setResults(null);

    try {
      const { data } = await api.functions.invoke('scenarioSimulator', {
        scenario: scenario.trim()
      });

      if (data.success) {
        setResults(data);
        toast.success(`Scenario completed: ${data.success_count}/${data.total_steps} steps successful`);
      } else {
        toast.error('Scenario simulation failed');
      }
    } catch (error) {
      toast.error('Failed to run scenario');
      console.error('Scenario error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const loadExample = (example) => {
    setScenario(example.scenario);
    setResults(null);
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="bg-white/5 border-[#f4d35e]/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#f4d35e]" />
            Scenario Simulation Engine
          </CardTitle>
          <p className="text-white/60 text-sm">
            Describe a multi-step business workflow in natural language, and the AI will execute it for you.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-white">Scenario Description</Label>
            <Textarea
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              placeholder="e.g., Create a new lead named John Doe with email john@example.com. Send him a welcome email. Update his status to contacted after 2 seconds..."
              rows={6}
              className="bg-white/5 border-[#f4d35e]/30 text-white placeholder:text-white/40 mt-2"
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={runScenario}
              disabled={isRunning}
              className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Simulating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Scenario
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setScenario('');
                setResults(null);
              }}
              className="border-[#f4d35e]/30 text-white hover:bg-white/10"
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Example Scenarios */}
      <div className="grid md:grid-cols-3 gap-4">
        {exampleScenarios.map((example, idx) => (
          <Card
            key={idx}
            className="bg-white/5 border-[#f4d35e]/20 hover:border-[#f4d35e]/40 cursor-pointer transition-all"
            onClick={() => loadExample(example)}
          >
            <CardHeader>
              <CardTitle className="text-white text-sm">{example.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/60 text-xs">{example.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Results Section */}
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="bg-white/5 border-[#f4d35e]/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Simulation Results</CardTitle>
                  <Badge className={`${
                    results.failure_count === 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {results.success_count}/{results.total_steps} Successful
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4 p-4 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-white/60 text-xs mb-1">Total Steps</p>
                    <p className="text-2xl font-bold text-white">{results.total_steps}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs mb-1">Success Rate</p>
                    <p className="text-2xl font-bold text-green-400">
                      {((results.success_count / results.total_steps) * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs mb-1">Duration</p>
                    <p className="text-2xl font-bold text-blue-400">
                      {results.results.length}s
                    </p>
                  </div>
                </div>

                {/* Step-by-Step Results */}
                <div className="space-y-3">
                  {results.results.map((step, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`p-4 rounded-lg border ${
                        step.status === 'success' 
                          ? 'bg-green-500/10 border-green-500/30' 
                          : 'bg-red-500/10 border-red-500/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 p-1 rounded ${
                          step.status === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'
                        }`}>
                          {step.status === 'success' ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-white/10 text-white text-xs">
                              Step {step.step_number}
                            </Badge>
                            <Badge className={`text-xs ${
                              step.action === 'create' ? 'bg-blue-500/20 text-blue-400' :
                              step.action === 'update' ? 'bg-yellow-500/20 text-yellow-400' :
                              step.action === 'delete' ? 'bg-red-500/20 text-red-400' :
                              'bg-purple-500/20 text-purple-400'
                            }`}>
                              {step.action} {step.entity}
                            </Badge>
                          </div>
                          
                          <p className="text-white font-medium text-sm">{step.description}</p>
                          
                          {step.affected_records && (
                            <div className="flex items-center gap-2 mt-2">
                              <Database className="w-3 h-3 text-blue-400" />
                              <span className="text-white/60 text-xs">
                                {step.affected_records} record(s) affected
                              </span>
                            </div>
                          )}
                          
                          {step.error && (
                            <div className="mt-2 p-2 bg-red-500/10 rounded border border-red-500/20">
                              <p className="text-red-400 text-xs">{step.error}</p>
                            </div>
                          )}

                          {step.response && step.status === 'success' && (
                            <details className="mt-2">
                              <summary className="text-blue-400 text-xs cursor-pointer hover:text-blue-300">
                                View Response
                              </summary>
                              <pre className="mt-2 p-2 bg-black/20 rounded text-xs text-white/70 overflow-x-auto max-h-40 overflow-y-auto">
                                {JSON.stringify(step.response, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>

                        {idx < results.results.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-white/30 mt-6" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}