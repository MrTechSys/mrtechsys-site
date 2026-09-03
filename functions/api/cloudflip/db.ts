// functions/db.ts

export interface DBEntity<T> {
  list(options?: any): Promise<T[]>;
  get(id: string): Promise<T | null>;
  create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  filter(query: any, order?: string, limit?: number): Promise<T[]>;
}

// In a real Worker, `env.DB` is passed in request handler. 
// We need a factory or a way to access it. 
// Since this file exports a static object, we'll change it to a factory function 
// or rely on the `env` being passed to the router which then initializes the entities.

// Let's change the export to be a function that takes the D1 database instance.

export const createDb = (d1: D1Database) => ({
  users: createEntity<any>(d1, 'users'),
  refreshSessions: createEntity<any>(d1, 'refresh_sessions'),
  organizations: createEntity<any>(d1, 'organizations'),
  clients: createEntity<any>(d1, 'clients'),
  leads: createEntity<any>(d1, 'leads'),
  products: createEntity<any>(d1, 'products'),
  quotes: createEntity<any>(d1, 'quotes'),
  jobs: createEntity<any>(d1, 'jobs'),
  invoices: createEntity<any>(d1, 'invoices'),
  payments: createEntity<any>(d1, 'payments'),
  activities: createEntity<any>(d1, 'activities'),
  billingSubscriptions: createEntity<any>(d1, 'billing_subscriptions'),
  usageEvents: createEntity<any>(d1, 'usage_events'),
  auditLogs: createEntity<any>(d1, 'audit_logs'),
  industryTemplates: createEntity<any>(d1, 'industry_templates'),
  quoteVersions: createEntity<any>(d1, 'quote_versions'),
  connectedAccounts: createEntity<any>(d1, 'connected_accounts'),
  contacts: createEntity<any>(d1, 'contacts'),
  deals: createEntity<any>(d1, 'deals'),
  tickets: createEntity<any>(d1, 'tickets'),
  crmActivities: createEntity<any>(d1, 'crm_activities'),
  agentTasks: createEntity<any>(d1, 'agent_tasks'),
  eventMicroSignals: createEntity<any>(d1, 'event_micro_signals'),
  payrollEntries: createEntity<any>(d1, 'payroll_entries'),
  commissionRules: createEntity<any>(d1, 'commission_rules'),
  commissionPayouts: createEntity<any>(d1, 'commission_payouts'),
  dataImports: createEntity<any>(d1, 'data_imports'),
  tasks: createEntity<any>(d1, 'tasks'),
  emailDrafts: createEntity<any>(d1, 'email_drafts'),
  reportSchedules: createEntity<any>(d1, 'report_schedules'),
  dashboardWidgets: createEntity<any>(d1, 'dashboard_widgets'),
  nurtureWorkflows: createEntity<any>(d1, 'nurture_workflows'),
  nurtureEnrollments: createEntity<any>(d1, 'nurture_enrollments'),
  emailEngagements: createEntity<any>(d1, 'email_engagements'),
  aiInsights: createEntity<any>(d1, 'ai_insights'),
  forecasts: createEntity<any>(d1, 'forecasts'),
  crmSyncs: createEntity<any>(d1, 'crm_syncs'),
  comments: createEntity<any>(d1, 'comments'),
  teamActivities: createEntity<any>(d1, 'team_activities'),
  securityLogs: createEntity<any>(d1, 'security_logs'),
  rateLimitLogs: createEntity<any>(d1, 'rate_limit_logs'),
  clientPortalAccesses: createEntity<any>(d1, 'client_portal_accesses'),
  infraBaselines: createEntity<any>(d1, 'infra_baselines'),
  businessGoals: createEntity<any>(d1, 'business_goals'),
  readinessScores: createEntity<any>(d1, 'readiness_scores'),
  planRecommendations: createEntity<any>(d1, 'plan_recommendations'),
  migrationPaths: createEntity<any>(d1, 'migration_paths'),
  devOpsTeams: createEntity<any>(d1, 'dev_ops_teams'),
  pipelines: createEntity<any>(d1, 'pipelines'),
  releases: createEntity<any>(d1, 'releases'),
  telemetryEvents: createEntity<any>(d1, 'telemetry_events'),
  metricsRollups: createEntity<any>(d1, 'metrics_rollups'),
  alertRules: createEntity<any>(d1, 'alert_rules'),
  featureFlags: createEntity<any>(d1, 'feature_flags'),
  adminSettings: createEntity<any>(d1, 'admin_settings'),
  services: createEntity<any>(d1, 'services'),
  metricsTimeSeries: createEntity<any>(d1, 'metrics_time_series'),
  logEntries: createEntity<any>(d1, 'log_entries'),
  incidents: createEntity<any>(d1, 'incidents'),
  sloDefinitions: createEntity<any>(d1, 'slo_definitions'),
  sloBurns: createEntity<any>(d1, 'slo_burns'),
  anomalies: createEntity<any>(d1, 'anomalies'),
  complianceControls: createEntity<any>(d1, 'compliance_controls'),
  complianceMetrics: createEntity<any>(d1, 'compliance_metrics'),
  complianceAuditLogs: createEntity<any>(d1, 'compliance_audit_logs'),
  evidenceItems: createEntity<any>(d1, 'evidence_items'),
  capacityForecasts: createEntity<any>(d1, 'capacity_forecasts'),
  slas: createEntity<any>(d1, 'slas'),
  pipelineRuns: createEntity<any>(d1, 'pipeline_runs'),
  builds: createEntity<any>(d1, 'builds'),
  userRoles: createEntity<any>(d1, 'user_roles'),
  widgetRegistries: createEntity<any>(d1, 'widget_registries'),
  dashboardLayouts: createEntity<any>(d1, 'dashboard_layouts'),
  reportViews: createEntity<any>(d1, 'report_views'),
  onboardingWizardStates: createEntity<any>(d1, 'onboarding_wizard_states'),
  tutorials: createEntity<any>(d1, 'tutorials'),
  tooltipDefs: createEntity<any>(d1, 'tooltip_defs'),
  supportTickets: createEntity<any>(d1, 'support_tickets'),
  kbArticles: createEntity<any>(d1, 'kb_articles'),
  aiSuggestions: createEntity<any>(d1, 'ai_suggestions'),
  customAlerts: createEntity<any>(d1, 'custom_alerts'),
  baselineSnapshots: createEntity<any>(d1, 'baseline_snapshots'),
  liveMetrics: createEntity<any>(d1, 'live_metrics'),
  regressionTests: createEntity<any>(d1, 'regression_tests'),
  multiVariateAnomalies: createEntity<any>(d1, 'multi_variate_anomalies'),
  complianceTrackers: createEntity<any>(d1, 'compliance_trackers'),
  complianceFindings: createEntity<any>(d1, 'compliance_findings'),
  remediationTasks: createEntity<any>(d1, 'remediation_tasks'),
  devOpsRoadmaps: createEntity<any>(d1, 'dev_ops_roadmaps'),
  devOpsEpics: createEntity<any>(d1, 'dev_ops_epics'),
  devOpsSprints: createEntity<any>(d1, 'dev_ops_sprints'),
  systemHealths: createEntity<any>(d1, 'system_healths'),
  dataflowAudits: createEntity<any>(d1, 'dataflow_audits'),
  distributedTraces: createEntity<any>(d1, 'distributed_traces'),
  predictedIncidents: createEntity<any>(d1, 'predicted_incidents'),
  autoDocumentations: createEntity<any>(d1, 'auto_documentations'),
  canaryDeployments: createEntity<any>(d1, 'canary_deployments'),
  securityAlerts: createEntity<any>(d1, 'security_alerts'),
  performanceBenchmarks: createEntity<any>(d1, 'performance_benchmarks'),
  workflowAutomations: createEntity<any>(d1, 'workflow_automations'),
  workflowExecutions: createEntity<any>(d1, 'workflow_executions'),
  personalGoals: createEntity<any>(d1, 'personal_goals'),
  userPresences: createEntity<any>(d1, 'user_presences'),
  collaborativeDocuments: createEntity<any>(d1, 'collaborative_documents'),
  appointments: createEntity<any>(d1, 'appointments'),
  clientPreferences: createEntity<any>(d1, 'client_preferences'),
  referrals: createEntity<any>(d1, 'referrals'),
  reviews: createEntity<any>(d1, 'reviews'),
  socialPosts: createEntity<any>(d1, 'social_posts'),
  loyaltyPrograms: createEntity<any>(d1, 'loyalty_programs'),
  localSeos: createEntity<any>(d1, 'local_seos'),
  marketplaceAddons: createEntity<any>(d1, 'marketplace_addons'),
  addonInstallations: createEntity<any>(d1, 'addon_installations'),
  mfaSettings: createEntity<any>(d1, 'mfa_settings'),
  mfaAttempts: createEntity<any>(d1, 'mfa_attempts'),
  userActivityLogs: createEntity<any>(d1, 'user_activity_logs'),
  tenantSecurityProfiles: createEntity<any>(d1, 'tenant_security_profiles'),
  behaviorAnomalies: createEntity<any>(d1, 'behavior_anomalies'),
  threatIntelligences: createEntity<any>(d1, 'threat_intelligences'),
  incidentPlaybooks: createEntity<any>(d1, 'incident_playbooks'),
  signatureRules: createEntity<any>(d1, 'signature_rules'),
  externalLogSources: createEntity<any>(d1, 'external_log_sources'),
  correlationRules: createEntity<any>(d1, 'correlation_rules'),
  alertWorkflows: createEntity<any>(d1, 'alert_workflows'),
  systemConfigurations: createEntity<any>(d1, 'system_configurations'),
  notificationPreferences: createEntity<any>(d1, 'notification_preferences'),
  emailTemplates: createEntity<any>(d1, 'email_templates'),
  integrationLogs: createEntity<any>(d1, 'integration_logs'),
  reportDefinitions: createEntity<any>(d1, 'report_definitions'),
  teamMessages: createEntity<any>(d1, 'team_messages'),
  teamChannels: createEntity<any>('team_channels'),
  sharedDocuments: createEntity<any>(d1, 'shared_documents'),
  projects: createEntity<any>(d1, 'projects'),
  mfaSecurityQuestions: createEntity<any>(d1, 'mfa_security_questions'),
});

// Since the existing code imports `db` directly, we need to adapt usage.
// The consumer `[[path]].ts` and `_auth.ts` will need to be updated to call `createDb(env.DB)`.
// We can't export a static `db` object anymore because we need the env.

// However, to minimize refactoring impact for now, we can export a placeholder 
// and assume the caller will use the new `createDb` function.
export const db: any = {}; 

function createEntity<T>(d1: D1Database, tableName: string): DBEntity<T> {
  return {
    async list(options?: any) { 
        // Basic list with limit/offset support can be added
        const stmt = d1.prepare(`SELECT * FROM ${tableName} ORDER BY created_at DESC LIMIT 100`);
        const result = await stmt.all<T>();
        return result.results || [];
    },
    async get(id) { 
        const result = await d1.prepare(`SELECT * FROM ${tableName} WHERE id = ?`).bind(id).first<T>();
        return result || null;
    },
    async create(data) { 
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const keys = ['id', 'created_at', 'updated_at', ...Object.keys(data)];
        const values = [id, now, now, ...Object.values(data)];
        const placeholders = keys.map(() => '?').join(',');
        
        await d1.prepare(`INSERT INTO ${tableName} (${keys.join(',')}) VALUES (${placeholders})`)
            .bind(...values)
            .run();
            
        return { id, created_at: now, updated_at: now, ...data } as unknown as T;
    },
    async update(id, data) { 
        const updates = Object.keys(data).map(k => `${k} = ?`).join(',');
        const values = [...Object.values(data), new Date().toISOString(), id];
        
        await d1.prepare(`UPDATE ${tableName} SET ${updates}, updated_at = ? WHERE id = ?`)
            .bind(...values)
            .run();
            
        // Fetch updated
        return this.get(id) as Promise<T>;
    },
    async delete(id) { 
        await d1.prepare(`DELETE FROM ${tableName} WHERE id = ?`).bind(id).run();
    },
    async filter(query: any, order?: string, limit?: number) { 
        // Basic equality filter
        const conditions: string[] = [];
        const values: any[] = [];
        
        for (const [k, v] of Object.entries(query)) {
            conditions.push(`${k} = ?`);
            values.push(v);
        }
        
        let sql = `SELECT * FROM ${tableName}`;
        if (conditions.length > 0) {
            sql += ` WHERE ${conditions.join(' AND ')}`;
        }
        
        if (order) {
            // Very basic SQL injection prevention for order
            const [col, dir] = order.split(' '); // e.g. "created_at DESC"
            // validate col is safe-ish
            if (/^[a-zA-Z0-9_]+$/.test(col)) {
                 sql += ` ORDER BY ${col} ${dir === 'DESC' ? 'DESC' : 'ASC'}`;
            }
        }
        
        if (limit) {
            sql += ` LIMIT ${limit}`;
        } else {
            sql += ` LIMIT 100`;
        }

        const stmt = d1.prepare(sql).bind(...values);
        const result = await stmt.all<T>();
        return result.results || [];
    }
  }
}
