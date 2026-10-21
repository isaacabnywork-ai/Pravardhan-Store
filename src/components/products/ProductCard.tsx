'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, Plus, Minus, AlertTriangle, Clock, Package } from 'lucide-react';
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
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 hover:border-emerald-500/80 hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] transition-all duration-200 flex flex-col justify-between overflow-hidden group shadow-[0_2px_8px_rgba(0,0,0,0.03)] h-full">
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
          aria-label={`View details for ${product.name}`}
          className="w-full h-full flex items-center justify-center p-1 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded-xl"
        >
          {!imageError && imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-300 drop-shadow-2xs"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100/80 rounded-xl p-2 text-center text-slate-400 group-hover:bg-slate-200/60 transition-colors">
              <Package className="w-8 h-8 text-emerald-600/70 mb-1" />
              <span className="text-[10px] font-bold text-slate-600 line-clamp-1">{product.brand}</span>
              <span className="text-[9px] text-slate-400 font-medium">{selectedVariant.title}</span>
            </div>
          )}
        </Link>
      </div>

      {/* Product Details Section */}
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Rating (No artificial truncation, real review counts) */}
          <div className="flex items-center justify-between text-[10px] mb-1 gap-1">
            <span
              className="text-slate-400 font-bold uppercase tracking-wider truncate flex-1 min-w-0"
              title={product.brand}
            >
              {product.brand}
            </span>
            {product.reviewCount > 0 ? (
              <div className="flex items-center gap-0.5 text-amber-900 font-extrabold text-[9px] bg-amber-50 px-1 py-0.5 rounded border border-amber-200/60 flex-shrink-0">
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
                <span>{product.rating}</span>
              </div>
            ) : (
              <span className="text-[8px] font-black tracking-wider uppercase text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1 py-0.5 rounded flex-shrink-0">
                NEW
              </span>
            )}
          </div>

          {/* Product Name with guaranteed 2-line reserved height */}
          <Link
            href={`/product/${product.slug}`}
            title={product.name}
            className="block font-bold text-slate-900 hover:text-emerald-700 text-xs line-clamp-2 leading-snug mb-1.5 transition-colors h-8 sm:h-9"
          >
            {product.name}
          </Link>

          {/* Variant Selector Row with uniform vertical spacing */}
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
                      className={`text-[9px] sm:text-[10px] px-2 py-1 rounded-md font-bold border transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
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
              <p className="text-[10px] text-slate-400 font-medium">
                {selectedVariant.unit}
              </p>
            )}
          </div>
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

            {/* Zero Layout Shift ADD Button & Stepper (Fixed Width 74-82px) */}
            <div className="w-[74px] sm:w-[82px] h-8 flex-shrink-0 flex items-center justify-end">
              {isOutOfStock ? (
                <span className="w-full text-center text-[9px] font-bold text-slate-400 bg-slate-100 py-1.5 rounded-xl border border-slate-200">
                  Out
                </span>
              ) : quantityInCart > 0 ? (
                <div className="w-full h-full flex items-center justify-between bg-emerald-700 text-white rounded-xl shadow-xs overflow-hidden border border-emerald-700">
                  <button
                    type="button"
                    aria-label={`Decrease quantity of ${product.name} ${selectedVariant.title}`}
                    onClick={() => updateQuantity(selectedVariant.id, quantityInCart - 1)}
                    className="w-7 h-full flex items-center justify-center hover:bg-emerald-800 active:bg-emerald-900 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none transition-colors"
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
                    className="w-7 h-full flex items-center justify-center hover:bg-emerald-800 active:bg-emerald-900 disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  aria-label={`Add ${product.name} ${selectedVariant.title} to cart`}
                  onClick={() => addToCart(product, selectedVariant, 1)}
                  className="w-full h-full bg-emerald-50 hover:bg-emerald-700 text-emerald-800 hover:text-white border border-emerald-600 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all shadow-2xs active:scale-95 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
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
