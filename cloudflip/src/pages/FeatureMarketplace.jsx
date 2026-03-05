
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Mail,
  MessageSquare,
  Zap,
  Crown,
  Palette,
  BarChart3,
  Users,
  Globe,
  Lock,
  Facebook,
  Brain,
  Calendar,
  Shield,
  Workflow,
  FileText,
  CreditCard,
  Upload,
  TrendingUp,
  Bell,
  Code,
  BookOpen // Added BookOpen import
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const features = [
  // DEMO TIER
  {
    id: "demo-preview",
    name: "Interactive Demo Mode",
    description: "Test drive CloudFlip with sample data and read-only previews before committing.",
    icon: Sparkles,
    plan: "demo",
    color: "from-gray-500 to-gray-600",
    benefits: [
      "Branded onboarding experience",
      "Sample quote flow with dummy data",
      "Dashboard preview mode",
      "Explore all features risk-free"
    ]
  },

  // STARTER TIER
  {
    id: "lead-management",
    name: "Lead Management",
    description: "Manual lead entry and CSV import to build your customer pipeline.",
    icon: Users,
    plan: "starter",
    color: "from-blue-500 to-blue-600",
    benefits: [
      "Manual lead entry forms",
      "CSV/Excel import",
      "Basic lead tracking",
      "Up to 100 leads/month"
    ]
  },
  {
    id: "quote-generator",
    name: "Quote Generator",
    description: "Create professional quotes with templates and basic customization.",
    icon: FileText,
    plan: "starter",
    color: "from-blue-500 to-cyan-500",
    benefits: [
      "Pre-built quote templates",
      "Line item management",
      "PDF generation",
      "Email delivery"
    ]
  },
  {
    id: "invoice-tracking",
    name: "Invoice & Payment Tracking",
    description: "Create and send invoices with basic payment tracking.",
    icon: CreditCard,
    plan: "starter",
    color: "from-blue-400 to-blue-600",
    benefits: [
      "Invoice creation & sending",
      "Payment status tracking",
      "Basic reminders",
      "PDF invoices"
    ]
  },
  {
    id: "email-notifications",
    name: "Email Notifications",
    description: "Automated email alerts for leads, quotes, and invoice updates.",
    icon: Mail,
    plan: "starter",
    color: "from-blue-500 to-indigo-500",
    benefits: [
      "Lead notification emails",
      "Quote status updates",
      "Invoice reminders",
      "Custom email templates"
    ]
  },

  // PRO TIER
  {
    id: "crm-pipeline",
    name: "Visual CRM Pipeline",
    description: "Drag-and-drop kanban board to manage leads through every stage of your sales process.",
    icon: TrendingUp,
    plan: "pro",
    color: "from-purple-500 to-pink-500",
    benefits: [
      "Drag-and-drop interface",
      "Customizable pipeline stages",
      "Activity timeline tracking",
      "Win rate analytics"
    ]
  },
  {
    id: "stripe-integration",
    name: "Stripe Payment Processing",
    description: "Accept online payments directly through invoices with secure Stripe integration.",
    icon: CreditCard,
    plan: "pro",
    color: "from-purple-500 to-blue-600",
    benefits: [
      "Online payment processing",
      "Automatic invoice updates",
      "Recurring payments",
      "Refund handling"
    ]
  },
  {
    id: "landing-page-builder",
    name: "Branded Landing Pages",
    description: "Create custom landing pages with your branding to capture more leads.",
    icon: Palette,
    plan: "pro",
    color: "from-pink-500 to-purple-600",
    benefits: [
      "Drag-and-drop builder",
      "Custom domains",
      "Lead capture forms",
      "Mobile responsive"
    ]
  },
  {
    id: "advanced-scheduling",
    name: "Advanced Job Scheduling",
    description: "Powerful calendar with recurring jobs, team assignments, and reminders.",
    icon: Calendar,
    plan: "pro",
    color: "from-purple-400 to-indigo-600",
    benefits: [
      "Recurring job templates",
      "Team member assignments",
      "Automated reminders",
      "Calendar integrations"
    ]
  },

  // PARTNER TIER
  {
    id: "social-sync",
    name: "Social Media Lead Sync",
    description: "Auto-import leads from Facebook, Instagram, Nextdoor, and TikTok.",
    icon: Facebook,
    plan: "partner",
    color: "from-amber-500 to-orange-500",
    benefits: [
      "OAuth platform integration",
      "Automatic lead import",
      "Keyword filtering",
      "Real-time sync"
    ]
  },
  {
    id: "ai-quotes",
    name: "AI Quote Generation",
    description: "Generate professional quotes instantly using AI. Just describe the work and get itemized quotes.",
    icon: Sparkles,
    plan: "partner",
    color: "from-amber-500 to-yellow-500",
    benefits: [
      "Instant quote generation",
      "Industry-specific templates",
      "Smart pricing recommendations",
      "Unlimited AI tokens"
    ]
  },
  {
    id: "ai-agents",
    name: "AI Agent Inbox",
    description: "AI-powered agents handle inquiries, schedule appointments, and follow up automatically.",
    icon: Brain,
    plan: "partner",
    color: "from-green-500 to-emerald-500",
    benefits: [
      "24/7 automated responses",
      "Smart lead qualification",
      "Appointment scheduling",
      "WhatsApp integration"
    ]
  },
  {
    id: "smart-reminders",
    name: "Smart Reminders & Follow-ups",
    description: "Intelligent follow-up system for quotes, invoices, and customer engagement.",
    icon: Bell,
    plan: "partner",
    color: "from-orange-500 to-amber-600",
    benefits: [
      "Automated reminders",
      "Custom schedules",
      "Multi-channel (email/SMS)",
      "Escalation rules"
    ]
  },
  {
    id: "sentiment-analysis",
    name: "Sentiment Analysis",
    description: "AI-powered emotion detection to understand customer mood and optimize engagement.",
    icon: Brain,
    plan: "partner",
    color: "from-teal-500 to-cyan-500",
    benefits: [
      "Real-time sentiment scoring",
      "Emotion state tracking",
      "Auto-escalation triggers",
      "Customer insights"
    ]
  },
  {
    id: "privacy-center",
    name: "Privacy & Consent Management",
    description: "GDPR-compliant consent tracking and data privacy controls.",
    icon: Shield,
    plan: "partner",
    color: "from-slate-500 to-gray-600",
    benefits: [
      "Consent tracking",
      "Data export tools",
      "Right to be forgotten",
      "Compliance reports"
    ]
  },

  // ELITE TIER
  {
    id: "white-label",
    name: "White Label Branding",
    description: "Remove CloudFlip branding completely and use your own domain, logo, and colors.",
    icon: Palette,
    plan: "elite",
    color: "from-yellow-500 to-amber-600",
    benefits: [
      "Remove CloudFlip branding",
      "Custom domain support",
      "Custom email sender",
      "Full brand customization"
    ]
  },
  {
    id: "multi-agent",
    name: "Multi-Agent Routing",
    description: "Route conversations to team members with intelligent assignment and load balancing.",
    icon: Users,
    plan: "elite",
    color: "from-amber-500 to-orange-500",
    benefits: [
      "Team collaboration",
      "Smart routing rules",
      "Load balancing",
      "Performance tracking"
    ]
  },
  {
    id: "api-access",
    name: "Full API Access",
    description: "Build custom integrations and automate workflows with complete REST API access.",
    icon: Code,
    plan: "elite",
    color: "from-teal-500 to-cyan-600",
    benefits: [
      "Full REST API",
      "Webhook events",
      "API documentation",
      "Priority support"
    ]
  },
  {
    id: "advanced-analytics",
    name: "Advanced Analytics & Forecasting",
    description: "Deep insights with conversion rates, lead sources, revenue forecasting, and custom dashboards.",
    icon: BarChart3,
    plan: "elite",
    color: "from-indigo-500 to-purple-600",
    benefits: [
      "Custom dashboards",
      "Revenue forecasting",
      "Lead source ROI",
      "Export & scheduling"
    ]
  },
  {
    id: "contract-builder",
    name: "Contract & Template Builder",
    description: "Create professional contracts with recurring templates and digital signatures.",
    icon: FileText,
    plan: "elite",
    color: "from-slate-600 to-gray-700",
    benefits: [
      "Recurring templates",
      "Digital signatures",
      "Version control",
      "Legal compliance"
    ]
  },
  {
    id: "client-portal",
    name: "Client Approval Portal",
    description: "Give clients a branded portal to view quotes, approve work, and make payments.",
    icon: Lock,
    plan: "elite",
    color: "from-purple-600 to-indigo-700",
    benefits: [
      "Quote approval buttons",
      "Payment processing",
      "Job status updates",
      "Document sharing"
    ]
  },
  {
    id: "automated-workflows",
    name: "Automated Workflows",
    description: "Set up smart triggers for follow-ups, reminders, and status updates.",
    icon: Workflow,
    plan: "elite",
    color: "from-orange-500 to-red-600",
    benefits: [
      "Custom automation rules",
      "Smart nudges",
      "Email sequences",
      "SMS reminders"
    ]
  },
  {
    id: "plugin-hub",
    name: "Plugin Hub",
    description: "Access vertical-specific modules and social connectors to extend CloudFlip functionality.",
    icon: Zap,
    plan: "elite",
    color: "from-yellow-500 to-amber-600",
    benefits: [
      "HVAC/Plumbing modules",
      "Landscaping tools",
      "Insurance calculators",
      "Custom connectors"
    ]
  }
];

const planLevels = {
  demo: { name: "Demo", color: "text-gray-400", price: "Free" },
  starter: { name: "Starter", color: "text-blue-400", price: "$20/mo" },
  pro: { name: "Pro", color: "text-purple-400", price: "$50/mo" },
  partner: { name: "Partner", color: "text-amber-400", price: "$100/mo" },
  elite: { name: "Elite", color: "text-yellow-400", price: "$200/mo" }
};

// Group features by plan
const featuresByPlan = {
  demo: features.filter(f => f.plan === 'demo'),
  starter: features.filter(f => f.plan === 'starter'),
  pro: features.filter(f => f.plan === 'pro'),
  partner: features.filter(f => f.plan === 'partner'),
  elite: features.filter(f => f.plan === 'elite')
};

export default function FeatureMarketplace() {
  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3">
          <Zap className="w-10 h-10 text-amber-500" />
          <span className="text-amber-400">Feature</span> Marketplace
        </h1>
        <p className="text-white/80 mt-3 text-lg">
          Unlock powerful <span className="text-amber-400">features</span> to grow your <span className="text-amber-400">business</span>
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to={createPageUrl("HowWeWork")}>
            <Button variant="outline" className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
              <BookOpen className="w-4 h-4 mr-2" />
              How We Work
            </Button>
          </Link>
          <Link to={createPageUrl("ContactUs")}>
            <Button className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold">
              Contact Sales
            </Button>
          </Link>
        </div>
      </div>

      {/* Demo Tier */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-500/30 to-transparent" />
          <h2 className="text-xl font-bold text-gray-400 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Demo Tier - {planLevels.demo.price}
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-500/30 to-transparent" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuresByPlan.demo.map((feature) => {
            const Icon = feature.icon;
            const planInfo = planLevels[feature.plan];
            
            return (
              <Card key={feature.id} className="relative overflow-hidden bg-[#0a1929]/60 backdrop-blur border-amber-500/20 hover:shadow-xl hover:shadow-amber-500/10 transition-all h-full flex flex-col">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-10 transform translate-x-8 -translate-y-8 rounded-full`} />
                
                <CardHeader className="flex-shrink-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                      <Crown className="w-3 h-3 mr-1" />
                      {planInfo.name}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl text-white min-h-[3.5rem]">{feature.name}</CardTitle>
                  <p className="text-sm text-white/70 mt-2 min-h-[3rem]">{feature.description}</p>
                </CardHeader>

                <CardContent className="space-y-4 flex-1 flex flex-col">
                  <div className="space-y-2 flex-1">
                    {feature.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-white/80">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-amber-500/20 mt-auto">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-white/60">Included in:</span>
                      <span className={`font-semibold ${planInfo.color}`}>{planInfo.name} ({planInfo.price})</span>
                    </div>
                    <Link to={createPageUrl("Billing")}>
                      <Button className={`w-full bg-gradient-to-r ${feature.color} hover:opacity-90 text-white font-semibold`}>
                        Try Free Demo
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Starter Tier */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
          <h2 className="text-xl font-bold text-blue-400 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Starter Tier - {planLevels.starter.price}
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuresByPlan.starter.map((feature) => {
            const Icon = feature.icon;
            const planInfo = planLevels[feature.plan];
            
            return (
              <Card key={feature.id} className="relative overflow-hidden bg-[#0a1929]/60 backdrop-blur border-amber-500/20 hover:shadow-xl hover:shadow-amber-500/10 transition-all h-full flex flex-col">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-10 transform translate-x-8 -translate-y-8 rounded-full`} />
                
                <CardHeader className="flex-shrink-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      <Crown className="w-3 h-3 mr-1" />
                      {planInfo.name}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl text-white min-h-[3.5rem]">{feature.name}</CardTitle>
                  <p className="text-sm text-white/70 mt-2 min-h-[3rem]">{feature.description}</p>
                </CardHeader>

                <CardContent className="space-y-4 flex-1 flex flex-col">
                  <div className="space-y-2 flex-1">
                    {feature.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-white/80">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-amber-500/20 mt-auto">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-white/60">Included in:</span>
                      <span className={`font-semibold ${planInfo.color}`}>{planInfo.name} ({planInfo.price})</span>
                    </div>
                    <Link to={createPageUrl("Billing")}>
                      <Button className={`w-full bg-gradient-to-r ${feature.color} hover:opacity-90 text-white font-semibold`}>
                        Upgrade to Unlock
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Pro Tier */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
          <h2 className="text-xl font-bold text-purple-400 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Pro Tier - {planLevels.pro.price}
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuresByPlan.pro.map((feature) => {
            const Icon = feature.icon;
            const planInfo = planLevels[feature.plan];
            
            return (
              <Card key={feature.id} className="relative overflow-hidden bg-[#0a1929]/60 backdrop-blur border-amber-500/20 hover:shadow-xl hover:shadow-amber-500/10 transition-all h-full flex flex-col">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-10 transform translate-x-8 -translate-y-8 rounded-full`} />
                
                <CardHeader className="flex-shrink-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                      <Crown className="w-3 h-3 mr-1" />
                      {planInfo.name}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl text-white min-h-[3.5rem]">{feature.name}</CardTitle>
                  <p className="text-sm text-white/70 mt-2 min-h-[3rem]">{feature.description}</p>
                </CardHeader>

                <CardContent className="space-y-4 flex-1 flex flex-col">
                  <div className="space-y-2 flex-1">
                    {feature.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-white/80">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-amber-500/20 mt-auto">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-white/60">Included in:</span>
                      <span className={`font-semibold ${planInfo.color}`}>{planInfo.name} ({planInfo.price})</span>
                    </div>
                    <Link to={createPageUrl("Billing")}>
                      <Button className={`w-full bg-gradient-to-r ${feature.color} hover:opacity-90 text-white font-semibold`}>
                        Upgrade to Unlock
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Partner Tier */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
          <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Partner Tier - {planLevels.partner.price}
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuresByPlan.partner.map((feature) => {
            const Icon = feature.icon;
            const planInfo = planLevels[feature.plan];
            
            return (
              <Card key={feature.id} className="relative overflow-hidden bg-[#0a1929]/60 backdrop-blur border-amber-500/20 hover:shadow-xl hover:shadow-amber-500/10 transition-all h-full flex flex-col">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-10 transform translate-x-8 -translate-y-8 rounded-full`} />
                
                <CardHeader className="flex-shrink-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                      <Crown className="w-3 h-3 mr-1" />
                      {planInfo.name}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl text-white min-h-[3.5rem]">{feature.name}</CardTitle>
                  <p className="text-sm text-white/70 mt-2 min-h-[3rem]">{feature.description}</p>
                </CardHeader>

                <CardContent className="space-y-4 flex-1 flex flex-col">
                  <div className="space-y-2 flex-1">
                    {feature.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-white/80">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-amber-500/20 mt-auto">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-white/60">Included in:</span>
                      <span className={`font-semibold ${planInfo.color}`}>{planInfo.name} ({planInfo.price})</span>
                    </div>
                    <Link to={createPageUrl("Billing")}>
                      <Button className={`w-full bg-gradient-to-r ${feature.color} hover:opacity-90 text-white font-semibold`}>
                        Upgrade to Unlock
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Elite Tier */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent" />
          <h2 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Elite Tier - {planLevels.elite.price}
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuresByPlan.elite.map((feature) => {
            const Icon = feature.icon;
            const planInfo = planLevels[feature.plan];
            
            return (
              <Card key={feature.id} className="relative overflow-hidden bg-[#0a1929]/60 backdrop-blur border-amber-500/20 hover:shadow-xl hover:shadow-amber-500/10 transition-all h-full flex flex-col">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-10 transform translate-x-8 -translate-y-8 rounded-full`} />
                
                <CardHeader className="flex-shrink-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      <Crown className="w-3 h-3 mr-1" />
                      {planInfo.name}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl text-white min-h-[3.5rem]">{feature.name}</CardTitle>
                  <p className="text-sm text-white/70 mt-2 min-h-[3rem]">{feature.description}</p>
                </CardHeader>

                <CardContent className="space-y-4 flex-1 flex flex-col">
                  <div className="space-y-2 flex-1">
                    {feature.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-white/80">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-amber-500/20 mt-auto">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-white/60">Included in:</span>
                      <span className={`font-semibold ${planInfo.color}`}>{planInfo.name} ({planInfo.price})</span>
                    </div>
                    <Link to={createPageUrl("Billing")}>
                      <Button className={`w-full bg-gradient-to-r ${feature.color} hover:opacity-90 text-white font-semibold`}>
                        Upgrade to Unlock
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-2 border-amber-500/30 backdrop-blur">
        <CardContent className="p-8 text-center">
          <Crown className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">
            Not sure which <span className="text-amber-400">plan</span> is right for you?
          </h3>
          <p className="text-white/70 mb-6">
            We'll help you choose the perfect <span className="text-amber-400">plan</span> for your <span className="text-amber-400">business</span> needs
          </p>
          <div className="flex justify-center gap-3">
            <Link to={createPageUrl("Billing")}>
              <Button size="lg" className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold">
                Compare Plans
              </Button>
            </Link>
            <Link to={createPageUrl("ContactUs")}>
              <Button size="lg" variant="outline" className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
                Contact Sales
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
