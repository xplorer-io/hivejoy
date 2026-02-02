'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product, ProductVariant } from '@/types';

interface CartState {
  items: CartItem[];

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

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, variant, quantity = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            item => item.variantId === variant.id
          );

          if (existingIndex >= 0) {
            // Update quantity of existing item
            const newItems = [...state.items];
            newItems[existingIndex] = {
              ...newItems[existingIndex],
              quantity: Math.min(
                newItems[existingIndex].quantity + quantity,
                variant.stock
              ),
            };
            return { items: newItems };
          }

          // Add new item
          return {
            items: [
              ...state.items,
              {
                variantId: variant.id,
                productId: product.id,
                quantity: Math.min(quantity, variant.stock),
                product,
                variant,
              },
            ],
          };
        });
      },

      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter(item => item.variantId !== variantId),
        }));
      },

      updateQuantity: (variantId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter(item => item.variantId !== variantId),
            };
          }

          return {
            items: state.items.map(item =>
              item.variantId === variantId
                ? { ...item, quantity: Math.min(quantity, item.variant.stock) }
                : item
            ),
          };
        });
      },

      clearCart: () => set({ items: [] }),

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.variant.price * item.quantity,
          0
        );
      },

      getCartBySeller: () => {
        const items = get().items;
        const bySeller = new Map<string, CartItem[]>();

        items.forEach(item => {
          const sellerId = item.product.producerId;
          if (!bySeller.has(sellerId)) {
            bySeller.set(sellerId, []);
          }
          bySeller.get(sellerId)!.push(item);
        });

        return bySeller;
      },
    }),
    {
      name: 'hive-joy-cart',
    }
  )
);

