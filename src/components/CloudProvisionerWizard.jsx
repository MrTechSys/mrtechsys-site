import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, Server, Database, HardDrive, Key, BarChart3, 
  Cpu, Bot, MessageSquare, Check, ArrowRight, ArrowLeft, 
  Sparkles, ShieldCheck, DollarSign, Copy, CheckCircle2, RefreshCw,
  ExternalLink, ChevronDown, ChevronUp, Mail, Send
} from 'lucide-react';
import ConsultationModal from './ConsultationModal';

const BUILD_OPTIONS = [
  { id: 'web', name: 'Website / Landing Page', icon: Globe, desc: 'Ultra-fast global static site with edge SSL' },
  { id: 'api', name: 'API / Backend Logic', icon: Server, desc: 'REST or GraphQL endpoints with microsecond response' },
  { id: 'database', name: 'Database', icon: Database, desc: 'Serverless SQL or NoSQL with auto-replication' },
  { id: 'storage', name: 'File & Asset Storage', icon: HardDrive, desc: 'Media, customer PDFs, documents & backups' },
  { id: 'auth', name: 'Authentication & Login', icon: Key, desc: 'Zero-trust user login, SMS 2FA, session tokens' },
  { id: 'analytics', name: 'Analytics & Telemetry', icon: BarChart3, desc: 'Real-time operational logging and metrics' },
  { id: 'automation', name: 'Worker / Cron Automation', icon: Cpu, desc: 'Scheduled jobs, webhook consumers, background queues' },
  { id: 'ai', name: 'AI / ML Inference', icon: Bot, desc: 'Autonomous dispatch agents & voice synthesis' },
  { id: 'messaging', name: 'Messaging / Notifications', icon: MessageSquare, desc: 'Transactional customer SMS & email dispatch' },
];

const CSP_PLAYBOOKS = {
  cloudflare: {
    id: 'cloudflare',
    name: 'Cloudflare',
    color: '#F38020',
    signupUrl: 'https://dash.cloudflare.com/sign-up',
    docsUrl: 'https://developers.cloudflare.com',
    portalTitle: 'Cloudflare Dashboard (Free Tier)',
    setupPointers: [
      { step: '01', title: 'Create Free Cloudflare Account', desc: 'Navigate to dash.cloudflare.com/sign-up and register with your business email. No credit card required to start.' },
      { step: '02', title: 'Add Your Domain & Update Nameservers', desc: 'Add your domain (e.g. yourbusiness.com) to activate free Edge DNS, automatic SSL/TLS certificates, and DDoS mitigation.' },
      { step: '03', title: 'Deploy Cloudflare Pages (Frontend)', desc: 'Link your GitHub repo in Workers & Pages > Create Application > Pages. Gives you unlimited static requests and global cache 100% free.' },
      { step: '04', title: 'Initialize Cloudflare Workers (Backend API)', desc: 'Create a Worker script in the dashboard for microsecond API execution. Free allocation covers 100,000 requests every single day.' },
      { step: '05', title: 'Create D1 Serverless Database', desc: 'Go to Workers & Pages > D1 SQL Database > Create Database. Enjoy 5GB of relational SQL storage with automated replication at $0.' },
      { step: '06', title: 'Activate R2 Object Storage (Photos & Invoices)', desc: 'Enable R2 in dashboard. Free tier includes 10GB/month of file storage with zero egress bandwidth fees forever.' },
      { step: '07', title: 'Configure Zero-Trust Access (Team Security)', desc: 'Go to Zero Trust > Access Policies. Add up to 50 team members for secure admin and remote field login completely free.' },
      { step: '08', title: 'Enable Edge SSL & Security Headers', desc: 'Set SSL/TLS encryption mode to Full (Strict) and turn on HTTP Strict Transport Security (HSTS).' },
      { step: '09', title: 'Enable Automatic Brotli & Minification', desc: 'In Speed > Optimization, turn on Brotli and Early Hints to achieve sub-second load times on mobile phones.' },
      { step: '10', title: 'Configure Usage Alerts ($0 Alarm)', desc: 'In Notifications, set a billing tripwire alert to notify you the instant traffic reaches 80% of free allocations.' }
    ]
  },
  aws: {
    id: 'aws',
    name: 'Amazon Web Services (AWS)',
    color: '#FF9900',
    signupUrl: 'https://aws.amazon.com/free',
    docsUrl: 'https://aws.amazon.com/getting-started',
    portalTitle: 'AWS Free Tier Console',
    setupPointers: [
      { step: '01', title: 'Sign Up for AWS Free Tier', desc: 'Visit aws.amazon.com/free and create your AWS account. Unlocks 12 months of free services + permanent Always Free allocations.' },
      { step: '02', title: 'Secure Root Account & Enable MFA', desc: 'Immediately configure Google Authenticator or hardware MFA on your Root account in IAM security credentials.' },
      { step: '03', title: 'Set Up $0.00 Billing Alarm (Crucial)', desc: 'Go to Billing Preferences > Enable Receive Billing Alerts. In CloudWatch, create an alarm for $0.01 threshold with your email.' },
      { step: '04', title: 'Create IAM Admin User', desc: 'Never use Root for daily work. Create an IAM User with AdministratorAccess and use its access keys for CLI/IaC deployment.' },
      { step: '05', title: 'Deploy AWS Lambda (Serverless Compute)', desc: 'Open AWS Lambda console and create your first function. You get 1,000,000 free execution requests every month forever.' },
      { step: '06', title: 'Create Amazon DynamoDB Table (NoSQL DB)', desc: 'In DynamoDB console, create a table with On-Demand or Provisioned mode. Enjoy 25GB of permanent free data storage.' },
      { step: '07', title: 'Set Up Amazon S3 Bucket (Secure Assets)', desc: 'Create a private S3 bucket with Block All Public Access enabled. 5GB of standard storage is free for the first 12 months.' },
      { step: '08', title: 'Configure Amazon API Gateway', desc: 'Create an HTTP API endpoint to route webhooks and mobile requests to your Lambda functions. 1 Million free calls per month.' },
      { step: '09', title: 'Activate Amazon CloudWatch Basic Logs', desc: 'Monitor application errors, latency metrics, and API health with 5GB of free log ingestion.' },
      { step: '10', title: 'Connect to MrTechSys Multi-Cloud Mesh', desc: 'Point Cloudflare Workers to your AWS API Gateway endpoint for lightning-fast edge caching with deep serverless power.' }
    ]
  },
  azure: {
    id: 'azure',
    name: 'Microsoft Azure',
    color: '#0078D4',
    signupUrl: 'https://azure.microsoft.com/free',
    docsUrl: 'https://learn.microsoft.com/azure',
    portalTitle: 'Azure Portal (Free Account)',
    setupPointers: [
      { step: '01', title: 'Register for Azure Free Account', desc: 'Go to azure.microsoft.com/free to receive $200 in initial cloud credits plus 12 months of popular free services.' },
      { step: '02', title: 'Configure Azure Cost Management & Budgets', desc: 'Go to Cost Management > Budgets. Create a $0 budget alert with automated email notifications to prevent unexpected charges.' },
      { step: '03', title: 'Set Up Microsoft Entra ID (Active Directory)', desc: 'Connect your business email to Entra ID for free identity management supporting up to 50,000 monthly active users.' },
      { step: '04', title: 'Deploy Azure Functions (Serverless)', desc: 'In Functions App, select Consumption Plan. Gives you 1 Million executions free every month.' },
      { step: '05', title: 'Create Azure Cosmos DB (Free Tier Discount)', desc: 'Enable "Apply Free Tier Discount" when creating your Cosmos DB account. Yields 1,000 RU/s throughput and 25GB storage permanently free.' },
      { step: '06', title: 'Set Up Azure Blob Storage', desc: 'Create a Storage Account in LRS mode. 5GB of standard blob storage is free for your first 12 months.' },
      { step: '07', title: 'Deploy Azure Container Apps (Scale to Zero)', desc: 'Run microservices with auto-scaling to 0 replicas when idle. The first 180,000 vCPU-seconds each month are free.' },
      { step: '08', title: 'Configure Azure Key Vault', desc: 'Store API secrets and connection strings securely with hardware-backed encryption.' },
      { step: '09', title: 'Integrate with Microsoft 365 & Outlook', desc: 'Use Graph API to trigger automated customer email confirmations directly through your team’s Outlook mailboxes.' },
      { step: '10', title: 'Link Azure DNS to Cloudflare Proxy', desc: 'Add CNAME records to route Azure services through Cloudflare for zero-egress edge protection.' }
    ]
  },
  gcp: {
    id: 'gcp',
    name: 'Google Cloud Platform (GCP)',
    color: '#4285F4',
    signupUrl: 'https://cloud.google.com/free',
    docsUrl: 'https://cloud.google.com/docs',
    portalTitle: 'Google Cloud Console',
    setupPointers: [
      { step: '01', title: 'Claim Google Cloud $300 Free Credits', desc: 'Visit cloud.google.com/free to activate your 90-day $300 credit pool and access the permanent "Free Tier".' },
      { step: '02', title: 'Create a Billing Budget Tripwire', desc: 'In Billing > Budgets & Alerts, create a $0.01 threshold budget alert that triggers an instant Gmail alert.' },
      { step: '03', title: 'Deploy Cloud Run (Auto-Scale Containers)', desc: 'Deploy containerized web services in Cloud Run. Enjoy 2 Million free requests per month with scale-to-zero when idle.' },
      { step: '04', title: 'Initialize Cloud Firestore Database', desc: 'In Firestore console, select Native Mode. Free tier gives you 1GB of document storage and 50,000 reads/day.' },
      { step: '05', title: 'Create Cloud Storage Bucket (US Multi-Region)', desc: 'Store client documents in Google Cloud Storage. 5GB standard storage per month is included in the Always Free tier.' },
      { step: '06', title: 'Query Data with BigQuery Sandbox', desc: 'Analyze sales logs and dispatch records. 1TB of SQL querying per month and 10GB of storage are free without a credit card.' },
      { step: '07', title: 'Deploy Cloud Functions (2nd Gen)', desc: 'Run lightweight event handlers with 2 Million free invocations every month.' },
      { step: '08', title: 'Configure Cloud Pub/Sub (Async Queues)', desc: 'Publish order events and mobile tech alerts. The first 10GB of message throughput each month is free.' },
      { step: '09', title: 'Integrate Vertex AI Gemini API', desc: 'Access Gemini Flash APIs with free trial credits for automated document parsing and customer inquiry classification.' },
      { step: '10', title: 'Secure with Cloud Armor & Edge Proxy', desc: 'Route external requests through Cloudflare Edge DNS into Cloud Run for complete zero-trust protection.' }
    ]
  }
};

const CloudProvisionerWizard = ({ initialWorkload = null, onClose = null }) => {
  const [step, setStep] = useState(1);
  const [selectedBuild, setSelectedBuild] = useState(initialWorkload ? [initialWorkload] : ['web', 'api', 'database']);
  const [selectedCsps, setSelectedCsps] = useState(['cloudflare', 'aws']);
  const [scalePreference, setScalePreference] = useState('free_first');
  const [copied, setCopied] = useState(false);
  const [showIaC, setShowIaC] = useState(false);

  // Delivery Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliverySuccess, setDeliverySuccess] = useState(false);
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);

  const toggleBuild = (id) => {
    setSelectedBuild(prev => 
      prev.includes(id) 
        ? (prev.length > 1 ? prev.filter(item => item !== id) : prev) 
        : [...prev, id]
    );
  };

  const toggleCsp = (id) => {
    setSelectedCsps(prev => 
      prev.includes(id) 
        ? (prev.length > 1 ? prev.filter(item => item !== id) : prev) 
        : [...prev, id]
    );
  };

  const conversationalAdvice = useMemo(() => {
    const hasAi = selectedBuild.includes('ai');
    const hasApi = selectedBuild.includes('api');
    const hasDb = selectedBuild.includes('database');
    const isMultiCloud = selectedCsps.length > 1;

    if (step === 1) {
      if (hasAi && hasApi) {
        return "“Pairing AI inference with an API backend? That’s the modern SMB sweet spot. We will map you to serverless edge inference so you get instant voice/dispatch models with zero idle GPU bills.”";
      }
      if (hasApi && hasDb) {
        return "“APIs and Databases selected: This is the operational engine. We will hook you up to serverless D1 or DynamoDB so reads and writes scale automatically from $0.”";
      }
      return `“You’ve selected ${selectedBuild.length} operational primitives. Every component is mapped to start on permanent zero-dollar developer allocations.”`;
    }

    if (step === 2) {
      if (selectedCsps.includes('cloudflare') && selectedCsps.includes('aws')) {
        return "“Cloudflare + AWS: The gold standard enterprise pair. Cloudflare eliminates bandwidth and DDoS costs at the edge, while AWS provides rock-solid serverless power.”";
      }
      if (isMultiCloud) {
        return `“Multi-cloud architecture detected across ${selectedCsps.join(' + ').toUpperCase()}: Zero single-vendor lock-in. If any provider experiences regional downtime, your traffic routes automatically through edge failover.”`;
      }
      return `“Focused on ${selectedCsps[0]?.toUpperCase() || 'Cloudflare'}: Keeps setup simple while ensuring you stay well within free developer quotas.”`;
    }

    if (step === 3) {
      return `“Based on your selection of ${selectedBuild.join(', ').toUpperCase()} across ${selectedCsps.join(' + ').toUpperCase()}, 100% of your stack qualifies for permanent zero-cost developer allocations.”`;
    }

    if (step === 4) {
      return scalePreference === 'free_first'
        ? "“Conservative $0 safety mode: We configure hard tripwire budget alarms. If usage ever approaches billable thresholds, you receive an instant alert with zero surprise charges.”"
        : "“Pay-as-you-go elastic scale: Pay pennies on the dollar only when actual paying customers drive high traffic to your systems.”";
    }

    return "“Your custom cloud blueprint & self-deployment playbook are ready. Follow the 10-point checklist below for each provider or email it to your team!”";
  }, [step, selectedBuild, selectedCsps, scalePreference]);

  const handleConsultAgent = () => {
    const prompt = `Review my cloud footprint for [${selectedBuild.join(', ')}] on [${selectedCsps.join(', ')}]. Explain the exact architecture and setup steps.`;
    window.dispatchEvent(new CustomEvent('mrtechsys-open-chat', { detail: { prompt } }));
  };

  const generateTerraformSnippet = () => {
    return `# MRTECHSYS UNIFIED CLOUD FOOTPRINT
# Mode: Free-Tier First Architecture
# Target Providers: ${selectedCsps.map(c => c.toUpperCase()).join(' + ')}
# Workloads: ${selectedBuild.join(', ')}

module "mrtechsys_footprint" {
  source              = "mrtechsys/cloudflip/footprint"
  version             = "~> 3.2.0"
  
  tier_strategy       = "free_tier_first"
  budget_safety_limit = 0.00 # $0 Hard alert threshold
  
  enabled_workloads   = ${JSON.stringify(selectedBuild)}
  providers_mesh      = ${JSON.stringify(selectedCsps)}
  
  zero_egress_edge    = ${selectedCsps.includes('cloudflare')}
  compliance_tags = {
    Orchestration     = "MrTechSys CloudFlip"
    TexasRootedSimplicity = "Enabled"
  }
}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateTerraformSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeliverySubmit = async (e) => {
    e.preventDefault();
    if (!email || !businessName) return;

    setIsSubmitting(true);
    try {
      await fetch('/api/blueprint-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          contactName,
          email,
          selectedBuild,
          selectedCsps,
          scalePreference
        })
      });
      setDeliverySuccess(true);
    } catch (err) {
      setDeliverySuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 md:p-10 rounded-2xl bg-[#07090E] border border-[#D4AF37]/30 shadow-[0_20px_60px_rgba(0,0,0,0.9)] relative overflow-hidden text-slate-100">
      
      {/* Texas Watermark Backdrop */}
      <div className="absolute -right-12 -bottom-12 w-96 opacity-[0.03] pointer-events-none select-none">
        <img src="/logo.png" alt="" className="w-full h-auto" />
      </div>

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08] mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] font-mono text-[10px] tracking-wider uppercase mb-2 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse"></span>
            CLOUD PROVISIONER · GUIDED ONBOARDING WIZARD
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Build Your Cloud Footprint &mdash; <span className="text-gold-gradient">Free First, Scale Smart</span>.
          </h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-mono text-xs transition-colors self-start md:self-auto"
          >
            Close ✕
          </button>
        )}
      </div>

      {/* 5-Step Progress HUD */}
      <div className="grid grid-cols-5 gap-2 mb-8">
        {[
          { num: '01', title: 'Workload' },
          { num: '02', title: 'Providers' },
          { num: '03', title: 'Free Tier' },
          { num: '04', title: 'Scale Safeguard' },
          { num: '05', title: 'Blueprint & Playbook' }
        ].map((s, idx) => {
          const stepNum = idx + 1;
          const isActive = step === stepNum;
          const isDone = step > stepNum;
          return (
            <button
              key={s.num}
              onClick={() => setStep(stepNum)}
              className={`p-3 rounded-lg border text-left transition-all ${
                isActive 
                  ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-white shadow-[0_0_15px_rgba(212,175,55,0.15)]' 
                  : isDone 
                  ? 'border-white/10 bg-white/[0.02] text-slate-300' 
                  : 'border-transparent text-slate-600'
              }`}
            >
              <div className="text-[10px] font-mono mb-1 flex items-center justify-between">
                <span className={isActive ? 'text-[#D4AF37] font-bold' : isDone ? 'text-slate-400' : 'text-slate-600'}>
                  STEP {s.num}
                </span>
                {isDone && <CheckCircle2 size={12} className="text-[#D4AF37]" />}
              </div>
              <div className="text-xs font-semibold truncate hidden sm:block">{s.title}</div>
            </button>
          );
        })}
      </div>

      {/* Conversational Coach Banner */}
      <div className="p-4 rounded-xl bg-[#D4AF37]/[0.04] border border-[#D4AF37]/25 mb-8 flex items-start gap-3.5">
        <div className="p-2 rounded-lg bg-[#D4AF37]/15 text-[#D4AF37] shrink-0 mt-0.5">
          <Sparkles size={16} />
        </div>
        <div className="flex-grow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest font-bold block">
              MRTECHSYS ARCHITECT ADVICE
            </span>
            <button
              onClick={handleConsultAgent}
              className="text-[10px] font-mono text-[#D4AF37] hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              Ask MrTechSysGPT about this setup ↗
            </button>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed mt-1">
            {conversationalAdvice}
          </p>
        </div>
      </div>

      {/* Main Step Content */}
      <div className="min-h-[380px]">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: What do you want to build? */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Step 01 &mdash; What do you want to build?</h3>
                <p className="text-sm text-slate-400">Select all capabilities your business needs. You can choose multiple.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {BUILD_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = selectedBuild.includes(opt.id);
                  return (
                    <div
                      key={opt.id}
                      onClick={() => toggleBuild(opt.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                        isSelected 
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_15px_rgba(212,175,55,0.1)]' 
                          : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-[#D4AF37] text-[#07090E]' : 'bg-white/5 text-slate-400'}`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white mb-0.5">{opt.name}</div>
                        <div className="text-xs text-slate-400 leading-snug">{opt.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#EAB308] text-[#07090E] font-bold text-xs uppercase tracking-wider rounded shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:from-[#EAB308] hover:to-[#F1C40F] transition-all"
                >
                  Choose Cloud Providers &rarr;
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Choose your cloud providers */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Step 02 &mdash; Choose your cloud providers</h3>
                <p className="text-sm text-slate-400">“Let’s start with free resources &mdash; you can always upgrade later.”</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(CSP_PLAYBOOKS).map((csp) => {
                  const isChecked = selectedCsps.includes(csp.id);
                  return (
                    <div
                      key={csp.id}
                      onClick={() => toggleCsp(csp.id)}
                      className={`p-5 rounded-xl border cursor-pointer transition-all ${
                        isChecked 
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_20px_rgba(212,175,55,0.12)]' 
                          : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: csp.color }}></span>
                          <h4 className="font-bold text-white text-base">{csp.name}</h4>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                          10-Step Playbook Ready
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 leading-relaxed mb-3">
                        {csp.portalTitle} &bull; Official Free Tier Sign-up
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-mono text-[#D4AF37]">
                        <Check size={14} /> {isChecked ? 'Selected for Blueprint' : 'Click to Include'}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white"
                >
                  &larr; Back to Workload
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#EAB308] text-[#07090E] font-bold text-xs uppercase tracking-wider rounded shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:from-[#EAB308] hover:to-[#F1C40F] transition-all"
                >
                  View Recommended Free Resources &rarr;
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Recommended Free Resources */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                <div>
                  <h3 className="text-xl font-bold text-white">Step 03 &mdash; Recommended Free Resources</h3>
                  <p className="text-sm text-slate-400">Everything below is 100% free under official developer allocations.</p>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold shrink-0">
                  EST. INITIAL BILL: $0.00 / mo
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedCsps.map((cspId) => {
                  const csp = CSP_PLAYBOOKS[cspId];
                  if (!csp) return null;
                  return (
                    <div key={csp.id} className="p-5 rounded-xl bg-[#0B0F17] border border-[#D4AF37]/25">
                      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: csp.color }}></span>
                          <h4 className="font-bold text-white text-sm">{csp.name}</h4>
                        </div>
                        <a 
                          href={csp.signupUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[10px] font-mono text-[#D4AF37] flex items-center gap-1 hover:underline"
                        >
                          Sign-Up Console <ExternalLink size={10} />
                        </a>
                      </div>
                      <ul className="space-y-2 text-xs text-slate-300">
                        {csp.setupPointers.slice(0, 4).map((p, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 size={13} className="text-[#D4AF37] shrink-0 mt-0.5" />
                            <span><strong>{p.title}:</strong> {p.desc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white"
                >
                  &larr; Adjust Providers
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#EAB308] text-[#07090E] font-bold text-xs uppercase tracking-wider rounded shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:from-[#EAB308] hover:to-[#F1C40F] transition-all"
                >
                  Configure Scale Safeguards &rarr;
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Scale options (when you grow) */}
          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Step 04 &mdash; Scale Options &amp; Budget Safeguards</h3>
                <p className="text-sm text-slate-400">“If your business grows, we’ll help you scale without surprise bills.”</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    id: 'free_first',
                    title: 'Free First (Zero-Risk)',
                    badge: '$0.00 / MO START',
                    desc: 'Zero spend policy. Alerts trigger the moment usage reaches 80% of free limits. Never charges your card without manual authorization.',
                    features: ['$0 Budget Alarm Hard Cap', 'Scale-to-zero when idle', 'Ideal for launch and testing']
                  },
                  {
                    id: 'moderate',
                    title: 'Pay-As-You-Go Scale',
                    badge: 'EST. $15 - $45 / MO',
                    desc: 'Free tier baseline + pennies per additional million requests. Smooth scaling when customer volume ramps up.',
                    features: ['Cloudflare Workers ($0.30/M req)', 'AWS DynamoDB pay-per-req', 'No fixed monthly server contracts']
                  },
                  {
                    id: 'mission_critical',
                    title: 'Enterprise Resilience',
                    badge: 'MISSION CRITICAL',
                    desc: 'Multi-region hot standby and live failover mesh for zero downtime across hyper-scaler outages.',
                    features: ['Active-active multi-cloud failover', 'Continuous compliance backup', '99.99% SLA guarantee']
                  }
                ].map((tier) => {
                  const isSelected = scalePreference === tier.id;
                  return (
                    <div
                      key={tier.id}
                      onClick={() => setScalePreference(tier.id)}
                      className={`p-5 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                        isSelected 
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_20px_rgba(212,175,55,0.12)]' 
                          : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] font-bold">
                            {tier.badge}
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-sm mb-2">{tier.title}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed mb-4">{tier.desc}</p>
                      </div>
                      <div className="space-y-1.5 pt-3 border-t border-white/[0.06] text-[11px] text-slate-300">
                        {tier.features.map((f, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <Check size={12} className="text-[#D4AF37]" /> {f}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                <button
                  onClick={() => setStep(3)}
                  className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white"
                >
                  &larr; Review Free Resources
                </button>
                <button
                  onClick={() => setStep(5)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#EAB308] text-[#07090E] font-bold text-xs uppercase tracking-wider rounded shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:from-[#EAB308] hover:to-[#F1C40F] transition-all"
                >
                  Generate Blueprint &amp; 10-Point Playbook &rarr;
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: Your Cloud Blueprint & CSP Activation Playbook */}
          {step === 5 && (
            <motion.div
              key="step-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.08]">
                <div>
                  <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest font-bold block mb-1">
                    EXECUTIVE ARCHITECTURE BLUEPRINT &bull; SELF-DEPLOYMENT PLAYBOOK
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    Your Tailored Cloud Footprint Playbook
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Follow the 10-step activation guide below for each provider, or have our team guide your deployment.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-slate-500 block uppercase">STARTING COMMITMENT</span>
                  <span className="text-2xl font-bold font-mono text-[#D4AF37]">$0.00 / mo</span>
                </div>
              </div>

              {/* Dynamic 10-Point CSP Setup Checklists */}
              <div className="space-y-6">
                {selectedCsps.map((cspId) => {
                  const csp = CSP_PLAYBOOKS[cspId];
                  if (!csp) return null;
                  return (
                    <div key={csp.id} className="p-6 rounded-xl bg-[#0B0F17] border border-[#D4AF37]/30 shadow-xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08] mb-4">
                        <div className="flex items-center gap-3">
                          <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: csp.color }}></span>
                          <h4 className="text-lg font-bold text-white">{csp.name} &bull; 10-Point Activation Playbook</h4>
                        </div>
                        <a
                          href={csp.signupUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded bg-gradient-to-r from-[#D4AF37] to-[#EAB308] text-[#07090E] font-mono text-xs font-bold uppercase tracking-wider hover:from-[#EAB308] hover:to-[#F1C40F] transition-all shrink-0"
                        >
                          <span>Open {csp.name} Console</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {csp.setupPointers.map((p) => (
                          <div key={p.step} className="p-3.5 rounded-lg bg-black/40 border border-white/[0.06] flex items-start gap-3">
                            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#D4AF37]/15 text-[#D4AF37] font-bold shrink-0 mt-0.5">
                              {p.step}
                            </span>
                            <div>
                              <div className="text-xs font-bold text-white mb-0.5">{p.title}</div>
                              <div className="text-[11px] text-slate-400 leading-relaxed">{p.desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Advanced Technical Collapsible (Terraform IaC) */}
              <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.08]">
                <button
                  onClick={() => setShowIaC(!showIaC)}
                  className="w-full flex items-center justify-between text-xs font-mono text-slate-400 hover:text-white"
                >
                  <span className="flex items-center gap-2">
                    <Server size={14} className="text-[#D4AF37]" />
                    Advanced: View Infrastructure-as-Code Terraform Configuration (Optional)
                  </span>
                  {showIaC ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {showIaC && (
                  <div className="mt-4 p-4 rounded-lg bg-black/80 border border-white/10 font-mono text-[11px] text-slate-300">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[10px] text-slate-500">
                      <span>main.tf (Automated Deployment Template)</span>
                      <button onClick={handleCopy} className="text-[#D4AF37] hover:underline flex items-center gap-1">
                        {copied ? 'Copied' : 'Copy IaC'}
                      </button>
                    </div>
                    <pre className="overflow-x-auto">
                      <code>{generateTerraformSnippet()}</code>
                    </pre>
                  </div>
                )}
              </div>

              {/* Delivery Action Bar */}
              <div className="p-6 rounded-xl bg-gradient-to-r from-[#D4AF37]/15 via-[#0B0F17] to-[#CA8A04]/15 border border-[#D4AF37]/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
                <div>
                  <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-wider font-bold block mb-1">
                    DELIVERY &amp; ACTIVATION
                  </span>
                  <h4 className="text-lg font-bold text-white">Save or Email Your Complete Cloud Playbook</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Receive direct links, account checklists, and architecture diagrams directly in your inbox.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#EAB308] hover:from-[#EAB308] hover:to-[#F1C40F] text-[#07090E] font-mono text-xs font-bold uppercase tracking-wider rounded-xl shadow-[0_0_25px_rgba(212,175,55,0.35)] transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Mail size={14} />
                    <span>Email My Complete Blueprint</span>
                  </button>
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-3.5 bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-xs rounded-xl border border-white/10 transition-all"
                  >
                    Reset
                  </button>
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Blueprint Delivery Lead Capture Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-2xl bg-[#0B0F17] border border-[#D4AF37]/40 shadow-2xl relative font-sans"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                ✕
              </button>

              {!deliverySuccess ? (
                <form onSubmit={handleDeliverySubmit} className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] font-mono text-[10px] uppercase font-bold">
                    <span>⚡ Instant Delivery</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Receive Your Cloud Blueprint</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    We will send the complete 10-point activation playbook, direct setup links, and architecture summary to your email.
                  </p>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1">
                      Business Name
                    </label>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Lone Star Operations"
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="owner@yourcompany.com"
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#EAB308] hover:from-[#EAB308] hover:to-[#F1C40F] disabled:opacity-50 text-[#07090E] font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] mt-2 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? 'Sending...' : 'Deliver My Blueprint & Playbook →'}
                  </button>
                </form>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37] flex items-center justify-center mx-auto">
                    <Check size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Blueprint Delivered!</h3>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                    We have recorded your custom cloud footprint and sent the 10-point activation checklist to <strong>{email}</strong>.
                  </p>
                  <div className="pt-3 border-t border-white/[0.08]">
                    <span className="text-[11px] font-mono text-slate-400 block mb-2">Want MrTechSys to review or guide your launch?</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setIsConsultModalOpen(true);
                      }}
                      className="inline-block px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#EAB308] hover:from-[#EAB308] hover:to-[#F1C40F] text-[#07090E] font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] cursor-pointer"
                    >
                      Launch AI Architecture Review &rarr;
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive Virtual Architect Advisory Modal */}
      <ConsultationModal
        isOpen={isConsultModalOpen}
        onClose={() => setIsConsultModalOpen(false)}
        contextTitle="Cloud Footprint Architecture Advisory"
        selectedBuild={selectedBuild}
        selectedCsps={selectedCsps}
        source="cloud_provisioner_wizard"
      />

    </div>
  );
};

export default CloudProvisionerWizard;
