import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, CheckCircle, XCircle, Clock } from "lucide-react";

export default function ControlsHeatmap({ controls }) {
  const categories = ['security', 'availability', 'confidentiality', 'privacy', 'integrity'];
  const frequencies = ['daily', 'weekly', 'monthly', 'quarterly', 'annually'];

  const heatmapData = categories.map(category => ({
    category,
    frequencies: frequencies.map(freq => {
      const matching = controls.filter(c => 
        c.category === category && c.review_frequency === freq
      );
      const active = matching.filter(c => c.status === 'active').length;
      const failed = matching.filter(c => c.status === 'failed').length;
      const inProgress = matching.filter(c => c.status === 'in_progress').length;

      return {
        frequency: freq,
        total: matching.length,
        active,
        failed,
        inProgress,
        intensity: matching.length
      };
    })
  }));

  const maxIntensity = Math.max(
    ...heatmapData.flatMap(row => row.frequencies.map(f => f.intensity)),
    1
  );

  const getColor = (data) => {
    if (data.total === 0) return 'bg-white/5';
    if (data.failed > 0) return 'bg-red-500/40';
    if (data.inProgress > 0) return 'bg-yellow-500/40';
    if (data.active > 0) return 'bg-green-500/40';
    return 'bg-blue-500/40';
  };

  const getOpacity = (intensity) => {
    return 0.3 + (intensity / maxIntensity) * 0.7;
  };

  return (
    <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-cyan-400" />
          Control Coverage Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Headers */}
            <div className="grid grid-cols-6 gap-2 mb-2">
              <div className="text-white/70 text-xs font-semibold uppercase">Category</div>
              {frequencies.map(freq => (
                <div key={freq} className="text-white/70 text-xs font-semibold uppercase text-center capitalize">
                  {freq}
                </div>
              ))}
            </div>

            {/* Heatmap Grid */}
            <div className="space-y-2">
              {heatmapData.map(row => (
                <div key={row.category} className="grid grid-cols-6 gap-2">
                  <div className="text-white text-sm capitalize py-2 flex items-center">
                    {row.category}
                  </div>
                  {row.frequencies.map((cell, idx) => (
                    <div
                      key={idx}
                      className={`${getColor(cell)} rounded p-2 border border-white/10 relative group cursor-pointer transition-all hover:scale-105`}
                      style={{ opacity: getOpacity(cell.intensity) }}
                    >
                      <div className="text-center">
                        <p className="text-white font-bold text-sm">{cell.total}</p>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          {cell.active > 0 && (
                            <CheckCircle className="w-3 h-3 text-green-400" />
                          )}
                          {cell.failed > 0 && (
                            <XCircle className="w-3 h-3 text-red-400" />
                          )}
                          {cell.inProgress > 0 && (
                            <Clock className="w-3 h-3 text-yellow-400" />
                          )}
                        </div>
                      </div>

                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                        <div className="bg-[#0a1929] border border-cyan-500/50 rounded-lg p-3 shadow-xl min-w-[200px]">
                          <p className="text-white font-semibold text-xs mb-2 capitalize">
                            {row.category} - {cell.frequency}
                          </p>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-white/60">Total:</span>
                              <span className="text-white font-semibold">{cell.total}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-green-400">Active:</span>
                              <span className="text-green-400 font-semibold">{cell.active}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-yellow-400">In Progress:</span>
                              <span className="text-yellow-400 font-semibold">{cell.inProgress}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-red-400">Failed:</span>
                              <span className="text-red-400 font-semibold">{cell.failed}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-4 flex-wrap text-xs text-white/70">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500/40 rounded" />
                  <span>Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500/40 rounded" />
                  <span>In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500/40 rounded" />
                  <span>Failed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500/40 rounded" />
                  <span>Inactive</span>
                </div>
                <div className="ml-auto text-white/50">
                  *Intensity indicates control count
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}