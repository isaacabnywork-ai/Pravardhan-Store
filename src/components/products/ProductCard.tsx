'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, Plus, Minus, AlertTriangle, Clock } from 'lucide-react';
import { Product, ProductVariant } from '@/types';
import { formatPrice, calculateDiscountPercentage } from '@/lib/utils';
import { useCart } from '@/lib/context/CartContext';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export function ProductCard({ product }: ProductCardProps) {
  const { items, addToCart, updateQuantity } = useCart();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants[0]
  );

  const cartItem = items.find((i) => i.variantId === selectedVariant.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const discount = calculateDiscountPercentage(
    selectedVariant.mrp,
    selectedVariant.price
  );

  const isLowStock = selectedVariant.stock > 0 && selectedVariant.stock <= 5;
  const isOutOfStock = selectedVariant.stock <= 0;

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 hover:border-emerald-500/80 hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] transition-all duration-200 flex flex-col justify-between overflow-hidden group shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
      {/* Product Image Section */}
      <div className="relative p-2 sm:p-3 bg-gradient-to-b from-slate-50/90 to-slate-100/50 flex items-center justify-center aspect-square overflow-hidden">
        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-xs tracking-wider z-10">
            {discount}% OFF
          </span>
        )}

        {/* Delivery Time Tag (Blinkit/Zepto quick-commerce style) */}
        <span className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-md border border-slate-200/90 text-slate-900 text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-2xs z-10 flex items-center gap-1">
          <Clock className="w-2.5 h-2.5 text-emerald-600 stroke-[2.5]" />
          <span>12 MINS</span>
        </span>

        {/* Organic Badge */}
        {product.isOrganic && (
          <span className="absolute top-2 right-2 bg-amber-100 border border-amber-200 text-amber-950 text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded z-10">
            🌱 Organic
          </span>
        )}

        <Link
          href={`/product/${product.slug}`}
          className="w-full h-full flex items-center justify-center p-1"
        >
          <img
            src={selectedVariant.image || product.images[0]}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-300 drop-shadow-2xs"
            loading="lazy"
          />
        </Link>
      </div>

      {/* Product Details Section */}
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Rating */}
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-slate-400 font-bold uppercase tracking-wider truncate max-w-[85px]">
              {product.brand}
            </span>
            <div className="flex items-center gap-0.5 text-amber-900 font-extrabold text-[9px] bg-amber-50 px-1 py-0.2 rounded border border-amber-200/60">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
              <span>{product.rating}</span>
            </div>
          </div>

          {/* Product Name */}
          <Link
            href={`/product/${product.slug}`}
            className="block font-bold text-slate-900 hover:text-emerald-700 text-xs line-clamp-2 leading-snug mb-1.5 transition-colors"
          >
            {product.name}
          </Link>

          {/* Variant Selector Pill toggle */}
          {product.variants.length > 1 ? (
            <div className="flex flex-wrap gap-1 mb-2">
              {product.variants.map((v) => {
                const isSelected = v.id === selectedVariant.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md font-bold border transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {v.title}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-[10px] text-slate-400 font-medium mb-2">
              {selectedVariant.unit}
            </p>
          )}
        </div>

        {/* Pricing & Zero-Layout-Shift ADD / Stepper Button */}
        <div className="pt-2 border-t border-slate-100">
          {isLowStock && (
            <p className="text-[9px] font-bold text-amber-700 mb-1 flex items-center gap-0.5">
              <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
              Only {selectedVariant.stock} left
            </p>
          )}

          <div className="flex items-center justify-between gap-1">
            {/* Price section */}
            <div className="min-w-0">
              <div className="flex items-baseline gap-1">
                <span className="text-xs sm:text-sm font-black text-slate-900">
                  {formatPrice(selectedVariant.price)}
                </span>
                {selectedVariant.mrp > selectedVariant.price && (
                  <span className="text-[9px] sm:text-[10px] text-slate-400 line-through">
                    {formatPrice(selectedVariant.mrp)}
                  </span>
                )}
              </div>
            </div>

            {/* Zero Layout Shift ADD Button & Stepper (Fixed Width 76px) */}
            <div className="w-[72px] sm:w-[78px] h-7 sm:h-8 flex-shrink-0 flex items-center justify-end">
              {isOutOfStock ? (
                <span className="w-full text-center text-[9px] font-bold text-slate-400 bg-slate-100 py-1.5 rounded-xl border border-slate-200">
                  Out
                </span>
              ) : quantityInCart > 0 ? (
                <div className="w-full h-full flex items-center justify-between bg-emerald-700 text-white rounded-xl shadow-xs overflow-hidden border border-emerald-700">
                  <button
                    type="button"
                    onClick={() => updateQuantity(selectedVariant.id, quantityInCart - 1)}
                    className="w-6 h-full flex items-center justify-center hover:bg-emerald-800 active:bg-emerald-900 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                  <span className="text-xs font-black select-none">
                    {quantityInCart}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(selectedVariant.id, quantityInCart + 1)}
                    disabled={quantityInCart >= selectedVariant.stock}
                    className="w-6 h-full flex items-center justify-center hover:bg-emerald-800 active:bg-emerald-900 disabled:opacity-40 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => addToCart(product, selectedVariant, 1)}
                  className="w-full h-full bg-emerald-50 hover:bg-emerald-700 text-emerald-800 hover:text-white border border-emerald-600 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all shadow-2xs active:scale-95 flex items-center justify-center"
                >
                  ADD
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
