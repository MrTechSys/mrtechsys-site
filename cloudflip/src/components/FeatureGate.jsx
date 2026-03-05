import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";

const featureMatrix = {
  // Demo features
  'demo_mode': ['demo'],
  
  // Starter features
  'manual_lead_entry': ['starter', 'pro', 'partner', 'elite'],
  'csv_import': ['starter', 'pro', 'partner', 'elite'],
  'quote_generator': ['starter', 'pro', 'partner', 'elite'],
  'invoice_creation': ['starter', 'pro', 'partner', 'elite'],
  'basic_metrics': ['starter', 'pro', 'partner', 'elite'],
  
  // Pro features
  'crm_pipeline': ['pro', 'partner', 'elite'],
  'stripe_integration': ['pro', 'partner', 'elite'],
  'branded_landing': ['pro', 'partner', 'elite'],
  'lead_tagging': ['pro', 'partner', 'elite'],
  'quote_tracking': ['pro', 'partner', 'elite'],
  
  // Partner features
  'social_media_sync': ['partner', 'elite'],
  'ai_quotes': ['partner', 'elite'],
  'ai_agents': ['partner', 'elite'],
  'smart_reminders': ['partner', 'elite'],
  'sentiment_analysis': ['partner', 'elite'],
  'privacy_center': ['partner', 'elite'],
  
  // Elite features
  'white_label': ['elite'],
  'custom_domain': ['elite'],
  'multi_agent_routing': ['elite'],
  'team_dashboard': ['elite'],
  'api_access': ['elite'],
  'advanced_analytics': ['elite'],
  'recurring_templates': ['elite'],
  'contract_builder': ['elite'],
  'client_portal': ['elite'],
  'automated_workflows': ['elite'],
  'plugin_hub': ['elite']
};

export async function getUserPlan() {
  try {
    const user = await api.auth.me();
    
    // MrTechSys gets Elite plan automatically
    if (user.email === 'brandon@mrtechsys.com' || user.role === 'admin') {
      return 'elite';
    }
    
    if (!user?.current_org_id) return 'demo';
    
    const subs = await api.entities.BillingSubscription.filter({ 
      org_id: user.current_org_id 
    });
    
    if (subs.length > 0) {
      return subs[0].plan;
    }
    
    return 'demo';
  } catch (error) {
    console.error('Error getting user plan:', error);
    return 'demo';
  }
}

export async function hasFeatureAccess(feature) {
  const plan = await getUserPlan();
  return featureMatrix[feature]?.includes(plan) || false;
}

// Component to gate features by plan
export default function FeatureGate({ feature, children, fallback = null }) {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      const access = await hasFeatureAccess(feature);
      setHasAccess(access);
      setLoading(false);
    };
    checkAccess();
  }, [feature]);

  if (loading) return null;
  if (!hasAccess) return fallback;
  return <>{children}</>;
}