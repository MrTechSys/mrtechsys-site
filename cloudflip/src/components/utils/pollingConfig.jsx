export const POLLING_INTERVALS = {
  realtime: {
    free: false,
    demo: false,
    starter: 30 * 60 * 1000,
    pro: 15 * 60 * 1000,
    partner: 5 * 60 * 1000,
    elite: 5 * 1000
  },
  
  operational: {
    free: 60 * 60 * 1000,
    demo: 60 * 60 * 1000,
    starter: 30 * 60 * 1000,
    pro: 15 * 60 * 1000,
    partner: 5 * 60 * 1000,
    elite: 30 * 1000
  },
  
  aggregates: {
    free: 6 * 60 * 60 * 1000,
    demo: 6 * 60 * 60 * 1000,
    starter: 6 * 60 * 60 * 1000,
    pro: 60 * 60 * 1000,
    partner: 30 * 60 * 1000,
    elite: 15 * 60 * 1000
  },
  
  presence: {
    free: false,
    demo: false,
    starter: false,
    pro: false,
    partner: 10 * 1000,
    elite: 5 * 1000
  }
};

export function getPollingInterval(category, plan = 'free') {
  const interval = POLLING_INTERVALS[category]?.[plan];
  if (interval === false) return false;
  if (interval === undefined) return POLLING_INTERVALS[category]?.free || false;
  return interval;
}

export function isFeatureAvailable(category, plan = 'free') {
  return getPollingInterval(category, plan) !== false;
}

export function getIntervalDescription(milliseconds) {
  if (milliseconds === false) return 'Disabled';
  if (milliseconds < 60000) return `${milliseconds / 1000}s`;
  if (milliseconds < 3600000) return `${milliseconds / 60000}min`;
  return `${milliseconds / 3600000}hr`;
}

export const USAGE_QUOTAS = {
  'live_metric.batch_ingest': {
    free: 0,
    demo: 0,
    starter: 10000,
    pro: 50000,
    partner: 200000,
    elite: -1
  },
  'realtime_presence.sync': {
    free: 0,
    demo: 0,
    starter: 0,
    pro: 0,
    partner: 50000,
    elite: -1
  }
};

export function getQuota(eventType, plan = 'free') {
  return USAGE_QUOTAS[eventType]?.[plan] || 0;
}