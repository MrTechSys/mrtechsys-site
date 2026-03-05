import React, { useState } from 'react';
import { api } from '@/api/apiClient';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Database,
  Download,
  Upload,
  Loader2,
  CheckCircle,
  GitBranch,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import RelationalDataBuilder from './RelationalDataBuilder';

const availableEntities = [
  'Lead', 'Contact', 'Client', 'Quote', 'Invoice', 
  'Job', 'Task', 'Deal', 'Ticket', 'Activity'
];

const dataPatterns = [
  { value: 'normal', label: 'Normal Distribution', desc: 'Realistic data patterns' },
  { value: 'edge', label: 'Edge Cases', desc: 'Extreme values & unusual patterns' },
  { value: 'stress', label: 'Stress Test', desc: 'High volume data' }
];

export default function MockDataGenerator() {
  const [entity, setEntity] = useState('Lead');
  const [recordCount, setRecordCount] = useState('50');
  const [pattern, setPattern] = useState('normal');
  const [format, setFormat] = useState('json');
  const [generatedData, setGeneratedData] = useState(null);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.functions.invoke('generateMockData', {
        entity,
        count: parseInt(recordCount),
        pattern
      });
      return data;
    },
    onSuccess: (data) => {
      setGeneratedData(data.records);
      toast.success(`Generated ${data.records.length} ${entity} records`);
    },
    onError: () => {
      toast.error('Failed to generate mock data');
    }
  });

  const handleExport = () => {
    if (!generatedData) return;

    let content, filename, type;
    if (format === 'json') {
      content = JSON.stringify(generatedData, null, 2);
      filename = `${entity.toLowerCase()}-mock-data.json`;
      type = 'application/json';
    } else {
      const headers = Object.keys(generatedData[0] || {}).join(',');
      const rows = generatedData.map(r => Object.values(r).map(v => `"${v}"`).join(',')).join('\n');
      content = `${headers}\n${rows}`;
      filename = `${entity.toLowerCase()}-mock-data.csv`;
      type = 'text/csv';
    }

    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    toast.success('Data exported');
  };

  const handleInject = async () => {
    if (!generatedData) return;

    try {
      const user = await api.auth.me();
      const dataWithOrg = generatedData.map(record => ({
        ...record,
        org_id: user.data.current_org_id
      }));

      await api.entities[entity].bulkCreate(dataWithOrg);
      toast.success(`Injected ${generatedData.length} records into ${entity}`);
      setGeneratedData(null);
    } catch (error) {
      toast.error('Failed to inject data: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="simple" className="space-y-6">
        <TabsList className="bg-white/5 border border-amber-500/20 p-1">
          <TabsTrigger value="simple" className="text-xs md:text-sm data-[state=active]:bg-amber-500/20">
            <Database className="w-4 h-4 mr-2" />
            Simple Generator
          </TabsTrigger>
          <TabsTrigger value="relational" className="text-xs md:text-sm data-[state=active]:bg-purple-500/20">
            <GitBranch className="w-4 h-4 mr-2" />
            Relational Builder
          </TabsTrigger>
        </TabsList>

        <TabsContent value="simple">
          <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-amber-400" />
                Mock Data Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Entity Type</Label>
                  <Select value={entity} onValueChange={setEntity}>
                    <SelectTrigger className="bg-white/5 border-amber-500/30 text-white mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableEntities.map(e => (
                        <SelectItem key={e} value={e}>{e}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">Record Count</Label>
                  <Select value={recordCount} onValueChange={setRecordCount}>
                    <SelectTrigger className="bg-white/5 border-amber-500/30 text-white mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="500">500</SelectItem>
                      <SelectItem value="1000">1,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">Data Pattern</Label>
                  <Select value={pattern} onValueChange={setPattern}>
                    <SelectTrigger className="bg-white/5 border-amber-500/30 text-white mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dataPatterns.map(p => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label} - {p.desc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">Export Format</Label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger className="bg-white/5 border-amber-500/30 text-white mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
                className="w-full bg-gradient-to-r from-amber-600 to-amber-500"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Generate {recordCount} Records
                  </>
                )}
              </Button>

              {generatedData && (
                <div className="space-y-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <p className="text-green-400 font-semibold">
                      Generated {generatedData.length} {entity} records
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleExport}
                      className="bg-blue-600"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export {format.toUpperCase()}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleInject}
                      variant="outline"
                      className="border-green-500/30 text-green-400"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Inject to Database
                    </Button>
                  </div>

                  <pre className="bg-black/40 border border-amber-500/20 rounded p-3 text-amber-400 text-xs overflow-x-auto max-h-48">
                    {JSON.stringify(generatedData.slice(0, 3), null, 2)}
                    {generatedData.length > 3 && '\n... and more'}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relational">
          <RelationalDataBuilder />
        </TabsContent>
      </Tabs>
    </div>
  );
}