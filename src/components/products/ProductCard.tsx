'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Plus, Minus, Clock } from 'lucide-react';
import { Product, ProductVariant } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

interface ProductCardProps {
  product: Product;
  selectedVariant?: ProductVariant;
}

export function ProductCard({ product, selectedVariant }: ProductCardProps) {
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const variant = selectedVariant || product.variants[0];
  const quantity = variant ? getItemQuantity(variant.id) : 0;
  const isWishlisted = isInWishlist(product.id);
  const stock = variant ? variant.stock : 0;
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= (variant?.lowStockThreshold || 5);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart(product, variant);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (variant && quantity < stock) {
      updateQuantity(variant.id, quantity + 1);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (variant) {
      updateQuantity(variant.id, quantity - 1);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="group relative bg-white border border-[#E2E8F0] rounded-xl p-2.5 sm:p-3 flex flex-col justify-between hover:border-blue-300 transition-all duration-150">
      {/* Top Image + Badges */}
      <div className="relative w-full aspect-square rounded-lg bg-[#F8FAFC] overflow-hidden mb-2">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 48vw, (max-width: 1024px) 25vw, 18vw"
            className="object-cover group-hover:scale-102 transition-transform duration-200"
            loading="lazy"
          />
        </Link>

        {/* Wishlist Heart */}
        <button
          onClick={handleWishlist}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-white/90 text-[#64748B] hover:text-[#DC2626] transition-colors z-10 shadow-xs"
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${
              isWishlisted ? 'fill-[#DC2626] text-[#DC2626]' : 'text-[#64748B]'
            }`}
          />
        </button>

        {/* Discount Badge */}
        {variant?.discount > 0 && (
          <span className="absolute top-1.5 left-1.5 bg-[#2563EB] text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded tracking-tight">
            {variant.discount}% OFF
          </span>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <span className="text-[11px] font-bold text-[#64748B] bg-slate-100 px-2 py-0.5 rounded">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="flex-1 flex flex-col">
        {/* Weight & Low Stock */}
        <div className="flex items-center justify-between text-[11px] text-[#64748B] font-medium mb-1">
          <span>{variant?.weight || product.weight}</span>
          {isLowStock && (
            <span className="text-[10px] font-bold text-[#F59E0B]">
              {stock} left
            </span>
          )}
        </div>

        {/* Product Name */}
        <Link
          href={`/products/${product.slug}`}
          className="font-bold text-xs sm:text-sm text-[#0F172A] leading-snug line-clamp-2 hover:text-[#2563EB] transition-colors mb-2"
          title={product.name}
        >
          {product.name}
        </Link>
      </div>

      {/* Bottom Row: Price & Add Button */}
      <div className="pt-2 mt-auto flex items-center justify-between gap-1 border-t border-[#E2E8F0]">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm sm:text-base font-black text-[#0F172A]">
              ₹{variant?.price || product.price}
            </span>
            {variant?.mrp && variant.mrp > variant.price && (
              <span className="text-[11px] text-[#64748B] line-through">
                ₹{variant.mrp}
              </span>
            )}
          </div>
        </div>

        {/* Add Button with Inline Transition */}
        <div>
          {isOutOfStock ? (
            <span className="text-[10px] font-bold text-[#64748B] bg-slate-100 px-2.5 py-1 rounded-lg">
              Sold Out
            </span>
          ) : quantity === 0 ? (
            <button
              onClick={handleAdd}
              className="px-3.5 py-1 bg-white hover:bg-blue-50 text-[#2563EB] border border-[#2563EB] font-black text-xs rounded-lg transition-all active:scale-95"
            >
              ADD
            </button>
          ) : (
            <div className="flex items-center bg-[#2563EB] text-white rounded-lg overflow-hidden shadow-xs">
              <button
                onClick={handleDecrement}
                className="p-1 hover:bg-[#1D4ED8] transition-colors active:scale-90"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5 stroke-[3]" />
              </button>
              <span className="px-1.5 text-xs font-black min-w-[18px] text-center">
                {quantity}
              </span>
              <button
                onClick={handleIncrement}
                disabled={quantity >= stock}
                className="p-1 hover:bg-[#1D4ED8] disabled:opacity-40 transition-colors active:scale-90"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
