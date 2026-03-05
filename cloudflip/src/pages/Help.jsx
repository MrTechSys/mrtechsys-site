
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, MessageCircle, FileText, HelpCircle, Zap, Mail } from "lucide-react";
import CopyrightFooter from "../components/CopyrightFooter";

const helpTopics = [
  {
    icon: Zap,
    title: "Getting Started",
    description: "Learn the basics and set up your account",
    link: "#"
  },
  {
    icon: FileText,
    title: "Creating Quotes",
    description: "Generate professional quotes with AI",
    link: "#"
  },
  {
    icon: Mail,
    title: "Email & SMS Setup",
    description: "Configure communication channels",
    link: "#"
  },
  {
    icon: HelpCircle,
    title: "Billing & Plans",
    description: "Understand pricing and subscription options",
    link: "#"
  }
];

export default function Help() {
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8 max-w-full overflow-x-hidden">
      <div className="max-w-5xl mx-auto space-y-8 w-full">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl md:text-4xl font-bold text-white flex flex-col sm:flex-row items-center justify-center gap-3">
            <HelpCircle className="w-8 h-8 md:w-10 md:h-10 text-amber-500" />
            <span>Help & <span className="text-amber-400">Support</span></span>
          </h1>
          <p className="text-white/80 mt-3 text-sm md:text-lg px-4">
            Get help with CloudFlip or learn more about our <span className="text-amber-400">features</span>
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {helpTopics.map((topic) => {
            const Icon = topic.icon;
            return (
              <Card key={topic.title} className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20 hover:shadow-lg hover:shadow-amber-500/10 transition-all cursor-pointer">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-white">{topic.title}</CardTitle>
                      <p className="text-sm text-white/70 mt-1">{topic.description}</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-2 border-amber-500/30 backdrop-blur">
          <CardContent className="p-6 md:p-8 text-center">
            <BookOpen className="w-10 h-10 md:w-12 md:h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
              Need More <span className="text-amber-400">Help</span>?
            </h3>
            <p className="text-white/70 mb-6 text-sm md:text-base px-4">
              Check out our comprehensive <span className="text-amber-400">documentation</span> or contact our <span className="text-amber-400">support team</span>
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold">
                <BookOpen className="w-5 h-5 mr-2" />
                View Documentation
              </Button>
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold">
                <MessageCircle className="w-5 h-5 mr-2" />
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="max-w-4xl mx-auto border-t border-amber-500/20 pt-8">
          <h2 className="text-2xl font-bold text-white mb-6">Plan <span className="text-amber-400">Features</span> & <span className="text-amber-400">Limits</span></h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-amber-500/20 rounded-lg overflow-hidden">
              <thead className="bg-[#0a1929]/80">
                <tr className="border-b border-amber-500/20">
                  <th className="text-left py-3 px-4 text-white">Feature</th>
                  <th className="text-center py-3 px-4 text-white">Free</th>
                  <th className="text-center py-3 px-4 text-white">Starter</th>
                  <th className="text-center py-3 px-4 text-white">Pro</th>
                  <th className="text-center py-3 px-4 text-white">Partner</th>
                </tr>
              </thead>
              <tbody className="bg-[#0a1929]/40">
                <tr className="border-b border-amber-500/10">
                  <td className="py-3 px-4 text-white/80">Leads/month</td>
                  <td className="text-center py-3 px-4 text-white">50</td>
                  <td className="text-center py-3 px-4 text-white">500</td>
                  <td className="text-center py-3 px-4 text-amber-400">Unlimited</td>
                  <td className="text-center py-3 px-4 text-amber-400">Unlimited</td>
                </tr>
                <tr className="border-b border-amber-500/10">
                  <td className="py-3 px-4 text-white/80">Quotes/month</td>
                  <td className="text-center py-3 px-4 text-white">5</td>
                  <td className="text-center py-3 px-4 text-white">50</td>
                  <td className="text-center py-3 px-4 text-white">300</td>
                  <td className="text-center py-3 px-4 text-amber-400">Unlimited</td>
                </tr>
                <tr className="border-b border-amber-500/10">
                  <td className="py-3 px-4 text-white/80">Users</td>
                  <td className="text-center py-3 px-4 text-white">1</td>
                  <td className="text-center py-3 px-4 text-white">3</td>
                  <td className="text-center py-3 px-4 text-white">10</td>
                  <td className="text-center py-3 px-4 text-amber-400">Unlimited</td>
                </tr>
                <tr className="border-b border-amber-500/10">
                  <td className="py-3 px-4 text-white/80">AI Quote Generation</td>
                  <td className="text-center py-3 px-4 text-white/40">-</td>
                  <td className="text-center py-3 px-4 text-white/40">-</td>
                  <td className="text-center py-3 px-4 text-green-400">✓</td>
                  <td className="text-center py-3 px-4 text-green-400">✓</td>
                </tr>
                <tr className="border-b border-amber-500/10">
                  <td className="py-3 px-4 text-white/80">White Label</td>
                  <td className="text-center py-3 px-4 text-white/40">-</td>
                  <td className="text-center py-3 px-4 text-white/40">-</td>
                  <td className="text-center py-3 px-4 text-white/40">-</td>
                  <td className="text-center py-3 px-4 text-green-400">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <CopyrightFooter />
    </div>
  );
}
