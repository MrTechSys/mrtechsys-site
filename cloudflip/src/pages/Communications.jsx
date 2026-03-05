import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Calendar, MessageSquare, Send } from "lucide-react";
import EmailCenter from "./EmailCenter";
import SupportInbox from "./SupportInbox";

// Simple placeholder for scheduled emails
const ScheduledEmails = () => (
  <div className="p-6 text-white">
    <h2 className="text-2xl font-bold mb-4">Scheduled Emails</h2>
    <p className="text-white/60">Email scheduling coming soon...</p>
  </div>
);

export default function Communications() {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          <span className="text-amber-400">Communications</span> Hub
        </h1>
        <p className="text-white/70 mt-1">Manage all your team communications</p>
      </div>

      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-amber-500/20">
          <TabsTrigger value="email" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Mail className="w-4 h-4 mr-2" />
            Email Center
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Calendar className="w-4 h-4 mr-2" />
            Scheduled
          </TabsTrigger>
          <TabsTrigger value="support" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <MessageSquare className="w-4 h-4 mr-2" />
            Support Inbox
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="mt-6">
          <EmailCenter />
        </TabsContent>

        <TabsContent value="scheduled" className="mt-6">
          <ScheduledEmails />
        </TabsContent>

        <TabsContent value="support" className="mt-6">
          <SupportInbox />
        </TabsContent>
      </Tabs>
    </div>
  );
}