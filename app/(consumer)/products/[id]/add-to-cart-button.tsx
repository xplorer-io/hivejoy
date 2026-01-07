'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Product, ProductVariant } from '@/types';
import { ShoppingCart, Plus, Minus, Check } from 'lucide-react';

interface AddToCartButtonProps {
  product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem(product, selectedVariant, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleVariantChange = (variantId: string) => {
    const variant = product.variants.find((v) => v.id === variantId);
    if (variant) {
      setSelectedVariant(variant);
      setQuantity(1);
    }
  };

  const incrementQuantity = () => {
    if (quantity < selectedVariant.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const isOutOfStock = selectedVariant.stock === 0;
  const isLowStock = selectedVariant.stock > 0 && selectedVariant.stock <= 5;

  return (
    <div className="space-y-4">
      {/* Size Selector */}
      <div className="space-y-2">
        <Label>Size</Label>
        <Select value={selectedVariant.id} onValueChange={handleVariantChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {product.variants.map((variant) => (
              <SelectItem key={variant.id} value={variant.id}>
                <span className="flex items-center justify-between gap-4 w-full">
                  <span>{variant.size}</span>
                  <span className="font-medium">${variant.price.toFixed(2)}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Display */}
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-primary">
          ${selectedVariant.price.toFixed(2)}
        </span>
        {isLowStock && (
          <span className="text-sm text-orange-600 dark:text-orange-400">
            Only {selectedVariant.stock} left
          </span>
        )}
      </div>

      {/* Quantity Selector */}
      <div className="space-y-2">
        <Label>Quantity</Label>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={decrementQuantity}
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={incrementQuantity}
            disabled={quantity >= selectedVariant.stock}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Add to Cart Button */}
      <Button
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        className="w-full gap-2"
        size="lg"
      >
        {added ? (
          <>
            <Check className="h-5 w-5" />
            Added to Cart
          </>
        ) : isOutOfStock ? (
          'Out of Stock'
        ) : (
          <>
            <ShoppingCart className="h-5 w-5" />
            Add to Cart - ${(selectedVariant.price * quantity).toFixed(2)}
          </>
        )}
      </Button>
    </div>
  );
}

