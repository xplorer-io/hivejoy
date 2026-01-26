'use client';

import { useAuth } from '@clerk/nextjs';
import { useAuthStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import type { UserRole } from '@/types';
import { User, Store, Shield, ChevronDown } from 'lucide-react';

const roleConfig: Record<UserRole, { label: string; icon: typeof User; color: string }> = {
  consumer: { label: 'Consumer', icon: User, color: 'bg-blue-500' },
  producer: { label: 'Producer', icon: Store, color: 'bg-amber-500' },
  admin: { label: 'Admin', icon: Shield, color: 'bg-purple-500' },
};

export function DevRoleSwitcher() {
  const { user, devSetRole, isAuthenticated } = useAuthStore();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    // AuthProvider will update the store when Clerk signs out
  };

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const currentRole = user?.role || 'consumer';
  const config = roleConfig[currentRole];
  const Icon = config.icon;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 shadow-lg border-2">
            <Badge className={`${config.color} text-white`}>DEV</Badge>
            <Icon className="h-4 w-4" />
            <span>{config.label}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {(Object.keys(roleConfig) as UserRole[]).map((role) => {
            const { label, icon: RoleIcon, color } = roleConfig[role];
            return (
              <DropdownMenuItem
                key={role}
                onClick={() => devSetRole(role)}
                className="gap-2 cursor-pointer"
              >
                <div className={`w-2 h-2 rounded-full ${color}`} />
                <RoleIcon className="h-4 w-4" />
                <span>{label}</span>
                {role === currentRole && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    Active
                  </Badge>
                )}
              </DropdownMenuItem>
            );
          })}
          {isAuthenticated && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                Sign Out
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

