'use client';

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';

export default function SSOCallback() {
  // Handle the redirect flow for OAuth providers
  return <AuthenticateWithRedirectCallback />;
}
