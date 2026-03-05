
import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Users, Circle } from 'lucide-react';
import { getPollingInterval } from './utils/pollingConfig';

export default function GlobalPresence() {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await api.auth.me();
        setUser(currentUser);
        
        const subs = await api.entities.BillingSubscription.list();
        setSubscription(subs.length > 0 ? subs[0] : { plan: 'free' });
      } catch (error) {
        console.error('Error loading presence data:', error);
      }
    };
    loadData();
  }, []);

  const plan = subscription?.plan || 'free';
  const presenceInterval = getPollingInterval('presence', plan);
  const isPresenceAvailable = presenceInterval !== false;

  const { data: onlineUsers = [] } = useQuery({
    queryKey: ['user-presence'],
    queryFn: async () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const all = await api.entities.UserPresence.list('-last_active_at', 50);
      return all.filter(p => 
        p.status === 'online' && 
        p.last_active_at > fiveMinutesAgo
      );
    },
    enabled: !!user && isPresenceAvailable,
    refetchInterval: presenceInterval
  });

  if (!isPresenceAvailable) {
    return null; // Don't render if not available
  }

  return (
    <div className="mt-2 flex items-center justify-center gap-2">
      <Circle className="w-2 h-2 text-green-400 fill-green-400 animate-pulse" />
      <span className="text-white/60 text-xs">{onlineUsers.length} online</span>
    </div>
  );
}
