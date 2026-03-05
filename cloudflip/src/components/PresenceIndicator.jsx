import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Eye, Edit } from "lucide-react";
import { motion } from "framer-motion";

export default function PresenceIndicator({ entityType, entityId }) {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const user = await api.auth.me();
      setCurrentUser(user);
      
      // Update own presence
      const sessionId = sessionStorage.getItem('cf_session');
      await api.entities.UserPresence.create({
        user_id: user.id,
        user_name: user.full_name,
        status: 'online',
        current_entity_type: entityType,
        current_entity_id: entityId,
        is_editing: false,
        last_active_at: new Date().toISOString(),
        session_id: sessionId
      });
    };
    loadUser();

    // Heartbeat to keep presence alive
    const interval = setInterval(async () => {
      if (currentUser) {
        const sessionId = sessionStorage.getItem('cf_session');
        const presences = await api.entities.UserPresence.filter({
          user_id: currentUser.id,
          session_id: sessionId
        });
        
        if (presences.length > 0) {
          await api.entities.UserPresence.update(presences[0].id, {
            last_active_at: new Date().toISOString(),
            status: 'online'
          });
        }
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [entityType, entityId, currentUser]);

  const { data: presences = [] } = useQuery({
    queryKey: ['user-presence', entityType, entityId],
    queryFn: async () => {
      if (!currentUser) return [];
      
      // Get presences for this entity within last 5 minutes
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      return api.entities.UserPresence.filter({
        current_entity_type: entityType,
        current_entity_id: entityId,
        last_active_at: { $gte: fiveMinutesAgo },
        user_id: { $ne: currentUser.id }
      });
    },
    refetchInterval: 10000,
    enabled: !!currentUser && !!entityType && !!entityId
  });

  if (!entityType || !entityId || presences.length === 0) return null;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {presences.slice(0, 3).map((presence, idx) => (
          <Tooltip key={presence.id}>
            <TooltipTrigger asChild>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="relative"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium border-2 border-white/20">
                  {presence.user_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <motion.div
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#0a1929]"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                {presence.is_editing && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                    <Edit className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                {presence.user_name} is {presence.is_editing ? 'editing' : 'viewing'}
              </p>
            </TooltipContent>
          </Tooltip>
        ))}
        {presences.length > 3 && (
          <Badge className="bg-white/10 text-white text-xs">
            +{presences.length - 3}
          </Badge>
        )}
      </div>
    </TooltipProvider>
  );
}