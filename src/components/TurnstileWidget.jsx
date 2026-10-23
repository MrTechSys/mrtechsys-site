import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

// Cloudflare Turnstile for the public forms that send email (checked on the server: shared/turnstile.ts).
// Production hostnames use the site's widget; preview and local builds use Cloudflare's always-pass test key,
// which the server pairs with the test secret there. Tokens are single-use: the parent calls reset() after a submit.
const SITE_KEY = '0x4AAAAAAFjCeYVf5QMufrhl';
const TEST_SITE_KEY = '1x00000000000000000000AA';
const PRODUCTION_HOSTS = ['mrtechsys.com', 'www.mrtechsys.com', 'mrtechsys-site.pages.dev'];
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let scriptPromise;
function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = SCRIPT_SRC;
      s.async = true;
      s.defer = true;
      s.onload = () => resolve(window.turnstile);
      s.onerror = () => { scriptPromise = undefined; reject(new Error('Turnstile failed to load')); };
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
}

const TurnstileWidget = forwardRef(function TurnstileWidget({ onToken, className = '' }, ref) {
  const container = useRef(null);
  const widgetId = useRef(null);
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;

  useImperativeHandle(ref, () => ({
    reset() {
      onTokenRef.current?.(null);
      if (window.turnstile && widgetId.current !== null) window.turnstile.reset(widgetId.current);
    },
  }));

  useEffect(() => {
    let cancelled = false;
    const sitekey = PRODUCTION_HOSTS.includes(window.location.hostname) ? SITE_KEY : TEST_SITE_KEY;
    loadTurnstile().then((turnstile) => {
      if (cancelled || !container.current || widgetId.current !== null) return;
      widgetId.current = turnstile.render(container.current, {
        sitekey,
        theme: 'dark',
        callback: (token) => onTokenRef.current?.(token),
        'expired-callback': () => onTokenRef.current?.(null),
        'error-callback': () => onTokenRef.current?.(null),
      });
    }).catch(() => onTokenRef.current?.(null));
    return () => {
      cancelled = true;
      if (window.turnstile && widgetId.current !== null) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, []);

  return <div ref={container} className={className} />;
});

export default TurnstileWidget;
