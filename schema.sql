-- Telemetry and Audit Logging
CREATE TABLE IF NOT EXISTS telemetry_events (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    ip TEXT,
    country TEXT,
    user_agent TEXT,
    path TEXT,
    method TEXT,
    response_status INTEGER,
    duration_ms INTEGER,
    bot_score INTEGER,
    tenant_id TEXT,
    user_id TEXT,
    component_id TEXT,
    action_type TEXT,
    metadata TEXT -- JSON string
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    user_id TEXT,
    org_id TEXT,
    action TEXT NOT NULL,
    entity TEXT,
    details TEXT, -- JSON string
    status TEXT
);

-- Users and Auth
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    org_id TEXT NOT NULL,
    role TEXT DEFAULT 'member',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS refresh_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    org_id TEXT NOT NULL,
    token_id TEXT UNIQUE NOT NULL,
    expires_at TEXT NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Auto-generated Entities
CREATE TABLE IF NOT EXISTS a_i_insights (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    entity_type TEXT,
    entity_id TEXT,
    type TEXT,
    content TEXT,
    score INTEGER,
    confidence INTEGER,
    metadata TEXT
);

CREATE TABLE IF NOT EXISTS a_i_suggestions (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    user_id TEXT,
    context TEXT,
    query TEXT,
    response TEXT,
    rating TEXT,
    feedback TEXT
);

CREATE TABLE IF NOT EXISTS a_p_i_telemetries (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    tenant_id TEXT,
    request_id TEXT,
    timestamp TEXT,
    endpoint TEXT,
    method TEXT,
    auth_context TEXT,
    request_metadata TEXT,
    response_metadata TEXT,
    network_context TEXT,
    execution_time_ms INTEGER,
    rate_limit_bucket TEXT,
    rate_limit_remaining INTEGER,
    threat_indicators TEXT,
    threat_score INTEGER,
    attack_pattern_detected TEXT,
    flagged_for_review BOOLEAN
);

CREATE TABLE IF NOT EXISTS a_p_i_tokens (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    tenant_id TEXT,
    user_id TEXT,
    client_id TEXT,
    token_hash TEXT,
    token_type TEXT,
    scopes TEXT,
    plan_tier TEXT,
    expires_at TEXT,
    last_used_at TEXT,
    revoked BOOLEAN,
    revoked_at TEXT,
    revoked_reason TEXT,
    ip_whitelist TEXT,
    metadata TEXT
);

CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    kind TEXT,
    subject TEXT,
    body TEXT,
    related_type TEXT,
    related_id TEXT,
    actor_id TEXT,
    direction TEXT
);

CREATE TABLE IF NOT EXISTS addon_installations (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    addon_id TEXT,
    status TEXT,
    configuration TEXT,
    installed_by TEXT,
    installed_at TEXT,
    last_used_at TEXT,
    usage_count INTEGER,
    error_message TEXT
);

CREATE TABLE IF NOT EXISTS admin_settingses (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    demo_mode BOOLEAN,
    production_mode BOOLEAN,
    configuration_locked BOOLEAN,
    last_security_audit TEXT,
    last_toggled_by TEXT,
    last_toggled_at TEXT,
    telemetry_enabled BOOLEAN,
    polling_frequency TEXT,
    usage_quotas_override TEXT,
    api_throttling TEXT,
    settings TEXT
);

CREATE TABLE IF NOT EXISTS agent_memories (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    agent_id TEXT,
    session_id TEXT,
    user_id TEXT,
    memory_type TEXT,
    key TEXT,
    value TEXT,
    context_embedding TEXT,
    expires_at TEXT,
    last_accessed TEXT
);

CREATE TABLE IF NOT EXISTS agent_tasks (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    agent_type TEXT,
    target_type TEXT,
    target_id TEXT,
    state TEXT,
    actions TEXT,
    reward_score INTEGER,
    error_message TEXT,
    completed_at TEXT
);

CREATE TABLE IF NOT EXISTS alert_rules (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    name TEXT,
    description TEXT,
    condition TEXT,
    threshold INTEGER,
    window_minutes INTEGER,
    severity TEXT,
    channels TEXT,
    runbook_url TEXT,
    is_active BOOLEAN,
    last_triggered TEXT,
    trigger_count INTEGER
);

CREATE TABLE IF NOT EXISTS alert_workflows (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    workflow_id TEXT,
    name TEXT,
    description TEXT,
    trigger_conditions TEXT,
    notification_channels TEXT,
    escalation_policy TEXT,
    is_active BOOLEAN,
    execution_count INTEGER,
    success_count INTEGER,
    last_executed_at TEXT,
    created_by TEXT
);

CREATE TABLE IF NOT EXISTS anomalies (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    scope TEXT,
    service_id TEXT,
    signal TEXT,
    score INTEGER,
    status TEXT,
    rca TEXT,
    detected_at TEXT,
    resolved_at TEXT
);

CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    client_id TEXT,
    contact_id TEXT,
    service_type TEXT,
    title TEXT,
    description TEXT,
    start_time TEXT,
    end_time TEXT,
    duration_minutes INTEGER,
    status TEXT,
    booking_source TEXT,
    location TEXT,
    assigned_to TEXT,
    reminder_sent BOOLEAN,
    reminder_sent_at TEXT,
    calendar_sync TEXT,
    estimated_value INTEGER,
    actual_value INTEGER,
    notes TEXT,
    client_preferences TEXT
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    entity TEXT,
    record_id TEXT,
    actor_id TEXT,
    actor_name TEXT,
    action TEXT,
    before TEXT,
    after TEXT,
    detail TEXT,
    ip_address TEXT,
    user_agent TEXT,
    hash_chain TEXT,
    metadata TEXT
);

CREATE TABLE IF NOT EXISTS auto_documentations (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    doc_id TEXT,
    doc_type TEXT,
    target_name TEXT,
    target_path TEXT,
    title TEXT,
    summary TEXT,
    description TEXT,
    parameters TEXT,
    returns TEXT,
    examples TEXT,
    dependencies TEXT,
    use_cases TEXT,
    best_practices TEXT,
    warnings TEXT,
    related_docs TEXT,
    tags TEXT,
    version TEXT,
    generated_at TEXT,
    generated_by TEXT,
    accuracy_score INTEGER,
    reviewed BOOLEAN,
    reviewed_by TEXT,
    reviewed_at TEXT
);

CREATE TABLE IF NOT EXISTS baseline_snapshots (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    snapshot_id TEXT,
    snapshot_type TEXT,
    captured_at TEXT,
    captured_by TEXT,
    services_state TEXT,
    sla_state TEXT,
    dora_metrics TEXT,
    incidents_summary TEXT,
    anomalies_active INTEGER,
    system_health_pct INTEGER,
    metrics_rollup TEXT,
    storage_size_mb INTEGER,
    retention_days INTEGER,
    tags TEXT,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS behavior_anomalies (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    user_id TEXT,
    anomaly_type TEXT,
    severity TEXT,
    anomaly_score INTEGER,
    classification_tags TEXT,
    baseline_behavior TEXT,
    detected_behavior TEXT,
    deviation_percentage INTEGER,
    threat_indicators TEXT,
    ai_analysis TEXT,
    correlation_links TEXT,
    status TEXT,
    auto_response_taken BOOLEAN,
    response_actions TEXT,
    detected_at TEXT,
    resolved_at TEXT
);

CREATE TABLE IF NOT EXISTS billing_subscriptions (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    plan_id TEXT,
    plan_tier TEXT,
    status TEXT,
    current_period_start TEXT,
    current_period_end TEXT,
    cancel_at_period_end BOOLEAN,
    legal_entity TEXT,
    usage_counts TEXT
);

CREATE TABLE IF NOT EXISTS builds (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    pipeline_run_id TEXT,
    build_number TEXT,
    status TEXT,
    started_at TEXT,
    completed_at TEXT,
    duration_seconds INTEGER,
    build_agent TEXT,
    build_logs_url TEXT,
    compiler_warnings INTEGER,
    compiler_errors INTEGER,
    unit_tests TEXT,
    integration_tests TEXT,
    code_quality TEXT,
    artifact_size_mb INTEGER,
    cache_hit BOOLEAN,
    resource_usage TEXT,
    error_details TEXT
);

CREATE TABLE IF NOT EXISTS business_goalses (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    top_priorities TEXT,
    compliance_requirements TEXT,
    budget_range TEXT,
    pain_points TEXT,
    timeline TEXT,
    team_size INTEGER,
    technical_expertise TEXT
);

CREATE TABLE IF NOT EXISTS c_r_m_activities (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    actor_id TEXT,
    entity_type TEXT,
    entity_id TEXT,
    action_type TEXT,
    metadata TEXT,
    ip_address TEXT,
    user_agent TEXT
);

CREATE TABLE IF NOT EXISTS c_r_m_syncs (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    connected_account_id TEXT,
    entity_type TEXT,
    cloudflip_id TEXT,
    external_id TEXT,
    sync_direction TEXT,
    last_synced_at TEXT,
    sync_status TEXT,
    cloudflip_updated_at TEXT,
    external_updated_at TEXT,
    field_mappings TEXT,
    conflict_resolution TEXT,
    error_log TEXT
);

CREATE TABLE IF NOT EXISTS canary_deployments (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    deployment_id TEXT,
    release_id TEXT,
    pipeline_run_id TEXT,
    canary_version TEXT,
    baseline_version TEXT,
    traffic_split TEXT,
    status TEXT,
    started_at TEXT,
    completed_at TEXT,
    duration_minutes INTEGER,
    performance_metrics TEXT,
    ai_analysis TEXT,
    health_checks TEXT,
    decision TEXT,
    decision_reason TEXT,
    promoted_at TEXT,
    rolled_back_at TEXT
);

CREATE TABLE IF NOT EXISTS capacity_forecasts (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    service_id TEXT,
    metric TEXT,
    model TEXT,
    horizon_days INTEGER,
    forecast TEXT,
    upper_bound TEXT,
    lower_bound TEXT,
    current_capacity INTEGER,
    projected_usage INTEGER,
    headroom_pct INTEGER,
    recommendation TEXT,
    generated_at TEXT
);

CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    name TEXT,
    email TEXT,
    phone TEXT,
    company TEXT,
    address TEXT,
    tags TEXT,
    notes TEXT,
    owner_id TEXT,
    stripe_customer_id TEXT
);

CREATE TABLE IF NOT EXISTS client_portal_accesses (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    client_id TEXT,
    email TEXT,
    access_token TEXT,
    is_active BOOLEAN,
    last_login TEXT,
    login_count INTEGER,
    permissions TEXT,
    invited_by TEXT,
    invited_at TEXT,
    expires_at TEXT
);

CREATE TABLE IF NOT EXISTS client_preferences (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    client_id TEXT,
    preference_type TEXT,
    key TEXT,
    value TEXT,
    importance TEXT,
    notes TEXT,
    last_confirmed TEXT,
    auto_learned BOOLEAN
);

CREATE TABLE IF NOT EXISTS collaborative_documents (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    title TEXT,
    content TEXT,
    doc_type TEXT,
    related_entity_type TEXT,
    related_entity_id TEXT,
    owner_id TEXT,
    collaborators TEXT,
    version INTEGER,
    last_edited_by TEXT,
    last_edited_at TEXT,
    is_locked BOOLEAN,
    locked_by TEXT
);

CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    entity_type TEXT,
    entity_id TEXT,
    author_id TEXT,
    author_name TEXT,
    content TEXT,
    mentions TEXT,
    is_edited BOOLEAN,
    edited_at TEXT,
    parent_comment_id TEXT,
    attachments TEXT,
    reactions TEXT
);

CREATE TABLE IF NOT EXISTS commission_payouts (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    agent_id TEXT,
    agent_name TEXT,
    job_id TEXT,
    invoice_id TEXT,
    quote_id TEXT,
    deal_id TEXT,
    rule_id TEXT,
    job_value INTEGER,
    commission_amount INTEGER,
    commission_rate INTEGER,
    status TEXT,
    payment_date TEXT,
    payment_method TEXT,
    period TEXT,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS commission_rules (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    name TEXT,
    description TEXT,
    agent_id TEXT,
    commission_type TEXT,
    percentage INTEGER,
    flat_rate INTEGER,
    tiers TEXT,
    applies_to TEXT,
    categories TEXT,
    is_active BOOLEAN,
    minimum_job_value INTEGER
);

CREATE TABLE IF NOT EXISTS compliance_audit_logs (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    event_type TEXT,
    actor TEXT,
    resource TEXT,
    action TEXT,
    result TEXT,
    ip_address TEXT,
    user_agent TEXT,
    metadata TEXT,
    timestamp TEXT
);

CREATE TABLE IF NOT EXISTS compliance_controls (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    control_id TEXT,
    category TEXT,
    name TEXT,
    description TEXT,
    owner TEXT,
    status TEXT,
    implementation_date TEXT,
    review_frequency TEXT,
    last_reviewed TEXT,
    next_review TEXT,
    evidence_required BOOLEAN,
    evidence_count INTEGER,
    automated BOOLEAN,
    test_procedures TEXT,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS compliance_findings (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    finding_id TEXT,
    source TEXT,
    regulation TEXT,
    severity TEXT,
    category TEXT,
    title TEXT,
    description TEXT,
    affected_data_types TEXT,
    affected_regions TEXT,
    endpoint TEXT,
    request_data TEXT,
    response_data TEXT,
    recommendation TEXT,
    status TEXT,
    assigned_to TEXT,
    remediation_task_id TEXT,
    detected_at TEXT,
    resolved_at TEXT,
    resolution_notes TEXT,
    recurrence_count INTEGER,
    risk_score INTEGER,
    compliance_impact TEXT
);

CREATE TABLE IF NOT EXISTS compliance_metrics (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    metric_type TEXT,
    value INTEGER,
    status TEXT,
    timestamp TEXT,
    metadata TEXT
);

CREATE TABLE IF NOT EXISTS compliance_trackers (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    item_type TEXT,
    name TEXT,
    description TEXT,
    issuing_agency TEXT,
    reference_number TEXT,
    issue_date TEXT,
    expiry_date TEXT,
    renewal_period TEXT,
    cost INTEGER,
    status TEXT,
    vertical TEXT,
    location TEXT,
    regulatory_level TEXT,
    auto_renew BOOLEAN,
    reminder_days_before INTEGER,
    document_url TEXT,
    last_checked TEXT,
    regulatory_changes_detected TEXT,
    alert_sent BOOLEAN,
    alert_sent_at TEXT,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS connected_accounts (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    user_id TEXT,
    platform TEXT,
    platform_user_id TEXT,
    platform_username TEXT,
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    token_expires_at TEXT,
    scopes_granted TEXT,
    last_synced TEXT,
    sync_enabled BOOLEAN,
    sync_frequency TEXT,
    filters TEXT,
    status TEXT,
    error_message TEXT
);

CREATE TABLE IF NOT EXISTS connected_apps (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    tenant_id TEXT,
    app_name TEXT,
    client_id TEXT,
    client_secret_hash TEXT,
    webhook_key_hash TEXT,
    allowed_event_types TEXT,
    allowed_scopes TEXT,
    redirect_uris TEXT,
    rate_limit TEXT,
    status TEXT,
    last_used_at TEXT,
    request_count INTEGER,
    webhook_failures INTEGER,
    metadata TEXT
);

CREATE TABLE IF NOT EXISTS contacts (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    company TEXT,
    title TEXT,
    tags TEXT,
    lifecycle_stage TEXT,
    owner_id TEXT,
    activity_log TEXT,
    sentiment_score INTEGER,
    emotion_state TEXT,
    last_interaction_at TEXT,
    address TEXT,
    notes TEXT,
    lead_source TEXT,
    metadata TEXT
);

CREATE TABLE IF NOT EXISTS content_assets (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    asset_type TEXT,
    title TEXT,
    content TEXT,
    lead_id TEXT,
    deal_id TEXT,
    campaign_id TEXT,
    tone TEXT,
    target_audience TEXT,
    ai_generated BOOLEAN,
    generation_prompt TEXT,
    status TEXT,
    performance_metrics TEXT,
    tags TEXT
);

CREATE TABLE IF NOT EXISTS correlation_rules (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    rule_id TEXT,
    name TEXT,
    description TEXT,
    event_pattern TEXT,
    severity TEXT,
    threshold TEXT,
    actions TEXT,
    is_active BOOLEAN,
    match_count INTEGER,
    last_matched_at TEXT,
    false_positive_count INTEGER,
    accuracy_score INTEGER,
    created_by TEXT
);

CREATE TABLE IF NOT EXISTS custom_alerts (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    name TEXT,
    description TEXT,
    metric TEXT,
    condition TEXT,
    threshold INTEGER,
    duration_minutes INTEGER,
    severity TEXT,
    notification_channels TEXT,
    service_ids TEXT,
    is_active BOOLEAN,
    last_triggered TEXT,
    trigger_count INTEGER,
    created_by TEXT
);

CREATE TABLE IF NOT EXISTS dashboard_layouts (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    user_id TEXT,
    org_id TEXT,
    widgets TEXT,
    layout_config TEXT
);

CREATE TABLE IF NOT EXISTS dashboard_widgets (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    user_id TEXT,
    dashboard_id TEXT,
    widget_type TEXT,
    title TEXT,
    data_source TEXT,
    config TEXT,
    position TEXT,
    is_visible BOOLEAN
);

CREATE TABLE IF NOT EXISTS data_imports (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    platform TEXT,
    connected_account_id TEXT,
    data_types TEXT,
    status TEXT,
    records_imported INTEGER,
    records_skipped INTEGER,
    records_failed INTEGER,
    error_log TEXT,
    summary TEXT
);

CREATE TABLE IF NOT EXISTS dataflow_audits (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    audit_id TEXT,
    source_entity TEXT,
    destination_entity TEXT,
    flow_path TEXT,
    status TEXT,
    schema_issues TEXT,
    missing_records INTEGER,
    broken_references TEXT,
    latency_ms INTEGER,
    records_processed INTEGER,
    records_failed INTEGER,
    auto_fixed BOOLEAN,
    fix_details TEXT,
    recommendation TEXT,
    checked_at TEXT
);

CREATE TABLE IF NOT EXISTS deals (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    contact_id TEXT,
    lead_id TEXT,
    name TEXT,
    owner_id TEXT,
    value INTEGER,
    close_probability INTEGER,
    expected_value INTEGER,
    pipeline_stage TEXT,
    products TEXT,
    close_date TEXT,
    forecast_quarter TEXT,
    automation_state TEXT,
    next_steps TEXT,
    lost_reason TEXT,
    metadata TEXT
);

CREATE TABLE IF NOT EXISTS dev_ops_epics (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    roadmap_id TEXT,
    epic_id TEXT,
    title TEXT,
    description TEXT,
    business_value TEXT,
    priority TEXT,
    status TEXT,
    owner_id TEXT,
    team_ids TEXT,
    start_date TEXT,
    target_date TEXT,
    completed_date TEXT,
    story_points INTEGER,
    completed_points INTEGER,
    acceptance_criteria TEXT,
    dependencies TEXT,
    labels TEXT,
    health TEXT,
    blocked_reason TEXT,
    release_version TEXT
);

CREATE TABLE IF NOT EXISTS dev_ops_roadmaps (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    name TEXT,
    description TEXT,
    vision TEXT,
    time_horizon TEXT,
    start_date TEXT,
    end_date TEXT,
    owner_id TEXT,
    stakeholders TEXT,
    objectives TEXT,
    themes TEXT,
    status TEXT,
    progress_pct INTEGER,
    epic_count INTEGER,
    sprint_count INTEGER,
    is_public BOOLEAN,
    tags TEXT
);

CREATE TABLE IF NOT EXISTS dev_ops_sprints (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    sprint_id TEXT,
    name TEXT,
    epic_id TEXT,
    sprint_number INTEGER,
    duration_weeks INTEGER,
    start_date TEXT,
    end_date TEXT,
    goal TEXT,
    status TEXT,
    team_id TEXT,
    capacity TEXT,
    user_stories TEXT,
    velocity INTEGER,
    burndown TEXT,
    metrics TEXT,
    retrospective TEXT,
    demo_completed BOOLEAN
);

CREATE TABLE IF NOT EXISTS dev_ops_teams (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    name TEXT,
    members TEXT,
    channels TEXT,
    runbooks TEXT
);

CREATE TABLE IF NOT EXISTS directory_integrations (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    tenant_id TEXT,
    integration_type TEXT,
    azure_tenant_id TEXT,
    client_id TEXT,
    client_secret_encrypted TEXT,
    redirect_uri TEXT,
    integration_status TEXT,
    sync_enabled BOOLEAN,
    sync_frequency TEXT,
    last_sync_at TEXT,
    sync_config TEXT,
    last_error TEXT
);

CREATE TABLE IF NOT EXISTS directory_sync_logs (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    tenant_id TEXT,
    integration_id TEXT,
    sync_type TEXT,
    status TEXT,
    started_at TEXT,
    completed_at TEXT,
    stats TEXT,
    errors TEXT
);

CREATE TABLE IF NOT EXISTS distributed_traces (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    trace_id TEXT,
    span_id TEXT,
    parent_span_id TEXT,
    service_name TEXT,
    operation_name TEXT,
    span_kind TEXT,
    start_time TEXT,
    end_time TEXT,
    duration_ms INTEGER,
    status TEXT,
    status_message TEXT,
    attributes TEXT,
    events TEXT,
    resource TEXT,
    environment TEXT
);

CREATE TABLE IF NOT EXISTS drafts (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    key TEXT,
    data TEXT,
    user_id TEXT,
    entity_type TEXT,
    last_modified_device TEXT
);

CREATE TABLE IF NOT EXISTS email_drafts (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    related_type TEXT,
    related_id TEXT,
    recipient_email TEXT,
    recipient_name TEXT,
    subject TEXT,
    body TEXT,
    ai_generated BOOLEAN,
    generation_context TEXT,
    sentiment_score INTEGER,
    status TEXT,
    scheduled_at TEXT,
    sent_at TEXT,
    sent_by TEXT,
    attachments TEXT
);

CREATE TABLE IF NOT EXISTS email_engagements (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    lead_id TEXT,
    enrollment_id TEXT,
    email_draft_id TEXT,
    tracking_id TEXT,
    event_type TEXT,
    link_url TEXT,
    user_agent TEXT,
    ip_address TEXT,
    device_type TEXT,
    metadata TEXT
);

CREATE TABLE IF NOT EXISTS email_templates (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    template_key TEXT,
    subject TEXT,
    body_html TEXT,
    body_text TEXT,
    variables TEXT,
    category TEXT,
    is_active BOOLEAN
);

CREATE TABLE IF NOT EXISTS event_micro_signals (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    contact_id TEXT,
    signal_type TEXT,
    weight INTEGER,
    page_url TEXT,
    session_id TEXT,
    metadata TEXT
);

CREATE TABLE IF NOT EXISTS evidence_items (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    control_id TEXT,
    name TEXT,
    description TEXT,
    file_url TEXT,
    file_type TEXT,
    collected_at TEXT,
    collected_by TEXT,
    status TEXT,
    reviewed_by TEXT,
    reviewed_at TEXT,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS external_log_sources (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    source_id TEXT,
    name TEXT,
    source_type TEXT,
    connection_config TEXT,
    normalization_schema TEXT,
    status TEXT,
    last_ingestion_at TEXT,
    logs_ingested_count INTEGER,
    error_count INTEGER,
    last_error TEXT,
    retention_days INTEGER,
    tags TEXT
);

CREATE TABLE IF NOT EXISTS feature_flags (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    flag TEXT,
    enabled BOOLEAN,
    environment TEXT,
    percentage_rollout INTEGER,
    tenant_targets TEXT,
    description TEXT,
    created_by TEXT,
    last_modified_by TEXT
);

CREATE TABLE IF NOT EXISTS forecasts (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    forecast_type TEXT,
    period_type TEXT,
    forecast_date TEXT,
    predicted_value INTEGER,
    lower_bound INTEGER,
    upper_bound INTEGER,
    confidence INTEGER,
    model_type TEXT,
    actual_value INTEGER,
    variance INTEGER,
    training_data TEXT,
    factors TEXT
);

CREATE TABLE IF NOT EXISTS groups (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    tenant_id TEXT,
    group_name TEXT,
    description TEXT,
    group_type TEXT,
    ad_synced BOOLEAN,
    ad_object_id TEXT,
    member_count INTEGER
);

CREATE TABLE IF NOT EXISTS group_memberships (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    tenant_id TEXT,
    group_id TEXT,
    user_id TEXT,
    assigned_by TEXT,
    ad_synced BOOLEAN
);

CREATE TABLE IF NOT EXISTS group_role_mappings (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    tenant_id TEXT,
    group_id TEXT,
    role_id TEXT,
    assigned_by TEXT
);

CREATE TABLE IF NOT EXISTS identity_audit_logs (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    tenant_id TEXT,
    actor_id TEXT,
    target_user_id TEXT,
    action TEXT,
    resource_type TEXT,
    resource_id TEXT,
    metadata TEXT,
    ip_address TEXT,
    user_agent TEXT
);

CREATE TABLE IF NOT EXISTS incidents (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    incident_id TEXT,
    service_id TEXT,
    severity TEXT,
    status TEXT,
    title TEXT,
    summary TEXT,
    opened_at TEXT,
    closed_at TEXT,
    opened_by TEXT,
    timeline TEXT,
    runbook_ref TEXT,
    comm_channels TEXT,
    postmortem_ref TEXT,
    impacted_customers INTEGER,
    root_cause TEXT,
    mitigation TEXT
);

CREATE TABLE IF NOT EXISTS incident_playbooks (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    playbook_id TEXT,
    name TEXT,
    description TEXT,
    trigger_conditions TEXT,
    automated_steps TEXT,
    manual_steps TEXT,
    notification_channels TEXT,
    escalation_policy TEXT,
    success_criteria TEXT,
    is_active BOOLEAN,
    execution_count INTEGER,
    success_rate INTEGER,
    avg_resolution_time_minutes INTEGER,
    last_executed_at TEXT,
    created_by TEXT
);

CREATE TABLE IF NOT EXISTS industry_templates (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    industry_name TEXT,
    display_name TEXT,
    description TEXT,
    icon TEXT,
    default_products TEXT,
    default_settings TEXT,
    quote_templates TEXT
);

CREATE TABLE IF NOT EXISTS infra_baselines (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    environment_type TEXT,
    server_count INTEGER,
    storage_type TEXT,
    backup_methods TEXT,
    networking_setup TEXT,
    security_stack TEXT,
    automation_level TEXT,
    current_challenges TEXT
);

CREATE TABLE IF NOT EXISTS integration_logs (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    integration_name TEXT,
    operation TEXT,
    request_payload TEXT,
    response_status INTEGER,
    response_data TEXT,
    duration_ms INTEGER,
    success BOOLEAN,
    error_message TEXT,
    user_id TEXT,
    ip_address TEXT
);

CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    subscription_id TEXT,
    number TEXT,
    amount_due INTEGER,
    amount_paid INTEGER,
    status TEXT,
    due_date TEXT,
    pdf_url TEXT,
    customer_tax_id TEXT,
    line_items TEXT
);

CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    quote_id TEXT,
    client_id TEXT,
    title TEXT,
    description TEXT,
    address TEXT,
    scheduled_start TEXT,
    scheduled_end TEXT,
    assignees TEXT,
    status TEXT,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS k_b_articles (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    article_id TEXT,
    title TEXT,
    body_md TEXT,
    excerpt TEXT,
    category TEXT,
    tags TEXT,
    author_id TEXT,
    is_published BOOLEAN,
    view_count INTEGER,
    helpful_count INTEGER,
    not_helpful_count INTEGER,
    last_indexed_at TEXT,
    search_vector TEXT,
    related_articles TEXT,
    seo_keywords TEXT
);

CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    contact_id TEXT,
    source TEXT,
    source_url TEXT,
    source_post_id TEXT,
    name TEXT,
    email TEXT,
    phone TEXT,
    message TEXT,
    status TEXT,
    stage TEXT,
    score INTEGER,
    confidence INTEGER,
    ai_scoring TEXT,
    expected_value INTEGER,
    close_date TEXT,
    ai_summary TEXT,
    ai_suggested_response TEXT,
    sentiment_last TEXT,
    micro_moment_signal TEXT,
    assigned_to TEXT,
    claimed_by TEXT,
    claimed_at TEXT,
    location TEXT,
    vertical_tags TEXT,
    metadata TEXT
);

CREATE TABLE IF NOT EXISTS lead_scoring_configs (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    weights TEXT,
    caps TEXT,
    source_prefs TEXT,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS live_metrics (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    session_id TEXT,
    user_id TEXT,
    page TEXT,
    event_type TEXT,
    event_name TEXT,
    properties TEXT,
    value INTEGER,
    duration_ms INTEGER,
    device TEXT,
    geo TEXT,
    timestamp TEXT
);

CREATE TABLE IF NOT EXISTS local_s_e_os (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    keyword TEXT,
    search_volume INTEGER,
    competition TEXT,
    current_rank INTEGER,
    target_rank INTEGER,
    location TEXT,
    content_suggestions TEXT,
    google_business_updates TEXT,
    impressions_30d INTEGER,
    clicks_30d INTEGER,
    last_updated TEXT
);

CREATE TABLE IF NOT EXISTS log_entries (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    service_id TEXT,
    environment TEXT,
    level TEXT,
    message TEXT,
    json_data TEXT,
    trace_id TEXT,
    span_id TEXT,
    demo BOOLEAN,
    timestamp TEXT
);

CREATE TABLE IF NOT EXISTS loyalty_programs (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    client_id TEXT,
    points INTEGER,
    tier TEXT,
    jobs_completed INTEGER,
    total_spent INTEGER,
    referrals_made INTEGER,
    badges TEXT,
    rewards_claimed TEXT,
    next_reward_at INTEGER,
    lifetime_value INTEGER,
    joined_at TEXT
);

CREATE TABLE IF NOT EXISTS marketplace_addons (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    addon_id TEXT,
    name TEXT,
    description TEXT,
    category TEXT,
    icon_url TEXT,
    icon_emoji TEXT,
    plan_requirement TEXT,
    price_type TEXT,
    monthly_price INTEGER,
    features TEXT,
    enablement_script TEXT,
    config_schema TEXT,
    is_active BOOLEAN,
    install_count INTEGER,
    rating INTEGER,
    tags TEXT
);

CREATE TABLE IF NOT EXISTS metrics_rollups (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    period TEXT,
    period_type TEXT,
    kpis TEXT,
    funnels TEXT,
    per_module TEXT,
    utm_attribution TEXT,
    errors TEXT,
    performance TEXT,
    demo_included BOOLEAN
);

CREATE TABLE IF NOT EXISTS metrics_time_serieses (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    service_id TEXT,
    environment TEXT,
    metric TEXT,
    value INTEGER,
    labels TEXT,
    demo BOOLEAN,
    timestamp TEXT
);

CREATE TABLE IF NOT EXISTS migration_paths (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    phases TEXT,
    total_estimated_weeks INTEGER,
    risk_factors TEXT,
    success_metrics TEXT,
    current_phase INTEGER,
    overall_progress INTEGER,
    phase5_enabled BOOLEAN,
    tier_progression TEXT
);

CREATE TABLE IF NOT EXISTS monitoring_findings (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    category TEXT,
    severity TEXT,
    title TEXT,
    description TEXT,
    suggested_fix TEXT,
    status TEXT,
    detected_at TEXT
);

CREATE TABLE IF NOT EXISTS multi_variate_anomalies (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    anomaly_id TEXT,
    service_id TEXT,
    correlated_metrics TEXT,
    pattern_type TEXT,
    severity_score INTEGER,
    ai_hypothesis TEXT,
    status TEXT,
    detected_at TEXT,
    resolved_at TEXT,
    incident_created_id TEXT,
    tags TEXT,
    time_series_data TEXT
);

CREATE TABLE IF NOT EXISTS notification_preferences (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    user_id TEXT,
    channel TEXT,
    event_type TEXT,
    enabled BOOLEAN,
    delivery_address TEXT
);

CREATE TABLE IF NOT EXISTS nurture_enrollments (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    workflow_id TEXT,
    lead_id TEXT,
    current_step INTEGER,
    status TEXT,
    enrolled_at TEXT,
    last_action_at TEXT,
    next_action_at TEXT,
    engagement_score INTEGER,
    emails_sent INTEGER,
    emails_opened INTEGER,
    links_clicked INTEGER,
    tasks_created INTEGER,
    exit_reason TEXT,
    completed_at TEXT,
    history TEXT
);

CREATE TABLE IF NOT EXISTS nurture_workflows (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    name TEXT,
    description TEXT,
    trigger TEXT,
    steps TEXT,
    engagement_rules TEXT,
    ai_optimization TEXT,
    is_active BOOLEAN,
    total_enrolled INTEGER,
    total_completed INTEGER,
    avg_completion_rate INTEGER,
    created_by TEXT
);

CREATE TABLE IF NOT EXISTS onboarding_wizard_states (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    user_id TEXT,
    current_step INTEGER,
    completed BOOLEAN,
    answers TEXT,
    bootstrap_executed BOOLEAN,
    bootstrap_results TEXT
);

CREATE TABLE IF NOT EXISTS org_units (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    tenant_id TEXT,
    unit_name TEXT,
    description TEXT,
    parent_unit_id TEXT,
    unit_path TEXT,
    ad_synced BOOLEAN
);

CREATE TABLE IF NOT EXISTS org_unit_memberships (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    tenant_id TEXT,
    unit_id TEXT,
    user_id TEXT,
    is_manager BOOLEAN
);

CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    name TEXT,
    slug TEXT,
    owner_id TEXT,
    industry TEXT,
    status TEXT,
    webhook_secret TEXT,
    settings TEXT
);

CREATE TABLE IF NOT EXISTS outreach_campaigns (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    lead_id TEXT,
    name TEXT,
    channel TEXT,
    subject TEXT,
    content TEXT,
    status TEXT,
    schedule TEXT,
    performance TEXT,
    ai_generated BOOLEAN,
    approved_by TEXT,
    approved_at TEXT,
    metadata TEXT
);

CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    invoice_id TEXT,
    amount INTEGER,
    method TEXT,
    received_at TEXT,
    stripe_payment_intent_id TEXT,
    metadata TEXT,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS payroll_entries (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    employee_id TEXT,
    employee_name TEXT,
    pay_period_start TEXT,
    pay_period_end TEXT,
    hours_worked INTEGER,
    hourly_rate INTEGER,
    overtime_hours INTEGER,
    overtime_rate INTEGER,
    base_pay INTEGER,
    overtime_pay INTEGER,
    bonuses INTEGER,
    deductions INTEGER,
    gross_pay INTEGER,
    net_pay INTEGER,
    status TEXT,
    payment_method TEXT,
    payment_date TEXT,
    notes TEXT,
    timesheet_entries TEXT
);

CREATE TABLE IF NOT EXISTS performance_benchmarks (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    benchmark_id TEXT,
    release_id TEXT,
    canary_deployment_id TEXT,
    test_type TEXT,
    environment TEXT,
    test_config TEXT,
    results TEXT,
    ai_analysis TEXT,
    slo_compliance TEXT,
    test_scenarios TEXT,
    resource_utilization TEXT,
    issues_found TEXT,
    passed BOOLEAN
);

CREATE TABLE IF NOT EXISTS permissions (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    permission_key TEXT,
    description TEXT,
    module TEXT,
    resource_type TEXT,
    action TEXT,
    is_system BOOLEAN
);

CREATE TABLE IF NOT EXISTS personal_goals (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    user_id TEXT,
    title TEXT,
    description TEXT,
    category TEXT,
    target_value INTEGER,
    current_value INTEGER,
    unit TEXT,
    target_date TEXT,
    status TEXT,
    milestone_values TEXT,
    last_updated_at TEXT,
    completed_at TEXT
);

CREATE TABLE IF NOT EXISTS pipelines (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    project TEXT,
    repo_url TEXT,
    branches TEXT,
    stages TEXT,
    environments TEXT,
    artifact_store TEXT,
    gates TEXT,
    notifications TEXT
);

CREATE TABLE IF NOT EXISTS pipeline_runs (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    pipeline_id TEXT,
    run_number INTEGER,
    git_sha TEXT,
    git_branch TEXT,
    git_message TEXT,
    git_author TEXT,
    triggered_by TEXT,
    trigger_type TEXT,
    status TEXT,
    started_at TEXT,
    completed_at TEXT,
    duration_seconds INTEGER,
    stages TEXT,
    build_ids TEXT,
    release_id TEXT,
    artifacts TEXT,
    test_results TEXT,
    coverage_pct INTEGER,
    quality_gates TEXT,
    environment_vars TEXT,
    logs_url TEXT,
    error_message TEXT
);

CREATE TABLE IF NOT EXISTS plan_recommendations (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    recommended_tier TEXT,
    reasoning TEXT,
    confidence_score INTEGER,
    alternative_tiers TEXT,
    estimated_monthly_cost INTEGER,
    roi_projection TEXT,
    plan_features TEXT,
    upgrade_path TEXT,
    user_override TEXT
);

CREATE TABLE IF NOT EXISTS predicted_incidents (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    prediction_id TEXT,
    service_id TEXT,
    incident_type TEXT,
    probability INTEGER,
    confidence INTEGER,
    predicted_severity TEXT,
    predicted_impact TEXT,
    triggering_signals TEXT,
    time_to_incident INTEGER,
    predicted_at TEXT,
    expires_at TEXT,
    remediation_steps TEXT,
    similar_incidents TEXT,
    status TEXT,
    actual_incident_id TEXT,
    prevention_actions_taken TEXT,
    outcome TEXT
);

CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    sku TEXT,
    name TEXT,
    description TEXT,
    unit_price INTEGER,
    tax_rate INTEGER,
    is_active BOOLEAN,
    category TEXT
);

CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    name TEXT,
    description TEXT,
    status TEXT,
    owner_id TEXT,
    owner_name TEXT,
    team_members TEXT,
    start_date TEXT,
    due_date TEXT,
    priority TEXT,
    progress INTEGER,
    budget INTEGER,
    tags TEXT,
    linked_entities TEXT
);

CREATE TABLE IF NOT EXISTS quotes (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    client_id TEXT,
    lead_id TEXT,
    number TEXT,
    items TEXT,
    subtotal INTEGER,
    tax INTEGER,
    total INTEGER,
    status TEXT,
    valid_until TEXT,
    pdf_url TEXT,
    public_hash TEXT,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS quote_versions (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    quote_id TEXT,
    version_number INTEGER,
    changes_description TEXT,
    before_snapshot TEXT,
    after_snapshot TEXT,
    actor_id TEXT
);

CREATE TABLE IF NOT EXISTS rag_policies (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    tenantId TEXT,
    name TEXT,
    chunk_size INTEGER,
    chunk_overlap INTEGER,
    top_k INTEGER,
    recency_bias INTEGER,
    require_citations BOOLEAN,
    allow_namespaces TEXT,
    updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS rate_limit_logs (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    identifier TEXT,
    identifier_type TEXT,
    endpoint TEXT,
    request_count INTEGER,
    window_start TEXT,
    window_end TEXT,
    limit_exceeded BOOLEAN,
    blocked_requests INTEGER,
    last_request_at TEXT
);

CREATE TABLE IF NOT EXISTS readiness_scores (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    overall_score INTEGER,
    dimension_scores TEXT,
    readiness_gaps TEXT,
    industry_benchmark TEXT,
    maturity_level TEXT,
    calculated_at TEXT
);

CREATE TABLE IF NOT EXISTS referrals (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    referrer_client_id TEXT,
    referrer_name TEXT,
    referred_name TEXT,
    referred_email TEXT,
    referred_phone TEXT,
    status TEXT,
    converted_client_id TEXT,
    converted_at TEXT,
    reward_type TEXT,
    reward_value INTEGER,
    reward_claimed BOOLEAN,
    reward_claimed_at TEXT,
    conversion_value INTEGER,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS regression_tests (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    test_id TEXT,
    pipeline_id TEXT,
    service_id TEXT,
    test_type TEXT,
    baseline_snapshot_id TEXT,
    test_suite TEXT,
    metrics_compared TEXT,
    status TEXT,
    regression_detected BOOLEAN,
    regressions TEXT,
    improvements TEXT,
    ai_analysis TEXT,
    started_at TEXT,
    completed_at TEXT,
    duration_seconds INTEGER,
    triggered_by TEXT
);

CREATE TABLE IF NOT EXISTS releases (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    pipeline_id TEXT,
    git_sha TEXT,
    version TEXT,
    environment TEXT,
    status TEXT,
    dora_metrics TEXT,
    approvals TEXT,
    links TEXT,
    started_at TEXT,
    completed_at TEXT,
    deployed_by TEXT
);

CREATE TABLE IF NOT EXISTS remediation_tasks (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    finding_id TEXT,
    title TEXT,
    description TEXT,
    priority TEXT,
    status TEXT,
    assigned_to TEXT,
    assigned_name TEXT,
    estimated_hours INTEGER,
    actual_hours INTEGER,
    due_date TEXT,
    started_at TEXT,
    completed_at TEXT,
    blocked_reason TEXT,
    verification_steps TEXT,
    test_results TEXT,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS report_definitions (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    name TEXT,
    description TEXT,
    entity TEXT,
    filters TEXT,
    visualization TEXT,
    config TEXT,
    created_by TEXT,
    is_public BOOLEAN
);

CREATE TABLE IF NOT EXISTS report_schedules (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    report_id TEXT,
    frequency TEXT,
    cron_expression TEXT,
    recipients TEXT,
    next_run TEXT,
    last_run TEXT,
    is_active BOOLEAN
);

CREATE TABLE IF NOT EXISTS report_views (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    owner_id TEXT,
    title TEXT,
    description TEXT,
    filters TEXT,
    widgets TEXT,
    share_scope TEXT,
    tags TEXT,
    view_count INTEGER,
    last_viewed TEXT
);

CREATE TABLE IF NOT EXISTS retail_configs (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    business_name TEXT,
    business_address TEXT,
    business_type TEXT,
    onboarding_status TEXT,
    storefront_domain TEXT,
    storefront_status TEXT,
    delivery_options TEXT,
    payment_gateway TEXT,
    theme_config TEXT,
    advanced_theme_config TEXT,
    policies TEXT
);

CREATE TABLE IF NOT EXISTS retail_customers (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    name TEXT,
    email TEXT,
    phone TEXT,
    loyalty_points INTEGER,
    tags TEXT
);

CREATE TABLE IF NOT EXISTS retail_orders (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    customer_id TEXT,
    items TEXT,
    subtotal INTEGER,
    tax INTEGER,
    total INTEGER,
    payment_status TEXT,
    fulfillment_status TEXT,
    status TEXT,
    notes TEXT,
    status_history TEXT,
    sms_notification_log TEXT,
    deleted_at TEXT,
    deleted_by TEXT
);

CREATE TABLE IF NOT EXISTS retail_products (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    name TEXT,
    description TEXT,
    ai_description TEXT,
    description_source TEXT,
    price INTEGER,
    cost INTEGER,
    sku TEXT,
    barcode TEXT,
    category TEXT,
    subcategory TEXT,
    tags TEXT,
    images TEXT,
    image_captions TEXT,
    variants TEXT,
    inventory_count INTEGER,
    low_stock_threshold INTEGER,
    is_active BOOLEAN,
    deleted_at TEXT,
    deleted_by TEXT
);

CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    client_id TEXT,
    job_id TEXT,
    rating INTEGER,
    title TEXT,
    comment TEXT,
    sentiment_score INTEGER,
    key_phrases TEXT,
    status TEXT,
    published_to TEXT,
    published_at TEXT,
    response TEXT,
    response_at TEXT,
    helpful_count INTEGER,
    verified BOOLEAN
);

CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    tenant_id TEXT,
    role_name TEXT,
    description TEXT,
    is_system_role BOOLEAN,
    permissions TEXT,
    priority INTEGER
);

CREATE TABLE IF NOT EXISTS s_l_as (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    sla_id TEXT,
    service_id TEXT,
    customer_name TEXT,
    contract_ref TEXT,
    name TEXT,
    description TEXT,
    slo_ids TEXT,
    start_date TEXT,
    end_date TEXT,
    review_period TEXT,
    availability_target INTEGER,
    latency_target_ms INTEGER,
    error_rate_target INTEGER,
    mttr_target_minutes INTEGER,
    current_compliance TEXT,
    breaches TEXT,
    penalties TEXT,
    notification_contacts TEXT,
    status TEXT,
    last_reviewed TEXT,
    owner_id TEXT
);

CREATE TABLE IF NOT EXISTS s_l_o_burns (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    slo_id TEXT,
    window TEXT,
    burn_rate INTEGER,
    remaining_budget_pct INTEGER,
    projected_exhaust_ts TEXT,
    status TEXT,
    calculated_at TEXT
);

CREATE TABLE IF NOT EXISTS s_l_o_definitions (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    slo_id TEXT,
    service_id TEXT,
    name TEXT,
    indicator TEXT,
    target INTEGER,
    window_days INTEGER,
    budget_pct INTEGER,
    description TEXT,
    is_active BOOLEAN
);

CREATE TABLE IF NOT EXISTS s_o_c_alerts (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    tenant_id TEXT,
    alert_id TEXT,
    linked_security_event_id TEXT,
    severity TEXT,
    detection_reason TEXT,
    threat_type TEXT,
    confidence INTEGER,
    auto_action_taken TEXT,
    auto_action_result TEXT,
    human_review_required BOOLEAN,
    created_by TEXT,
    assigned_to TEXT,
    status TEXT,
    investigation_notes TEXT,
    related_alerts TEXT,
    mitigation_steps TEXT,
    resolved_at TEXT,
    resolution_summary TEXT
);

CREATE TABLE IF NOT EXISTS s_o_c_automated_responses (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    tenant_id TEXT,
    response_id TEXT,
    alert_id TEXT,
    playbook_id TEXT,
    response_type TEXT,
    target_type TEXT,
    target_id TEXT,
    trigger_conditions TEXT,
    actions_taken TEXT,
    approval_status TEXT,
    approved_by TEXT,
    approved_at TEXT,
    reversion_available BOOLEAN,
    reverted BOOLEAN,
    reverted_at TEXT,
    reverted_by TEXT,
    impact_summary TEXT,
    compliance_tags TEXT,
    executed_at TEXT,
    expires_at TEXT
);

CREATE TABLE IF NOT EXISTS s_o_c_playbooks (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    tenant_id TEXT,
    playbook_id TEXT,
    name TEXT,
    description TEXT,
    trigger_condition TEXT,
    actions TEXT,
    enabled BOOLEAN,
    is_system_playbook BOOLEAN,
    execution_count INTEGER,
    last_executed_at TEXT,
    success_rate INTEGER,
    requires_human_approval BOOLEAN
);

CREATE TABLE IF NOT EXISTS security_alerts (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    alert_id TEXT,
    severity TEXT,
    alert_type TEXT,
    title TEXT,
    description TEXT,
    threat_actor TEXT,
    affected_resources TEXT,
    risk_score INTEGER,
    risk_factors TEXT,
    suggested_actions TEXT,
    auto_actions_taken TEXT,
    status TEXT,
    assigned_to TEXT,
    notified_users TEXT,
    notification_channels TEXT,
    related_incident_id TEXT,
    detected_at TEXT,
    resolved_at TEXT,
    resolution_notes TEXT,
    false_positive BOOLEAN
);

CREATE TABLE IF NOT EXISTS security_events (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    tenant_id TEXT,
    event_id TEXT,
    timestamp TEXT,
    actor_user_id TEXT,
    actor_agent_id TEXT,
    event_type TEXT,
    event_category TEXT,
    metadata TEXT,
    risk_score INTEGER,
    risk_factors TEXT,
    context TEXT,
    status TEXT,
    severity TEXT,
    auto_actions_taken TEXT,
    related_alert_id TEXT,
    blurcrypt_encrypted BOOLEAN
);

CREATE TABLE IF NOT EXISTS security_logs (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    user_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    request_method TEXT,
    request_path TEXT,
    request_params TEXT,
    response_status INTEGER,
    response_time_ms INTEGER,
    risk_score INTEGER,
    risk_factors TEXT,
    geolocation TEXT,
    is_bot BOOLEAN,
    is_suspicious BOOLEAN,
    is_blocked BOOLEAN,
    session_id TEXT,
    referrer TEXT,
    device_fingerprint TEXT
);

CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    service_id TEXT,
    name TEXT,
    description TEXT,
    owner_team TEXT,
    tier TEXT,
    links TEXT,
    dependencies TEXT,
    tech_stack TEXT,
    health_status TEXT,
    last_deployed TEXT,
    deployment_frequency TEXT
);

CREATE TABLE IF NOT EXISTS shared_documents (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    name TEXT,
    description TEXT,
    file_url TEXT,
    file_type TEXT,
    file_size INTEGER,
    owner_id TEXT,
    owner_name TEXT,
    shared_with TEXT,
    versions TEXT,
    tags TEXT,
    linked_entities TEXT,
    is_archived BOOLEAN
);

CREATE TABLE IF NOT EXISTS signature_rules (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    rule_id TEXT,
    name TEXT,
    description TEXT,
    rule_type TEXT,
    category TEXT,
    severity TEXT,
    pattern TEXT,
    protocol TEXT,
    source_port TEXT,
    dest_port TEXT,
    direction TEXT,
    action TEXT,
    is_active BOOLEAN,
    false_positive_rate INTEGER,
    match_count INTEGER,
    last_matched_at TEXT,
    custom_response TEXT,
    tags TEXT,
    created_by TEXT
);

CREATE TABLE IF NOT EXISTS social_posts (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    platforms TEXT,
    content TEXT,
    media_urls TEXT,
    hashtags TEXT,
    scheduled_for TEXT,
    status TEXT,
    ai_generated BOOLEAN,
    post_type TEXT,
    engagement TEXT,
    posted_at TEXT,
    posted_ids TEXT,
    error_message TEXT
);

CREATE TABLE IF NOT EXISTS storefront_pages (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    slug TEXT,
    title TEXT,
    seo TEXT,
    published BOOLEAN,
    blocks TEXT
);

CREATE TABLE IF NOT EXISTS storefront_settingses (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    logo TEXT,
    colors TEXT,
    home_page_id TEXT,
    custom_domain TEXT,
    published BOOLEAN,
    feature_flags TEXT
);

CREATE TABLE IF NOT EXISTS subscription_plans (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    tier_id TEXT,
    name TEXT,
    price_monthly INTEGER,
    limits TEXT,
    features TEXT
);

CREATE TABLE IF NOT EXISTS support_tickets (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    ticket_number TEXT,
    requester_id TEXT,
    requester_email TEXT,
    requester_name TEXT,
    subject TEXT,
    body TEXT,
    channel TEXT,
    status TEXT,
    priority TEXT,
    category TEXT,
    assigned_to TEXT,
    sentiment_score INTEGER,
    emotion TEXT,
    tags TEXT,
    conversation TEXT,
    ai_suggestion_ids TEXT,
    kb_article_refs TEXT,
    sla_due_at TEXT,
    first_response_at TEXT,
    resolved_at TEXT,
    resolution TEXT,
    satisfaction_rating INTEGER
);

CREATE TABLE IF NOT EXISTS system_configurations (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    config_key TEXT,
    config_value TEXT,
    category TEXT,
    is_sensitive BOOLEAN,
    description TEXT
);

CREATE TABLE IF NOT EXISTS system_healths (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    service_id TEXT,
    endpoint TEXT,
    check_type TEXT,
    status TEXT,
    response_time_ms INTEGER,
    status_code INTEGER,
    error_message TEXT,
    uptime_pct INTEGER,
    availability_score INTEGER,
    latency_p50 INTEGER,
    latency_p95 INTEGER,
    latency_p99 INTEGER,
    error_rate INTEGER,
    throughput_rps INTEGER,
    trace_id TEXT,
    span_id TEXT,
    parent_span_id TEXT,
    trace_context TEXT,
    metadata TEXT,
    region TEXT,
    environment TEXT,
    timestamp TEXT
);

CREATE TABLE IF NOT EXISTS system_kill_switchs (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    tenant_id TEXT,
    switch_type TEXT,
    target_id TEXT,
    is_active BOOLEAN,
    activated_by TEXT,
    activated_at TEXT,
    reason TEXT,
    severity TEXT,
    auto_activated BOOLEAN,
    actions_blocked TEXT,
    deactivated_by TEXT,
    deactivated_at TEXT,
    deactivation_reason TEXT,
    requires_multi_party_approval BOOLEAN,
    approval_requests TEXT
);

CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    project_id TEXT,
    title TEXT,
    description TEXT,
    status TEXT,
    priority TEXT,
    assigned_to TEXT,
    assigned_to_name TEXT,
    due_date TEXT,
    parent_id TEXT,
    dependencies TEXT,
    block_reason TEXT,
    is_recurring BOOLEAN,
    recurrence_rule TEXT,
    estimated_hours INTEGER,
    tags TEXT,
    attachments TEXT
);

CREATE TABLE IF NOT EXISTS team_activities (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    actor_name TEXT,
    actor_id TEXT,
    action_type TEXT,
    entity_type TEXT,
    entity_id TEXT,
    metadata TEXT
);

CREATE TABLE IF NOT EXISTS team_channels (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    name TEXT,
    description TEXT,
    type TEXT,
    members TEXT,
    admins TEXT,
    is_archived BOOLEAN,
    last_message_at TEXT,
    unread_count TEXT
);

CREATE TABLE IF NOT EXISTS team_messages (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    channel_id TEXT,
    channel_type TEXT,
    sender_id TEXT,
    sender_name TEXT,
    content TEXT,
    attachments TEXT,
    reactions TEXT,
    thread_count INTEGER,
    is_edited BOOLEAN,
    is_pinned BOOLEAN,
    read_by TEXT
);

CREATE TABLE IF NOT EXISTS telemetry_events (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    tenant_id TEXT,
    module TEXT,
    event TEXT,
    user_id TEXT,
    session_id TEXT,
    url TEXT,
    referrer TEXT,
    utm TEXT,
    ip_hash TEXT,
    user_agent TEXT,
    device_type TEXT,
    metadata TEXT,
    demo BOOLEAN,
    environment TEXT,
    timestamp TEXT
);

CREATE TABLE IF NOT EXISTS tenant_security_profiles (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    profile_name TEXT,
    industry_vertical TEXT,
    data_sensitivity_level TEXT,
    regulatory_requirements TEXT,
    custom_controls TEXT,
    risk_thresholds TEXT,
    monitoring_preferences TEXT,
    compliance_targets TEXT,
    auto_remediation_config TEXT,
    audit_settings TEXT,
    is_active BOOLEAN,
    created_by TEXT,
    last_updated_by TEXT
);

CREATE TABLE IF NOT EXISTS threat_correlation_graphs (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    tenant_id TEXT,
    graph_id TEXT,
    nodes TEXT,
    edges TEXT,
    attack_paths TEXT,
    escalation_sequences TEXT,
    impact_radius TEXT,
    generated_at TEXT,
    expires_at TEXT
);

CREATE TABLE IF NOT EXISTS threat_intelligences (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    ip_address TEXT,
    threat_type TEXT,
    severity TEXT,
    confidence INTEGER,
    sources TEXT,
    geolocation TEXT,
    reputation_score INTEGER,
    total_reports INTEGER,
    last_reported TEXT,
    attack_history TEXT,
    is_blacklisted BOOLEAN,
    blacklist_reason TEXT,
    blacklisted_at TEXT,
    whitelisted BOOLEAN,
    notes TEXT,
    first_seen TEXT,
    last_seen TEXT
);

CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    contact_id TEXT,
    number TEXT,
    subject TEXT,
    description TEXT,
    category TEXT,
    priority TEXT,
    status TEXT,
    assigned_to TEXT,
    sentiment_score INTEGER,
    emotion_state TEXT,
    sla_due_at TEXT,
    channel TEXT,
    messages TEXT,
    tags TEXT,
    resolution TEXT,
    resolved_at TEXT
);

CREATE TABLE IF NOT EXISTS tooltip_defs (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    selector TEXT,
    text TEXT,
    when TEXT,
    role_targets TEXT,
    module TEXT,
    priority INTEGER,
    is_active BOOLEAN
);

CREATE TABLE IF NOT EXISTS tutorials (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    slug TEXT,
    title TEXT,
    description TEXT,
    module_ref TEXT,
    segment TEXT,
    steps TEXT,
    order INTEGER,
    is_active BOOLEAN,
    required_role TEXT
);

CREATE TABLE IF NOT EXISTS u_e_b_a_profiles (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    tenant_id TEXT,
    entity_type TEXT,
    entity_id TEXT,
    baseline TEXT,
    risk_score INTEGER,
    risk_factors TEXT,
    trust_level TEXT,
    anomaly_tags TEXT,
    correlation_links TEXT,
    adaptive_thresholds TEXT,
    last_activity_at TEXT,
    baseline_updated_at TEXT,
    profile_maturity TEXT,
    data_points_count INTEGER
);

CREATE TABLE IF NOT EXISTS usage_events (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    event TEXT,
    quantity INTEGER,
    cost_estimate INTEGER,
    actor_id TEXT,
    metadata TEXT,
    period TEXT
);

CREATE TABLE IF NOT EXISTS user_activity_logs (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    user_id TEXT,
    action_type TEXT,
    details TEXT,
    ip_address TEXT,
    user_agent TEXT,
    device_fingerprint TEXT,
    geolocation TEXT,
    risk_score INTEGER,
    success BOOLEAN,
    error_message TEXT
);

CREATE TABLE IF NOT EXISTS user_presences (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    user_id TEXT,
    user_name TEXT,
    status TEXT,
    current_page TEXT,
    current_entity_type TEXT,
    current_entity_id TEXT,
    is_editing BOOLEAN,
    last_active_at TEXT,
    session_id TEXT
);

CREATE TABLE IF NOT EXISTS user_roles (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    tenant_id TEXT,
    user_id TEXT,
    role_id TEXT,
    assigned_by TEXT,
    assigned_at TEXT,
    expires_at TEXT
);

CREATE TABLE IF NOT EXISTS v_i_f_logs (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    tenantId TEXT,
    kind TEXT,
    detail TEXT,
    payload TEXT,
    createdAt TEXT
);

CREATE TABLE IF NOT EXISTS v_i_f_memories (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    tenantId TEXT,
    agentId TEXT,
    namespace TEXT,
    content TEXT,
    source TEXT,
    metadata TEXT,
    embedding TEXT,
    hash TEXT,
    createdAt TEXT
);

CREATE TABLE IF NOT EXISTS v_i_f_tool_registries (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    tenantId TEXT,
    name TEXT,
    description TEXT,
    input_schema TEXT,
    output_schema TEXT,
    allowed_agents TEXT,
    credit_cost INTEGER,
    retry INTEGER,
    timeout_ms INTEGER,
    is_active BOOLEAN
);

CREATE TABLE IF NOT EXISTS webhook_events (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    tenant_id TEXT,
    client_id TEXT,
    event_id TEXT,
    event_type TEXT,
    payload TEXT,
    status TEXT,
    processing_result TEXT,
    error_message TEXT,
    signature_valid BOOLEAN,
    ip_address TEXT,
    user_agent TEXT,
    processed_at TEXT,
    retry_count INTEGER
);

CREATE TABLE IF NOT EXISTS widget_registries (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    key TEXT,
    title TEXT,
    description TEXT,
    category TEXT,
    query_ref TEXT,
    config_schema TEXT,
    default_size TEXT,
    drilldown_route TEXT,
    chart_type TEXT,
    permissions_required TEXT,
    is_system BOOLEAN,
    created_by TEXT
);

CREATE TABLE IF NOT EXISTS workflow_automations (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    name TEXT,
    description TEXT,
    status TEXT,
    trigger TEXT,
    actions TEXT,
    created_by TEXT,
    execution_count INTEGER,
    last_execution TEXT
);

CREATE TABLE IF NOT EXISTS workflow_executions (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    org_id TEXT,
    workflow_id TEXT,
    workflow_name TEXT,
    trigger_data TEXT,
    status TEXT,
    results TEXT,
    duration_ms INTEGER
);

CREATE TABLE IF NOT EXISTS zero_trust_policies (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    tenant_id TEXT,
    policy_id TEXT,
    policy_name TEXT,
    description TEXT,
    scope TEXT,
    module TEXT,
    action TEXT,
    requirements TEXT,
    enforcement_mode TEXT,
    enabled BOOLEAN,
    is_system_policy BOOLEAN,
    priority INTEGER,
    violation_count INTEGER,
    last_violation_at TEXT
);


-- ============================================================
-- MRTECHSYS SMART BOOKING ENGINE
-- ============================================================

-- Defines available working days/hours for MrTechSys consultations
CREATE TABLE IF NOT EXISTS booking_availability (
  id TEXT PRIMARY KEY,
  day_of_week INTEGER NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  slot_duration_options TEXT DEFAULT '["30","45","60"]',
  buffer_minutes INTEGER DEFAULT 15,
  timezone TEXT DEFAULT 'America/Chicago',
  max_daily_bookings INTEGER DEFAULT 8,
  advance_notice_hours INTEGER DEFAULT 24,
  is_active BOOLEAN DEFAULT 1,
  updated_at TEXT DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO booking_availability (id, day_of_week, start_time, end_time)
VALUES
  ('avail-mon', 1, '09:00', '19:00'),
  ('avail-tue', 2, '09:00', '19:00'),
  ('avail-wed', 3, '09:00', '19:00'),
  ('avail-thu', 4, '09:00', '19:00'),
  ('avail-fri', 5, '09:00', '19:00'),
  ('avail-sat', 6, '09:00', '17:00');

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  business_name TEXT,
  phone TEXT,
  service_type TEXT,
  industry TEXT,
  problem_summary TEXT,
  budget_range TEXT,
  timeline TEXT,
  ai_plan_summary TEXT,
  buy_in_detected BOOLEAN DEFAULT 0,
  booking_date TEXT NOT NULL,
  booking_time TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  timezone TEXT DEFAULT 'America/Chicago',
  meeting_type TEXT DEFAULT 'zoom',
  meeting_link TEXT,
  status TEXT DEFAULT 'confirmed',
  cancelled_at TEXT,
  cancellation_reason TEXT,
  rescheduled_from TEXT,
  cloudflip_tenant_id TEXT,
  cloudflip_provisioned BOOLEAN DEFAULT 0,
  cloudflip_invite_sent BOOLEAN DEFAULT 0,
  cloudflip_otp_sent BOOLEAN DEFAULT 0,
  confirmation_sent BOOLEAN DEFAULT 0,
  owner_alert_sent BOOLEAN DEFAULT 0,
  ip_address TEXT,
  cancel_token TEXT,
  source TEXT DEFAULT 'mrtechsys_booking'
);

CREATE INDEX IF NOT EXISTS idx_bookings_date_status ON bookings(booking_date, status);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(email);
CREATE INDEX IF NOT EXISTS idx_bookings_cancel_token ON bookings(cancel_token);
CREATE INDEX IF NOT EXISTS idx_bookings_date_status ON bookings(booking_date, status);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(email);
CREATE INDEX IF NOT EXISTS idx_bookings_cancel_token ON bookings(cancel_token);

-- ==============================================================================
-- CANONICAL BUSINESS TECHNOLOGY PROFILES (MRTECHSYS ASSESSMENT INTELLIGENCE)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS business_technology_profiles (
  id TEXT PRIMARY KEY,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  
  -- Company Context
  business_name TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  industry TEXT,
  team_size TEXT,
  
  -- Structured Extracted State
  raw_dialogue_json TEXT,
  extracted_state_json TEXT,
  
  -- Scoring & Diagnostics (0 to 100)
  health_score INTEGER,
  operations_score INTEGER,
  security_score INTEGER,
  technology_score INTEGER,
  data_score INTEGER,
  cx_score INTEGER,
  financial_score INTEGER,
  continuity_score INTEGER,
  
  -- Identified Economic Inefficiencies
  identified_inefficiencies_json TEXT,
  estimated_annual_savings_min INTEGER DEFAULT 1200,
  estimated_annual_savings_max INTEGER DEFAULT 3600,
  estimated_hours_recovered_min INTEGER DEFAULT 5,
  estimated_hours_recovered_max INTEGER DEFAULT 12,
  
  -- Actionable Executive Roadmap (NOW / NEXT / LATER)
  now_actions_json TEXT,
  next_actions_json TEXT,
  later_actions_json TEXT,
  
  -- Objective Solution Routes
  recommended_routes_json TEXT,
  
  -- Post-Assessment Hand-off
  consultation_booked BOOLEAN DEFAULT 0,
  pre_call_brief_generated BOOLEAN DEFAULT 0,
  pre_call_brief_text TEXT
);

CREATE INDEX IF NOT EXISTS idx_btp_email ON business_technology_profiles(contact_email);
