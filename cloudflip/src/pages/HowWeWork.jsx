
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import {
  BookOpen,
  Sparkles,
  Shield,
  Zap,
  TrendingUp,
  Target,
  Users,
  Database,
  Settings,
  Mail,
  BarChart,
  CheckCircle
} from "lucide-react";

function Pill({ children }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-200 shadow-sm backdrop-blur">
      {children}
    </div>
  );
}

function SectionCard({ title, subtitle, children, icon }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl ring-1 ring-white/5 backdrop-blur-md"
    >
      <div className="mb-3 flex items-center gap-3">
        {icon}
        <h3 className="text-lg font-bold text-white/90">{title}</h3>
        {subtitle && (
          <span className="ml-auto text-xs font-medium text-white/60">{subtitle}</span>
        )}
      </div>
      <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-li:marker:text-amber-200">
        {children}
      </div>
    </motion.section>
  );
}

function Divider() {
  return <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent my-8" />;
}

function Hero() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#06162a] via-[#0b213d] to-[#0d2a52] p-8 shadow-2xl"
    >
      <div className="relative z-10">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <Pill>CloudFlip Modular Platform</Pill>
          <Pill>Cinematic UX</Pill>
          <Pill>Multi‑Tenant</Pill>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
          How We Work
        </h1>
        <p className="mt-3 max-w-2xl text-white/80">
          CloudFlip is a modular, multi‑tenant platform that modernizes small business operations
          through centralized workflows, smart automation, and a cinematic interface.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            to={createPageUrl("Dashboard")}
            className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-amber-300/40 transition-colors"
          >
            Back to Dashboard
          </Link>
          <a
            href="#modules"
            className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/5 transition-colors"
          >
            Explore Modules
          </a>
          <Link
            to={createPageUrl("FeatureMarketplace")}
            className="rounded-xl border border-amber-300/50 bg-amber-300/10 px-4 py-2 text-sm font-bold text-amber-100 hover:bg-amber-300/20 transition-colors"
          >
            Visit Marketplace
          </Link>
        </div>
      </div>
      {/* Decorative gold circuitry */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_400px_at_80%_-10%,rgba(244,211,94,0.18),transparent),radial-gradient(600px_300px_at_10%_110%,rgba(60,247,212,0.15),transparent)]" />
    </motion.header>
  );
}

const bullet = <span className="inline-block h-1.5 w-1.5 translate-y-[-1px] rounded-full bg-amber-200/90" />;

export default function HowWeWorkPage() {
  return (
    <main className="min-h-screen bg-[#06162a] text-white selection:bg-amber-300/30 selection:text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        <Hero />

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <SectionCard title="Why This Page Matters" subtitle="Expectations • Trust • Empowerment" icon={<BookOpen className="w-5 h-5 text-amber-400" />}>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-amber-400 mt-1 flex-shrink-0" />
                <span><strong>Sets Expectations:</strong> See our philosophy, flow, and modular logic. Reduce onboarding confusion.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-amber-400 mt-1 flex-shrink-0" />
                <span><strong>Builds Trust:</strong> Clear, honest view of architecture, automation, and data handling.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-amber-400 mt-1 flex-shrink-0" />
                <span><strong>Empowers Users:</strong> Understand how modules connect (CRM → Quote Funnel → Billing).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-amber-400 mt-1 flex-shrink-0" />
                <span><strong>Supports Partners:</strong> A living playbook for onboarding specialists and advisors.</span>
              </li>
            </ul>
          </SectionCard>

          <SectionCard title="Core Principles" subtitle="Design DNA" icon={<Sparkles className="w-5 h-5 text-amber-400" />}>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Centralization', icon: Database },
                { label: 'Automation', icon: Zap },
                { label: 'Verticalization', icon: Target },
                { label: 'Privacy & Compliance', icon: Shield },
                { label: 'Cinematic UX', icon: Sparkles },
                { label: 'Measured Outcomes', icon: BarChart }
              ].map(({ label, icon: Icon }) => (
                <div key={label} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10">
                  <Icon className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-white/90">{label}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <Divider />

        <div id="modules" className="grid gap-6 md:grid-cols-2">
          <SectionCard title="Module Breakdown" subtitle="What lives where" icon={<Settings className="w-5 h-5 text-amber-400" />}>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Users className="w-4 h-4 text-amber-400 mt-1 flex-shrink-0" />
                <div>
                  <strong>CRM:</strong> Contacts, Pipeline, Deals, Tickets
                </div>
              </li>
              <li className="flex items-start gap-2">
                <BarChart className="w-4 h-4 text-amber-400 mt-1 flex-shrink-0" />
                <div>
                  <strong>Business:</strong> Email Center, Billing, Reports
                </div>
              </li>
              <li className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400 mt-1 flex-shrink-0" />
                <div>
                  <strong>Growth:</strong> Campaigns, Referrals, Insights
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Settings className="w-4 h-4 text-amber-400 mt-1 flex-shrink-0" />
                <div>
                  <strong>Settings:</strong> Branding, Permissions, Preferences
                </div>
              </li>
            </ul>
          </SectionCard>

          <SectionCard title="Workflow Examples" subtitle="End‑to‑end clarity" icon={<Zap className="w-5 h-5 text-amber-400" />}>
            <ul className="space-y-3">
              <li className="p-3 rounded-lg bg-white/5 border border-amber-500/20">
                <div className="flex items-center gap-2 text-sm font-semibold text-amber-400 mb-1">
                  Lead → Quote → Invoice → Payment
                </div>
                <p className="text-xs text-white/60">Complete sales cycle from first contact to payment</p>
              </li>
              <li className="p-3 rounded-lg bg-white/5 border border-amber-500/20">
                <div className="flex items-center gap-2 text-sm font-semibold text-amber-400 mb-1">
                  Job → Crew → Completion → Review
                </div>
                <p className="text-xs text-white/60">Field service workflow with team coordination</p>
              </li>
              <li className="p-3 rounded-lg bg-white/5 border border-amber-500/20">
                <div className="flex items-center gap-2 text-sm font-semibold text-amber-400 mb-1">
                  Campaign → Engagement → ROI
                </div>
                <p className="text-xs text-white/60">Marketing automation with measurable results</p>
              </li>
            </ul>
          </SectionCard>
        </div>

        <Divider />

        <div className="grid gap-6 md:grid-cols-2">
          <SectionCard title="Assistant Logic" subtitle="Your onboarder & guide" icon={<Sparkles className="w-5 h-5 text-amber-400" />}>
            <p className="text-white/80 mb-4">
              Your CloudFlip Assistant walks you through onboarding, migration, and optimization — adapting to your goals and vertical.
              It can trigger readiness scans, propose plans, and open tasks automatically.
            </p>
            <div className="flex flex-wrap gap-2">
              <Pill>Assistant Triggers</Pill>
              <Pill>Readiness Scan</Pill>
              <Pill>Plan Recommendation</Pill>
              <Pill>Task Autogen</Pill>
            </div>
          </SectionCard>

          <SectionCard title="Data & Privacy" subtitle="Transparency first" icon={<Shield className="w-5 h-5 text-amber-400" />}>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                <span>Data is encrypted at rest and in transit (AES-256 + TLS)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                <span>SOC2/GDPR‑ready logging and consent management</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                <span>Telemetry is transparent and configurable per tenant</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                <span>Multi-tenant isolation with row-level security</span>
              </li>
            </ul>
          </SectionCard>
        </div>

        <Divider />

        <div className="grid gap-6 md:grid-cols-2">
          <SectionCard id="readiness" title="Migration Philosophy" subtitle="We meet you where you are" icon={<Target className="w-5 h-5 text-amber-400" />}>
            <p className="text-white/80 mb-4">
              Whether you're using spreadsheets, QuickBooks, or paper, CloudFlip translates your current setup into intelligent workflows.
              Start with a readiness scan and let the system generate your roadmap in one click.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to={createPageUrl("Dashboard")}
                className="rounded-lg bg-amber-300/20 px-4 py-2 text-sm font-bold text-amber-50 hover:bg-amber-300/30 transition-colors"
              >
                Begin Readiness →
              </Link>
              <Link
                to={createPageUrl("FeatureMarketplace")}
                className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/5 transition-colors"
              >
                Visit Marketplace
              </Link>
            </div>
          </SectionCard>

          <SectionCard title="Discoverability" subtitle="Make it easy to find" icon={<BookOpen className="w-5 h-5 text-amber-400" />}>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                {bullet}
                <span>Assistant triggers (contextual help in modules)</span>
              </li>
              <li className="flex items-start gap-2">
                {bullet}
                <span>Footer links ("How CloudFlip Works")</span>
              </li>
              <li className="flex items-start gap-2">
                {bullet}
                <span>Onboarding slides (first‑run experience)</span>
              </li>
              <li className="flex items-start gap-2">
                {bullet}
                <span>Tooltips and "Learn More" buttons throughout the UI</span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-white/5 rounded-lg border border-amber-500/20">
              <p className="text-xs text-white/70 font-semibold mb-2">Quick Access:</p>
              <div className="space-y-1 text-xs text-white/60">
                <div>• Settings → <Link to={createPageUrl("Settings")} className="text-amber-400 hover:text-amber-300">General Settings</Link></div>
                <div>• Help → <Link to={createPageUrl("Help")} className="text-amber-400 hover:text-amber-300">Documentation</Link></div>
                <div>• Dashboard → <Link to={createPageUrl("Dashboard")} className="text-amber-400 hover:text-amber-300">Home</Link></div>
              </div>
            </div>
          </SectionCard>
        </div>

        <Divider />

        {/* Tier Comparison */}
        <div className="rounded-2xl border border-amber-500/20 bg-white/5 p-6 backdrop-blur-md">
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-amber-400" />
            CloudFlip Tiers at a Glance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { tier: 'Demo', price: '$0', highlight: 'Try for free' },
              { tier: 'Starter', price: '$20', highlight: 'Solo pros' },
              { tier: 'Pro', price: '$50', highlight: 'Growing teams' },
              { tier: 'Partner', price: '$100', highlight: 'AI + Social' },
              { tier: 'Elite', price: '$200', highlight: 'White label' }
            ].map(({ tier, price, highlight }) => (
              <div key={tier} className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                <div className="text-lg font-bold text-amber-400">{tier}</div>
                <div className="text-2xl font-extrabold text-white my-2">{price}</div>
                <div className="text-xs text-white/60">{highlight}</div>
              </div>
            ))}
          </div>
        </div>

        <footer className="relative mt-12 flex flex-col items-center justify-center gap-6">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to={createPageUrl("Dashboard")}
              className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/25">←</span>
              Back to Dashboard
            </Link>
            <Link
              to={createPageUrl("SecurityCenter")}
              className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
            >
              <Shield className="w-4 h-4" />
              Security & Privacy
            </Link>
            <Link
              to={createPageUrl("ContactUs")}
              className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
            >
              <Mail className="w-4 h-4" />
              Contact Support
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
