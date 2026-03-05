
import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MessageSquare, Send, CheckCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import CopyrightFooter from "../components/CopyrightFooter";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

// Particle animation component
const FloatingParticles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => i);
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-amber-400 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 20,
            opacity: 0
          }}
          animate={{
            y: -20,
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 2,
            repeat: Infinity,
            ease: "easeOut"
          }}
          style={{
            left: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </div>
  );
};

// Success animation component
const SuccessAnimation = () => {
  return (
    <div className="relative">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 200, 
          damping: 15,
          duration: 0.6 
        }}
        className="relative"
      >
        <motion.div
          className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mx-auto"
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(251, 191, 36, 0.4)",
              "0 0 0 20px rgba(251, 191, 36, 0)",
              "0 0 0 0 rgba(251, 191, 36, 0)"
            ]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <CheckCircle className="w-16 h-16 text-[#0a1929]" />
        </motion.div>
        
        {/* Orbiting sparkles */}
        {[0, 120, 240].map((angle, i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2"
            animate={{
              rotate: [angle, angle + 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <motion.div
              className="relative"
              style={{
                width: "80px",
                height: "80px",
                marginLeft: "-40px",
                marginTop: "-40px"
              }}
            >
              <Sparkles className="w-6 h-6 text-amber-400 absolute top-0 right-0" />
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default function ContactUs() {
  const [submitted, setSubmitted] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const navigate = useNavigate();

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      try {
        const user = await api.auth.me().catch(() => null);
        
        console.log("=== Contact Form Submission ===");
        console.log("Form Data:", data);
        console.log("User:", user);
        
        // Log to CRM Activity if user is authenticated
        if (user && user.current_org_id) {
          try {
            console.log("Creating CRM activity...");
            await api.entities.CRMActivity.create({
              org_id: user.current_org_id,
              actor_id: user.id,
              entity_type: 'contact',
              entity_id: user.id,
              action_type: 'submitted_feedback',
              metadata: {
                email: data.email,
                phone: data.phone,
                subject: data.subject,
                message_preview: data.message.substring(0, 100),
                form_source: 'contact_us_page'
              }
            });
            console.log("CRM activity logged successfully");
          } catch (error) {
            console.error("Failed to log CRM activity:", error);
          }
        }
        
        // Send email via Core integration
        const emailBody = `
New Contact Form Submission from CloudFlip

From: ${data.name}
Email: ${data.email}
Phone: ${data.phone || 'Not provided'}
Subject: ${data.subject}

Message:
${data.message}

---
Submitted at: ${new Date().toISOString()}
User ID: ${user?.id || 'Anonymous'}
User Email: ${user?.email || 'Not logged in'}
Organization: ${user?.current_org_id || 'N/A'}
        `.trim();
        
        console.log("Sending email to support@mrtechsys.com...");
        console.log("Email body:", emailBody);
        
        const result = await api.integrations.Core.SendEmail({
          to: 'support@mrtechsys.com',
          subject: `CloudFlip Contact: ${data.subject}`,
          body: emailBody,
          from_name: 'CloudFlip Contact Form'
        });
        
        console.log("Email send result:", result);
        console.log("=== End Contact Form Submission ===");
        
        return { success: true, result };
      } catch (error) {
        console.error("=== Contact Form Error ===");
        console.error("Error details:", error);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Contact form submitted successfully:", data);
      setSubmitted(true);
      toast.success("Message sent successfully!");
      
      // Redirect to dashboard after 5 seconds
      setTimeout(() => {
        navigate(createPageUrl("Dashboard"));
      }, 5000);
    },
    onError: (error) => {
      console.error("Contact form submission error:", error);
      toast.error(`Failed to send message: ${error.message || 'Unknown error'}`);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone') || '', // Ensure phone is an empty string if not provided
      subject: formData.get('subject'),
      message: formData.get('message')
    };
    
    console.log("Form submitted with data:", data);
    
    if (wordCount > 500) {
      toast.error("Message exceeds 500 word limit");
      return;
    }
    
    submitMutation.mutate(data);
  };

  const handleMessageChange = (e) => {
    const text = e.target.value;
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    setWordCount(words.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1929] to-[#1a2942] p-4 md:p-6 lg:p-8 relative overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <FloatingParticles />
              
              <Card className="bg-[#0a1929]/80 backdrop-blur border-amber-500/30 shadow-2xl">
                <CardContent className="py-16 text-center relative">
                  <SuccessAnimation />
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    <h2 className="text-3xl md:text-4xl font-bold text-white mt-8 mb-4">
                      Message <span className="text-amber-400">Received!</span>
                    </h2>
                    <p className="text-white/80 text-lg mb-2">
                      Thank you for reaching out to <span className="text-amber-400 font-semibold">MrTechSys</span>
                    </p>
                    <p className="text-white/60 mb-8">
                      We'll get back to you within 24 hours at the email you provided.
                    </p>
                    
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1, duration: 0.5 }}
                      className="flex items-center justify-center gap-2 text-white/50 text-sm"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="w-4 h-4 text-amber-400" />
                      </motion.div>
                      Redirecting to dashboard in 5 seconds...
                    </motion.div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="mt-8"
                  >
                    <Button
                      onClick={() => navigate(createPageUrl("Dashboard"))}
                      className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold px-8"
                    >
                      Go to Dashboard Now
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Header */}
              <div className="text-center">
                <h1 className="text-2xl md:text-4xl font-bold text-white flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Mail className="w-8 h-8 md:w-10 md:h-10 text-amber-500" />
                  <span>Contact <span className="text-amber-400">Us</span></span>
                </h1>
                <p className="text-white/80 mt-3 text-sm md:text-lg max-w-2xl mx-auto px-4">
                  Have questions or feedback? We'd love to hear from <span className="text-amber-400">you</span>!
                </p>
              </div>

              <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Send Us a <span className="text-amber-400">Message</span></CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name" className="text-white">Your Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          required
                          placeholder="John Doe"
                          className="bg-white/5 border-amber-500/30 text-white placeholder:text-white/40"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-white">Email Address *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          placeholder="john@example.com"
                          className="bg-white/5 border-amber-500/30 text-white placeholder:text-white/40"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="phone" className="text-white">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="(555) 123-4567"
                          className="bg-white/5 border-amber-500/30 text-white placeholder:text-white/40"
                        />
                      </div>
                      <div>
                        <Label htmlFor="subject" className="text-white">Subject *</Label>
                        <Input
                          id="subject"
                          name="subject"
                          required
                          placeholder="How can we help?"
                          className="bg-white/5 border-amber-500/30 text-white placeholder:text-white/40"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="message" className="text-white">Your Message *</Label>
                        <span className={`text-sm ${wordCount > 500 ? 'text-red-400' : 'text-white/60'}`}>
                          {wordCount} / 500 words
                        </span>
                      </div>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        rows={8}
                        placeholder="Tell us about your question, concern, or feedback..."
                        onChange={handleMessageChange}
                        className="bg-white/5 border-amber-500/30 text-white placeholder:text-white/40 resize-none"
                      />
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button
                        type="submit"
                        disabled={submitMutation.isPending || wordCount > 500}
                        className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
                      >
                        {submitMutation.isPending ? (
                          <>Sending...</>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
                  <CardContent className="pt-6 text-center">
                    <Mail className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                    <h3 className="font-semibold text-white mb-2">Email</h3>
                    <a href="mailto:support@mrtechsys.com" className="text-amber-400 hover:text-amber-300">
                      support@mrtechsys.com
                    </a>
                  </CardContent>
                </Card>

                <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
                  <CardContent className="pt-6 text-center">
                    <Phone className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                    <h3 className="font-semibold text-white mb-2">Phone</h3>
                    <p className="text-white/70">Available 9 AM - 5 PM CST</p>
                  </CardContent>
                </Card>

                <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
                  <CardContent className="pt-6 text-center">
                    <Sparkles className="w-10 h-10 text-amber-400 mx-auto mb-3" /> {/* Changed icon from MessageSquare to Sparkles */}
                    <h3 className="font-semibold text-white mb-2">Live Chat</h3>
                    <p className="text-white/70">Use our AI assistant (bottom right)</p>
                  </CardContent>
                </Card>
              </div>

              <CopyrightFooter />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
