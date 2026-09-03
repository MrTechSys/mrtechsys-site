import React, { useState } from 'react';
import { 
  Check, Copy, Cpu, Database, Shield
} from 'lucide-react';

const CSP_PROVIDERS = [
  {
    id: 'aws',
    name: 'Amazon Web Services',
    shortName: 'AWS',
    badge: 'Enterprise Standard',
    color: '#FF9900',
    description: 'High reliability, global reach, rich serverless ecosystem (Lambda, ECS, RDS).',
    computeOptions: ['AWS ECS Fargate', 'AWS Lambda Serverless', 'AWS EC2 Graviton4'],
    databaseOptions: ['Amazon Aurora PostgreSQL', 'Amazon DynamoDB Global Tables', 'RDS Multi-AZ'],
    edgeLayer: 'Cloudflare Edge DNS & Workers Proxy'
  },
  {
    id: 'gcp',
    name: 'Google Cloud Platform',
    shortName: 'GCP',
    badge: 'AI & Data Native',
    color: '#4285F4',
    description: 'Optimal for Vertex AI, real-time BigQuery data streaming, and Cloud Run containers.',
    computeOptions: ['GCP Cloud Run (Auto-Scale)', 'GCP GKE Autopilot', 'Compute Engine N2D'],
    databaseOptions: ['Google Cloud SQL PostgreSQL', 'Cloud Spanner', 'Firestore Serverless'],
    edgeLayer: 'Cloudflare Zero-Trust + Google Armor'
  },
  {
    id: 'azure',
    name: 'Microsoft Azure',
    shortName: 'Azure',
    badge: 'SMB & Enterprise Hybrid',
    color: '#0078D4',
    description: 'Direct integration into Microsoft 365, Active Directory, and Azure OpenAI Service.',
    computeOptions: ['Azure Container Apps', 'Azure App Service', 'Azure Functions'],
    databaseOptions: ['Azure Database for PostgreSQL', 'Azure Cosmos DB', 'Azure SQL Managed Instance'],
    edgeLayer: 'Cloudflare Access + Azure Front Door'
  },
  {
    id: 'hybrid',
    name: 'MrTechSys Multi-Cloud Mesh',
    shortName: 'Hybrid Mesh',
    badge: 'Zero Vendor Lock-in',
    color: '#D4AF37',
    description: 'Cloudflare Edge execution with cross-cloud failover routing across AWS, GCP, and Azure.',
    computeOptions: ['Cloudflare Workers + Container Mesh', 'Distributed Edge Compute', 'Zero-Egress Multi-Region'],
    databaseOptions: ['Distributed SQLite (D1) + PostgreSQL Replica', 'Multi-Region Sharded DB', 'Edge KV Cache'],
    edgeLayer: 'Native Cloudflare 300+ Edge Data Centers'
  }
];

const WORKLOAD_TYPES = [
  { id: 'web_ops', name: 'Real-Time Web Ops & Portal', desc: 'Customer portal, mobile API backend, webhooks, sub-100ms response.' },
  { id: 'data_lake', name: 'Analytics & Telemetry Stream', desc: 'IoT vehicle telemetry, financial logs, live operational reporting.' },
  { id: 'ai_runtime', name: 'TOL-Core AI Inference Node', desc: 'Autonomous dispatch agents, document parsing, voice synthesis.' }
];

const CloudProvisioningAgent = () => {
  const [selectedCsp, setSelectedCsp] = useState(CSP_PROVIDERS[0]);
  const [selectedWorkload, setSelectedWorkload] = useState(WORKLOAD_TYPES[0]);
  const [tier, setTier] = useState('production'); // starter, production, high_availability
  const [copied, setCopied] = useState(false);

  const getEstimatedMonthlyCost = () => {
    let base = 48;
    if (tier === 'starter') base = 24;
    if (tier === 'high_availability') base = 165;
    if (selectedCsp.id === 'gcp') base = Math.round(base * 0.95);
    if (selectedCsp.id === 'hybrid') base = Math.round(base * 0.75); // edge cost efficiency
    return base;
  };

  const getTerraformSample = () => {
    if (selectedCsp.id === 'aws') {
      return `# MRTECHSYS TERRAFORM PROVISIONER // AWS WORKLOAD
module "mrtechsys_aws_stack" {
  source       = "mrtechsys/cloudflip/aws"
  version      = "~> 2.4.0"
  
  environment  = "${tier}"
  workload     = "${selectedWorkload.id}"
  compute_type = "ecs_fargate_arm64"
  database     = "aurora_postgres_serverless"
  
  enable_cloudflare_zero_trust = true
  tags = {
    Owner       = "MrTechSys Digital Transformation"
    Ecosystem   = "CloudFlip"
  }
}`;
    } else if (selectedCsp.id === 'gcp') {
      return `# MRTECHSYS TERRAFORM PROVISIONER // GCP WORKLOAD
module "mrtechsys_gcp_stack" {
  source       = "mrtechsys/cloudflip/google"
  version      = "~> 2.4.0"

  project_tier = "${tier}"
  service_type = "cloud_run_v2"
  database     = "cloud_sql_postgres"
  ai_runtime   = "vertex_tol_core_bridge"

  enable_cloudflare_edge_protection = true
}`;
    } else if (selectedCsp.id === 'azure') {
      return `# MRTECHSYS TERRAFORM PROVISIONER // AZURE WORKLOAD
module "mrtechsys_azure_stack" {
  source       = "mrtechsys/cloudflip/azure"
  version      = "~> 2.4.0"

  tier_sku     = "${tier}"
  compute      = "container_apps_managed"
  database     = "azure_postgres_flexible"
  auth_sync    = "microsoft_entra_id"
}`;
    } else {
      return `# MRTECHSYS MULTI-CLOUD EDGE MESH // CLOUDFLARE + HYBRID CSP
module "mrtechsys_edge_mesh" {
  source       = "mrtechsys/cloudflip/edge-mesh"
  version      = "~> 3.0.0"

  edge_routing = "cloudflare_workers_ai"
  primary_csp  = "aws_us_east"
  fallback_csp = "gcp_us_central"
  zero_egress  = true
}`;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getTerraformSample());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="cloud-provisioner" className="py-24 bg-[#0B0F17] relative border-b border-white/[0.06] overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        
        {/* Section Header */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-[#D4AF37]/25 bg-[#D4AF37]/5 text-[#D4AF37] font-mono text-[11px] tracking-wider uppercase mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
            04 · MULTI-CLOUD PROVISIONING AGENT
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
            Provision Resilient Cloud Primitives. <br />
            <span className="text-slate-400 font-light">Without Vendor Lock-In or Infrastructure Guesswork.</span>
          </h2>
          <p className="text-slate-400 max-w-3xl text-base md:text-lg leading-relaxed">
            Whether your business requires AWS enterprise compliance, GCP machine learning pipelines, Azure Microsoft 365 synergy, or a multi-cloud edge mesh &mdash; MrTechSys guides, designs, and automates your deployment.
          </p>
        </div>

        {/* Provisioning Interactive Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Select CSP */}
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">
                1. Select Target Cloud Service Provider (CSP)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {CSP_PROVIDERS.map((csp) => {
                  const isSelected = selectedCsp.id === csp.id;
                  return (
                    <div
                      key={csp.id}
                      onClick={() => setSelectedCsp(csp)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_15px_rgba(212,175,55,0.1)]' 
                          : 'border-white/[0.07] bg-white/[0.01] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-white text-sm">{csp.shortName}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-300 border border-white/[0.08]">
                          {csp.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-snug line-clamp-2">{csp.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Select Workload Archetype */}
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">
                2. Select Workload Archetype
              </label>
              <div className="space-y-2.5">
                {WORKLOAD_TYPES.map((wl) => {
                  const isSelected = selectedWorkload.id === wl.id;
                  return (
                    <div
                      key={wl.id}
                      onClick={() => setSelectedWorkload(wl)}
                      className={`p-3.5 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${
                        isSelected 
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10' 
                          : 'border-white/[0.07] bg-white/[0.01] hover:border-white/20'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-bold text-white">{wl.name}</div>
                        <div className="text-xs text-slate-400">{wl.desc}</div>
                      </div>
                      {isSelected && <Check size={16} className="text-[#D4AF37] shrink-0 ml-3" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Reliability & Scale Tier */}
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">
                3. Deployment Scale Tier
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'starter', label: 'Starter SMB', desc: 'Single-region serverless' },
                  { id: 'production', label: 'Production', desc: 'Multi-AZ auto-scaling' },
                  { id: 'high_availability', label: 'Mission-Critical', desc: 'Active-active edge failover' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTier(t.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      tier === t.id 
                        ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-white shadow-[0_0_12px_rgba(212,175,55,0.1)]' 
                        : 'border-white/[0.07] bg-white/[0.01] text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold font-mono uppercase mb-0.5">{t.label}</div>
                    <div className="text-[11px] text-slate-500">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Blueprint & IaC Output Column (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between p-6 rounded-xl bg-[#07090E] border border-[#D4AF37]/20 relative">
            
            <div>
              {/* Telemetry Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 block uppercase">TARGET ARCHITECTURE</span>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedCsp.color }}></span>
                    {selectedCsp.name}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-500 block uppercase">EST. CLOUD COST</span>
                  <div className="text-lg font-bold font-mono text-[#D4AF37]">
                    ${getEstimatedMonthlyCost()} <span className="text-xs text-slate-400 font-normal">/mo</span>
                  </div>
                </div>
              </div>

              {/* Stack Primitives */}
              <div className="space-y-2 mb-6">
                <div className="p-2.5 rounded bg-white/[0.02] border border-white/[0.05] text-xs flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Cpu size={14} className="text-[#D4AF37]" /> Compute Primitive
                  </span>
                  <span className="font-mono text-slate-200">{selectedCsp.computeOptions[0]}</span>
                </div>
                <div className="p-2.5 rounded bg-white/[0.02] border border-white/[0.05] text-xs flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Database size={14} className="text-[#D4AF37]" /> Managed DB
                  </span>
                  <span className="font-mono text-slate-200">{selectedCsp.databaseOptions[0]}</span>
                </div>
                <div className="p-2.5 rounded bg-white/[0.02] border border-white/[0.05] text-xs flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Shield size={14} className="text-[#D4AF37]" /> Edge Security
                  </span>
                  <span className="font-mono text-slate-200">{selectedCsp.edgeLayer}</span>
                </div>
              </div>

              {/* Code Snippet */}
              <div className="relative rounded-lg bg-black/60 border border-white/[0.08] p-4 font-mono text-[11px] text-slate-300 overflow-x-auto">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[10px] text-slate-500">
                  <span>terraform_stack.tf</span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-slate-400 hover:text-white"
                  >
                    {copied ? <Check size={12} className="text-[#D4AF37]" /> : <Copy size={12} />}
                    {copied ? 'COPIED' : 'COPY'}
                  </button>
                </div>
                <pre className="text-slate-300 leading-relaxed">
                  <code>{getTerraformSample()}</code>
                </pre>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-6 mt-6 border-t border-white/[0.08] flex items-center justify-between gap-4">
              <span className="text-xs text-slate-400">
                Ready to deploy with MrTechSys automated CI/CD?
              </span>
              <a
                href="/about/mrtechsys"
                className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#EAB308] text-[#07090E] font-mono text-xs font-bold rounded uppercase tracking-wider transition-all shrink-0 hover:from-[#EAB308] hover:to-[#F1C40F]"
              >
                Request Architecture Review &rarr;
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default CloudProvisioningAgent;
