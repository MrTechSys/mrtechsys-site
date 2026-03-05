import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, Clock, XCircle, Download, Eye } from "lucide-react";
import { format } from "date-fns";

export default function EvidenceTracker({ evidence, controls }) {
  const getControlName = (controlId) => {
    const control = controls.find(c => c.id === controlId);
    return control?.name || control?.control_id || 'Unknown Control';
  };

  const pendingEvidence = evidence.filter(e => e.status === 'pending');
  const approvedEvidence = evidence.filter(e => e.status === 'approved');
  const rejectedEvidence = evidence.filter(e => e.status === 'rejected');

  const statusGroups = [
    { status: 'pending', items: pendingEvidence, color: 'yellow', icon: Clock },
    { status: 'approved', items: approvedEvidence, color: 'green', icon: CheckCircle },
    { status: 'rejected', items: rejectedEvidence, color: 'red', icon: XCircle }
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              <Badge className="bg-yellow-500/20 text-yellow-400">Pending</Badge>
            </div>
            <p className="text-3xl font-bold text-yellow-400">{pendingEvidence.length}</p>
            <p className="text-white/60 text-xs mt-1">Awaiting review</p>
          </CardContent>
        </Card>

        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <Badge className="bg-green-500/20 text-green-400">Approved</Badge>
            </div>
            <p className="text-3xl font-bold text-green-400">{approvedEvidence.length}</p>
            <p className="text-white/60 text-xs mt-1">Audit ready</p>
          </CardContent>
        </Card>

        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="w-5 h-5 text-red-400" />
              <Badge className="bg-red-500/20 text-red-400">Rejected</Badge>
            </div>
            <p className="text-3xl font-bold text-red-400">{rejectedEvidence.length}</p>
            <p className="text-white/60 text-xs mt-1">Needs revision</p>
          </CardContent>
        </Card>
      </div>

      {/* Evidence Lists by Status */}
      {statusGroups.map(group => {
        const Icon = group.icon;
        
        if (group.items.length === 0) return null;

        return (
          <Card key={group.status} className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 capitalize">
                <Icon className={`w-5 h-5 text-${group.color}-400`} />
                {group.status} Evidence ({group.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {group.items.map(item => (
                  <div key={item.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className={`w-4 h-4 text-${group.color}-400`} />
                          <h4 className="text-white font-medium">{item.name}</h4>
                        </div>
                        
                        {item.description && (
                          <p className="text-white/70 text-sm mb-2">{item.description}</p>
                        )}

                        <div className="flex items-center gap-3 text-xs text-white/60 mt-2">
                          <span>Control: {getControlName(item.control_id)}</span>
                          <span>•</span>
                          <span>Type: {item.file_type || 'document'}</span>
                          {item.collected_at && (
                            <>
                              <span>•</span>
                              <span>Collected {format(new Date(item.collected_at), 'MMM d, yyyy')}</span>
                            </>
                          )}
                        </div>

                        {item.notes && (
                          <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/30 rounded">
                            <p className="text-blue-400 text-xs">{item.notes}</p>
                          </div>
                        )}

                        {item.reviewed_by && (
                          <div className="mt-2 text-xs text-white/50">
                            Reviewed by {item.reviewed_by} on {format(new Date(item.reviewed_at), 'MMM d, yyyy')}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        {item.file_url && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                              onClick={() => window.open(item.file_url, '_blank')}
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                              onClick={() => {
                                const a = document.createElement('a');
                                a.href = item.file_url;
                                a.download = item.name;
                                a.click();
                              }}
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}