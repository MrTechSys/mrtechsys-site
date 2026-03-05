
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Mail,
  Receipt,
  BarChart,
  Users,
  TrendingUp,
  Target,
  AlertCircle,
  Settings,
  Zap,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Crown,
  Lock
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from '@/components/ui/badge'; // Ensure Badge is imported

// Feature requirements by plan
const featureRequirements = {
  'Business Tools': 'free',
  'CRM Suite': 'pro',
  'Growth & Automation': 'partner'
};

const categories = [
  {
    id: 'business',
    title: 'Business Tools',
    icon: Receipt,
    emoji: '🧾',
    color: 'from-blue-500 to-blue-600',
    requiredPlan: 'free',
    items: [
      { title: "Email Center", url: createPageUrl("EmailCenter"), icon: Mail, description: "Manage communications", requiredPlan: 'starter' },
      { title: "Billing", url: createPageUrl("BillingDashboard"), icon: Receipt, description: "Track payments", requiredPlan: 'free' },
      { title: "Reports", url: createPageUrl("Reports"), icon: BarChart, description: "View analytics", requiredPlan: 'starter' }
    ]
  },
  {
    id: 'crm',
    title: 'CRM Suite',
    icon: Users,
    emoji: '👥',
    color: 'from-purple-500 to-pink-600',
    requiredPlan: 'pro',
    items: [
      { title: "Contacts", url: createPageUrl("CRMContacts"), icon: Users, description: "Manage contacts", requiredPlan: 'pro' },
      { title: "Pipeline", url: createPageUrl("CRMLeads"), icon: TrendingUp, description: "Track leads", requiredPlan: 'pro' },
      { title: "Deals", url: createPageUrl("CRMDeals"), icon: Target, description: "Close deals", requiredPlan: 'pro' },
      { title: "Tickets", url: createPageUrl("CRMTickets"), icon: AlertCircle, description: "Support tickets", requiredPlan: 'pro' },
      { title: "Analytics", url: createPageUrl("CRMAnalytics"), icon: BarChart, description: "CRM insights", requiredPlan: 'pro' },
      { title: "Settings", url: createPageUrl("CRMSettings"), icon: Settings, description: "Configure CRM", requiredPlan: 'pro' }
    ]
  },
  {
    id: 'growth',
    title: 'Growth & Automation',
    icon: Zap,
    emoji: '⚡',
    color: 'from-amber-500 to-orange-600',
    requiredPlan: 'partner',
    items: [
      { title: "Nurture Workflows", url: createPageUrl("NurtureWorkflows"), icon: Zap, description: "Automate follow-ups", requiredPlan: 'partner' },
      { title: "Advanced Reports", url: createPageUrl("AdvancedReports"), icon: BarChart, description: "Deep analytics", requiredPlan: 'partner' },
      { title: "CRM Integrations", url: createPageUrl("CRMIntegrations"), icon: Zap, description: "Connect systems", requiredPlan: 'partner' },
      { title: "Features", url: createPageUrl("FeatureMarketplace"), icon: Sparkles, description: "Add features", requiredPlan: 'free' },
      { title: "Integrations", url: createPageUrl("Integrations"), icon: Zap, description: "Connect apps", requiredPlan: 'starter' }
    ]
  }
];

const planHierarchy = {
  'free': 0,
  'demo': 0,
  'starter': 1,
  'pro': 2,
  'partner': 3,
  'elite': 4
};

export default function NavigationCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [userPlan, setUserPlan] = useState('free');
  const [isMobile, setIsMobile] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const loadUserPlan = async () => {
      try {
        const user = await api.auth.me();
        
        // Check if MrTechSys owner
        if (user.email === 'brandon@mrtechsys.com' || user.role === 'admin') {
          setUserPlan('elite');
          return;
        }

        // Check subscription
        if (user.current_org_id) {
          const subs = await api.entities.BillingSubscription.filter({ 
            org_id: user.current_org_id 
          });
          if (subs.length > 0) {
            setUserPlan(subs[0].plan);
          }
        }
      } catch (error) {
        console.error('Failed to load user plan:', error);
      }
    };

    loadUserPlan();
  }, []);

  useEffect(() => {
    if (isMobile) return; // Don't auto-rotate on mobile
    
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % categories.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isMobile]);

  const hasFeatureAccess = (requiredPlan) => {
    return planHierarchy[userPlan] >= planHierarchy[requiredPlan];
  };

  const trackClick = async (category, itemTitle) => {
    try {
      const user = await api.auth.me();
      await api.entities.UsageEvent.create({
        org_id: user.current_org_id,
        event: 'carousel.click',
        actor_id: user.id,
        metadata: {
          category,
          item: itemTitle,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Failed to track click:', error);
    }
  };

  const handlePrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + categories.length) % categories.length);
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % categories.length);
  };

  const handleItemClick = (category, item) => {
    trackClick(category.title, item.title);
  };

  // Mobile Accordion View
  if (isMobile) {
    return (
      <div className="space-y-2">
        {categories.map((category, idx) => {
          const CategoryIcon = category.icon;
          const hasAccess = hasFeatureAccess(category.requiredPlan);
          const safeItems = category.items || [];
          
          return (
            <Collapsible
              key={category.id}
              open={openAccordion === category.id}
              onOpenChange={(open) => setOpenAccordion(open ? category.id : null)}
            >
              <Card className="bg-gradient-to-br from-[#0a1929]/80 to-[#1a1f3a]/80 backdrop-blur border-amber-500/30">
                <CollapsibleTrigger className="w-full">
                  <CardHeader className={`bg-gradient-to-r ${category.color} text-white py-3 flex flex-row items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{category.emoji}</span>
                      <CategoryIcon className="w-5 h-5" />
                      <span className="font-semibold text-sm">{category.title}</span>
                      {!hasAccess && (
                        <Lock className="w-3 h-3 ml-1" />
                      )}
                    </div>
                    <ChevronDown 
                      className={`w-5 h-5 transition-transform ${
                        openAccordion === category.id ? 'rotate-180' : ''
                      }`} 
                    />
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      {safeItems.map((item) => {
                        const ItemIcon = item.icon;
                        const itemHasAccess = hasFeatureAccess(item.requiredPlan);
                        
                        return itemHasAccess ? (
                          <Link 
                            key={item.title} 
                            to={item.url}
                            onClick={() => handleItemClick(category, item)}
                          >
                            <Card className="bg-white/5 border-amber-500/20 hover:border-amber-500/50 hover:bg-white/10 transition-all">
                              <CardContent className="p-3">
                                <div className="flex items-center gap-2">
                                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center flex-shrink-0`}>
                                    <ItemIcon className="w-4 h-4 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-medium text-sm">{item.title}</h4>
                                    <p className="text-white/60 text-xs">{item.description}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ) : (
                          <Card key={item.title} className="bg-white/5 border-red-500/20 opacity-50">
                            <CardContent className="p-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gray-500/20 flex items-center justify-center flex-shrink-0">
                                  <Lock className="w-4 h-4 text-gray-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-white/50 font-medium text-sm">{item.title}</h4>
                                  <p className="text-white/40 text-xs">Requires {item.requiredPlan} plan</p>
                                </div>
                                <Link to={createPageUrl("Billing")}>
                                  <Button size="sm" variant="outline" className="border-amber-500/30 text-amber-400 text-xs">
                                    <Crown className="w-3 h-3 mr-1" />
                                    Upgrade
                                  </Button>
                                </Link>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>
    );
  }

  // Desktop Carousel View
  const currentCategory = categories[currentIndex];
  const CategoryIcon = currentCategory.icon;
  const hasAccess = hasFeatureAccess(currentCategory.requiredPlan);
  const categoryItems = currentCategory.items || [];

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8
    })
  };

  return (
    <div className="relative">
      <div className="overflow-hidden min-h-[400px]">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
              scale: { duration: 0.2 }
            }}
          >
            <Card className="bg-gradient-to-br from-[#0a1929]/80 to-[#1a1f3a]/80 backdrop-blur border-amber-500/30">
              <CardHeader className={`bg-gradient-to-r ${currentCategory.color} text-white py-4`}>
                <CardTitle className="flex items-center gap-3">
                  <span className="text-2xl">{currentCategory.emoji}</span>
                  <CategoryIcon className="w-6 h-6" />
                  <span className="text-xl">{currentCategory.title}</span>
                  {!hasAccess && (
                    <Badge className="bg-white/20 text-white ml-2">
                      <Lock className="w-3 h-3 mr-1" />
                      Locked
                    </Badge>
                  )}
                  <div className="ml-auto flex items-center gap-1">
                    {categories.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-2 h-2 rounded-full transition-all ${
                          idx === currentIndex ? 'bg-white w-6' : 'bg-white/40'
                        }`}
                      />
                    ))}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 min-h-[280px]">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryItems.map((item, idx) => {
                    const ItemIcon = item.icon;
                    const itemHasAccess = hasFeatureAccess(item.requiredPlan);
                    
                    return (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        {itemHasAccess ? (
                          <Link 
                            to={item.url}
                            onClick={() => handleItemClick(currentCategory, item)}
                          >
                            <Card className="h-full bg-white/5 border-amber-500/20 hover:border-amber-500/50 hover:bg-white/10 transition-all group cursor-pointer">
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${currentCategory.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                    <ItemIcon className="w-5 h-5 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-medium text-sm group-hover:text-amber-400 transition-colors">
                                      {item.title}
                                    </h4>
                                    <p className="text-white/60 text-xs mt-1">
                                      {item.description}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ) : (
                          <Card className="h-full bg-white/5 border-red-500/20 opacity-50">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gray-500/20 flex items-center justify-center flex-shrink-0">
                                  <Lock className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-white/50 font-medium text-sm">
                                    {item.title}
                                  </h4>
                                  <p className="text-white/40 text-xs mt-1">
                                    Requires {item.requiredPlan} plan
                                  </p>
                                  <Link to={createPageUrl("Billing")}>
                                    <Button size="sm" variant="outline" className="mt-2 border-amber-500/30 text-amber-400 text-xs">
                                      <Crown className="w-3 h-3 mr-1" />
                                      Upgrade
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      <Button
        onClick={handlePrevious}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#0a1929]/80 backdrop-blur border border-amber-500/30 hover:bg-amber-500/20 p-0 z-10"
        variant="ghost"
      >
        <ChevronLeft className="w-5 h-5 text-amber-400" />
      </Button>
      <Button
        onClick={handleNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#0a1929]/80 backdrop-blur border border-amber-500/30 hover:bg-amber-500/20 p-0 z-10"
        variant="ghost"
      >
        <ChevronRight className="w-5 h-5 text-amber-400" />
      </Button>
    </div>
  );
}
