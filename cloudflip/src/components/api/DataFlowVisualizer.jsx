import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  ArrowRight, 
  Circle,
  CheckCircle,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function DataFlowVisualizer({ entityType, entityId, action }) {
  const [impactMap, setImpactMap] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (entityType && entityId && action) {
      analyzeImpact();
    }
  }, [entityType, entityId, action]);

  const analyzeImpact = async () => {
    setIsAnalyzing(true);

    try {
      // Simulate analyzing data relationships
      // In a real implementation, this would query the database for related records
      
      const mockImpactMap = {
        primary: {
          entity: entityType,
          id: entityId,
          action: action,
          fields_changed: action === 'update' ? ['status', 'updated_date'] : ['all']
        },
        related: []
      };

      // Add related entities based on type
      if (entityType === 'Lead') {
        mockImpactMap.related.push(
          { entity: 'Contact', relationship: 'contact_id', affected: 1, action: 'updated' },
          { entity: 'Activity', relationship: 'related_id', affected: 3, action: 'created' },
          { entity: 'EmailDraft', relationship: 'related_id', affected: 1, action: 'created' }
        );
      } else if (entityType === 'Quote') {
        mockImpactMap.related.push(
          { entity: 'Client', relationship: 'client_id', affected: 1, action: 'updated' },
          { entity: 'QuoteVersion', relationship: 'quote_id', affected: 1, action: 'created' },
          { entity: 'Activity', relationship: 'related_id', affected: 2, action: 'created' }
        );
      } else if (entityType === 'Contact') {
        mockImpactMap.related.push(
          { entity: 'Lead', relationship: 'contact_id', affected: 1, action: 'updated' },
          { entity: 'Deal', relationship: 'contact_id', affected: 2, action: 'updated' },
          { entity: 'CRMActivity', relationship: 'entity_id', affected: 1, action: 'created' }
        );
      }

      setImpactMap(mockImpactMap);
    } catch (error) {
      console.error('Impact analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!impactMap) {
    return (
      <Card className="bg-white/5 border-[#f4d35e]/20">
        <CardContent className="p-12 text-center">
          <Database className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <p className="text-white/60">Execute an API call to see its data flow impact</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 border-[#f4d35e]/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#f4d35e]" />
          Data Flow Impact Map
        </CardTitle>
        <p className="text-white/60 text-sm">
          Visualizing how this {impactMap.primary.action} affects related data
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Primary Entity */}
          <div className="flex justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="p-6 bg-[#f4d35e]/20 rounded-lg border-2 border-[#f4d35e]"
            >
              <div className="text-center">
                <Database className="w-8 h-8 text-[#f4d35e] mx-auto mb-2" />
                <p className="text-white font-bold text-lg">{impactMap.primary.entity}</p>
                <Badge className="bg-[#f4d35e] text-[#0a1929] mt-2">
                  {impactMap.primary.action.toUpperCase()}
                </Badge>
                <p className="text-white/60 text-xs mt-2">
                  Fields: {Array.isArray(impactMap.primary.fields_changed) 
                    ? impactMap.primary.fields_changed.join(', ') 
                    : 'All'}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Arrows and Related Entities */}
          {impactMap.related.length > 0 && (
            <>
              <div className="flex justify-center">
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <ArrowRight className="w-8 h-8 text-[#f4d35e] rotate-90" />
                </motion.div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {impactMap.related.map((related, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30"
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-white font-semibold">{related.entity}</p>
                        <p className="text-white/60 text-xs mt-1">
                          via {related.relationship}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                            {related.affected} record(s) {related.action}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {/* Summary */}
          <div className="p-4 bg-white/5 rounded-lg border border-[#f4d35e]/10">
            <p className="text-white/80 text-sm">
              <strong className="text-[#f4d35e]">Impact Summary:</strong> This {impactMap.primary.action} operation 
              on <strong>{impactMap.primary.entity}</strong> affected {impactMap.related.length} related 
              entity type(s) and modified {impactMap.related.reduce((sum, r) => sum + r.affected, 0)} total record(s).
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}