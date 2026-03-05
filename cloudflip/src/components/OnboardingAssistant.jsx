import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  CheckCircle,
  ArrowRight,
  Target,
  Zap,
  Users,
  FileText,
  Calendar,
  X,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function OnboardingAssistant({ user, organization }) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [coreActions, setCoreActions] = useState([]);
  const [completedActions, setCompletedActions] = useState([]);
  const [aiGreeting, setAiGreeting] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAssistant = async () => {
      if (!user || !organization) return;

      const hasSeenAssistant = user.onboarding_assistant_completed === true;
      
      if (hasSeenAssistant) {
        setIsVisible(false);
        return;
      }

      setLoading(true);

      try {
        const industry = organization.industry || 'general business';
        const { data } = await api.functions.invoke('generateOnboardingPlan', {
          userName: user.full_name || 'there',
          industry,
          orgSettings: organization.settings
        });

        setAiGreeting(data?.greeting || '');
        setCoreActions(data?.coreActions || []);
        setIsVisible(true);
      } catch (error) {
        console.error('Failed to initialize onboarding assistant:', error);
      } finally {
        setLoading(false);
      }
    };

    initAssistant();
  }, [user, organization]);

  const completeAction = (actionId) => {
    if (!completedActions.includes(actionId)) {
      setCompletedActions([...completedActions, actionId]);
      toast.success("Great job! Action completed 🎉");
    }
  };

  const dismissAssistant = async () => {
    await api.auth.updateMe({ onboarding_assistant_completed: true });
    setIsVisible(false);
    toast.success("You can always access help from the AI chat widget!");
  };

  const nextStep = () => {
    if (currentStep < coreActions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      dismissAssistant();
    }
  };

  if (!isVisible || loading || coreActions.length === 0) return null;

  const currentAction = coreActions[currentStep];
  const ActionIcon = currentAction?.icon === 'Users' ? Users :
                      currentAction?.icon === 'FileText' ? FileText :
                      currentAction?.icon === 'Calendar' ? Calendar :
                      Target;
  
  const actionSteps = currentAction?.steps || [];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        className="fixed bottom-24 right-6 z-50 max-w-md"
      >
        <Card className="bg-gradient-to-br from-[#0a1929] to-[#1a2744] border-2 border-amber-500/40 shadow-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  <Sparkles className="w-6 h-6 text-amber-400" />
                </motion.div>
                <CardTitle className="text-white text-lg">Your AI Guide</CardTitle>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                  Step {currentStep + 1}/{coreActions.length}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={dismissAssistant}
                className="text-white/70 hover:text-white hover:bg-white/10 h-6 w-6"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {currentStep === 0 && aiGreeting && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg"
              >
                <p className="text-white/90 text-sm">{aiGreeting}</p>
              </motion.div>
            )}

            {currentAction && (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-500/20 rounded-lg">
                    <ActionIcon className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{currentAction.title || 'Action'}</h3>
                    <p className="text-white/70 text-sm">{currentAction.description || ''}</p>
                  </div>
                </div>

                {actionSteps.length > 0 && (
                  <div className="space-y-2 pl-11">
                    {actionSteps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 flex-shrink-0" />
                        <p className="text-white/80 text-sm">{step}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {currentAction.actionUrl && (
                    <Link to={createPageUrl(currentAction.actionUrl)} className="flex-1">
                      <Button
                        onClick={() => completeAction(currentAction.id)}
                        className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
                      >
                        {currentAction.actionLabel || 'Get Started'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                  {currentStep < coreActions.length - 1 && (
                    <Button
                      onClick={nextStep}
                      variant="outline"
                      className="border-amber-500/30 text-white hover:bg-white/10"
                    >
                      Skip
                    </Button>
                  )}
                </div>
              </motion.div>
            )}

            <div className="flex items-center gap-1 pt-2 border-t border-white/10">
              {coreActions.map((_, idx) => (
                <div
                  key={idx}
                  className={`flex-1 h-1 rounded-full transition-all ${
                    idx <= currentStep ? 'bg-amber-400' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}