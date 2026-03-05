import React from "react";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Plus,
  FileText,
  Calendar,
  Users,
  Mail
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const quickActions = [
  {
    label: "New Quote",
    icon: FileText,
    url: createPageUrl("Quotes"),
    color: "from-blue-500 to-cyan-500"
  },
  {
    label: "Schedule Job",
    icon: Calendar,
    url: createPageUrl("Jobs"),
    color: "from-purple-500 to-pink-500"
  },
  {
    label: "Add Lead",
    icon: Users,
    url: createPageUrl("Leads"),
    color: "from-green-500 to-emerald-500"
  },
  {
    label: "Send Email",
    icon: Mail,
    url: createPageUrl("Communications"),
    color: "from-amber-500 to-orange-500"
  }
];

export default function QuickActionsWidget({ config = {} }) {
  return (
    <>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                to={action.url}
              >
                <Button
                  className={`w-full h-24 flex flex-col items-center justify-center gap-2 bg-gradient-to-br ${action.color} hover:opacity-90 text-white border-0`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-sm font-medium">{action.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </>
  );
}