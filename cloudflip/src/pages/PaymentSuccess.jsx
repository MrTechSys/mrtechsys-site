import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home, Receipt } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

export default function PaymentSuccess() {
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setSessionId(urlParams.get('session_id'));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#06162a] to-[#0b213d] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-[#0a1929]/80 backdrop-blur border-green-500/30 max-w-md">
          <CardHeader className="text-center pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>
            <CardTitle className="text-3xl text-white">
              Payment <span className="text-green-400">Successful!</span>
            </CardTitle>
            <p className="text-white/70 mt-2">
              Thank you for your payment. Your transaction has been processed successfully.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {sessionId && (
              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <p className="text-white/60 text-xs mb-1">Session ID:</p>
                <p className="text-white text-xs font-mono">{sessionId}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Link to={createPageUrl("Dashboard")} className="flex-1">
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                  <Home className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
              </Link>
              <Link to={createPageUrl("Invoices")} className="flex-1">
                <Button className="w-full bg-gradient-to-r from-green-600 to-green-500">
                  <Receipt className="w-4 h-4 mr-2" />
                  View Invoices
                </Button>
              </Link>
            </div>

            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-green-400 text-sm text-center">
                ✅ A receipt has been sent to your email
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}