import React, { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, Info } from "lucide-react";
import { motion } from "framer-motion";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

export default function ContextualTooltip({ 
  content, 
  title,
  icon = "help",
  position = "top",
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false);

  const Icon = icon === "info" ? Info : HelpCircle;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors ${className}`}
            type="button"
          >
            <Icon className="w-3 h-3" />
          </motion.button>
        </TooltipTrigger>
        <TooltipPrimitive.Portal>
          <TooltipContent 
            side={position}
            sideOffset={5}
            align="center"
            alignOffset={0}
            collisionPadding={20}
            className="bg-[#0a1929] border-amber-500/30 max-w-xs z-[100]"
          >
            {title && (
              <div className="font-semibold text-amber-400 mb-1 text-sm">
                {title}
              </div>
            )}
            <p className="text-white/80 text-xs leading-relaxed">
              {content}
            </p>
          </TooltipContent>
        </TooltipPrimitive.Portal>
      </Tooltip>
    </TooltipProvider>
  );
}