import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Leads from "./Leads";

import Quotes from "./Quotes";

import Jobs from "./Jobs";

import Invoices from "./Invoices";

import Settings from "./Settings";

import Billing from "./Billing";

import Help from "./Help";

import SecurityCenter from "./SecurityCenter";

import FeatureMarketplace from "./FeatureMarketplace";

import Integrations from "./Integrations";

import DataPrivacy from "./DataPrivacy";

import CRMContacts from "./CRMContacts";

import CRMLeads from "./CRMLeads";

import CRMDeals from "./CRMDeals";

import OAuthFacebookCallback from "./OAuthFacebookCallback";

import TermsOfService from "./TermsOfService";

import Cookies from "./Cookies";

import BillingDashboard from "./BillingDashboard";

import ContactUs from "./ContactUs";

import CRMTickets from "./CRMTickets";

import CRMAnalytics from "./CRMAnalytics";

import CRMSettings from "./CRMSettings";

import Reports from "./Reports";

import CustomDashboard from "./CustomDashboard";

import NurtureWorkflows from "./NurtureWorkflows";

import AdvancedReports from "./AdvancedReports";

import CRMIntegrations from "./CRMIntegrations";

import EmailCenter from "./EmailCenter";

import ClientPortal from "./ClientPortal";

import HowWeWork from "./HowWeWork";

import OpsObservability from "./OpsObservability";

import LaunchControlCenter from "./LaunchControlCenter";

import OpsTraffic from "./OpsTraffic";

import SOC2CommandCenter from "./SOC2CommandCenter";

import SOC2ControlsDashboard from "./SOC2ControlsDashboard";

import EvidenceVault from "./EvidenceVault";

import APIPlayground from "./APIPlayground";

import ScheduledReports from "./ScheduledReports";

import OpsDeploys from "./OpsDeploys";

import RoleManagement from "./RoleManagement";

import ReportDesigner from "./ReportDesigner";

import SupportInbox from "./SupportInbox";

import OpsIncidents from "./OpsIncidents";

import OpsRegressionTesting from "./OpsRegressionTesting";

import LiveAnalytics from "./LiveAnalytics";

import CRMCommandCenter from "./CRMCommandCenter";

import SecurityCommandCenter from "./SecurityCommandCenter";

import VerticalHub from "./VerticalHub";

import SLADashboard from "./SLADashboard";

import ComplianceDashboard from "./ComplianceDashboard";

import DevOpsPlanner from "./DevOpsPlanner";

import SentinelSRE from "./SentinelSRE";

import AutoDocumentation from "./AutoDocumentation";

import SystemAnalytics from "./SystemAnalytics";

import CICDPipeline from "./CICDPipeline";

import WorkflowBuilder from "./WorkflowBuilder";

import PersonalDashboard from "./PersonalDashboard";

import Communications from "./Communications";

import ReportsHub from "./ReportsHub";

import AISalesAssistant from "./AISalesAssistant";

import AdvancedAnalytics from "./AdvancedAnalytics";

import AIAnalytics from "./AIAnalytics";

import SmartBooking from "./SmartBooking";

import ClientMemory from "./ClientMemory";

import ReferralHub from "./ReferralHub";

import ReviewManager from "./ReviewManager";

import SocialScheduler from "./SocialScheduler";

import Profile from "./Profile";

import AnalyticsDashboards from "./AnalyticsDashboards";

import GrowthEngine from "./GrowthEngine";

import LocalSEOManager from "./LocalSEOManager";

import AIAdminHub from "./AIAdminHub";

import CustomizableDashboard from "./CustomizableDashboard";

import SREAgent from "./SREAgent";

import MarketplaceHub from "./MarketplaceHub";

import TicketingSystem from "./TicketingSystem";

import AssetInventory from "./AssetInventory";

import PatchBoard from "./PatchBoard";

import BackupManager from "./BackupManager";

import MFASettings from "./MFASettings";

import LeadScraper from "./LeadScraper";

import TenantSecurityProfile from "./TenantSecurityProfile";

import Robots from "./Robots";

import Sitemap from "./Sitemap";

import ContentGenerator from "./ContentGenerator";

import TrafficMonitor from "./TrafficMonitor";

import SecurityComplianceCenter from "./SecurityComplianceCenter";

import DisasterRecovery from "./DisasterRecovery";

import StripePOS from "./StripePOS";

import PaymentSuccess from "./PaymentSuccess";

import PaymentCancel from "./PaymentCancel";

import SecurityHub from "./SecurityHub";

import BrandingSettings from "./BrandingSettings";

import AutomationBuilder from "./AutomationBuilder";

import ReportBuilder from "./ReportBuilder";

import JobsCinematic from "./JobsCinematic";

import TeamCollaboration from "./TeamCollaboration";

import AIInsightsHub from "./AIInsightsHub";

import TaskManagement from "./TaskManagement";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Leads: Leads,
    
    Quotes: Quotes,
    
    Jobs: Jobs,
    
    Invoices: Invoices,
    
    Settings: Settings,
    
    Billing: Billing,
    
    Help: Help,
    
    SecurityCenter: SecurityCenter,
    
    FeatureMarketplace: FeatureMarketplace,
    
    Integrations: Integrations,
    
    DataPrivacy: DataPrivacy,
    
    CRMContacts: CRMContacts,
    
    CRMLeads: CRMLeads,
    
    CRMDeals: CRMDeals,
    
    OAuthFacebookCallback: OAuthFacebookCallback,
    
    TermsOfService: TermsOfService,
    
    Cookies: Cookies,
    
    BillingDashboard: BillingDashboard,
    
    ContactUs: ContactUs,
    
    CRMTickets: CRMTickets,
    
    CRMAnalytics: CRMAnalytics,
    
    CRMSettings: CRMSettings,
    
    Reports: Reports,
    
    CustomDashboard: CustomDashboard,
    
    NurtureWorkflows: NurtureWorkflows,
    
    AdvancedReports: AdvancedReports,
    
    CRMIntegrations: CRMIntegrations,
    
    EmailCenter: EmailCenter,
    
    ClientPortal: ClientPortal,
    
    HowWeWork: HowWeWork,
    
    OpsObservability: OpsObservability,
    
    LaunchControlCenter: LaunchControlCenter,
    
    OpsTraffic: OpsTraffic,
    
    SOC2CommandCenter: SOC2CommandCenter,
    
    SOC2ControlsDashboard: SOC2ControlsDashboard,
    
    EvidenceVault: EvidenceVault,
    
    APIPlayground: APIPlayground,
    
    ScheduledReports: ScheduledReports,
    
    OpsDeploys: OpsDeploys,
    
    RoleManagement: RoleManagement,
    
    ReportDesigner: ReportDesigner,
    
    SupportInbox: SupportInbox,
    
    OpsIncidents: OpsIncidents,
    
    OpsRegressionTesting: OpsRegressionTesting,
    
    LiveAnalytics: LiveAnalytics,
    
    CRMCommandCenter: CRMCommandCenter,
    
    SecurityCommandCenter: SecurityCommandCenter,
    
    VerticalHub: VerticalHub,
    
    SLADashboard: SLADashboard,
    
    ComplianceDashboard: ComplianceDashboard,
    
    DevOpsPlanner: DevOpsPlanner,
    
    SentinelSRE: SentinelSRE,
    
    AutoDocumentation: AutoDocumentation,
    
    SystemAnalytics: SystemAnalytics,
    
    CICDPipeline: CICDPipeline,
    
    WorkflowBuilder: WorkflowBuilder,
    
    PersonalDashboard: PersonalDashboard,
    
    Communications: Communications,
    
    ReportsHub: ReportsHub,
    
    AISalesAssistant: AISalesAssistant,
    
    AdvancedAnalytics: AdvancedAnalytics,
    
    AIAnalytics: AIAnalytics,
    
    SmartBooking: SmartBooking,
    
    ClientMemory: ClientMemory,
    
    ReferralHub: ReferralHub,
    
    ReviewManager: ReviewManager,
    
    SocialScheduler: SocialScheduler,
    
    Profile: Profile,
    
    AnalyticsDashboards: AnalyticsDashboards,
    
    GrowthEngine: GrowthEngine,
    
    LocalSEOManager: LocalSEOManager,
    
    AIAdminHub: AIAdminHub,
    
    CustomizableDashboard: CustomizableDashboard,
    
    SREAgent: SREAgent,
    
    MarketplaceHub: MarketplaceHub,
    
    TicketingSystem: TicketingSystem,
    
    AssetInventory: AssetInventory,
    
    PatchBoard: PatchBoard,
    
    BackupManager: BackupManager,
    
    MFASettings: MFASettings,
    
    LeadScraper: LeadScraper,
    
    TenantSecurityProfile: TenantSecurityProfile,
    
    Robots: Robots,
    
    Sitemap: Sitemap,
    
    ContentGenerator: ContentGenerator,
    
    TrafficMonitor: TrafficMonitor,
    
    SecurityComplianceCenter: SecurityComplianceCenter,
    
    DisasterRecovery: DisasterRecovery,
    
    StripePOS: StripePOS,
    
    PaymentSuccess: PaymentSuccess,
    
    PaymentCancel: PaymentCancel,
    
    SecurityHub: SecurityHub,
    
    BrandingSettings: BrandingSettings,
    
    AutomationBuilder: AutomationBuilder,
    
    ReportBuilder: ReportBuilder,
    
    JobsCinematic: JobsCinematic,
    
    TeamCollaboration: TeamCollaboration,
    
    AIInsightsHub: AIInsightsHub,
    
    TaskManagement: TaskManagement,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Leads" element={<Leads />} />
                
                <Route path="/Quotes" element={<Quotes />} />
                
                <Route path="/Jobs" element={<Jobs />} />
                
                <Route path="/Invoices" element={<Invoices />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/Billing" element={<Billing />} />
                
                <Route path="/Help" element={<Help />} />
                
                <Route path="/SecurityCenter" element={<SecurityCenter />} />
                
                <Route path="/FeatureMarketplace" element={<FeatureMarketplace />} />
                
                <Route path="/Integrations" element={<Integrations />} />
                
                <Route path="/DataPrivacy" element={<DataPrivacy />} />
                
                <Route path="/CRMContacts" element={<CRMContacts />} />
                
                <Route path="/CRMLeads" element={<CRMLeads />} />
                
                <Route path="/CRMDeals" element={<CRMDeals />} />
                
                <Route path="/OAuthFacebookCallback" element={<OAuthFacebookCallback />} />
                
                <Route path="/TermsOfService" element={<TermsOfService />} />
                
                <Route path="/Cookies" element={<Cookies />} />
                
                <Route path="/BillingDashboard" element={<BillingDashboard />} />
                
                <Route path="/ContactUs" element={<ContactUs />} />
                
                <Route path="/CRMTickets" element={<CRMTickets />} />
                
                <Route path="/CRMAnalytics" element={<CRMAnalytics />} />
                
                <Route path="/CRMSettings" element={<CRMSettings />} />
                
                <Route path="/Reports" element={<Reports />} />
                
                <Route path="/CustomDashboard" element={<CustomDashboard />} />
                
                <Route path="/NurtureWorkflows" element={<NurtureWorkflows />} />
                
                <Route path="/AdvancedReports" element={<AdvancedReports />} />
                
                <Route path="/CRMIntegrations" element={<CRMIntegrations />} />
                
                <Route path="/EmailCenter" element={<EmailCenter />} />
                
                <Route path="/ClientPortal" element={<ClientPortal />} />
                
                <Route path="/HowWeWork" element={<HowWeWork />} />
                
                <Route path="/OpsObservability" element={<OpsObservability />} />
                
                <Route path="/LaunchControlCenter" element={<LaunchControlCenter />} />
                
                <Route path="/OpsTraffic" element={<OpsTraffic />} />
                
                <Route path="/SOC2CommandCenter" element={<SOC2CommandCenter />} />
                
                <Route path="/SOC2ControlsDashboard" element={<SOC2ControlsDashboard />} />
                
                <Route path="/EvidenceVault" element={<EvidenceVault />} />
                
                <Route path="/APIPlayground" element={<APIPlayground />} />
                
                <Route path="/ScheduledReports" element={<ScheduledReports />} />
                
                <Route path="/OpsDeploys" element={<OpsDeploys />} />
                
                <Route path="/RoleManagement" element={<RoleManagement />} />
                
                <Route path="/ReportDesigner" element={<ReportDesigner />} />
                
                <Route path="/SupportInbox" element={<SupportInbox />} />
                
                <Route path="/OpsIncidents" element={<OpsIncidents />} />
                
                <Route path="/OpsRegressionTesting" element={<OpsRegressionTesting />} />
                
                <Route path="/LiveAnalytics" element={<LiveAnalytics />} />
                
                <Route path="/CRMCommandCenter" element={<CRMCommandCenter />} />
                
                <Route path="/SecurityCommandCenter" element={<SecurityCommandCenter />} />
                
                <Route path="/VerticalHub" element={<VerticalHub />} />
                
                <Route path="/SLADashboard" element={<SLADashboard />} />
                
                <Route path="/ComplianceDashboard" element={<ComplianceDashboard />} />
                
                <Route path="/DevOpsPlanner" element={<DevOpsPlanner />} />
                
                <Route path="/SentinelSRE" element={<SentinelSRE />} />
                
                <Route path="/AutoDocumentation" element={<AutoDocumentation />} />
                
                <Route path="/SystemAnalytics" element={<SystemAnalytics />} />
                
                <Route path="/CICDPipeline" element={<CICDPipeline />} />
                
                <Route path="/WorkflowBuilder" element={<WorkflowBuilder />} />
                
                <Route path="/PersonalDashboard" element={<PersonalDashboard />} />
                
                <Route path="/Communications" element={<Communications />} />
                
                <Route path="/ReportsHub" element={<ReportsHub />} />
                
                <Route path="/AISalesAssistant" element={<AISalesAssistant />} />
                
                <Route path="/AdvancedAnalytics" element={<AdvancedAnalytics />} />
                
                <Route path="/AIAnalytics" element={<AIAnalytics />} />
                
                <Route path="/SmartBooking" element={<SmartBooking />} />
                
                <Route path="/ClientMemory" element={<ClientMemory />} />
                
                <Route path="/ReferralHub" element={<ReferralHub />} />
                
                <Route path="/ReviewManager" element={<ReviewManager />} />
                
                <Route path="/SocialScheduler" element={<SocialScheduler />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/AnalyticsDashboards" element={<AnalyticsDashboards />} />
                
                <Route path="/GrowthEngine" element={<GrowthEngine />} />
                
                <Route path="/LocalSEOManager" element={<LocalSEOManager />} />
                
                <Route path="/AIAdminHub" element={<AIAdminHub />} />
                
                <Route path="/CustomizableDashboard" element={<CustomizableDashboard />} />
                
                <Route path="/SREAgent" element={<SREAgent />} />
                
                <Route path="/MarketplaceHub" element={<MarketplaceHub />} />
                
                <Route path="/TicketingSystem" element={<TicketingSystem />} />
                
                <Route path="/AssetInventory" element={<AssetInventory />} />
                
                <Route path="/PatchBoard" element={<PatchBoard />} />
                
                <Route path="/BackupManager" element={<BackupManager />} />
                
                <Route path="/MFASettings" element={<MFASettings />} />
                
                <Route path="/LeadScraper" element={<LeadScraper />} />
                
                <Route path="/TenantSecurityProfile" element={<TenantSecurityProfile />} />
                
                <Route path="/Robots" element={<Robots />} />
                
                <Route path="/Sitemap" element={<Sitemap />} />
                
                <Route path="/ContentGenerator" element={<ContentGenerator />} />
                
                <Route path="/TrafficMonitor" element={<TrafficMonitor />} />
                
                <Route path="/SecurityComplianceCenter" element={<SecurityComplianceCenter />} />
                
                <Route path="/DisasterRecovery" element={<DisasterRecovery />} />
                
                <Route path="/StripePOS" element={<StripePOS />} />
                
                <Route path="/PaymentSuccess" element={<PaymentSuccess />} />
                
                <Route path="/PaymentCancel" element={<PaymentCancel />} />
                
                <Route path="/SecurityHub" element={<SecurityHub />} />
                
                <Route path="/BrandingSettings" element={<BrandingSettings />} />
                
                <Route path="/AutomationBuilder" element={<AutomationBuilder />} />
                
                <Route path="/ReportBuilder" element={<ReportBuilder />} />
                
                <Route path="/JobsCinematic" element={<JobsCinematic />} />
                
                <Route path="/TeamCollaboration" element={<TeamCollaboration />} />
                
                <Route path="/AIInsightsHub" element={<AIInsightsHub />} />
                
                <Route path="/TaskManagement" element={<TaskManagement />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}