import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, FileText, AlertTriangle, Scale, Lock } from "lucide-react";
import CopyrightFooter from "../components/CopyrightFooter";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1929] to-[#1a2942] p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl md:text-4xl font-bold text-white flex flex-col sm:flex-row items-center justify-center gap-3">
            <Scale className="w-8 h-8 md:w-10 md:h-10 text-amber-500" />
            <span>Terms of <span className="text-amber-400">Service</span></span>
          </h1>
          <p className="text-white/80 mt-3 text-sm md:text-lg max-w-3xl mx-auto px-4">
            Last Updated: January 2025
          </p>
        </div>

        {/* Introduction */}
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500" />
              Agreement to <span className="text-amber-400">Terms</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-white/80 space-y-4">
            <p>
              Welcome to <span className="text-amber-400 font-semibold">CloudFlip</span>, a service provided by <span className="text-amber-400 font-semibold">MrTechSys</span>. By accessing or using our platform, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our services.
            </p>
            <p>
              These Terms constitute a legally binding agreement between you (either an individual or entity) and MrTechSys. We reserve the right to modify these Terms at any time, and such modifications will be effective immediately upon posting.
            </p>
          </CardContent>
        </Card>

        {/* Service Description */}
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white">Service <span className="text-amber-400">Description</span></CardTitle>
          </CardHeader>
          <CardContent className="text-white/80 space-y-4">
            <p>
              CloudFlip is a comprehensive business management platform that provides:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Lead generation and management from social media platforms</li>
              <li>Quote and invoice generation with AI assistance</li>
              <li>Job scheduling and customer relationship management (CRM)</li>
              <li>Integration with third-party platforms (Facebook, Instagram, TikTok, Nextdoor, Zapier)</li>
              <li>AI-powered features including sentiment analysis, lead scoring, and automated responses</li>
              <li>Payment processing and billing management</li>
            </ul>
          </CardContent>
        </Card>

        {/* User Accounts */}
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-500" />
              User <span className="text-amber-400">Accounts</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-white/80 space-y-4">
            <h4 className="font-semibold text-white">Account Creation</h4>
            <p>
              To use CloudFlip, you must create an account by providing accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>
            
            <h4 className="font-semibold text-white mt-4">Account Security</h4>
            <p>
              You agree to immediately notify us of any unauthorized use of your account or any other breach of security. MrTechSys will not be liable for any loss or damage arising from your failure to comply with these security obligations.
            </p>
            
            <h4 className="font-semibold text-white mt-4">Account Termination</h4>
            <p>
              We reserve the right to suspend or terminate your account at any time, with or without cause, including but not limited to violation of these Terms, fraudulent activity, or non-payment of fees.
            </p>
          </CardContent>
        </Card>

        {/* Acceptable Use */}
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Acceptable <span className="text-amber-400">Use Policy</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-white/80 space-y-4">
            <p>You agree not to use CloudFlip to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Violate any applicable laws, regulations, or third-party rights</li>
              <li>Send spam, unsolicited messages, or engage in harassment</li>
              <li>Distribute malware, viruses, or other harmful code</li>
              <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
              <li>Scrape, crawl, or reverse engineer any part of our platform</li>
              <li>Impersonate any person or entity, or falsely state or misrepresent your affiliation</li>
              <li>Use our platform for any illegal or fraudulent purposes</li>
              <li>Violate the terms of service of any third-party platforms we integrate with</li>
            </ul>
          </CardContent>
        </Card>

        {/* Subscription and Billing */}
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white">Subscription & <span className="text-amber-400">Billing</span></CardTitle>
          </CardHeader>
          <CardContent className="text-white/80 space-y-4">
            <h4 className="font-semibold text-white">Plans and Pricing</h4>
            <p>
              CloudFlip offers multiple subscription tiers (Free, Starter, Pro, Partner) with varying features and usage limits. Pricing is subject to change with 30 days' notice.
            </p>
            
            <h4 className="font-semibold text-white mt-4">Payment Terms</h4>
            <p>
              Paid subscriptions are billed monthly or annually in advance. All fees are non-refundable except where required by law. You authorize us to charge your payment method on a recurring basis.
            </p>
            
            <h4 className="font-semibold text-white mt-4">Cancellation</h4>
            <p>
              You may cancel your subscription at any time. Cancellation will take effect at the end of your current billing period. You will retain access to paid features until that time.
            </p>
            
            <h4 className="font-semibold text-white mt-4">Usage Limits</h4>
            <p>
              Each subscription plan includes usage limits (e.g., number of quotes, leads, AI tokens). Exceeding these limits may result in overage charges or service restrictions.
            </p>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white">Intellectual <span className="text-amber-400">Property</span></CardTitle>
          </CardHeader>
          <CardContent className="text-white/80 space-y-4">
            <h4 className="font-semibold text-white">Our Rights</h4>
            <p>
              All content, features, and functionality of CloudFlip, including but not limited to text, graphics, logos, icons, images, audio clips, and software, are the exclusive property of MrTechSys and are protected by copyright, trademark, and other intellectual property laws.
            </p>
            
            <h4 className="font-semibold text-white mt-4">Your Content</h4>
            <p>
              You retain all rights to the data and content you upload to CloudFlip. By using our service, you grant us a limited, non-exclusive license to use, store, and process your content solely for the purpose of providing our services to you.
            </p>
            
            <h4 className="font-semibold text-white mt-4">Feedback</h4>
            <p>
              Any feedback, suggestions, or ideas you provide to us regarding CloudFlip become our property, and we may use them without restriction or compensation to you.
            </p>
          </CardContent>
        </Card>

        {/* Third-Party Services */}
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white">Third-Party <span className="text-amber-400">Services</span></CardTitle>
          </CardHeader>
          <CardContent className="text-white/80 space-y-4">
            <p>
              CloudFlip integrates with third-party services (Facebook, Instagram, TikTok, Nextdoor, Zapier, Stripe, etc.). Your use of these integrations is subject to their respective terms of service and privacy policies.
            </p>
            <p>
              We are not responsible for the availability, accuracy, or functionality of third-party services. Any issues with integrated platforms should be directed to the respective service provider.
            </p>
            <p>
              You are responsible for ensuring you have the necessary rights and permissions to connect third-party accounts to CloudFlip and to access data from those platforms.
            </p>
          </CardContent>
        </Card>

        {/* Disclaimers */}
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span className="text-amber-400">Disclaimers</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-white/80 space-y-4">
            <p className="font-semibold text-white">
              CLOUDFLIP IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND.
            </p>
            <p>
              To the fullest extent permitted by law, MrTechSys disclaims all warranties, express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
            </p>
            <p>
              We do not guarantee that CloudFlip will be uninterrupted, error-free, secure, or free from viruses or other harmful components. We do not warrant the accuracy, completeness, or reliability of any content or data provided through our platform.
            </p>
            <p>
              AI-generated content (quotes, responses, summaries) is provided for convenience and should be reviewed and verified before use. We are not responsible for any errors or inaccuracies in AI-generated content.
            </p>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white">Limitation of <span className="text-amber-400">Liability</span></CardTitle>
          </CardHeader>
          <CardContent className="text-white/80 space-y-4">
            <p className="font-semibold text-white">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, MRTECHSYS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.
            </p>
            <p>
              This includes, but is not limited to, damages for loss of profits, revenue, data, or other intangible losses resulting from:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Your use or inability to use CloudFlip</li>
              <li>Unauthorized access to or alteration of your data</li>
              <li>Errors, omissions, interruptions, or delays in our service</li>
              <li>Third-party conduct or content on our platform</li>
              <li>Integration failures with third-party services</li>
            </ul>
            <p>
              Our total liability to you for all claims arising from your use of CloudFlip shall not exceed the amount you paid us in the 12 months prior to the claim, or $100, whichever is greater.
            </p>
          </CardContent>
        </Card>

        {/* Indemnification */}
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white"><span className="text-amber-400">Indemnification</span></CardTitle>
          </CardHeader>
          <CardContent className="text-white/80 space-y-4">
            <p>
              You agree to indemnify, defend, and hold harmless MrTechSys, its affiliates, officers, directors, employees, and agents from and against any and all claims, damages, liabilities, costs, and expenses (including reasonable attorneys' fees) arising from:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Your use or misuse of CloudFlip</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party rights</li>
              <li>Your content or data uploaded to our platform</li>
              <li>Any fraudulent or illegal activity conducted through your account</li>
            </ul>
          </CardContent>
        </Card>

        {/* Governing Law */}
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white">Governing Law & <span className="text-amber-400">Disputes</span></CardTitle>
          </CardHeader>
          <CardContent className="text-white/80 space-y-4">
            <h4 className="font-semibold text-white">Jurisdiction</h4>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of Texas, United States, without regard to its conflict of law provisions.
            </p>
            
            <h4 className="font-semibold text-white mt-4">Dispute Resolution</h4>
            <p>
              Any disputes arising from these Terms or your use of CloudFlip shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association, except where prohibited by law.
            </p>
            
            <h4 className="font-semibold text-white mt-4">Class Action Waiver</h4>
            <p>
              You agree to resolve disputes with us on an individual basis and waive your right to participate in a class action lawsuit or class-wide arbitration.
            </p>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white">Changes to <span className="text-amber-400">Terms</span></CardTitle>
          </CardHeader>
          <CardContent className="text-white/80 space-y-4">
            <p>
              We reserve the right to modify these Terms at any time. We will notify you of material changes by email or through a prominent notice on our platform. Your continued use of CloudFlip after such notice constitutes your acceptance of the modified Terms.
            </p>
            <p>
              If you do not agree to the modified Terms, you must stop using CloudFlip and may cancel your subscription.
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
              If you have any questions about these Terms of Service, please contact us at:
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