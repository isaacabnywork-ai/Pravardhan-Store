'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Heart,
  Share2,
  Plus,
  Minus,
  Truck,
  RotateCcw,
  ChevronRight
} from 'lucide-react';
import { Product, ProductVariant } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const router = useRouter();
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants[0]
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  const isWishlisted = isInWishlist(product.id);
  const quantity = selectedVariant ? getItemQuantity(selectedVariant.id) : 0;
  const stock = selectedVariant?.stock || 0;
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= (selectedVariant?.lowStockThreshold || 5);

  const images = product.images.length > 0 ? product.images : [product.image];

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on Pravardhan Store`,
          url: window.location.href,
        });
      } catch {
        // Fallback
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleAdd = () => {
    if (!isOutOfStock) {
      addToCart(product, selectedVariant);
    }
  };

  return (
    <div className="w-full pb-20 sm:pb-10 bg-white">
      {/* Top Mobile Bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-[#E2E8F0] px-3.5 py-2 sm:hidden flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="p-1 rounded-lg hover:bg-slate-100 text-[#0F172A]"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <span className="text-xs font-bold text-[#0F172A] line-clamp-1 max-w-[200px]">
          {product.name}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleWishlist(product)}
            className="p-1.5 rounded-lg text-[#64748B]"
            aria-label="Wishlist"
          >
            <Heart
              className={`w-5 h-5 ${
                isWishlisted ? 'fill-[#DC2626] text-[#DC2626]' : 'text-[#64748B]'
              }`}
            />
          </button>
          <button
            onClick={handleShare}
            className="p-1.5 rounded-lg text-[#64748B]"
            aria-label="Share"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-3 sm:py-6">
        {/* Desktop Breadcrumb */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#64748B] mb-4">
          <Link href="/" className="hover:text-[#2563EB]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/categories/${product.categoryId.replace('cat-', '')}`} className="hover:text-[#2563EB]">
            {product.categoryName}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#0F172A] font-semibold">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Image Gallery (6 cols) */}
          <div className="lg:col-span-6 space-y-2.5">
            {/* Main Stage Image */}
            <div className="relative w-full aspect-square rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] overflow-hidden">
              <Image
                src={images[selectedImageIndex] || product.image}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 550px"
                className="object-cover"
              />

              {/* Discount Tag */}
              {selectedVariant.discount > 0 && (
                <span className="absolute top-3 left-3 bg-[#2563EB] text-white text-xs font-black px-2 py-0.5 rounded tracking-tight">
                  {selectedVariant.discount}% OFF
                </span>
              )}

              {/* Desktop Wishlist & Share buttons */}
              <div className="hidden sm:flex absolute top-3 right-3 flex-col gap-1.5">
                <button
                  onClick={() => toggleWishlist(product)}
                  className="p-2 rounded-full bg-white/90 text-[#64748B] hover:text-[#DC2626] shadow-xs transition-all"
                  title="Add to Wishlist"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isWishlisted ? 'fill-[#DC2626] text-[#DC2626]' : 'text-[#64748B]'
                    }`}
                  />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 rounded-full bg-white/90 text-[#64748B] hover:text-[#2563EB] shadow-xs transition-all"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* Stock indicator badge */}
              {isLowStock && (
                <span className="absolute bottom-3 left-3 bg-[#F59E0B] text-white text-[11px] font-bold px-2 py-0.5 rounded">
                  Only {stock} left in stock
                </span>
              )}
            </div>

            {/* Thumbnail row if multiple images */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImageIndex(i)}
                    className={`relative w-14 h-14 rounded-lg overflow-hidden border transition-all ${
                      i === selectedImageIndex
                        ? 'border-[#2563EB] ring-1 ring-[#2563EB]'
                        : 'border-[#E2E8F0] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {copiedLink && (
              <div className="p-2 bg-blue-50 text-[#2563EB] text-xs font-semibold rounded-lg text-center">
                Product link copied to clipboard!
              </div>
            )}
          </div>

          {/* Right Column: Product Info & Purchase Controls (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
                <span>{product.brand}</span>
                <span>•</span>
                <span className="text-[#64748B]">{product.categoryName}</span>
              </div>

              <h1 className="text-lg sm:text-2xl font-black text-[#0F172A] leading-snug">
                {product.name}
              </h1>
              {product.hindiName && (
                <p className="text-xs font-medium text-[#64748B] mt-0.5">
                  ({product.hindiName})
                </p>
              )}

              {/* Rating */}
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex items-center gap-1 bg-[#2563EB] text-white text-[11px] font-bold px-1.5 py-0.5 rounded">
                  <span>★</span>
                  <span>{product.rating}</span>
                </div>
                <span className="text-xs text-[#64748B]">
                  {product.reviewCount} customer reviews
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <div className="flex items-baseline gap-2.5">
                <span className="text-2xl font-black text-[#0F172A]">
                  ₹{selectedVariant.price}
                </span>
                {selectedVariant.mrp > selectedVariant.price && (
                  <span className="text-sm text-[#64748B] line-through">
                    MRP ₹{selectedVariant.mrp}
                  </span>
                )}
                {selectedVariant.discount > 0 && (
                  <span className="text-xs font-black text-[#16A34A] bg-green-50 px-1.5 py-0.5 rounded">
                    Save ₹{selectedVariant.mrp - selectedVariant.price} ({selectedVariant.discount}% OFF)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                (Inclusive of all taxes)
              </p>
            </div>

            {/* Pack Size / Variant Selector */}
            {product.variants.length > 1 && (
              <div>
                <span className="text-xs font-bold text-[#0F172A] block mb-1.5 uppercase tracking-wider">
                  Select Pack Size:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {product.variants.map((v) => {
                    const isSelected = v.id === selectedVariant.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-[#2563EB] bg-blue-50/40 ring-1 ring-[#2563EB]'
                            : 'border-[#E2E8F0] bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold text-[#0F172A]">{v.name}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-xs font-black text-[#0F172A]">₹{v.price}</span>
                          {v.mrp > v.price && (
                            <span className="text-[10px] text-[#64748B] line-through">₹{v.mrp}</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Desktop Add to Cart Box */}
            <div className="hidden sm:flex items-center gap-3 pt-1">
              {isOutOfStock ? (
                <button
                  disabled
                  className="w-full py-3 bg-slate-200 text-[#64748B] font-bold rounded-xl cursor-not-allowed text-xs"
                >
                  Currently Out of Stock
                </button>
              ) : quantity === 0 ? (
                <button
                  onClick={handleAdd}
                  className="flex-1 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-sm rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  Add to Cart • ₹{selectedVariant.price}
                </button>
              ) : (
                <div className="flex-1 flex items-center justify-between p-1.5 bg-[#2563EB] text-white rounded-xl">
                  <button
                    onClick={() => updateQuantity(selectedVariant.id, quantity - 1)}
                    className="p-1.5 hover:bg-[#1D4ED8] rounded-lg transition-colors active:scale-90"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4 stroke-[3]" />
                  </button>
                  <span className="text-xs font-black px-3">
                    {quantity} in cart (₹{quantity * selectedVariant.price})
                  </span>
                  <button
                    onClick={() => {
                      if (quantity < stock) {
                        updateQuantity(selectedVariant.id, quantity + 1);
                      }
                    }}
                    disabled={quantity >= stock}
                    className="p-1.5 hover:bg-[#1D4ED8] disabled:opacity-40 rounded-lg transition-colors active:scale-90"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              )}
            </div>

            {/* Delivery & Trust Highlights */}
            <div className="border-t border-b border-[#E2E8F0] py-3 grid grid-cols-2 gap-3 text-xs text-[#0F172A]">
              <div className="flex items-start gap-2">
                <Truck className="w-4 h-4 text-[#2563EB] mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold block">Scheduled Delivery</span>
                  <span className="text-[11px] text-[#64748B]">Today 4-6 PM or Tomorrow</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <RotateCcw className="w-4 h-4 text-[#2563EB] mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold block">Doorstep Replacement</span>
                  <span className="text-[11px] text-[#64748B]">Quality guarantee at delivery</span>
                </div>
              </div>
            </div>

            {/* Description & Specifications */}
            <div className="space-y-3 pt-1 text-xs">
              <div>
                <h3 className="font-bold text-[#0F172A] mb-1">Product Description</h3>
                <p className="text-[#64748B] leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Key Details Grid */}
              <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0] space-y-2">
                <h4 className="font-bold text-[#0F172A] uppercase tracking-wider text-[11px]">
                  Specifications
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#64748B] block text-[11px]">Brand</span>
                    <span className="font-bold text-[#0F172A]">{product.brand}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block text-[11px]">Origin</span>
                    <span className="font-bold text-[#0F172A]">
                      {product.details?.countryOfOrigin || 'India'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block text-[11px]">Shelf Life</span>
                    <span className="font-bold text-[#0F172A]">
                      {product.details?.shelfLife || 'Check packaging'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block text-[11px]">Storage</span>
                    <span className="font-bold text-[#0F172A]">
                      {product.details?.storageInstructions || 'Store in dry place'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8 pt-6 border-t border-[#E2E8F0]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm sm:text-base font-black text-[#0F172A]">
                You May Also Like
              </h2>
              <Link
                href={`/categories/${product.categoryId.replace('cat-', '')}`}
                className="text-xs font-bold text-[#2563EB] hover:underline"
              >
                View Category &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
              {relatedProducts.slice(0, 6).map((rp) => (
                <div key={rp.id}>
                  <Link href={`/products/${rp.slug}`} className="block group">
                    <div className="relative aspect-square rounded-lg bg-[#F8FAFC] overflow-hidden border border-[#E2E8F0] mb-1">
                      <Image src={rp.image} alt={rp.name} fill sizes="160px" className="object-cover group-hover:scale-102 transition-transform" />
                    </div>
                    <span className="text-[10px] text-[#64748B] font-medium">{rp.weight}</span>
                    <h4 className="text-xs font-bold text-[#0F172A] line-clamp-1 group-hover:text-[#2563EB]">{rp.name}</h4>
                    <span className="text-xs font-black text-[#0F172A] block mt-0.5">₹{rp.price}</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Mobile Add To Cart Bottom Bar */}
      <div className="sm:hidden fixed bottom-12 left-0 right-0 z-40 bg-white border-t border-[#E2E8F0] px-4 py-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-bold text-[#64748B]">
              {selectedVariant.weight}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-black text-[#0F172A]">
                ₹{selectedVariant.price}
              </span>
              {selectedVariant.mrp > selectedVariant.price && (
                <span className="text-xs text-[#64748B] line-through">
                  ₹{selectedVariant.mrp}
                </span>
              )}
            </div>
          </div>

          <div className="min-w-[130px]">
            {isOutOfStock ? (
              <span className="block text-center py-2 bg-slate-100 text-[#64748B] font-bold text-xs rounded-lg">
                Out of Stock
              </span>
            ) : quantity === 0 ? (
              <button
                onClick={handleAdd}
                className="w-full py-2 bg-[#2563EB] text-white font-black text-xs rounded-lg active:scale-95"
              >
                Add to Cart
              </button>
            ) : (
              <div className="flex items-center justify-between bg-[#2563EB] text-white rounded-lg p-1">
                <button
                  onClick={() => updateQuantity(selectedVariant.id, quantity - 1)}
                  className="p-1 hover:bg-[#1D4ED8]"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5 stroke-[3]" />
                </button>
                <span className="text-xs font-black px-2">{quantity}</span>
                <button
                  onClick={() => {
                    if (quantity < stock) {
                      updateQuantity(selectedVariant.id, quantity + 1);
                    }
                  }}
                  disabled={quantity >= stock}
                  className="p-1 hover:bg-[#1D4ED8] disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
