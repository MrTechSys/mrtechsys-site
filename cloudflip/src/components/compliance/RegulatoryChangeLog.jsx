import React from 'react';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileText,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function RegulatoryChangeLog() {
  const { data: complianceItems = [], isLoading } = useQuery({
    queryKey: ['compliance-changes'],
    queryFn: async () => {
      const user = await api.auth.me();
      return api.entities.ComplianceTracker.filter({ 
        org_id: user.current_org_id 
      }, '-last_checked');
    }
  });

  const allChanges = complianceItems
    .filter(item => item.regulatory_changes_detected?.length > 0)
    .flatMap(item => 
      item.regulatory_changes_detected.map(change => ({
        ...change,
        item_name: item.name,
        item_type: item.item_type
      }))
    )
    .sort((a, b) => new Date(b.change_date) - new Date(a.change_date));

  if (isLoading) {
    return (
      <Card className="bg-white/5 border-purple-500/30">
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (allChanges.length === 0) {
    return (
      <Card className="bg-white/5 border-green-500/30">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="text-white/70">No regulatory changes detected</p>
          <p className="text-white/50 text-sm mt-2">AI monitoring your compliance requirements</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-400" />
          Regulatory Change Log
          <Badge className="bg-purple-500/20 text-purple-400 ml-2">
            {allChanges.length} Changes
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
        {allChanges.map((change, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="p-4 bg-white/5 rounded-lg border border-purple-500/20"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-blue-500/20 text-blue-400 text-xs capitalize">
                    {change.item_type}
                  </Badge>
                  <span className="text-white/50 text-xs">•</span>
                  <span className="text-white/70 text-xs">{change.item_name}</span>
                </div>
                <h4 className="text-white font-medium text-sm">{change.change_description}</h4>
              </div>
              <Clock className="w-4 h-4 text-white/40 flex-shrink-0" />
            </div>

            <div className="space-y-2">
              {change.impact && (
                <div className="p-2 bg-orange-500/10 rounded text-xs">
                  <span className="text-orange-400 font-medium">Impact: </span>
                  <span className="text-white/80">{change.impact}</span>
                </div>
              )}

              {change.action_required && (
                <div className="p-2 bg-green-500/10 rounded text-xs">
                  <span className="text-green-400 font-medium">Action: </span>
                  <span className="text-white/80">{change.action_required}</span>
                </div>
              )}

              {change.source_url && (
                <a 
                  href={change.source_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-400 text-xs hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  Official Source
                </a>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-white/40 text-xs">
                Detected {new Date(change.change_date).toLocaleDateString()}
              </p>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}