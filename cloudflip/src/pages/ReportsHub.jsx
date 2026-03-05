import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Calendar, Paintbrush, Sparkles } from "lucide-react";
import Reports from "./Reports";
import ScheduledReports from "./ScheduledReports";
import ReportDesigner from "./ReportDesigner";
import ReportBuilder from "../components/reports/ReportBuilder";

export default function ReportsHub() {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          Advanced <span className="text-amber-400">Reporting</span> Module
        </h1>
        <p className="text-white/70 mt-1">Build custom reports with flexible analytics and visualizations</p>
      </div>

      <Tabs defaultValue="builder" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-amber-500/20">
          <TabsTrigger value="builder" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Sparkles className="w-4 h-4 mr-2" />
            Report Builder
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <BarChart className="w-4 h-4 mr-2" />
            Saved Reports
          </TabsTrigger>
          <TabsTrigger value="designer" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Paintbrush className="w-4 h-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Calendar className="w-4 h-4 mr-2" />
            Scheduled
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="mt-6">
          <ReportBuilder />
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <Reports />
        </TabsContent>

        <TabsContent value="designer" className="mt-6">
          <ReportDesigner />
        </TabsContent>

        <TabsContent value="scheduled" className="mt-6">
          <ScheduledReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}