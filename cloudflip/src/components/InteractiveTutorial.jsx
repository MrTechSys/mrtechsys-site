import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle,
  Lightbulb,
  Target
} from "lucide-react";

const tutorialSteps = {
  dashboard: [
    {
      target: '[data-tutorial="stats-cards"]',
      title: "Your Business at a Glance",
      content: "These cards show your key metrics: leads, quotes, revenue, and scheduled jobs. They update in real-time!",
      position: "bottom"
    },
    {
      target: '[data-tutorial="today-focus"]',
      title: "Today's Priorities",
      content: "Focus on what matters most. This section shows urgent items, overdue invoices, and leads needing attention.",
      position: "right"
    },
    {
      target: '[data-tutorial="pipeline"]',
      title: "Lead Pipeline",
      content: "Track your leads through each stage of your sales process. Watch them move from new to won!",
      position: "left"
    }
  ],
  kanban: [
    {
      target: '[data-tutorial="kanban-board"]',
      title: "Visual Task Management",
      content: "Drag and drop tasks between columns to update their status. It's that easy!",
      position: "top"
    },
    {
      target: '[data-tutorial="task-card"]',
      title: "Task Cards",
      content: "Each card shows priority, assignee, due date, and progress. Click to see details or add comments.",
      position: "bottom"
    },
    {
      target: '[data-tutorial="add-task"]',
      title: "Create Tasks",
      content: "Break down jobs into manageable tasks. Assign team members, set deadlines, and track progress.",
      position: "left"
    }
  ],
  crm: [
    {
      target: '[data-tutorial="crm-platforms"]',
      title: "Connect Your CRM",
      content: "Sync with Salesforce or HubSpot to keep your data in perfect harmony across platforms.",
      position: "bottom"
    },
    {
      target: '[data-tutorial="sync-settings"]',
      title: "Auto-Sync Controls",
      content: "Enable auto-sync to keep contacts and deals updated automatically, or sync manually whenever you want.",
      position: "top"
    }
  ]
};

export default function InteractiveTutorial({ page, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [highlightedElement, setHighlightedElement] = useState(null);

  const steps = tutorialSteps[page] || [];

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
      
      // Check if user has completed this tutorial
      const completed = currentUser.completed_walkthroughs?.[page];
      if (!completed) {
        setTimeout(() => setIsVisible(true), 1000); // Show after 1 second
      }
    };
    loadUser();
  }, [page]);

  useEffect(() => {
    if (isVisible && steps[currentStep]) {
      const target = document.querySelector(steps[currentStep].target);
      if (target) {
        setHighlightedElement(target);
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentStep, isVisible, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    // Mark tutorial as completed
    if (user) {
      const walkthroughs = user.completed_walkthroughs || {};
      await api.auth.updateMe({
        completed_walkthroughs: {
          ...walkthroughs,
          [page]: true
        }
      });
    }

    setIsVisible(false);
    if (onComplete) onComplete();
  };

  const handleDismiss = () => {
    setIsVisible(false);
    if (onComplete) onComplete();
  };

  if (!isVisible || steps.length === 0) return null;

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50"
        onClick={handleDismiss}
      />

      {/* Tutorial Card - Mobile Optimized */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed z-[60] bg-gradient-to-br from-[#0a1929] to-[#1a2939] border-2 border-amber-500 rounded-xl shadow-2xl w-[calc(100vw-2rem)] max-w-md mx-4 max-h-[80vh] overflow-y-auto"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          {/* Progress Bar */}
          <div className="h-1 bg-white/10 rounded-t-xl overflow-hidden sticky top-0 z-10">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-600 to-amber-400"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="p-4 sm:p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-white font-bold text-base sm:text-lg leading-tight">{currentStepData.title}</h3>
                  <p className="text-white/50 text-xs mt-0.5">
                    Step {currentStep + 1} of {steps.length}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDismiss}
                className="text-white/60 hover:text-white flex-shrink-0 -mr-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <p className="text-white/70 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
              {currentStepData.content}
            </p>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="text-white/60 hover:text-white w-full sm:w-auto justify-center"
                size="sm"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              <div className="flex flex-col-reverse sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={handleDismiss}
                  className="border-amber-500/30 text-white hover:bg-white/10 w-full sm:w-auto"
                  size="sm"
                >
                  Skip Tutorial
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold w-full sm:w-auto"
                  size="sm"
                >
                  {currentStep === steps.length - 1 ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}