'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, Plus, Minus, AlertTriangle } from 'lucide-react';
import { Product, ProductVariant } from '@/types';
import { formatPrice, calculateDiscountPercentage } from '@/lib/utils';
import { useCart } from '@/lib/context/CartContext';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export function ProductCard({ product, compact = false }: ProductCardProps) {
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
    <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      {/* Product Image Section */}
      <div className="relative p-2.5 sm:p-3 bg-slate-50/60 flex items-center justify-center aspect-square">
        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-emerald-700 text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-xs tracking-wider z-10">
            {discount}% OFF
          </span>
        )}

        {/* Organic Badge */}
        {product.isOrganic && (
          <span className="absolute top-2 right-2 bg-amber-100 text-amber-900 text-[8px] sm:text-[9px] font-bold px-1 py-0.5 rounded z-10">
            🌱 Organic
          </span>
        )}

        <Link
          href={`/product/${product.slug}`}
          className="w-full h-full flex items-center justify-center"
        >
          <img
            src={selectedVariant.image || product.images[0]}
            alt={product.name}
            className="w-full h-full object-contain max-h-28 sm:max-h-36 group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
        </Link>
      </div>

      {/* Product Info Section */}
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Rating */}
          <div className="flex items-center justify-between text-[10px] mb-0.5">
            <span className="text-slate-400 font-bold uppercase tracking-wider truncate max-w-[80px]">
              {product.brand}
            </span>
            <div className="flex items-center gap-0.5 text-amber-800 font-bold text-[9px]">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
              <span>{product.rating}</span>
            </div>
          </div>

          {/* Product Name */}
          <Link
            href={`/product/${product.slug}`}
            className="block font-bold text-slate-800 hover:text-emerald-700 text-xs line-clamp-2 leading-snug mb-1.5 transition-colors"
          >
            {product.name}
          </Link>

          {/* Variant Selector: Pill toggle */}
          {product.variants.length > 1 ? (
            <div className="flex flex-wrap gap-1 mb-2">
              {product.variants.map((v) => {
                const isSelected = v.id === selectedVariant.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded font-semibold border transition-all ${
                      isSelected
                        ? 'bg-emerald-800 text-white border-emerald-800'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {v.title}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-[10px] text-slate-400 font-medium mb-1.5">
              {selectedVariant.unit}
            </p>
          )}
        </div>

        {/* Pricing & Add Button */}
        <div className="pt-1.5 border-t border-slate-100">
          {isLowStock && (
            <p className="text-[9px] font-bold text-amber-700 mb-1 flex items-center gap-0.5">
              <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
              Only {selectedVariant.stock} left
            </p>
          )}

          <div className="flex items-center justify-between gap-1">
            <div>
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

            {/* App-like ADD Button / Stepper */}
            {isOutOfStock ? (
              <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                Sold Out
              </span>
            ) : quantityInCart > 0 ? (
              <div className="flex items-center border border-emerald-700 rounded-lg overflow-hidden bg-white shadow-xs">
                <button
                  type="button"
                  onClick={() => updateQuantity(selectedVariant.id, quantityInCart - 1)}
                  className="w-6 h-6 flex items-center justify-center text-emerald-800 hover:bg-emerald-50 active:bg-emerald-100"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-6 text-center text-[11px] font-black text-emerald-950">
                  {quantityInCart}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(selectedVariant.id, quantityInCart + 1)}
                  disabled={quantityInCart >= selectedVariant.stock}
                  className="w-6 h-6 flex items-center justify-center text-emerald-800 hover:bg-emerald-50 active:bg-emerald-100 disabled:opacity-40"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => addToCart(product, selectedVariant, 1)}
                className="px-3 py-1 bg-emerald-50 hover:bg-emerald-700 text-emerald-800 hover:text-white border border-emerald-600 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all shadow-xs active:scale-95"
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
