'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, Plus, Minus, AlertTriangle, Zap, Tag, Package } from 'lucide-react';
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
  const [imageError, setImageError] = useState(false);

  const cartItem = items.find((i) => i.variantId === selectedVariant.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const discount = calculateDiscountPercentage(
    selectedVariant.mrp,
    selectedVariant.price
  );

  const isLowStock = selectedVariant.stock > 0 && selectedVariant.stock <= 5;
  const isOutOfStock = selectedVariant.stock <= 0;

  const imageUrl = selectedVariant.image || product.images[0];

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-md hover:border-gray-300 transition-all duration-200 flex flex-col justify-between overflow-hidden group h-full">
      {/* 1:1 Aspect Ratio Image Container */}
      <div className="relative p-3 bg-gray-50/70 flex items-center justify-center aspect-square overflow-hidden">
        {/* Top-Left: Warm Orange Discount Badge */}
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-[#D97706] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs tracking-wide z-10 flex items-center gap-1">
            <Tag className="w-2.5 h-2.5 stroke-[2.5]" />
            <span>{discount}% OFF</span>
          </span>
        )}

        {/* Top-Right: Fast Delivery Badge in Semi-Transparent Floating Pill */}
        <span className="absolute top-2 right-2 bg-white/90 backdrop-blur-md border border-gray-200/80 text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs z-10 flex items-center gap-0.5">
          <Zap className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
          <span>12 MINS</span>
        </span>

        {/* Product Image Link */}
        <Link
          href={`/product/${product.slug}`}
          aria-label={`View details for ${product.name}`}
          className="w-full h-full flex items-center justify-center p-1 focus-visible:ring-2 focus-visible:ring-[#0F5132] focus-visible:outline-none rounded-xl"
        >
          {!imageError && imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-2xs"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100/80 rounded-xl p-2 text-center text-gray-400 group-hover:bg-gray-200/60 transition-colors">
              <Package className="w-8 h-8 text-[#0F5132]/70 mb-1" />
              <span className="text-[10px] font-bold text-gray-600 line-clamp-1">{product.brand}</span>
              <span className="text-[9px] text-gray-400 font-medium">{selectedVariant.title}</span>
            </div>
          )}
        </Link>
      </div>

      {/* Product Content Details */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand Name & Compact Star Rating */}
          <div className="flex items-center justify-between text-xs mb-1 gap-1">
            <span
              className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase truncate flex-1 min-w-0"
              title={product.brand}
            >
              {product.brand}
            </span>
            {product.reviewCount > 0 ? (
              <div className="flex items-center gap-0.5 text-amber-900 font-bold text-[10px] bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200/60 flex-shrink-0">
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
                <span>{product.rating}</span>
              </div>
            ) : (
              <span className="text-[9px] font-extrabold tracking-wider uppercase text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded flex-shrink-0">
                NEW
              </span>
            )}
          </div>

          {/* Product Title (2-Line Reserved Height) */}
          <Link
            href={`/product/${product.slug}`}
            title={product.name}
            className="block font-semibold text-gray-900 hover:text-[#0F5132] text-xs sm:text-sm line-clamp-2 leading-snug mb-2 transition-colors h-8 sm:h-9"
          >
            {product.name}
          </Link>

          {/* Variant Selector Row */}
          <div className="min-h-[28px] flex items-center mb-2">
            {product.variants.length > 1 ? (
              <div className="flex flex-wrap gap-1">
                {product.variants.map((v) => {
                  const isSelected = v.id === selectedVariant.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      aria-label={`Select ${v.title} variant of ${product.name}`}
                      onClick={() => {
                        setSelectedVariant(v);
                        setImageError(false);
                      }}
                      className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border transition-all focus-visible:ring-2 focus-visible:ring-[#0F5132] focus-visible:outline-none ${
                        isSelected
                          ? 'bg-gray-900 text-white border-gray-900 shadow-2xs'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {v.title}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-[11px] text-gray-500 font-medium">
                {selectedVariant.unit}
              </p>
            )}
          </div>
        </div>

        {/* Pricing & High-Converting ADD / Stepper Button */}
        <div className="pt-2 border-t border-gray-100">
          {isLowStock && (
            <p className="text-[10px] font-bold text-amber-700 mb-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              Only {selectedVariant.stock} left
            </p>
          )}

          <div className="flex items-center justify-between gap-1">
            {/* Price section */}
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs sm:text-sm font-bold text-gray-900">
                  {formatPrice(selectedVariant.price)}
                </span>
                {selectedVariant.mrp > selectedVariant.price && (
                  <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                    {formatPrice(selectedVariant.mrp)}
                  </span>
                )}
              </div>
            </div>

            {/* Zero Layout Shift ADD Button & Stepper (Fixed Width 74-82px) */}
            <div className="w-[74px] sm:w-[82px] h-8 flex-shrink-0 flex items-center justify-end">
              {isOutOfStock ? (
                <span className="w-full text-center text-[10px] font-bold text-gray-400 bg-gray-100 py-1.5 rounded-xl border border-gray-200">
                  Out
                </span>
              ) : quantityInCart > 0 ? (
                /* Interactive Quantity Stepper with Deep Emerald Green */
                <div className="w-full h-full flex items-center justify-between bg-[#0F5132] text-white rounded-xl shadow-xs overflow-hidden border border-[#0F5132]">
                  <button
                    type="button"
                    aria-label={`Decrease quantity of ${product.name} ${selectedVariant.title}`}
                    onClick={() => updateQuantity(selectedVariant.id, quantityInCart - 1)}
                    className="w-7 h-full flex items-center justify-center hover:bg-[#054A29] active:bg-[#03301B] focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                  <span
                    className="text-xs font-black select-none"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {quantityInCart}
                  </span>
                  <button
                    type="button"
                    aria-label={`Increase quantity of ${product.name} ${selectedVariant.title}`}
                    onClick={() => updateQuantity(selectedVariant.id, quantityInCart + 1)}
                    disabled={quantityInCart >= selectedVariant.stock}
                    className="w-7 h-full flex items-center justify-center hover:bg-[#054A29] active:bg-[#03301B] disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              ) : (
                /* Clean High-Converting ADD Button with Deep Emerald Outline / Hover Fill */
                <button
                  type="button"
                  aria-label={`Add ${product.name} ${selectedVariant.title} to cart`}
                  onClick={() => addToCart(product, selectedVariant, 1)}
                  className="w-full h-full bg-white hover:bg-[#0F5132] text-[#0F5132] hover:text-white border-2 border-[#0F5132] rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-2xs active:scale-95 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#0F5132] focus-visible:outline-none"
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
