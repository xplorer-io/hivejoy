'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { useAuthStore } from '@/lib/stores';

interface PostHogProviderProps {
  children: ReactNode;
}

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

export function PostHogProvider({ children }: PostHogProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || hasInitialized.current || !posthogKey) {
      return;
    }

    posthog.init(posthogKey, {
      api_host: posthogHost,
      capture_pageview: false,
    });
    hasInitialized.current = true;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !hasInitialized.current) {
      return;
    }

    if (user) {
      posthog.identify(user.id, {
        role: user.role,
        status: user.status,
      });
    } else {
      posthog.reset();
    }
  }, [user]);

  useEffect(() => {
    if (typeof window === 'undefined' || !hasInitialized.current) {
      return;
    }

    const search = searchParams?.toString();
    const url = search
      ? `${window.location.origin}${pathname}?${search}`
      : `${window.location.origin}${pathname}`;

    posthog.capture('$pageview', { $current_url: url });
  }, [pathname, searchParams]);

  return <>{children}</>;
}
