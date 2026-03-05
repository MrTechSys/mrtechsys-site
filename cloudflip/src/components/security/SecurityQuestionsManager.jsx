import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HelpCircle, CheckCircle, Shield, Save, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/apiClient";

export default function SecurityQuestionsManager({ currentQuestions, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([
    { question_id: '', answer: '' },
    { question_id: '', answer: '' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAvailableQuestions();
  }, []);

  const loadAvailableQuestions = async () => {
    try {
      const { data } = await api.functions.invoke('mfaSecurityQuestions', {
        action: 'get_questions'
      });
      setAvailableQuestions(data.questions || []);
    } catch (error) {
      console.error('Failed to load questions:', error);
      toast.error('Failed to load security questions');
    }
  };

  const handleAddQuestion = () => {
    if (selectedQuestions.length < 3) {
      setSelectedQuestions([...selectedQuestions, { question_id: '', answer: '' }]);
    }
  };

  const handleRemoveQuestion = (index) => {
    if (selectedQuestions.length > 2) {
      setSelectedQuestions(selectedQuestions.filter((_, i) => i !== index));
    }
  };

  const handleQuestionChange = (index, questionId) => {
    const updated = [...selectedQuestions];
    updated[index].question_id = questionId;
    setSelectedQuestions(updated);
  };

  const handleAnswerChange = (index, answer) => {
    const updated = [...selectedQuestions];
    updated[index].answer = answer;
    setSelectedQuestions(updated);
  };

  const handleSave = async () => {
    // Validate
    const valid = selectedQuestions.every(q => q.question_id && q.answer && q.answer.trim().length >= 3);
    if (!valid) {
      toast.error('Please complete all questions with answers of at least 3 characters');
      return;
    }

    // Check for duplicate questions
    const questionIds = selectedQuestions.map(q => q.question_id);
    if (new Set(questionIds).size !== questionIds.length) {
      toast.error('Please select different questions for each slot');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await api.functions.invoke('mfaSecurityQuestions', {
        action: 'set_questions',
        selectedQuestions: selectedQuestions.map(q => ({
          question_id: q.question_id,
          answer: q.answer
        }))
      });

      toast.success(data.message || 'Security questions saved');
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to save security questions:', error);
      toast.error(error?.response?.data?.message || 'Failed to save security questions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedQuestions([
      { question_id: '', answer: '' },
      { question_id: '', answer: '' }
    ]);
    setIsEditing(false);
  };

  const hasQuestions = currentQuestions && currentQuestions.length > 0;

  return (
    <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-purple-400" />
            Security Questions
          </div>
          {hasQuestions && (
            <Badge className="bg-green-500/20 text-green-400">
              <CheckCircle className="w-3 h-3 mr-1" />
              Configured
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-white/70 text-sm">
          Set security questions as a backup recovery method if you lose access to your authenticator.
        </p>

        {!isEditing ? (
          <div className="p-3 bg-white/5 rounded-lg border border-amber-500/20">
            {hasQuestions ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-white font-medium">{currentQuestions.length} questions configured</p>
                    <p className="text-white/60 text-xs mt-1">
                      Last updated: {currentQuestions[0]?.last_used_at 
                        ? new Date(currentQuestions[0].last_used_at).toLocaleDateString()
                        : 'Never used'}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                  >
                    Update
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-white/60 text-sm mb-3">No security questions set</p>
                <Button
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-purple-600 to-purple-500"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  Set Questions
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {selectedQuestions.map((q, index) => (
              <div key={index} className="space-y-2 p-3 bg-white/5 rounded-lg border border-amber-500/20">
                <div className="flex items-center justify-between">
                  <Label className="text-white text-sm">Question {index + 1}</Label>
                  {selectedQuestions.length > 2 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveQuestion(index)}
                      className="text-red-400 hover:text-red-300 h-6 w-6 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <Select
                  value={q.question_id}
                  onValueChange={(value) => handleQuestionChange(index, value)}
                >
                  <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                    <SelectValue placeholder="Select a question" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableQuestions.map((question) => (
                      <SelectItem 
                        key={question.id} 
                        value={question.id}
                        disabled={selectedQuestions.some((sq, i) => i !== index && sq.question_id === question.id)}
                      >
                        {question.text}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="text"
                  value={q.answer}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  placeholder="Your answer"
                  className="bg-white/5 border-amber-500/30 text-white"
                />
              </div>
            ))}

            {selectedQuestions.length < 3 && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddQuestion}
                className="w-full border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
              >
                Add Another Question (Optional)
              </Button>
            )}

            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <p className="text-purple-400 text-xs">
                💡 <strong>Tip:</strong> Choose questions with answers only you would know. Answers are case-insensitive.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-500"
              >
                <Save className="w-3 h-3 mr-1" />
                {isLoading ? 'Saving...' : 'Save Questions'}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1 border-amber-500/30 text-white"
              >
                <X className="w-3 h-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}