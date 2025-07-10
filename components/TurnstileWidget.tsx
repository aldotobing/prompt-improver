'use client';

import { useEffect, useState, useRef } from 'react';
import Script from 'next/script';

// Use a fixed widget ID to prevent hydration mismatch
const WIDGET_ID = 'cf-turnstile-widget';

export default function TurnstileWidget({ 
  theme = 'light',
  onVerify,
  onError,
  onExpire,
  className = ''
}: {
  theme?: 'light' | 'dark';
  onVerify?: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  className?: string;
}) {
  const widgetRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect only runs on the client
    setIsClient(true);
    isMounted.current = true;
    
    // Add global callback function for Turnstile
    const handleTurnstileCallback = (token: string) => {
      if (isMounted.current) {
        onVerify?.(token);
      }
    };

    (window as any).handleTurnstileCallback = handleTurnstileCallback;

    return () => {
      isMounted.current = false;
      // Clean up the global callback
      delete (window as any).handleTurnstileCallback;
    };
  }, [onVerify]);

  // Handle theme changes
  useEffect(() => {
    if (!isClient || !(window as any).turnstile || !widgetRef.current) {
      return;
    }

    // Re-render when theme changes
    (window as any).turnstile.render(widgetRef.current, {
      sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA',
      callback: (token: string) => onVerify?.(token),
      'expired-callback': () => onExpire?.(),
      'error-callback': () => onError?.(),
      theme: theme,
      size: 'normal',
      language: 'en'
    });
  }, [theme, isClient]);

  // Don't render anything on the server
  if (!isClient) {
    return <div className={className} id={WIDGET_ID} style={{ minHeight: '65px' }} />;
  }

  return (
    <div className={className}>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="lazyOnload"
        onLoad={() => {
          // Re-initialize the widget after script loads
          if ((window as any).turnstile && widgetRef.current) {
            (window as any).turnstile.render(widgetRef.current, {
              sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA',
              callback: (token: string) => onVerify?.(token),
              'expired-callback': () => onExpire?.(),
              'error-callback': () => onError?.(),
              theme: theme,
              size: 'normal',
              language: 'en'
            });
          }
        }}
      />
      <div id={WIDGET_ID} ref={widgetRef} style={{ minHeight: '65px' }} />
    </div>
  );
}
