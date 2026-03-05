import React from 'react';
import { Shield, Lock, Eye, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

export default function SecurityBanner({ variant = 'info', message, details }) {
  const variants = {
    info: {
      bg: 'bg-blue-500/10 border-blue-500/30',
      icon: Shield,
      iconColor: 'text-blue-400',
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    },
    warning: {
      bg: 'bg-amber-500/10 border-amber-500/30',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    },
    success: {
      bg: 'bg-green-500/10 border-green-500/30',
      icon: Lock,
      iconColor: 'text-green-400',
      badgeColor: 'bg-green-500/20 text-green-400 border-green-500/30'
    },
    monitoring: {
      bg: 'bg-purple-500/10 border-purple-500/30',
      icon: Eye,
      iconColor: 'text-purple-400',
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    }
  };

  const config = variants[variant] || variants.info;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border ${config.bg}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <p className={`${config.iconColor} font-semibold text-sm mb-1`}>{message}</p>
          {details && (
            <p className="text-white/70 text-xs">{details}</p>
          )}
        </div>
        <Badge className={config.badgeColor}>
          {variant === 'success' ? 'Secure' : 
           variant === 'warning' ? 'Alert' :
           variant === 'monitoring' ? 'Monitored' : 'Protected'}
        </Badge>
      </div>
    </motion.div>
  );
}