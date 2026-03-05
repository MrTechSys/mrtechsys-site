import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckCircle, AlertCircle, Edit2, Save, X } from "lucide-react";
import { toast } from "sonner";

export default function RecoveryEmailManager({ currentEmail, isVerified, onUpdateEmail }) {
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState(currentEmail || "");

  const handleSave = () => {
    if (!email || !email.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    onUpdateEmail(email);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEmail(currentEmail || "");
    setIsEditing(false);
  };

  return (
    <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-400" />
            Recovery Email
          </div>
          {currentEmail && (
            <Badge className={isVerified ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}>
              {isVerified ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Pending
                </>
              )}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-white/70 text-sm">
          Set a recovery email to receive account recovery links if you lose access to your authenticator.
        </p>

        {!isEditing ? (
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-amber-500/20">
            {currentEmail ? (
              <>
                <div className="flex-1">
                  <p className="text-white font-medium">{currentEmail}</p>
                  {!isVerified && (
                    <p className="text-yellow-400 text-xs mt-1">
                      Check your inbox to verify this email
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                >
                  <Edit2 className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              </>
            ) : (
              <>
                <p className="text-white/60 text-sm">No recovery email set</p>
                <Button
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-500"
                >
                  <Mail className="w-3 h-3 mr-1" />
                  Add Email
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="recovery@example.com"
              className="bg-white/5 border-amber-500/30 text-white"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                size="sm"
                className="flex-1 bg-gradient-to-r from-green-600 to-green-500"
              >
                <Save className="w-3 h-3 mr-1" />
                Save
              </Button>
              <Button
                onClick={handleCancel}
                size="sm"
                variant="outline"
                className="flex-1 border-amber-500/30 text-white"
              >
                <X className="w-3 h-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {!isVerified && currentEmail && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-400 text-xs">
              💡 <strong>Verification Required:</strong> Check your inbox for a verification email. Click the link to activate recovery options.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}