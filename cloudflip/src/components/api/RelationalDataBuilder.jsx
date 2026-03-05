import React, { useState } from 'react';
import { api } from '@/api/apiClient';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Database,
  GitBranch,
  Zap,
  Loader2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

export default function RelationalDataBuilder() {
  const [scenario, setScenario] = useState('');
  const [density, setDensity] = useState('balanced');
  const [recordCount, setRecordCount] = useState('100');

  const scenarios = [
    { id: 'startup', name: 'New Startup', desc: '15 Clients, Light Activity' },
    { id: 'ecommerce', name: 'E-commerce Store', desc: 'High Volume Orders & Products' },
    { id: 'enterprise', name: 'Enterprise B2B', desc: 'Complex Billing & Contracts' },
    { id: 'service', name: 'Service Business', desc: 'Jobs, Appointments, Reviews' },
    { id: 'saas', name: 'SaaS Company', desc: 'Subscriptions, Usage, Support Tickets' }
  ];

  const densityOptions = [
    { value: 'sparse', label: 'Sparse', desc: 'Many missing fields' },
    { value: 'balanced', label: 'Balanced', desc: 'Normalized dataset' },
    { value: 'dense', label: 'Dense', desc: 'Fully populated' },
    { value: 'noisy', label: 'Noisy', desc: 'Duplicates & anomalies' },
    { value: 'edge', label: 'Edge Cases', desc: 'Extreme test values' }
  ];

  const generateMutation = useMutation({
    mutationFn: async () => {
      const user = await api.auth.me();
      
      const { data } = await api.functions.invoke('generateRelationalMockData', {
        scenario,
        density,
        recordCount: parseInt(recordCount),
        orgId: user.data.current_org_id
      });

      return data;
    },
    onSuccess: (data) => {
      toast.success(`Generated ${data.totalRecords} related records across ${data.entities.length} entities!`);
    },
    onError: () => {
      toast.error('Failed to generate relational data');
    }
  });

  return (
    <Card className="bg-[#0a1929]/60 backdrop-blur border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-purple-400" />
          Relational Data Builder
        </CardTitle>
        <p className="text-white/60 text-sm">
          Generate interconnected datasets with realistic relationships
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Scenario Selection */}
        <div>
          <Label className="text-white mb-3 block">Business Scenario</Label>
          <div className="grid md:grid-cols-2 gap-3">
            {scenarios.map((s) => (
              <button
                key={s.id}
                onClick={() => setScenario(s.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  scenario === s.id
                    ? 'bg-purple-500/20 border-purple-500'
                    : 'bg-white/5 border-white/10 hover:border-purple-500/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white font-semibold">{s.name}</p>
                    <p className="text-white/60 text-xs mt-1">{s.desc}</p>
                  </div>
                  {scenario === s.id && <CheckCircle className="w-5 h-5 text-purple-400" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Data Density */}
        <div>
          <Label className="text-white">Data Density</Label>
          <Select value={density} onValueChange={setDensity}>
            <SelectTrigger className="bg-white/5 border-purple-500/30 text-white mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {densityOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <div className="flex items-center gap-2">
                    <span>{opt.label}</span>
                    <span className="text-xs text-white/60">- {opt.desc}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Record Count */}
        <div>
          <Label className="text-white">Total Records to Generate</Label>
          <Select value={recordCount} onValueChange={setRecordCount}>
            <SelectTrigger className="bg-white/5 border-purple-500/30 text-white mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">50 Records</SelectItem>
              <SelectItem value="100">100 Records</SelectItem>
              <SelectItem value="500">500 Records</SelectItem>
              <SelectItem value="1000">1,000 Records</SelectItem>
              <SelectItem value="5000">5,000 Records (Elite)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Preview */}
        {scenario && (
          <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <p className="text-purple-400 text-sm font-semibold mb-2">Will Generate:</p>
            <ul className="space-y-1 text-white/70 text-sm">
              <li>• Clients with related Contacts</li>
              <li>• Leads with Activity History</li>
              <li>• Quotes linked to Clients</li>
              <li>• Invoices with Line Items</li>
              <li>• Jobs with Tasks & Assignments</li>
            </ul>
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={() => generateMutation.mutate()}
          disabled={!scenario || generateMutation.isPending}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-500"
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Relational Data...
            </>
          ) : (
            <>
              <Database className="w-4 h-4 mr-2" />
              Generate {recordCount} Related Records
            </>
          )}
        </Button>

        {/* Warning */}
        <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
          <p className="text-yellow-400 text-xs">
            This will create interconnected test data. Use in sandbox/dev environments only.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}