import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, Receipt } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

export default function PaymentCancel() {
  const [invoiceId, setInvoiceId] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setInvoiceId(urlParams.get('invoice_id'));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#06162a] to-[#0b213d] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-[#0a1929]/80 backdrop-blur border-red-500/30 max-w-md">
          <CardHeader className="text-center pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <XCircle className="w-12 h-12 text-white" />
            </motion.div>
            <CardTitle className="text-3xl text-white">
              Payment <span className="text-red-400">Cancelled</span>
            </CardTitle>
            <p className="text-white/70 mt-2">
              Your payment was cancelled. No charges were made to your account.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {invoiceId && (
              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <p className="text-white/60 text-xs mb-1">Invoice ID:</p>
                <p className="text-white text-xs font-mono">{invoiceId}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Link to={createPageUrl("Invoices")} className="flex-1">
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Invoices
                </Button>
              </Link>
              {invoiceId && (
                <Button 
                  onClick={() => window.location.href = createPageUrl("Invoices") + `?retry=${invoiceId}`}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500"
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              )}
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-blue-400 text-sm text-center">
                💬 Need help? Contact our support team
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}