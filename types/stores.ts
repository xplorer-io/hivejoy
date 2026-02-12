// =============================================
// Store Types
// =============================================
// Types for Zustand store state management

import type { CartItem } from './cart';
import type { Product, ProductVariant } from './product';
import type { User, UserRole } from './user';
import type { ProducerProfile } from './producer';

export interface CartState {
  items: CartItem[];
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;

  // Actions
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;

  // Computed
  getItemCount: () => number;
  getSubtotal: () => number;
  getCartBySeller: () => Map<string, CartItem[]>;
}

export interface AuthState {
  user: User | null;
  producerProfile: ProducerProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setProducerProfile: (profile: ProducerProfile | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
  
  // Dev helpers
  devSetRole: (role: UserRole) => void;
}
