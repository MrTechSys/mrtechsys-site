import React from "react";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function LoadingScreen({ message = "Loading..." }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <Loader2 className="w-16 h-16 text-amber-400 animate-spin mx-auto mb-4" />
        <p className="text-white text-lg font-medium">{message}</p>
        <p className="text-white/60 text-sm mt-2">Please wait...</p>
      </motion.div>
    </div>
  );
}