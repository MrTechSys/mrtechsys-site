import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { api } from "@/api/apiClient";
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  Settings,
  CreditCard,
  Zap,
  Crown,
  ChevronDown,
  LogOut,
  Building,
  Shield,
  Sparkles,
  CheckCircle,
  ArrowUp,
  TrendingUp,
  Target,
  AlertCircle,
  BarChart,
  ChevronRight,
  Mail,
  Activity,
  Database,
  Globe,
  Briefcase,
  User,
  Search,
  Brain,
  DollarSign,
  HelpCircle,
  Wrench,
  Menu,
  X
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import IntroVideo from "@/components/IntroVideo";
import OnboardingWizard from "@/components/OnboardingWizard";
import CircuitBackground from "@/components/CircuitBackground";
import AIChatWidget from "@/components/AIChatWidget";
import ContextualTooltip from "@/components/ContextualTooltip";
import CopyrightFooter from "@/components/CopyrightFooter";
import ErrorBoundary from "@/components/ErrorBoundary";
import GlobalErrorHandler from "@/components/GlobalErrorHandler";
import { motion, AnimatePresence } from "framer-motion";
import OnboardingAssistant from "@/components/OnboardingAssistant";
import GlobalPresence from "@/components/GlobalPresence";
import { Toaster } from "sonner";
import { initTelemetry } from "@/components/utils/telemetryBatcher";
import { isFeatureAvailable } from "@/components/utils/pollingConfig";

// --- Navigation Configuration with Neon Accents ---
const mainNavItems = [
  { title: "Dashboard", url: createPageUrl("Dashboard"), icon: LayoutDashboard, color: "text-neon-amber" },
  { title: "Leads", url: createPageUrl("Leads"), icon: Users, color: "text-neon-cyan" },
  { title: "Quotes", url: createPageUrl("Quotes"), icon: FileText, color: "text-neon-amber" },
  { title: "Jobs", url: createPageUrl("Jobs"), icon: Calendar, color: "text-neon-green" },
  { title: "Invoices", url: createPageUrl("Invoices"), icon: DollarSign, color: "text-neon-green" },
  { title: "POS Terminal", url: createPageUrl("StripePOS"), icon: CreditCard, color: "text-neon-green" },
];

const crmNavItems = [
  { title: "Command Center", url: createPageUrl("CRMCommandCenter"), icon: Activity, color: "text-neon-cyan" },
  { title: "AI Sales Assistant", url: createPageUrl("AISalesAssistant"), icon: Sparkles, color: "text-neon-purple" },
  { title: "Contacts", url: createPageUrl("CRMContacts"), icon: Users, color: "text-neon-cyan" },
  { title: "Pipeline", url: createPageUrl("CRMLeads"), icon: TrendingUp, color: "text-neon-cyan" },
  { title: "Deals", url: createPageUrl("CRMDeals"), icon: Target, color: "text-neon-green" },
  { title: "Tickets", url: createPageUrl("CRMTickets"), icon: AlertCircle, color: "text-neon-red" },
  { title: "Analytics", url: createPageUrl("CRMAnalytics"), icon: BarChart, color: "text-neon-purple" },
  { title: "Integrations", url: createPageUrl("CRMIntegrations"), icon: Zap, color: "text-neon-amber" },
];

const devopsNavItems = [
  { title: "DevOps Planner", url: createPageUrl("DevOpsPlanner"), icon: Target, color: "text-neon-cyan" },
  { title: "Launch Control", url: createPageUrl("LaunchControlCenter"), icon: Activity, color: "text-neon-red" },
];

const growthNavItems = [
  { title: "Growth Engine", url: createPageUrl("GrowthEngine"), icon: TrendingUp, color: "text-neon-purple" },
  { title: "Lead Scraper", url: createPageUrl("LeadScraper"), icon: Globe, color: "text-neon-cyan" },
  { title: "Local SEO", url: createPageUrl("LocalSEOManager"), icon: Search, color: "text-neon-green" },
  { title: "AI Assistant", url: createPageUrl("AIAdminHub"), icon: Brain, color: "text-neon-purple" },
  { title: "Nurture Workflows", url: createPageUrl("NurtureWorkflows"), icon: Zap, color: "text-neon-amber" },
  { title: "Automation Builder", url: createPageUrl("WorkflowBuilder"), icon: Wrench, color: "text-neon-amber" },
  { title: "Features", url: createPageUrl("FeatureMarketplace"), icon: Sparkles, color: "text-neon-purple" },
];

const analyticsNavItems = [
  { title: "Reports Hub", url: createPageUrl("ReportsHub"), icon: BarChart, color: "text-neon-blue" },
  { title: "Analytics Dashboards", url: createPageUrl("AnalyticsDashboards"), icon: Activity, color: "text-neon-purple" },
  { title: "Billing Dashboard", url: createPageUrl("BillingDashboard"), icon: CreditCard, color: "text-neon-green" },
  { title: "Live Analytics", url: createPageUrl("LiveAnalytics"), icon: Activity, color: "text-neon-red" },
];

const settingsItems = [
  { title: "General", url: createPageUrl("Settings"), icon: Settings, color: "text-white" },
  { title: "Profile", url: createPageUrl("Profile"), icon: User, color: "text-white" },
  { title: "Plans & Billing", url: createPageUrl("Billing"), icon: CreditCard, color: "text-neon-green" },
  { title: "Roles", url: createPageUrl("RoleManagement"), icon: Shield, color: "text-neon-red" },
  { title: "MFA Security", url: createPageUrl("MFASettings"), icon: Shield, color: "text-neon-red" },
  { title: "Integrations", url: createPageUrl("Integrations"), icon: Zap, color: "text-neon-amber" },
];

const planConfig = {
  free: { label: "Free", color: "bg-gradient-to-r from-gray-600 to-gray-400", icon: null },
  starter: { label: "Starter", color: "bg-gradient-to-r from-neon-cyan to-blue-600", icon: Zap },
  pro: { label: "Pro", color: "bg-gradient-to-r from-neon-purple to-pink-600", icon: Crown },
  partner: { label: "Partner", color: "bg-gradient-to-r from-neon-amber to-orange-600", icon: Crown },
  elite: { label: "Elite", color: "bg-gradient-to-r from-neon-red to-rose-600", icon: Shield }
};

function LayoutContent({ children }) {
  const location = useLocation();
  const { setOpenMobile, isMobile, openMobile } = useSidebar();
  const [user, setUser] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [currentOrg, setCurrentOrg] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState({});
  const [showIntro, setShowIntro] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Sidebar State
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [crmOpen, setCrmOpen] = useState(false);
  const [devopsOpen, setDevopsOpen] = useState(false);
  const [growthOpen, setGrowthOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);

  const isLegalPage = ['/DataPrivacy', '/TermsOfService', '/Cookies', '/ContactUs'].includes(location.pathname);

  // --- Data Loading Effect ---
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const currentUser = await api.auth.me();
        setUser(currentUser);
        
        // Intro Check
        const introCompleted = currentUser?.data?.intro_completed || localStorage.getItem('cloudflip_intro_completed') === 'true';
        if (!introCompleted) setShowIntro(true);
        
        // Orgs Loading
        let fetchedOrganizations = [];
        let activeOrg = null;
        if (currentUser.organization_memberships?.length > 0) {
          const orgIds = currentUser.organization_memberships.map(m => m.org_id);
          fetchedOrganizations = await api.entities.Organization.filter({ id: { $in: orgIds } });
          setOrganizations(fetchedOrganizations);
          if (currentUser.current_org_id) {
            activeOrg = fetchedOrganizations.find(o => o.id === currentUser.current_org_id);
            setCurrentOrg(activeOrg);
          }
        }
        
        // Onboarding Check
        const onboardingCompleted = currentUser?.data?.onboarding_completed || activeOrg?.onboarding_completed || localStorage.getItem('cloudflip_onboarding_completed') === 'true';
        if (activeOrg && !onboardingCompleted && introCompleted) setShowOnboarding(true);
        
        // Subscription Check
        const isMrTechSys = currentUser.email === 'support@mrtechsys.com' || currentUser.role === 'admin' || activeOrg?.owner_id === currentUser.id;
        if (isMrTechSys) {
          setSubscription({ plan: 'elite' });
        } else {
          const subs = await api.entities.BillingSubscription.list();
          setSubscription(subs.length > 0 ? subs[0] : { plan: 'free' });
        }

        // Usage Stats
        const period = new Date().toISOString().slice(0, 7);
        const events = await api.entities.UsageEvent.list();
        const usageCounts = {};
        events.forEach(evt => {
          if (evt.period === period) usageCounts[evt.event] = (usageCounts[evt.event] || 0) + (evt.quantity || 1);
        });
        setUsage(usageCounts);

        // Telemetry
        if (activeOrg?.id && currentUser?.id) {
          const adminSettings = await api.entities.AdminSettings.list();
          if (adminSettings[0]?.telemetry_enabled) initTelemetry(activeOrg.id, currentUser.id);
        }

      } catch (error) {
        console.error("Critical error loading user data:", error);
      }
    };
    loadUserData();
  }, []);

  // --- Sidebar Auto-Expansion Logic ---
  useEffect(() => {
    const checkPath = (paths) => paths.includes(location.pathname);
    
    if (checkPath(settingsItems.map(i => i.url))) setSettingsOpen(true);
    if (checkPath(crmNavItems.map(i => i.url))) setCrmOpen(true);
    if (checkPath(devopsNavItems.map(i => i.url))) setDevopsOpen(true);
    if (checkPath(growthNavItems.map(i => i.url))) setGrowthOpen(true);
    if (checkPath(analyticsNavItems.map(i => i.url))) setAnalyticsOpen(true);
    
    const securityPaths = [createPageUrl("SecurityComplianceCenter"), createPageUrl("SentinelSRE"), createPageUrl("SecurityCommandCenter")]; // Simplified list
    if (securityPaths.includes(location.pathname)) setSecurityOpen(true);
    
    window.scrollTo(0, 0);
    setOpenMobile(false);
  }, [location.pathname]);

  // --- Handlers ---
  const handleIntroComplete = async () => {
    setShowIntro(false);
    localStorage.setItem('cloudflip_intro_completed', 'true');
    if (user) await api.auth.updateMe({ data: { ...user.data, intro_completed: true } });
    if (user && !user.data?.onboarding_completed) setShowOnboarding(true);
  };

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    if (user?.current_org_id) {
      const orgs = await api.entities.Organization.filter({ id: user.current_org_id });
      if (orgs[0]) setCurrentOrg(orgs[0]);
    }
  };

  const handleOrgSwitch = async (orgId) => {
    await api.auth.updateMe({ current_org_id: orgId });
    window.location.reload();
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // --- Render Helpers ---
  const planInfo = planConfig[subscription?.plan || 'free'];
  const PlanIcon = planInfo?.icon;
  const nakedCloudFlipLogo = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/api-prod/public/68f9c68eee1c76fe83e7fbb0/5fae4ab52_image.png";
  
  // Custom Styles for Papyrus Font & Neon Effects
  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&display=swap');
    
    .font-brand { font-family: 'Papyrus', fantasy; }
    .font-tech { font-family: 'Orbitron', sans-serif; }
    
    .sidebar-glass {
      background: rgba(10, 25, 41, 0.7);
      backdrop-filter: blur(20px);
      border-right: 1px solid rgba(245, 158, 11, 0.2);
    }
    
    .nav-item-active {
      background: linear-gradient(90deg, rgba(245, 158, 11, 0.15) 0%, transparent 100%);
      border-left: 3px solid #f59e0b;
    }
    
    .neon-text-amber { text-shadow: 0 0 10px rgba(245, 158, 11, 0.5); }
    .neon-text-cyan { text-shadow: 0 0 10px rgba(6, 182, 212, 0.5); }
  `;

  return (
    <>
      <GlobalErrorHandler />
      <style>{globalStyles}</style>
      
      <Toaster position="top-right" theme="dark" toastOptions={{ style: { background: '#0a1929', border: '1px solid #f59e0b', color: '#fff' } }} />
      <CircuitBackground />
      
      <IntroVideo open={showIntro} onComplete={handleIntroComplete} canSkip={true} />
      {currentOrg && <OnboardingWizard open={showOnboarding} onComplete={handleOnboardingComplete} />}
      
      <div className="flex h-screen overflow-hidden bg-holo-blue text-white selection:bg-neon-amber/30">
        <Sidebar className="sidebar-glass w-72 flex-shrink-0 hidden md:flex flex-col z-50">
          <SidebarHeader className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-12 h-12 relative group cursor-pointer" onClick={() => setShowIntro(true)}>
                  <div className="absolute inset-0 bg-neon-cyan/20 rounded-full blur-md group-hover:bg-neon-cyan/40 transition-all duration-500" />
                  <img src={nakedCloudFlipLogo} alt="CloudFlip" className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
               </div>
               <div>
                 <h2 className="font-brand text-2xl bg-gradient-to-r from-neon-amber to-orange-500 bg-clip-text text-transparent neon-text-amber">
                   {currentOrg?.settings?.brand_name || "CloudFlip"}
                 </h2>
                 <p className="text-[10px] text-white/50 tracking-widest uppercase font-tech">
                   Powered by MrTechSys
                 </p>
               </div>
            </div>
            
            <div className="flex items-center justify-between bg-white/5 p-2 rounded-lg border border-white/5">
              <Badge variant="outline" className={`${planInfo?.color} border-0 text-white`}>
                {PlanIcon && <PlanIcon className="w-3 h-3 mr-1" />}
                {planInfo?.label}
              </Badge>
              {isFeatureAvailable('presence', subscription?.plan) && <GlobalPresence />}
            </div>
          </SidebarHeader>

          <SidebarContent className="flex-1 overflow-y-auto px-2 py-4 space-y-6 scrollbar-thin scrollbar-thumb-neon-amber/20">
            {/* Main Navigation */}
            <SidebarGroup>
              <h4 className="px-4 text-xs font-bold text-white/40 uppercase tracking-widest mb-2 font-tech">Operations</h4>
              <SidebarMenu>
                {mainNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={location.pathname === item.url} 
                      className={`w-full justify-start gap-3 px-4 py-2 rounded-lg transition-all duration-200 group hover:bg-white/5 ${location.pathname === item.url ? 'nav-item-active text-white' : 'text-white/70'}`}
                    >
                      <Link to={item.url}>
                        <item.icon className={`w-5 h-5 ${item.color} group-hover:drop-shadow-[0_0_8px_currentColor]`} />
                        <span className="group-hover:text-white transition-colors">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>

            {/* CRM Collapsible */}
            <Collapsible open={crmOpen} onOpenChange={setCrmOpen}>
              <SidebarGroup>
                <CollapsibleTrigger className="w-full">
                  <h4 className="px-4 text-xs font-bold text-white/40 uppercase tracking-widest mb-2 font-tech flex items-center justify-between hover:text-white/60 transition-colors">
                    CRM Intelligence
                    <ChevronDown className={`w-3 h-3 transition-transform ${crmOpen ? '' : '-rotate-90'}`} />
                  </h4>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenu>
                    {crmNavItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={location.pathname === item.url}
                          className={`w-full justify-start gap-3 px-4 py-2 rounded-lg transition-all duration-200 group hover:bg-white/5 ${location.pathname === item.url ? 'nav-item-active text-white' : 'text-white/70'}`}
                        >
                          <Link to={item.url}>
                            <item.icon className={`w-5 h-5 ${item.color} group-hover:drop-shadow-[0_0_8px_currentColor]`} />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>

            {/* Security Collapsible */}
            <Collapsible open={securityOpen} onOpenChange={setSecurityOpen}>
              <SidebarGroup>
                 <CollapsibleTrigger className="w-full">
                  <h4 className="px-4 text-xs font-bold text-white/40 uppercase tracking-widest mb-2 font-tech flex items-center justify-between hover:text-white/60 transition-colors">
                    Security Command
                    <ChevronDown className={`w-3 h-3 transition-transform ${securityOpen ? '' : '-rotate-90'}`} />
                  </h4>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenu>
                     <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={location.pathname === createPageUrl("SecurityCommandCenter")}
                           className={`w-full justify-start gap-3 px-4 py-2 rounded-lg transition-all duration-200 group hover:bg-white/5 ${location.pathname === createPageUrl("SecurityCommandCenter") ? 'nav-item-active text-white' : 'text-white/70'}`}
                        >
                           <Link to={createPageUrl("SecurityCommandCenter")}>
                              <Shield className="w-5 h-5 text-neon-red group-hover:drop-shadow-[0_0_8px_currentColor]" />
                              <span>Command Center</span>
                           </Link>
                        </SidebarMenuButton>
                     </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={location.pathname === createPageUrl("SecurityComplianceCenter")}
                           className={`w-full justify-start gap-3 px-4 py-2 rounded-lg transition-all duration-200 group hover:bg-white/5 ${location.pathname === createPageUrl("SecurityComplianceCenter") ? 'nav-item-active text-white' : 'text-white/70'}`}
                        >
                           <Link to={createPageUrl("SecurityComplianceCenter")}>
                              <Database className="w-5 h-5 text-neon-red group-hover:drop-shadow-[0_0_8px_currentColor]" />
                              <span>Compliance & Audit</span>
                           </Link>
                        </SidebarMenuButton>
                     </SidebarMenuItem>
                  </SidebarMenu>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>

            {/* Growth Collapsible */}
            <Collapsible open={growthOpen} onOpenChange={setGrowthOpen}>
               <SidebarGroup>
                  <CollapsibleTrigger className="w-full">
                     <h4 className="px-4 text-xs font-bold text-white/40 uppercase tracking-widest mb-2 font-tech flex items-center justify-between hover:text-white/60 transition-colors">
                     Growth Engines
                     <ChevronDown className={`w-3 h-3 transition-transform ${growthOpen ? '' : '-rotate-90'}`} />
                     </h4>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                     <SidebarMenu>
                        {growthNavItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                           <SidebarMenuButton asChild isActive={location.pathname === item.url}
                              className={`w-full justify-start gap-3 px-4 py-2 rounded-lg transition-all duration-200 group hover:bg-white/5 ${location.pathname === item.url ? 'nav-item-active text-white' : 'text-white/70'}`}
                           >
                              <Link to={item.url}>
                              <item.icon className={`w-5 h-5 ${item.color} group-hover:drop-shadow-[0_0_8px_currentColor]`} />
                              <span>{item.title}</span>
                              </Link>
                           </SidebarMenuButton>
                        </SidebarMenuItem>
                        ))}
                     </SidebarMenu>
                  </CollapsibleContent>
               </SidebarGroup>
            </Collapsible>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-white/10 bg-black/40 backdrop-blur-sm">
             {user && (
                <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between hover:bg-white/5 px-2">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-neon-amber to-red-500 flex items-center justify-center font-bold text-black border border-white/20">
                               {user.full_name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="text-left hidden lg:block">
                               <p className="text-sm font-medium text-white truncate w-24">{user.full_name}</p>
                               <p className="text-xs text-white/50 truncate w-24">{user.email}</p>
                            </div>
                         </div>
                         <ChevronDown className="w-4 h-4 text-white/50" />
                      </Button>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent className="w-56 bg-holo-blue border border-white/10 text-white" align="end">
                      {organizations.map(org => (
                         <DropdownMenuItem key={org.id} onClick={() => handleOrgSwitch(org.id)} className="hover:bg-white/10 cursor-pointer">
                            <Building className="w-4 h-4 mr-2 text-neon-cyan" />
                            {org.name}
                            {org.id === currentOrg?.id && <CheckCircle className="w-4 h-4 ml-auto text-neon-green" />}
                         </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem onClick={handleLogout} className="hover:bg-red-900/20 text-red-400 cursor-pointer">
                         <LogOut className="w-4 h-4 mr-2" />
                         Sign Out
                      </DropdownMenuItem>
                   </DropdownMenuContent>
                </DropdownMenu>
             )}
          </SidebarFooter>
        </Sidebar>

        {/* Mobile Sidebar Overlay */}
        {openMobile && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden" onClick={() => setOpenMobile(false)} />
        )}
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
           {/* Mobile Header */}
           <header className="md:hidden h-16 border-b border-white/10 bg-holo-blue/80 backdrop-blur-md flex items-center justify-between px-4 z-40">
              <Button variant="ghost" size="icon" onClick={() => setOpenMobile(true)}>
                 <Menu className="w-6 h-6 text-neon-amber" />
              </Button>
              <div className="flex items-center gap-2">
                 <img src={nakedCloudFlipLogo} alt="Logo" className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
                 <span className="font-brand text-lg text-white font-bold">{currentOrg?.settings?.brand_name || "CloudFlip"}</span>
              </div>
              <div className="w-10" /> {/* Spacer */}
           </header>

           <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 p-4 md:p-6 lg:p-8 relative">
              {children}
              <div className="mt-12 border-t border-white/5 pt-6">
                 <CopyrightFooter />
              </div>
           </main>
        </div>

        {/* Scroll to Top */}
        <AnimatePresence>
           {showScrollTop && (
              <motion.button
                 initial={{ opacity: 0, scale: 0.5 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.5 }}
                 onClick={scrollToTop}
                 className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-neon-amber text-black flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:shadow-[0_0_30px_rgba(245,158,11,0.8)] transition-all z-50 hover:scale-110"
              >
                 <ArrowUp className="w-6 h-6 font-bold" />
              </motion.button>
           )}
        </AnimatePresence>

        {!isLegalPage && <AIChatWidget />}
        {user && currentOrg && !showOnboarding && <OnboardingAssistant user={user} organization={currentOrg} />}
      </div>
    </>
  );
}

export default function Layout({ children }) {
  return (
    <ErrorBoundary>
      <SidebarProvider>
        <LayoutContent>{children}</LayoutContent>
      </SidebarProvider>
    </ErrorBoundary>
  );
}
