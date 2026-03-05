import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertTriangle } from "lucide-react";
import { format, isAfter, isBefore, addDays } from "date-fns";

export default function ControlTestSchedule({ controls }) {
  const now = new Date();
  const next7Days = addDays(now, 7);

  // Categorize controls by review status
  const overdue = controls.filter(c => 
    c.next_review && isBefore(new Date(c.next_review), now)
  );

  const upcoming = controls.filter(c => 
    c.next_review && 
    isAfter(new Date(c.next_review), now) && 
    isBefore(new Date(c.next_review), next7Days)
  );

  const scheduled = controls.filter(c =>
    c.next_review && isAfter(new Date(c.next_review), next7Days)
  ).sort((a, b) => new Date(a.next_review) - new Date(b.next_review));

  return (
    <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-cyan-400" />
          Control Test Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overdue */}
        {overdue.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <h3 className="text-red-400 font-semibold text-sm">Overdue ({overdue.length})</h3>
            </div>
            <div className="space-y-2">
              {overdue.map(ctrl => (
                <div key={ctrl.id} className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">{ctrl.name}</p>
                      <p className="text-white/60 text-xs mt-1">
                        {ctrl.control_id} • {ctrl.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-red-500/20 text-red-400 text-xs">
                        Due {format(new Date(ctrl.next_review), 'MMM d')}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming (Next 7 Days) */}
        {upcoming.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-yellow-400" />
              <h3 className="text-yellow-400 font-semibold text-sm">Upcoming (Next 7 Days)</h3>
            </div>
            <div className="space-y-2">
              {upcoming.map(ctrl => (
                <div key={ctrl.id} className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">{ctrl.name}</p>
                      <p className="text-white/60 text-xs mt-1">
                        {ctrl.control_id} • {ctrl.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                        {format(new Date(ctrl.next_review), 'MMM d, h:mm a')}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Future Scheduled */}
        {scheduled.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <h3 className="text-cyan-400 font-semibold text-sm">Scheduled ({scheduled.slice(0, 10).length})</h3>
            </div>
            <div className="space-y-2">
              {scheduled.slice(0, 10).map(ctrl => (
                <div key={ctrl.id} className="p-3 bg-white/5 border border-white/10 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">{ctrl.name}</p>
                      <p className="text-white/60 text-xs mt-1">
                        {ctrl.control_id} • {ctrl.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-white/70 text-xs">
                        {format(new Date(ctrl.next_review), 'MMM d, yyyy')}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {overdue.length === 0 && upcoming.length === 0 && scheduled.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">No scheduled control tests</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}