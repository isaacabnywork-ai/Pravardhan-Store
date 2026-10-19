'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, Plus, Minus, Check, AlertTriangle } from 'lucide-react';
import { Product, ProductVariant } from '@/types';
import { formatPrice, calculateDiscountPercentage } from '@/lib/utils';
import { useCart } from '@/lib/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { items, addToCart, updateQuantity } = useCart();

  // Selected variant state
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants[0]
  );

  // Check if this particular variant is currently in the cart
  const cartItem = items.find((i) => i.variantId === selectedVariant.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const discount = calculateDiscountPercentage(
    selectedVariant.mrp,
    selectedVariant.price
  );

  const isLowStock = selectedVariant.stock > 0 && selectedVariant.stock <= 5;
  const isOutOfStock = selectedVariant.stock <= 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-300 hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      {/* Top Image & Badges */}
      <div className="relative p-3.5 bg-slate-50/50 flex items-center justify-center min-h-[180px]">
        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute top-2.5 left-2.5 bg-emerald-700 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs tracking-wider z-10">
            {discount}% OFF
          </span>
        )}

        {/* Organic / Bestseller Badge */}
        {product.isOrganic && (
          <span className="absolute top-2.5 right-2.5 bg-amber-100 border border-amber-300 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded z-10">
            🌱 Organic
          </span>
        )}

        <Link
          href={`/product/${product.slug}`}
          className="w-full flex items-center justify-center overflow-hidden"
        >
          <img
            src={selectedVariant.image || product.images[0]}
            alt={product.name}
            className="w-36 h-36 object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>
      </div>

      {/* Product Details */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Rating */}
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-slate-400 font-bold uppercase tracking-wider">
              {product.brand}
            </span>
            <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded text-amber-800 font-bold text-[10px]">
              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
              <span>{product.rating}</span>
              <span className="text-slate-400 font-normal">({product.reviewCount})</span>
            </div>
          </div>

          {/* Product Name */}
          <Link
            href={`/product/${product.slug}`}
            className="block font-bold text-slate-800 hover:text-emerald-700 text-sm line-clamp-2 leading-snug mb-2 transition-colors"
          >
            {product.name}
          </Link>

          {/* Variant Selector Pills (Section 4 of Spec: Variants supported) */}
          {product.variants.length > 1 && (
            <div className="mb-2.5">
              <span className="text-[10px] text-slate-500 font-semibold block mb-1">
                Select Pack:
              </span>
              <div className="flex flex-wrap gap-1">
                {product.variants.map((v) => {
                  const isSelected = v.id === selectedVariant.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`text-[11px] px-2 py-0.5 rounded-md font-semibold border transition-all ${
                        isSelected
                          ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {v.title}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Single variant unit hint if only 1 variant */}
          {product.variants.length === 1 && (
            <p className="text-[11px] text-slate-500 font-medium mb-2">
              Pack: {selectedVariant.unit}
            </p>
          )}
        </div>

        {/* Pricing, Stock status, and Add-to-cart */}
        <div className="pt-2 border-t border-slate-100">
          {/* Stock warnings */}
          {isLowStock && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-700 mb-1">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              <span>Only {selectedVariant.stock} left in stock!</span>
            </div>
          )}
          {isOutOfStock && (
            <p className="text-[10px] font-bold text-rose-600 mb-1">
              Currently Out of Stock
            </p>
          )}

          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-black text-slate-900">
                  {formatPrice(selectedVariant.price)}
                </span>
                {selectedVariant.mrp > selectedVariant.price && (
                  <span className="text-xs text-slate-400 line-through">
                    {formatPrice(selectedVariant.mrp)}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold">
                Save {formatPrice(selectedVariant.mrp - selectedVariant.price)}
              </span>
            </div>

            {/* Add or Stepper */}
            {isOutOfStock ? (
              <button
                disabled
                className="px-3 py-1.5 bg-slate-100 text-slate-400 text-xs font-bold rounded-xl cursor-not-allowed"
              >
                Sold Out
              </button>
            ) : quantityInCart > 0 ? (
              <div className="flex items-center border border-emerald-600 rounded-xl overflow-hidden bg-white shadow-xs">
                <button
                  type="button"
                  onClick={() => updateQuantity(selectedVariant.id, quantityInCart - 1)}
                  className="w-7 h-7 flex items-center justify-center text-emerald-800 hover:bg-emerald-50 active:bg-emerald-100"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-7 text-center text-xs font-black text-emerald-950">
                  {quantityInCart}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(selectedVariant.id, quantityInCart + 1)}
                  disabled={quantityInCart >= selectedVariant.stock}
                  className="w-7 h-7 flex items-center justify-center text-emerald-800 hover:bg-emerald-50 active:bg-emerald-100 disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => addToCart(product, selectedVariant, 1)}
                className="px-4 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-600 hover:border-emerald-600 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-xs active:scale-95"
              >
                ADD
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
