import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cookie, Settings, Eye, Shield, BarChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CopyrightFooter from "../components/CopyrightFooter";

export default function Cookies() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1929] to-[#1a2942] p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl md:text-4xl font-bold text-white flex flex-col sm:flex-row items-center justify-center gap-3">
            <Cookie className="w-8 h-8 md:w-10 md:h-10 text-amber-500" />
            <span>Cookie <span className="text-amber-400">Policy</span></span>
          </h1>
          <p className="text-white/80 mt-3 text-sm md:text-lg max-w-3xl mx-auto px-4">
            Last Updated: January 2025
          </p>
        </div>

        {/* Introduction */}
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white">What Are <span className="text-amber-400">Cookies</span>?</CardTitle>
          </CardHeader>
          <CardContent className="text-white/80 space-y-4">
            <p>
              Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and to provide information to website owners.
            </p>
            <p>
              <span className="text-amber-400 font-semibold">CloudFlip</span> uses cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and improve our services. This Cookie Policy explains what cookies we use, why we use them, and how you can control them.
            </p>
          </CardContent>
        </Card>

        {/* Types of Cookies */}
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white">Types of <span className="text-amber-400">Cookies</span> We Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Essential Cookies */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Essential Cookies</h4>
                  <Badge className="bg-red-100 text-red-800 text-xs mt-1">Required</Badge>
                </div>
              </div>
              <p className="text-white/80 ml-13">
                These cookies are necessary for the website to function properly. They enable core functionality such as security, authentication, and session management. Without these cookies, our services cannot be provided.
              </p>
              <div className="bg-white/5 rounded-lg p-3 ml-13">
                <p className="text-sm text-white/70">
                  <span className="font-semibold text-white">Examples:</span> Session tokens, authentication cookies, security cookies
                </p>
                <p className="text-sm text-white/70 mt-1">
                  <span className="font-semibold text-white">Duration:</span> Session or up to 30 days
                </p>
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <BarChart className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Analytics Cookies</h4>
                  <Badge className="bg-blue-100 text-blue-800 text-xs mt-1">Optional</Badge>
                </div>
              </div>
              <p className="text-white/80 ml-13">
                These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. They help us improve our services and user experience.
              </p>
              <div className="bg-white/5 rounded-lg p-3 ml-13">
                <p className="text-sm text-white/70">
                  <span className="font-semibold text-white">Examples:</span> Page views, time on site, navigation patterns, feature usage
                </p>
                <p className="text-sm text-white/70 mt-1">
                  <span className="font-semibold text-white">Duration:</span> Up to 2 years
                </p>
              </div>
            </div>

            {/* Functional Cookies */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Functional Cookies</h4>
                  <Badge className="bg-purple-100 text-purple-800 text-xs mt-1">Optional</Badge>
                </div>
              </div>
              <p className="text-white/80 ml-13">
                These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings. They may be set by us or by third-party providers whose services we use on our pages.
              </p>
              <div className="bg-white/5 rounded-lg p-3 ml-13">
                <p className="text-sm text-white/70">
                  <span className="font-semibold text-white">Examples:</span> Theme preferences, language settings, dashboard layout preferences
                </p>
                <p className="text-sm text-white/70 mt-1">
                  <span className="font-semibold text-white">Duration:</span> Up to 1 year
                </p>
              </div>
            </div>

            {/* Advertising Cookies */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Advertising Cookies</h4>
                  <Badge className="bg-green-100 text-green-800 text-xs mt-1">Optional</Badge>
                </div>
              </div>
              <p className="text-white/80 ml-13">
                These cookies are used to deliver advertisements that are relevant to you and your interests. They may also be used to limit the number of times you see an advertisement and to measure the effectiveness of advertising campaigns.
              </p>
              <div className="bg-white/5 rounded-lg p-3 ml-13">
                <p className="text-sm text-white/70">
                  <span className="font-semibold text-white">Examples:</span> Facebook Pixel, Google Ads, remarketing tags
                </p>
                <p className="text-sm text-white/70 mt-1">
                  <span className="font-semibold text-white">Duration:</span> Up to 2 years
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Third-Party Cookies */}
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white">Third-Party <span className="text-amber-400">Cookies</span></CardTitle>
          </CardHeader>
          <CardContent className="text-white/80 space-y-4">
            <p>
              CloudFlip integrates with various third-party services that may set their own cookies when you use our platform:
            </p>
            <div className="space-y-3">
              <div className="bg-white/5 rounded-lg p-4">
                <p className="font-semibold text-white">Authentication & Social Login</p>
                <p className="text-sm text-white/70 mt-1">
                  Facebook, Google, Microsoft - for OAuth authentication and social media integration
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="font-semibold text-white">Payment Processing</p>
                <p className="text-sm text-white/70 mt-1">
                  Stripe - for secure payment processing and billing management
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="font-semibold text-white">Analytics & Performance</p>
                <p className="text-sm text-white/70 mt-1">
                  Google Analytics, Mixpanel - for usage analytics and performance monitoring
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="font-semibold text-white">Customer Support</p>
                <p className="text-sm text-white/70 mt-1">
                  Intercom, Zendesk - for live chat and customer support features
                </p>
              </div>
            </div>
            <p className="mt-4">
              These third-party services have their own privacy policies and cookie policies. We recommend reviewing them to understand how they use cookies and handle your data.
            </p>
          </CardContent>
        </Card>

        {/* Managing Cookies */}
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-amber-500" />
              Managing Your <span className="text-amber-400">Cookie Preferences</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-white/80 space-y-4">
            <h4 className="font-semibold text-white">Browser Settings</h4>
            <p>
              Most web browsers allow you to control cookies through their settings. You can set your browser to refuse cookies or to alert you when cookies are being sent. However, please note that some parts of CloudFlip may not function properly if you disable cookies.
            </p>
            
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-white">Browser Cookie Settings:</h4>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• <span className="text-amber-400">Chrome:</span> Settings → Privacy and Security → Cookies</li>
                <li>• <span className="text-amber-400">Firefox:</span> Preferences → Privacy & Security → Cookies</li>
                <li>• <span className="text-amber-400">Safari:</span> Preferences → Privacy → Cookies</li>
                <li>• <span className="text-amber-400">Edge:</span> Settings → Privacy → Cookies</li>
              </ul>
            </div>

            <h4 className="font-semibold text-white mt-6">Opt-Out Tools</h4>
            <p>
              You can opt out of certain types of cookies using industry opt-out tools:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <a href="https://optout.networkadvertising.org/" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300 underline">
                  Network Advertising Initiative (NAI) Opt-Out
                </a>
              </li>
              <li>
                <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300 underline">
                  Digital Advertising Alliance (DAA) Opt-Out
                </a>
              </li>
              <li>
                <a href="https://www.youronlinechoices.com/" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300 underline">
                  Your Online Choices (EU)
                </a>
              </li>
            </ul>

            <h4 className="font-semibold text-white mt-6">Do Not Track Signals</h4>
            <p>
              Some browsers include a "Do Not Track" (DNT) feature that signals to websites that you do not want your online activity tracked. Currently, there is no industry standard for how DNT signals should be interpreted. CloudFlip does not currently respond to DNT signals.
            </p>
          </CardContent>
        </Card>

        {/* Updates to Policy */}
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white">Updates to This <span className="text-amber-400">Policy</span></CardTitle>
          </CardHeader>
          <CardContent className="text-white/80 space-y-4">
            <p>
              We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on this page and updating the "Last Updated" date.
            </p>
            <p>
              We encourage you to review this Cookie Policy periodically to stay informed about how we use cookies and how you can manage your preferences.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-500" />
              Contact <span className="text-amber-400">Us</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-white/80 space-y-4">
            <p>
              If you have any questions about this Cookie Policy or our use of cookies, please contact us at:
            </p>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <p className="font-semibold text-white">MrTechSys</p>
              <p className="mt-2">
                Email:{' '}
                <a href="mailto:support@mrtechsys.com" className="text-amber-400 hover:text-amber-300 underline">
                  support@mrtechsys.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        <CopyrightFooter />
      </div>
    </div>
  );
}