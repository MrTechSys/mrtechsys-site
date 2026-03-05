
import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Shield,
  FileText,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function VerticalComplianceHub({ vertical, location }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (vertical) {
      fetchVerticalData();
    }
  }, [vertical, location]);

  const fetchVerticalData = async () => {
    setLoading(true);
    try {
      const response = await api.functions.invoke('verticalDataScraper', { 
        vertical, 
        location 
      });
      if (response.data?.success) {
        setData(response.data.data);
        
        // Auto-create compliance tracker items from scraped data
        await autoPopulateComplianceItems(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch vertical data:', error);
      toast.error('Failed to load compliance data');
    } finally {
      setLoading(false);
    }
  };

  const autoPopulateComplianceItems = async (verticalData) => {
    try {
      const user = await api.auth.me();
      
      // Check existing items to avoid duplicates
      const existingItems = await api.entities.ComplianceTracker.filter({
        org_id: user.current_org_id
      });
      
      const existingNames = new Set(existingItems.map(item => item.name.toLowerCase()));
      
      // Create tracker items for permits/licenses that don't exist yet
      const itemsToCreate = [];
      
      verticalData.permits_licenses?.forEach(permit => {
        if (!existingNames.has(permit.name.toLowerCase())) {
          // Estimate expiry date (1 year from now by default)
          const expiryDate = new Date();
          if (permit.renewal_period?.includes('year')) {
            const years = parseInt(permit.renewal_period) || 1;
            expiryDate.setFullYear(expiryDate.getFullYear() + years);
          } else {
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
          }
          
          itemsToCreate.push({
            org_id: user.current_org_id,
            item_type: 'license',
            name: permit.name,
            description: permit.application_process,
            issuing_agency: permit.issuing_agency,
            issue_date: new Date().toISOString().split('T')[0],
            expiry_date: expiryDate.toISOString().split('T')[0],
            renewal_period: permit.renewal_period,
            cost: parseFloat(permit.cost?.replace(/[^0-9.]/g, '') || '0'),
            status: 'not_obtained',
            vertical,
            location: location ? { city: location.split(',')[0]?.trim(), state: location.split(',')[1]?.trim() } : null,
            reminder_days_before: 30
          });
        }
      });
      
      if (itemsToCreate.length > 0) {
        await api.entities.ComplianceTracker.bulkCreate(itemsToCreate);
        toast.success(`${itemsToCreate.length} compliance items added to your tracker`);
      }
    } catch (error) {
      console.error('Failed to auto-populate compliance items:', error);
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-[#0a1929]/60 to-[#1a2744]/60 backdrop-blur border-amber-500/30">
        <CardContent className="p-12 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-amber-400 animate-spin mb-4" />
          <p className="text-white/70">Loading {vertical} compliance data...</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card className="bg-gradient-to-br from-[#0a1929]/80 to-[#1a2744]/80 backdrop-blur border-amber-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-6 h-6 text-amber-400" />
              {data.vertical_name} Compliance Hub
              {location && (
                <Badge className="bg-blue-500/20 text-blue-400 ml-2">{location}</Badge>
              )}
            </CardTitle>
            <Button
              onClick={fetchVerticalData}
              size="sm"
              variant="ghost"
              className="text-white/70 hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Permits & Licenses */}
          {data.permits_licenses?.length > 0 && (
            <div>
              <h4 className="text-white/70 font-medium text-sm mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                Required Permits & Licenses
              </h4>
              <div className="space-y-3">
                {data.permits_licenses.map((permit, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 bg-white/5 rounded-lg border border-blue-500/20"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="text-white font-medium text-sm">{permit.name}</h5>
                      <Badge className="bg-green-500/20 text-green-400 text-xs">
                        {permit.cost}
                      </Badge>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3 text-xs text-white/70">
                      <div>
                        <span className="text-white/50">Renewal:</span> {permit.renewal_period}
                      </div>
                      <div>
                        <span className="text-white/50">Processing:</span> {permit.typical_processing_time}
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-white/50">Agency:</span> {permit.issuing_agency}
                      </div>
                    </div>
                    <div className="mt-2 p-2 bg-blue-500/10 rounded text-xs text-white/80">
                      {permit.application_process}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Regulations */}
          {data.regulations?.length > 0 && (
            <div>
              <h4 className="text-white/70 font-medium text-sm mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-400" />
                Key Regulations
              </h4>
              <div className="space-y-2">
                {data.regulations.map((reg, idx) => (
                  <div key={idx} className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="text-white font-medium text-sm">{reg.regulation_name}</h5>
                      {reg.regulatory_body && (
                        <Badge className="bg-red-500/20 text-red-400 text-xs shrink-0">
                          {reg.regulatory_body}
                        </Badge>
                      )}
                    </div>
                    <p className="text-white/70 text-xs mb-2">{reg.description}</p>
                    {reg.penalty_for_non_compliance && (
                      <p className="text-red-400 text-xs mb-2">
                        ⚠️ Penalty: {reg.penalty_for_non_compliance}
                      </p>
                    )}
                    <div className="p-2 bg-green-500/10 rounded text-xs text-white/80">
                      <span className="text-green-400 font-medium">How to comply:</span> {reg.how_to_comply}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compliance Checklists */}
          {data.compliance_requirements?.length > 0 && (
            <div>
              <h4 className="text-white/70 font-medium text-sm mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Compliance Checklists
              </h4>
              <div className="space-y-3">
                {data.compliance_requirements.map((req, idx) => (
                  <div key={idx} className="p-3 bg-white/5 rounded-lg border border-green-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium text-sm">{req.requirement}</span>
                      <Badge className="bg-green-500/20 text-green-400 text-xs">
                        {req.frequency}
                      </Badge>
                    </div>
                    <ul className="space-y-1">
                      {req.checklist?.map((item, i) => (
                        <li key={i} className="text-white/70 text-xs flex items-start gap-2">
                          <span className="text-green-400">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Insurance Needs */}
          {data.insurance_needs?.length > 0 && (
            <div>
              <h4 className="text-white/70 font-medium text-sm mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" />
                Insurance Requirements
              </h4>
              <div className="grid md:grid-cols-2 gap-3">
                {data.insurance_needs.map((insurance, idx) => (
                  <div key={idx} className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <h5 className="text-white font-medium text-sm mb-1">{insurance.insurance_type}</h5>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between text-white/70">
                        <span>Coverage:</span>
                        <span className="font-semibold">{insurance.coverage_amount}</span>
                      </div>
                      <div className="flex justify-between text-white/70">
                        <span>Est. Cost:</span>
                        <span className="font-semibold text-amber-400">{insurance.typical_cost}</span>
                      </div>
                    </div>
                    {insurance.providers?.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-white/10">
                        <span className="text-white/50 text-xs">Providers: </span>
                        <span className="text-white/70 text-xs">{insurance.providers.join(', ')}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Local Events */}
          {data.local_events?.length > 0 && (
            <div>
              <h4 className="text-white/70 font-medium text-sm mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#3cf7d4]" />
                Upcoming Business Opportunities
              </h4>
              <div className="space-y-2">
                {data.local_events.slice(0, 5).map((event, idx) => (
                  <div key={idx} className="p-3 bg-[#3cf7d4]/10 rounded-lg border border-[#3cf7d4]/20">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="text-white font-medium text-sm">{event.event_type}</h5>
                      <Badge className="bg-[#3cf7d4]/20 text-[#3cf7d4] text-xs">
                        {event.typical_dates}
                      </Badge>
                    </div>
                    <p className="text-white/70 text-xs mb-2">{event.business_opportunity}</p>
                    <p className="text-[#3cf7d4] text-xs">
                      Prep: {event.preparation_needed}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Best Practices */}
          {data.best_practices?.length > 0 && (
            <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg border border-amber-500/30">
              <h4 className="text-amber-400 font-medium text-sm mb-3">Industry Best Practices</h4>
              <ul className="space-y-2">
                {data.best_practices.slice(0, 5).map((practice, idx) => (
                  <li key={idx} className="text-white/80 text-xs flex items-start gap-2">
                    <span className="text-amber-400">•</span>
                    {practice}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
