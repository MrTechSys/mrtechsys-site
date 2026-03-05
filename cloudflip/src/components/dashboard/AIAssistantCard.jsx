
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Users, DollarSign, Target, Loader2 } from "lucide-react";
import { api } from "@/api/apiClient";
import { motion } from "framer-motion";
import { toast } from "sonner"; // Assuming 'sonner' for toast notifications

// Helper function for page URL construction
// This function might exist in a utility file or be part of a routing library.
// For this isolated component, we'll define a basic one.
const createPageUrl = (pageName) => {
  // Adjust this path based on your application's routing convention
  // For example, if 'NurtureWorkflows' maps to '/app/workflows', adjust accordingly.
  if (pageName === "NurtureWorkflows") {
    return "/app/workflows"; // Example path for nurture workflows
  }
  return `/app/${pageName.toLowerCase()}`; // Generic fallback
};

export default function AIAssistantCard() {
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [launchingWorkflow, setLaunchingWorkflow] = useState(false); // New state for loading indicator

  useEffect(() => {
    const loadOrg = async () => {
      try {
        const user = await api.auth.me();
        if (user.current_org_id) {
          const orgs = await api.entities.Organization.filter({ id: user.current_org_id });
          if (orgs.length > 0) {
            setOrganization(orgs[0]);
          }
        }
      } catch (error) {
        console.error('Failed to load organization:', error);
      }
    };
    loadOrg();
  }, []);

  const getGoalsForIndustry = (industry) => {
    const industryGoals = {
      hvac: [
        {
          id: 'revenue',
          icon: DollarSign,
          title: 'Increase Revenue',
          color: 'from-green-500 to-emerald-600',
          suggestions: [
            'Upsell maintenance contracts',
            'Promote seasonal tune-ups',
            'Follow up on HVAC replacements'
          ]
        },
        {
          id: 'leads',
          icon: Users,
          title: 'Get More Leads',
          color: 'from-blue-500 to-purple-600',
          suggestions: [
            'Run seasonal AC/heating campaigns',
            'Ask for online reviews',
            'Join local home improvement groups'
          ]
        },
        {
          id: 'efficiency',
          icon: TrendingUp,
          title: 'Work Smarter',
          color: 'from-amber-500 to-orange-600',
          suggestions: [
            'Schedule preventive maintenance',
            'Automate appointment reminders',
            'Use job templates'
          ]
        },
        {
          id: 'retention',
          icon: Target,
          title: 'Keep Clients Happy',
          color: 'from-pink-500 to-red-600',
          suggestions: [
            'Send seasonal reminders',
            'Create loyalty discounts',
            'Offer priority service'
          ]
        }
      ],
      landscaping: [
        {
          id: 'revenue',
          icon: DollarSign,
          title: 'Increase Revenue',
          color: 'from-green-500 to-emerald-600',
          suggestions: [
            'Upsell hardscaping projects',
            'Promote seasonal cleanups',
            'Offer fertilization packages'
          ]
        },
        {
          id: 'leads',
          icon: Users,
          title: 'Get More Leads',
          color: 'from-blue-500 to-purple-600',
          suggestions: [
            'Share before/after photos',
            'Join Nextdoor for local leads',
            'Offer spring promotion'
          ]
        },
        {
          id: 'efficiency',
          icon: TrendingUp,
          title: 'Work Smarter',
          color: 'from-amber-500 to-orange-600',
          suggestions: [
            'Route jobs by location',
            'Schedule recurring services',
            'Track equipment maintenance'
          ]
        },
        {
          id: 'retention',
          icon: Target,
          title: 'Keep Clients Happy',
          color: 'from-pink-500 to-red-600',
          suggestions: [
            'Send seasonal care tips',
            'Create monthly service plans',
            'Follow up after projects'
          ]
        }
      ],
      // Default for all other industries
      default: [
        {
          id: 'revenue',
          icon: DollarSign,
          title: 'Increase Revenue',
          color: 'from-green-500 to-emerald-600',
          suggestions: [
            'Upsell to repeat clients',
            'Create premium service tier',
            'Follow up on pending quotes'
          ]
        },
        {
          id: 'leads',
          icon: Users,
          title: 'Get More Leads',
          color: 'from-blue-500 to-purple-600',
          suggestions: [
            'Post daily on social media',
            'Ask for referrals',
            'Set up Nextdoor integration'
          ]
        },
        {
          id: 'efficiency',
          icon: TrendingUp,
          title: 'Work Smarter',
          color: 'from-amber-500 to-orange-600',
          suggestions: [
            'Automate quote follow-ups',
            'Use task templates',
            'Enable nurture workflows'
          ]
        },
        {
          id: 'retention',
          icon: Target,
          title: 'Keep Clients Happy',
          color: 'from-pink-500 to-red-600',
          suggestions: [
            'Send satisfaction surveys',
            'Create loyalty rewards',
            'Schedule check-ins'
          ]
        }
      ]
    };

    return industryGoals[industry] || industryGoals.default;
  };

  const handleStartWorkflow = async (suggestion) => {
    if (!selectedGoal) {
      toast.error('Please select a goal first.');
      return;
    }

    setLaunchingWorkflow(true);
    try {
      // Create a nurture workflow based on the suggestion
      const user = await api.auth.me();
      
      if (!user || !user.current_org_id || !user.id) {
        throw new Error("User or organization information missing.");
      }

      const workflowName = `${selectedGoal.title}: ${suggestion}`;
      
      // Create workflow
      const workflow = await api.entities.NurtureWorkflow.create({
        org_id: user.current_org_id,
        name: workflowName,
        description: `Auto-generated workflow to achieve the goal "${selectedGoal.title}" with the suggestion: "${suggestion}".`,
        trigger: {
          type: 'manual', // Assuming manual trigger for now
          conditions: {}
        },
        steps: [
          {
            step_number: 1,
            delay_hours: 0,
            action_type: 'send_email',
            email_template: {
              subject: `${selectedGoal.title} - Let's get started with "${suggestion}"`,
              body: `Hi there,
              
This automated workflow was created to help you with:
**${selectedGoal.title}**
Specifically, to implement the suggestion: **"${suggestion}"**.

Here's an initial email suggestion to get you started. Feel free to customize it!

---
Subject: Boost Your Business: Focus on "${suggestion}"

Body:
Hi [Client Name],

Are you looking to enhance your [business area related to selectedGoal.title]?

We've identified a key strategy that can significantly help: **${suggestion}**.

This approach can lead to [mention a specific benefit related to the suggestion and goal, e.g., "increased customer engagement" or "more efficient operations"].

Would you be interested in learning more about how we can implement this for you, or perhaps discussing other ways to achieve your goals?

Best regards,
[Your Company Name]
---

You can customize this email template and add more steps to this workflow in your dashboard.

Best,
The CloudFlip Team`,
              use_ai: true
            }
          },
          {
            step_number: 2,
            delay_hours: 24,
            action_type: 'create_task',
            task_template: {
              title: `Follow up on "${suggestion}" workflow`,
              description: `Check the progress of the workflow for "${suggestion}". Has the initial email been sent? Any responses? Consider creating follow-up tasks or calls.`,
              priority: 'medium'
            }
          }
        ],
        is_active: true,
        created_by: user.id
      });

      toast.success(`Workflow "${workflowName}" created successfully!`);
      
      // Navigate to workflows page
      setTimeout(() => {
        window.location.href = createPageUrl("NurtureWorkflows");
      }, 1500);
    } catch (error) {
      console.error('Failed to create workflow:', error);
      toast.error('Failed to create workflow: ' + (error.message || 'An unknown error occurred.'));
    } finally {
      setLaunchingWorkflow(false);
    }
  };

  const goals = getGoalsForIndustry(organization?.industry);

  return (
    <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          AI Growth Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!selectedGoal ? (
          <div className="space-y-3">
            <p className="text-white/70 text-sm mb-4">
              What do you want to grow this month?
            </p>
            <div className="grid grid-cols-2 gap-3">
              {goals.map((goal, idx) => {
                const Icon = goal.icon;
                return (
                  <motion.button
                    key={goal.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => setSelectedGoal(goal)}
                    className={`p-4 rounded-lg bg-gradient-to-br ${goal.color} hover:scale-105 transition-transform text-left`}
                  >
                    <Icon className="w-6 h-6 text-white mb-2" />
                    <p className="font-medium text-white text-sm">{goal.title}</p>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 mb-4">
              {React.createElement(selectedGoal.icon, {
                className: "w-8 h-8 text-amber-400"
              })}
              <div>
                <h3 className="font-medium text-white">{selectedGoal.title}</h3>
                <p className="text-xs text-white/60">Recommended actions:</p>
              </div>
            </div>

            <div className="space-y-2">
              {selectedGoal.suggestions.map((suggestion, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-3 bg-white/5 rounded-lg border border-amber-500/20 hover:border-amber-500/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-white">{suggestion}</p>
                    <Button
                      size="sm"
                      onClick={() => handleStartWorkflow(suggestion)}
                      disabled={launchingWorkflow}
                      className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold shrink-0"
                    >
                      {launchingWorkflow ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Start'
                      )}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button
              onClick={() => setSelectedGoal(null)}
              variant="outline"
              className="w-full border-amber-500/30 text-white hover:bg-white/10"
            >
              Choose Different Goal
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
