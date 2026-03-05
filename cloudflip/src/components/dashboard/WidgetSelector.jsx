import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Activity,
  Zap,
  Target,
  TrendingUp,
  CheckCircle
} from "lucide-react";

const availableWidgets = [
  {
    key: 'metrics',
    name: 'Business Metrics',
    description: 'Key performance indicators and statistics',
    icon: BarChart3,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    key: 'activity',
    name: 'Recent Activity',
    description: 'Latest team actions and updates',
    icon: Activity,
    color: 'from-purple-500 to-pink-500'
  },
  {
    key: 'actions',
    name: 'Quick Actions',
    description: 'Common tasks and shortcuts',
    icon: Zap,
    color: 'from-amber-500 to-orange-500'
  },
  {
    key: 'pipeline',
    name: 'Sales Pipeline',
    description: 'Deal stages and conversion rates',
    icon: TrendingUp,
    color: 'from-green-500 to-emerald-500'
  },
  {
    key: 'goals',
    name: 'Personal Goals',
    description: 'Track your progress and targets',
    icon: Target,
    color: 'from-indigo-500 to-purple-500'
  }
];

export default function WidgetSelector({ open, onClose, onSelect, existingWidgets = [] }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-[#0a1929] border-purple-500/30">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl">Add Widget</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-4 py-4">
          {availableWidgets.map(widget => {
            const Icon = widget.icon;
            const isAdded = existingWidgets.includes(widget.key);

            return (
              <button
                key={widget.key}
                onClick={() => !isAdded && onSelect(widget.key)}
                disabled={isAdded}
                className={`p-4 rounded-lg border text-left transition-all ${
                  isAdded
                    ? 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed'
                    : 'bg-white/5 border-purple-500/20 hover:border-purple-500/50 hover:bg-purple-500/10 cursor-pointer'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${widget.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-bold">{widget.name}</h4>
                      {isAdded && (
                        <Badge className="bg-green-500/20 text-green-400 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Added
                        </Badge>
                      )}
                    </div>
                    <p className="text-white/60 text-sm">{widget.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}