import React, { useEffect, useState } from "react";
import { api } from "@/api/apiClient";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function OAuthFacebookCallback() {
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("Connecting your Facebook account...");
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get code and state from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        // Check if user denied access
        if (error) {
          setStatus("error");
          setMessage(errorDescription || "Facebook authorization was denied");
          setTimeout(() => navigate(createPageUrl("Integrations")), 3000);
          return;
        }

        // Validate we have the authorization code
        if (!code) {
          setStatus("error");
          setMessage("No authorization code received from Facebook");
          setTimeout(() => navigate(createPageUrl("Integrations")), 3000);
          return;
        }

        // Call backend to exchange code for tokens
        const response = await api.functions.invoke('oauthFacebook', {
          action: 'callback',
          code,
          state
        });

        if (response.data.success) {
          setStatus("success");
          setMessage("Facebook account connected successfully!");
          setTimeout(() => navigate(createPageUrl("Integrations")), 2000);
        } else {
          setStatus("error");
          setMessage(response.data.error || "Failed to connect Facebook account");
          setTimeout(() => navigate(createPageUrl("Integrations")), 3000);
        }

      } catch (error) {
        console.error("OAuth callback error:", error);
        setStatus("error");
        setMessage(error.message || "An unexpected error occurred");
        setTimeout(() => navigate(createPageUrl("Integrations")), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[#0a1929] to-[#1a2942]">
      <Card className="max-w-md w-full bg-[#0a1929]/80 backdrop-blur border-amber-500/30">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center space-y-4">
            {status === "processing" && (
              <>
                <Loader2 className="w-16 h-16 text-amber-500 animate-spin" />
                <h2 className="text-2xl font-bold text-white">Connecting...</h2>
                <p className="text-white/70">{message}</p>
              </>
            )}
            
            {status === "success" && (
              <>
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">Success!</h2>
                <p className="text-white/70">{message}</p>
                <p className="text-sm text-white/50">Redirecting you back...</p>
              </>
            )}
            
            {status === "error" && (
              <>
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">Connection Failed</h2>
                <p className="text-white/70">{message}</p>
                <p className="text-sm text-white/50">Redirecting you back...</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}