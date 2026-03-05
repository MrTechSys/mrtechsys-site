import { api } from '@/api/apiClient';

class TelemetryBatcher {
  constructor() {
    this.queue = [];
    this.batchSize = 50;
    this.flushInterval = 30 * 60 * 1000; // 30 minutes
    this.timer = null;
    this.isEnabled = false;
  }

  init(orgId, userId, sessionId) {
    this.orgId = orgId;
    this.userId = userId;
    this.sessionId = sessionId;
    this.isEnabled = true;
    this.startTimer();
  }

  startTimer() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => this.flush(), this.flushInterval);
  }

  track(eventType, eventName, properties = {}) {
    if (!this.isEnabled) return;

    const device = {
      type: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 
            /Tablet|iPad/.test(navigator.userAgent) ? 'tablet' : 'desktop',
      os: navigator.platform,
      browser: navigator.userAgent.split(' ').pop()
    };

    this.queue.push({
      org_id: this.orgId,
      session_id: this.sessionId,
      user_id: this.userId,
      page: window.location.pathname,
      event_type: eventType,
      event_name: eventName,
      properties,
      device,
      timestamp: new Date().toISOString()
    });

    if (this.queue.length >= this.batchSize) {
      this.flush();
    }
  }

  async flush() {
    if (this.queue.length === 0) return;

    const eventsToSend = [...this.queue];
    this.queue = [];

    try {
      await api.functions.invoke('bulkTelemetryIngest', {
        events: eventsToSend
      });
      
      console.log(`✅ Flushed ${eventsToSend.length} telemetry events`);
    } catch (error) {
      console.error('Telemetry batch flush failed:', error);
      this.queue = [...eventsToSend, ...this.queue];
    }
  }

  destroy() {
    this.flush();
    if (this.timer) clearInterval(this.timer);
    this.isEnabled = false;
  }
}

export const telemetryBatcher = new TelemetryBatcher();

export function initTelemetry(orgId, userId) {
  const sessionId = sessionStorage.getItem('cf_session') || `session-${Date.now()}`;
  sessionStorage.setItem('cf_session', sessionId);
  
  telemetryBatcher.init(orgId, userId, sessionId);
  
  telemetryBatcher.track('page_view', 'page_loaded', { 
    module: window.location.pathname.split('/')[1] || 'dashboard' 
  });

  document.addEventListener('click', (e) => {
    const target = e.target.closest('button, a');
    if (target) {
      const label = target.textContent?.trim() || target.getAttribute('aria-label') || 'unknown';
      telemetryBatcher.track('click', 'cta_clicked', { label, href: target.href });
    }
  });

  window.addEventListener('beforeunload', () => {
    telemetryBatcher.destroy();
  });
}