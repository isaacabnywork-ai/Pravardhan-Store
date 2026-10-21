'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Clock, Plus, Minus, X, Package, Check } from 'lucide-react';
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
  const [isFavorite, setIsFavorite] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);

  const cartItem = items.find((i) => i.variantId === selectedVariant.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const discount = calculateDiscountPercentage(
    selectedVariant.mrp,
    selectedVariant.price
  );

  const isOutOfStock = selectedVariant.stock <= 0;
  const imageUrl = selectedVariant.image || product.images[0];

  const hasMultipleOptions = product.variants.length > 1;

  return (
    <>
      <div className="bg-white rounded-2xl p-2 sm:p-2.5 flex flex-col justify-between h-full group relative transition-all duration-200 hover:shadow-xs border border-gray-100/90">
        <div>
          {/* ================= 1. PRODUCT IMAGE AREA ================= */}
          <div className="relative w-full aspect-square bg-[#F8F9FA] rounded-2xl overflow-hidden flex items-center justify-center">
            {/* Top-Right: Wishlist Heart Button */}
            <button
              type="button"
              aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsFavorite(!isFavorite);
              }}
              className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/75 hover:bg-white backdrop-blur-xs flex items-center justify-center text-gray-700 hover:text-red-500 shadow-2xs transition-all active:scale-110 focus-visible:outline-none"
            >
              <Heart
                className={`w-3.5 h-3.5 transition-colors ${
                  isFavorite
                    ? 'text-red-500 fill-red-500'
                    : 'text-gray-700 hover:text-red-500'
                }`}
                strokeWidth={2}
              />
            </button>

            {/* Bottom-Left: Multiple Images Gallery Dots */}
            <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1 bg-black/35 backdrop-blur-xs px-1.5 py-0.5 rounded-full pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              <span className="w-1 h-1 rounded-full bg-white/60"></span>
              <span className="w-1 h-1 rounded-full bg-white/60"></span>
              <span className="w-1 h-1 rounded-full bg-white/60"></span>
            </div>

            {/* Bottom-Right: Indian Green Vegetarian Food Mark */}
            <div className="absolute bottom-2 right-2 z-10 pointer-events-none">
              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-[1.5px] border-emerald-600 bg-white/95 backdrop-blur-xs rounded-[3px] flex items-center justify-center p-[2px] shadow-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600"></div>
              </div>
            </div>

            {/* Product Image Link (Full Cover) */}
            <Link
              href={`/product/${product.slug}`}
              aria-label={`View details for ${product.name}`}
              className="w-full h-full block overflow-hidden focus-visible:ring-2 focus-visible:ring-[#0F5132] focus-visible:outline-none"
            >
              {!imageError && imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product.name}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100/80 p-2 text-center text-gray-400">
                  <Package className="w-8 h-8 text-[#0F5132]/60 mb-1" />
                  <span className="text-[10px] font-bold text-gray-600 line-clamp-1">{product.brand}</span>
                  <span className="text-[9px] text-gray-400 font-medium">{selectedVariant.title}</span>
                </div>
              )}
            </Link>
          </div>

          {/* ================= 2. WEIGHT & ADD BUTTON ROW ================= */}
          <div className="flex items-center justify-between gap-1.5 mt-2 min-h-[34px]">
            {/* Left: Product Weight / Unit */}
            <span
              className="text-xs font-semibold text-gray-700 truncate max-w-[50%]"
              title={selectedVariant.unit || selectedVariant.title}
            >
              {selectedVariant.unit || selectedVariant.title}
            </span>

            {/* Right: Blinkit/Zepto-style ADD Button / Stepper */}
            <div className="w-[74px] sm:w-[84px] h-8 sm:h-8.5 flex-shrink-0 flex items-center justify-end">
              {isOutOfStock ? (
                <span className="w-full text-center text-[10px] font-bold text-gray-400 bg-gray-100 py-1.5 rounded-lg border border-gray-200">
                  Out
                </span>
              ) : quantityInCart > 0 ? (
                /* Active Stepper (solid green) */
                <div className="w-full h-full flex items-center justify-between bg-[#0F5132] text-white rounded-lg shadow-xs overflow-hidden border border-[#0F5132]">
                  <button
                    type="button"
                    aria-label={`Decrease quantity of ${product.name}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      updateQuantity(selectedVariant.id, quantityInCart - 1);
                    }}
                    className="w-7 h-full flex items-center justify-center hover:bg-[#054A29] active:bg-[#03301B] transition-colors"
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
                    aria-label={`Increase quantity of ${product.name}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      updateQuantity(selectedVariant.id, quantityInCart + 1);
                    }}
                    disabled={quantityInCart >= selectedVariant.stock}
                    className="w-7 h-full flex items-center justify-center hover:bg-[#054A29] active:bg-[#03301B] disabled:opacity-40 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              ) : hasMultipleOptions ? (
                /* Multiple Options ADD Button with '2 options' footer tag */
                <button
                  type="button"
                  aria-label={`Select options for ${product.name}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowVariantModal(true);
                  }}
                  className="w-full h-full flex flex-col items-center justify-center bg-white hover:bg-emerald-50/40 border-[1.5px] border-[#0F5132] rounded-lg overflow-hidden transition-all shadow-2xs active:scale-95"
                >
                  <span className="text-[11px] sm:text-xs font-bold text-[#0F5132] uppercase tracking-wide leading-tight pt-0.5">
                    ADD
                  </span>
                  <span className="w-full text-[8px] sm:text-[9px] font-semibold text-[#0F5132] bg-emerald-50/90 py-0.5 border-t border-emerald-200/80 text-center leading-none">
                    {product.variants.length} options
                  </span>
                </button>
              ) : (
                /* Single Variant ADD Button */
                <button
                  type="button"
                  aria-label={`Add ${product.name} to cart`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addToCart(product, selectedVariant, 1);
                  }}
                  className="w-full h-full bg-white hover:bg-[#0F5132] text-[#0F5132] hover:text-white border-[1.5px] border-[#0F5132] rounded-lg text-xs font-extrabold uppercase tracking-wide transition-all shadow-2xs active:scale-95 flex items-center justify-center"
                >
                  ADD
                </button>
              )}
            </div>
          </div>

          {/* ================= 3. PRICE & DISCOUNT ROW ================= */}
          <div className="mt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-sm sm:text-base font-extrabold text-gray-900 tracking-tight">
                {formatPrice(selectedVariant.price)}
              </span>
              {selectedVariant.mrp > selectedVariant.price && (
                <span className="text-[11px] sm:text-xs text-gray-400 line-through font-normal">
                  {formatPrice(selectedVariant.mrp)}
                </span>
              )}
            </div>
            {discount > 0 ? (
              <p className="text-[10px] sm:text-[11px] font-bold text-blue-600 leading-tight mt-0.5">
                {discount}% OFF on MRP
              </p>
            ) : (
              <div className="h-3.5" />
            )}
          </div>

          {/* ================= 4. PRODUCT TITLE ================= */}
          <Link
            href={`/product/${product.slug}`}
            title={product.name}
            className="block font-semibold text-gray-900 hover:text-[#0F5132] text-xs sm:text-sm line-clamp-2 leading-snug transition-colors mt-1 min-h-[2.25rem] sm:min-h-[2.5rem]"
          >
            {product.name}
          </Link>
        </div>

        {/* ================= 5. EXPRESS DELIVERY BADGE ================= */}
        <div className="flex items-center gap-1 text-[11px] font-medium text-gray-500 mt-1.5 pt-1">
          <Clock className="w-3 h-3 text-gray-400 stroke-[2]" />
          <span>12 mins</span>
        </div>
      </div>

      {/* ================= VARIANT SELECTOR MODAL (WHEN 'X OPTIONS' CLICKED) ================= */}
      {showVariantModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setShowVariantModal(false)}
        >
          <div
            className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl border border-gray-100 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900">
                  Select Unit / Pack
                </h3>
                <p className="text-xs text-gray-500 line-clamp-1">{product.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowVariantModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Variant Options List */}
            <div className="divide-y divide-gray-100 mt-2">
              {product.variants.map((v) => {
                const isSelected = v.id === selectedVariant.id;
                const vDiscount = calculateDiscountPercentage(v.mrp, v.price);
                const vCartItem = items.find((i) => i.variantId === v.id);
                const vQty = vCartItem ? vCartItem.quantity : 0;

                return (
                  <div
                    key={v.id}
                    className={`py-3 flex items-center justify-between gap-3 ${
                      isSelected ? 'bg-emerald-50/30 -mx-2 px-2 rounded-xl' : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-gray-900">
                          {v.title}
                        </span>
                        {v.unit && v.unit !== v.title && (
                          <span className="text-[11px] text-gray-500">
                            ({v.unit})
                          </span>
                        )}
                        {isSelected && (
                          <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                            Selected
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-xs sm:text-sm font-extrabold text-gray-900">
                          {formatPrice(v.price)}
                        </span>
                        {v.mrp > v.price && (
                          <span className="text-[10px] text-gray-400 line-through">
                            {formatPrice(v.mrp)}
                          </span>
                        )}
                        {vDiscount > 0 && (
                          <span className="text-[10px] font-bold text-blue-600">
                            {vDiscount}% OFF
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Variant Stepper or ADD */}
                    <div className="w-[84px] h-8 flex-shrink-0 flex items-center justify-end">
                      {v.stock <= 0 ? (
                        <span className="text-[10px] font-bold text-gray-400">
                          Out of stock
                        </span>
                      ) : vQty > 0 ? (
                        <div className="w-full h-full flex items-center justify-between bg-[#0F5132] text-white rounded-lg shadow-xs overflow-hidden">
                          <button
                            type="button"
                            onClick={() => updateQuantity(v.id, vQty - 1)}
                            className="w-7 h-full flex items-center justify-center hover:bg-[#054A29]"
                          >
                            <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                          <span className="text-xs font-black">{vQty}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(v.id, vQty + 1)}
                            disabled={vQty >= v.stock}
                            className="w-7 h-full flex items-center justify-center hover:bg-[#054A29] disabled:opacity-40"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedVariant(v);
                            addToCart(product, v, 1);
                          }}
                          className="w-full h-full bg-white hover:bg-[#0F5132] text-[#0F5132] hover:text-white border-[1.5px] border-[#0F5132] rounded-lg text-xs font-extrabold uppercase tracking-wide transition-all shadow-2xs flex items-center justify-center"
                        >
                          ADD
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
