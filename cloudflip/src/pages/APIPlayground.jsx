import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Code,
  Play,
  Copy,
  Check,
  AlertCircle,
  Sparkles,
  Zap,
  Database,
  Shield,
  Webhook,
  Globe,
  Smartphone
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AIPlaygroundAssistant from "../components/api/AIPlaygroundAssistant";
import ScenarioSimulator from "../components/api/ScenarioSimulator";
import DataFlowVisualizer from "../components/api/DataFlowVisualizer";
import ComplianceAuditor from "../components/api/ComplianceAuditor";
import WebhookTester from "../components/api/WebhookTester";
import PWAFeatureTester from "../components/api/PWAFeatureTester";
import CodeSnippetGenerator from "../components/api/CodeSnippetGenerator";
import MockDataGenerator from "../components/api/MockDataGenerator";

const complianceEntities = [
  "ComplianceControl",
  "ComplianceMetric",
  "ComplianceAuditLog",
  "EvidenceItem"
];

const allEntities = [
  "Lead",
  "Contact",
  "Quote",
  "Deal",
  "Client",
  "Invoice",
  "Task",
  "Job",
  ...complianceEntities
];

export default function APIPlayground() {
  const [selectedEntity, setSelectedEntity] = useState("Lead");
  const [operation, setOperation] = useState("list");
  const [requestBody, setRequestBody] = useState("{}");
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("endpoint");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await api.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };
    loadUser();
  }, []);

  const handleExecute = async () => {
    setIsLoading(true);
    setResponse(null);

    try {
      let result;
      const entityAPI = api.entities[selectedEntity];

      if (operation === "list") {
        result = await entityAPI.list();
      } else if (operation === "create") {
        const data = JSON.parse(requestBody);
        result = await entityAPI.create(data);
      } else if (operation === "filter") {
        const filter = JSON.parse(requestBody);
        result = await entityAPI.filter(filter);
      } else if (operation === "schema") {
        result = await entityAPI.schema();
      }

      setResponse({
        status: 200,
        data: result,
        timestamp: new Date().toISOString(),
        entityType: selectedEntity,
        action: operation
      });
      toast.success("API call successful!");
    } catch (error) {
      setResponse({
        status: error.response?.status || 500,
        error: error.message,
        details: error.response?.data,
        timestamp: new Date().toISOString()
      });
      toast.error("API call failed");
    } finally {
      setIsLoading(false);
    }
  };

  const generateCode = () => {
    if (operation === "list") {
      return `const ${selectedEntity.toLowerCase()}s = await api.entities.${selectedEntity}.list();`;
    } else if (operation === "create") {
      return `const new${selectedEntity} = await api.entities.${selectedEntity}.create(${requestBody});`;
    } else if (operation === "filter") {
      return `const filtered${selectedEntity}s = await api.entities.${selectedEntity}.filter(${requestBody});`;
    } else if (operation === "schema") {
      return `const ${selectedEntity.toLowerCase()}Schema = await api.entities.${selectedEntity}.schema();`;
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateCode());
    setCopiedCode(true);
    toast.success("Code copied!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const documentation = {
    entities: allEntities.map(e => ({
      name: e,
      operations: ['list', 'create', 'filter', 'update', 'delete', 'schema']
    })),
    functions: ['scenarioSimulator', 'complianceAuditor', 'dataflowIntegrityCheck']
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Code className="w-8 h-8 text-cyan-400" />
          API <span className="text-amber-400">Playground</span>
        </h1>
        <p className="text-white/60">Advanced API testing with AI assistance, compliance auditing, and workflow simulation</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/5 border border-cyan-500/20 p-1">
          <TabsTrigger value="endpoint" className="text-xs md:text-sm data-[state=active]:bg-cyan-500/20">
            <Zap className="w-4 h-4 mr-2" />
            Endpoint Tester
          </TabsTrigger>
          <TabsTrigger value="ai" className="text-xs md:text-sm data-[state=active]:bg-purple-500/20">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Assistant
          </TabsTrigger>
          <TabsTrigger value="compliance" className="text-xs md:text-sm data-[state=active]:bg-green-500/20">
            <Shield className="w-4 h-4 mr-2" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="text-xs md:text-sm data-[state=active]:bg-amber-500/20">
            <Webhook className="w-4 h-4 mr-2" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="pwa" className="text-xs md:text-sm data-[state=active]:bg-blue-500/20">
            <Smartphone className="w-4 h-4 mr-2" />
            PWA Features
          </TabsTrigger>
          <TabsTrigger value="mock-data" className="text-xs md:text-sm data-[state=active]:bg-amber-500/20">
            <Database className="w-4 h-4 mr-2" />
            Mock Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="endpoint" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="bg-[#0a1929]/60 backdrop-blur border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  Build Request
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white">Entity</Label>
                  <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                    <SelectTrigger className="bg-white/5 border-cyan-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <optgroup label="Business Entities">
                        {allEntities.filter(e => !complianceEntities.includes(e)).map(entity => (
                          <SelectItem key={entity} value={entity}>{entity}</SelectItem>
                        ))}
                      </optgroup>
                      <optgroup label="SOC 2 Compliance">
                        {complianceEntities.map(entity => (
                          <SelectItem key={entity} value={entity}>
                            <Shield className="w-3 h-3 inline mr-2" />
                            {entity}
                          </SelectItem>
                        ))}
                      </optgroup>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">Operation</Label>
                  <Select value={operation} onValueChange={setOperation}>
                    <SelectTrigger className="bg-white/5 border-cyan-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="list">List All</SelectItem>
                      <SelectItem value="filter">Filter</SelectItem>
                      <SelectItem value="create">Create</SelectItem>
                      <SelectItem value="schema">Get Schema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(operation === "create" || operation === "filter") && (
                  <div>
                    <Label className="text-white">Request Body (JSON)</Label>
                    <textarea
                      value={requestBody}
                      onChange={(e) => setRequestBody(e.target.value)}
                      rows={8}
                      className="w-full bg-white/5 border border-cyan-500/30 text-white rounded-lg p-3 font-mono text-sm"
                      placeholder={operation === "filter" ? '{"status": "new"}' : '{"name": "Test Lead", "email": "test@example.com"}'}
                    />
                  </div>
                )}

                <Button
                  onClick={handleExecute}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600"
                >
                  {isLoading ? (
                    <>Loading...</>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Execute
                    </>
                  )}
                </Button>

                <CodeSnippetGenerator
                  entity={selectedEntity}
                  operation={operation}
                  requestBody={requestBody}
                />
              </CardContent>
            </Card>

            <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-amber-400" />
                  Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                {response ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge className={response.status === 200 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                        Status: {response.status}
                      </Badge>
                      <span className="text-white/40 text-xs">{response.timestamp}</span>
                    </div>

                    <div className="bg-black/60 border border-amber-500/20 rounded-lg p-4 max-h-[500px] overflow-auto">
                      <pre className="text-green-400 text-xs whitespace-pre-wrap">
                        {JSON.stringify(response.data || response.error || response.details, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Code className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60">Execute a request to see the response</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {response && response.status === 200 && response.entityType && (
            <DataFlowVisualizer
              entityType={response.entityType}
              entityId={response.data?.id || 'mock-id'}
              action={response.action}
            />
          )}

          {response && response.status === 200 && (
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-purple-400 mt-0.5" />
                  <div>
                    <p className="text-purple-400 font-semibold mb-2">💡 Suggested Multi-Step Scenarios</p>
                    <div className="space-y-1 text-white/70 text-sm">
                      {response.entityType === 'Lead' && (
                        <>
                          <p>• Create Lead → Score Lead → Enroll in Nurture Workflow</p>
                          <p>• Create Lead → Send Welcome Email → Update to Contacted</p>
                        </>
                      )}
                      {response.entityType === 'Quote' && (
                        <>
                          <p>• Create Quote → Send to Client → Mark Accepted → Convert to Invoice</p>
                          <p>• Create Quote → Add Line Items → Generate PDF → Email to Client</p>
                        </>
                      )}
                      {response.entityType === 'ComplianceControl' && (
                        <>
                          <p>• Create Control → Upload Evidence → Run Test → Update Status</p>
                          <p>• Create Control → Assign Owner → Schedule Review → Auto-Test</p>
                        </>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveTab('ai')}
                      className="mt-3 border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                    >
                      Try in Scenario Simulator
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-red-400 mt-0.5" />
                <div>
                  <p className="text-red-400 font-semibold mb-1">Security Notice</p>
                  <p className="text-white/70 text-sm">
                    All API calls are authenticated and rate-limited. RLS (Row Level Security) automatically applies to protect your data.
                    This playground is for testing purposes only.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <div className="space-y-6">
            <ScenarioSimulator />
            <AIPlaygroundAssistant user={user} documentation={documentation} />
          </div>
        </TabsContent>

        <TabsContent value="compliance">
          <ComplianceAuditor />
        </TabsContent>

        <TabsContent value="webhooks">
          <WebhookTester user={user} />
        </TabsContent>

        <TabsContent value="pwa">
          <PWAFeatureTester />
        </TabsContent>

        <TabsContent value="mock-data">
          <MockDataGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
}