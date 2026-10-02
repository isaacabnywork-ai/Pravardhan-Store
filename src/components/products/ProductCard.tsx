'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Plus, Minus } from 'lucide-react';
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
    <div className="group relative bg-white border border-slate-200/90 hover:border-emerald-400 rounded-2xl p-2.5 sm:p-3.5 flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:shadow-emerald-950/5">
      {/* Top Image + Badges */}
      <div className="relative w-full aspect-square rounded-xl bg-slate-50/80 overflow-hidden mb-2">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 48vw, (max-width: 1024px) 25vw, 18vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>

        {/* Wishlist Heart */}
        <button
          onClick={handleWishlist}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 backdrop-blur-xs text-slate-400 hover:text-rose-500 transition-all z-10 shadow-xs hover:scale-110 active:scale-90"
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${
              isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
            }`}
          />
        </button>

        {/* Discount Badge */}
        {variant?.discount > 0 && (
          <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full tracking-tight shadow-xs">
            {variant.discount}% OFF
          </span>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/85 backdrop-blur-xs flex items-center justify-center p-2">
            <span className="text-[10px] sm:text-[11px] font-black text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="flex-1 flex flex-col">
        {/* Weight & Low Stock */}
        <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
          <span className="text-slate-500 bg-slate-100/90 px-1.5 py-0.5 rounded text-[10px]">
            {variant?.weight || product.weight}
          </span>
          {isLowStock && (
            <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
              Only {stock} left
            </span>
          )}
        </div>

        {/* Product Name */}
        <Link
          href={`/products/${product.slug}`}
          className="font-bold text-xs sm:text-sm text-slate-900 leading-snug line-clamp-2 hover:text-emerald-700 transition-colors mb-2"
          title={product.name}
        >
          {product.name}
        </Link>
      </div>

      {/* Bottom Row: Price & Add Button */}
      <div className="pt-2 mt-auto flex items-center justify-between gap-1.5 border-t border-slate-100">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm sm:text-base font-black text-slate-900">
              ₹{variant?.price || product.price}
            </span>
            {variant?.mrp && variant.mrp > variant.price && (
              <span className="text-[10px] sm:text-[11px] text-slate-400 line-through">
                ₹{variant.mrp}
              </span>
            )}
          </div>
        </div>

        {/* Add Button with Smooth Transition */}
        <div>
          {isOutOfStock ? (
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
              Sold Out
            </span>
          ) : quantity === 0 ? (
            <button
              onClick={handleAdd}
              className="px-3 sm:px-3.5 py-1 sm:py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-600 font-black text-xs rounded-xl transition-all shadow-xs active:scale-95 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>ADD</span>
            </button>
          ) : (
            <div className="flex items-center bg-emerald-600 text-white rounded-xl overflow-hidden shadow-xs ring-1 ring-emerald-700">
              <button
                onClick={handleDecrement}
                className="p-1 sm:p-1.5 hover:bg-emerald-700 transition-colors active:scale-90"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5 stroke-[3]" />
              </button>
              <span className="px-1.5 text-xs font-black min-w-[20px] text-center">
                {quantity}
              </span>
              <button
                onClick={handleIncrement}
                disabled={quantity >= stock}
                className="p-1 sm:p-1.5 hover:bg-emerald-700 disabled:opacity-40 transition-colors active:scale-90"
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
