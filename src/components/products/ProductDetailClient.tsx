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
  ChevronRight,
  ShieldCheck,
  Star,
  CheckCircle2,
  Zap,
  ShoppingBag
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
          text: `Check out ${product.name} on Pravdhan Store`,
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

  const handleBuyNow = () => {
    if (!isOutOfStock) {
      if (quantity === 0) {
        addToCart(product, selectedVariant);
      }
      router.push('/cart');
    }
  };

  return (
    <div className="w-full pb-20 sm:pb-12 bg-white">
      {/* Top Mobile Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3.5 py-2 sm:hidden flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-800 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        <span className="text-xs font-bold text-slate-900 line-clamp-1 max-w-[200px]">
          {product.name}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleWishlist(product)}
            className="p-1.5 rounded-xl text-slate-600 hover:text-rose-500 transition-colors"
            aria-label="Wishlist"
          >
            <Heart
              className={`w-5 h-5 ${
                isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-600'
              }`}
            />
          </button>
          <button
            onClick={handleShare}
            className="p-1.5 rounded-xl text-slate-600 hover:text-emerald-600 transition-colors"
            aria-label="Share"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-4 sm:py-8">
        {/* Desktop Breadcrumb */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 mb-5">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/categories/${product.categoryId.replace('cat-', '')}`} className="hover:text-emerald-600 transition-colors">
            {product.categoryName}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 font-bold truncate max-w-sm">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Image Gallery (6 cols) */}
          <div className="lg:col-span-6 space-y-3">
            {/* Main Stage Image */}
            <div className="relative w-full aspect-square rounded-3xl bg-slate-50 border border-slate-200/90 overflow-hidden shadow-xs">
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
                <span className="absolute top-4 left-4 bg-emerald-600 text-white text-xs font-black px-2.5 py-1 rounded-full tracking-tight shadow-md">
                  {selectedVariant.discount}% OFF
                </span>
              )}

              {/* Desktop Wishlist & Share buttons */}
              <div className="hidden sm:flex absolute top-4 right-4 flex-col gap-2">
                <button
                  onClick={() => toggleWishlist(product)}
                  className="p-2.5 rounded-full bg-white/90 backdrop-blur-xs text-slate-400 hover:text-rose-500 shadow-sm transition-all hover:scale-105"
                  title="Add to Wishlist"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                    }`}
                  />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-full bg-white/90 backdrop-blur-xs text-slate-400 hover:text-emerald-600 shadow-sm transition-all hover:scale-105"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* Stock indicator badge */}
              {isLowStock && (
                <span className="absolute bottom-4 left-4 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
                  Only {stock} left in stock
                </span>
              )}
            </div>

            {/* Thumbnail row if multiple images */}
            {images.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImageIndex(i)}
                    className={`relative w-16 h-16 rounded-2xl overflow-hidden border transition-all ${
                      i === selectedImageIndex
                        ? 'border-emerald-600 ring-2 ring-emerald-500/20 scale-105'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {copiedLink && (
              <div className="p-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl text-center border border-emerald-200">
                Product link copied to clipboard!
              </div>
            )}
          </div>

          {/* Right Column: Product Info & Purchase Controls (6 cols) */}
          <div className="lg:col-span-6 space-y-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-black text-emerald-700 uppercase tracking-wider mb-1.5">
                <span className="bg-emerald-50 px-2 py-0.5 rounded-md">{product.brand}</span>
                <span>•</span>
                <span className="text-slate-500">{product.categoryName}</span>
              </div>

              <h1 className="text-xl sm:text-3xl font-black text-slate-900 leading-snug tracking-tight">
                {product.name}
              </h1>
              {product.hindiName && (
                <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
                  ({product.hindiName})
                </p>
              )}

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2.5">
                <div className="flex items-center gap-1 bg-amber-400 text-slate-950 text-xs font-black px-2 py-0.5 rounded-lg shadow-xs">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{product.rating}</span>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {product.reviewCount} customer ratings • Verified Buyer Choice
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-100/80">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl font-black text-slate-900">
                  ₹{selectedVariant.price}
                </span>
                {selectedVariant.mrp > selectedVariant.price && (
                  <span className="text-sm text-slate-400 line-through font-semibold">
                    MRP ₹{selectedVariant.mrp}
                  </span>
                )}
                {selectedVariant.discount > 0 && (
                  <span className="text-xs font-black text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Save ₹{selectedVariant.mrp - selectedVariant.price} ({selectedVariant.discount}% OFF)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                (Inclusive of all taxes) • Same-day mandi freshness guarantee
              </p>
            </div>

            {/* Pack Size / Variant Selector */}
            {product.variants.length > 1 && (
              <div>
                <span className="text-xs font-black text-slate-900 block mb-2 uppercase tracking-wider">
                  Select Pack Size:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {product.variants.map((v) => {
                    const isSelected = v.id === selectedVariant.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-900">{v.name}</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-xs font-black text-slate-900">₹{v.price}</span>
                          {v.mrp > v.price && (
                            <span className="text-[10px] text-slate-400 line-through">₹{v.mrp}</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Desktop Add to Cart & Buy Now Dual CTAs */}
            <div className="hidden sm:flex flex-col gap-2.5 pt-1">
              <div className="flex items-center gap-3">
                {isOutOfStock ? (
                  <button
                    disabled
                    className="w-full py-3.5 bg-slate-200 text-slate-500 font-bold rounded-2xl cursor-not-allowed text-xs uppercase tracking-wider"
                  >
                    Currently Out of Stock
                  </button>
                ) : quantity === 0 ? (
                  <>
                    <button
                      onClick={handleAdd}
                      className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl transition-all shadow-md shadow-emerald-600/20 active:scale-98 flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>Add to Cart • ₹{selectedVariant.price}</span>
                    </button>
                    <button
                      onClick={handleBuyNow}
                      className="flex-1 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm rounded-2xl transition-all shadow-md shadow-amber-400/20 active:scale-98 flex items-center justify-center gap-2"
                    >
                      <Zap className="w-4 h-4 fill-slate-950 stroke-none" />
                      <span>Buy Now</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 flex items-center justify-between p-1.5 bg-emerald-600 text-white rounded-2xl shadow-sm">
                      <button
                        onClick={() => updateQuantity(selectedVariant.id, quantity - 1)}
                        className="p-2 hover:bg-emerald-700 rounded-xl transition-colors active:scale-90"
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
                        className="p-2 hover:bg-emerald-700 disabled:opacity-40 rounded-xl transition-colors active:scale-90"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" />
                      </button>
                    </div>
                    <button
                      onClick={handleBuyNow}
                      className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm rounded-2xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-1.5"
                    >
                      <Zap className="w-4 h-4 fill-slate-950 stroke-none" />
                      <span>Checkout</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Delivery & Trust Highlights */}
            <div className="border-t border-b border-slate-200/90 py-4 grid grid-cols-2 gap-4 text-xs text-slate-900">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold block text-slate-900">Scheduled Delivery</span>
                  <span className="text-[11px] text-slate-500">Today 4-6 PM or Tomorrow Morning</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold block text-slate-900">100% Quality Assurance</span>
                  <span className="text-[11px] text-slate-500">Doorstep return if not satisfied</span>
                </div>
              </div>
            </div>

            {/* Description & Specifications */}
            <div className="space-y-4 pt-1 text-xs">
              <div>
                <h3 className="font-black text-slate-900 mb-1.5 text-sm">Product Description</h3>
                <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
                  {product.description}
                </p>
              </div>

              {/* Key Details Grid */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/90 space-y-2.5">
                <h4 className="font-black text-slate-900 uppercase tracking-wider text-xs">
                  Specifications & Details
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Brand</span>
                    <span className="font-bold text-slate-900">{product.brand}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Origin</span>
                    <span className="font-bold text-slate-900">
                      {product.details?.countryOfOrigin || 'India'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Shelf Life</span>
                    <span className="font-bold text-slate-900">
                      {product.details?.shelfLife || 'Check packaging for best before'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Storage</span>
                    <span className="font-bold text-slate-900">
                      {product.details?.storageInstructions || 'Store in cool, dry place'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 pt-8 border-t border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base sm:text-xl font-black text-slate-900">
                  Similar & Related Products
                </h2>
                <p className="text-xs text-slate-500">Customers also bought these items together</p>
              </div>
              <Link
                href={`/categories/${product.categoryId.replace('cat-', '')}`}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>View More</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-4">
              {relatedProducts.slice(0, 6).map((rp) => (
                <div key={rp.id}>
                  <Link href={`/products/${rp.slug}`} className="block group">
                    <div className="relative aspect-square rounded-2xl bg-slate-50 overflow-hidden border border-slate-200/90 mb-2 group-hover:border-emerald-400 transition-all">
                      <Image
                        src={rp.image}
                        alt={rp.name}
                        fill
                        sizes="180px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">{rp.weight}</span>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                      {rp.name}
                    </h4>
                    <span className="text-xs font-black text-slate-900 block mt-0.5">₹{rp.price}</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Mobile Add To Cart / Buy Now Bottom Bar */}
      <div className="sm:hidden fixed bottom-12 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-bold text-slate-500">
              {selectedVariant.weight}
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-slate-900">
                ₹{selectedVariant.price}
              </span>
              {selectedVariant.mrp > selectedVariant.price && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{selectedVariant.mrp}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isOutOfStock ? (
              <span className="block text-center py-2 px-4 bg-slate-100 text-slate-500 font-bold text-xs rounded-xl">
                Out of Stock
              </span>
            ) : quantity === 0 ? (
              <>
                <button
                  onClick={handleAdd}
                  className="py-2.5 px-4 bg-emerald-600 text-white font-black text-xs rounded-xl active:scale-95 shadow-xs"
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="py-2.5 px-4 bg-amber-400 text-slate-950 font-black text-xs rounded-xl active:scale-95 shadow-xs"
                >
                  Buy Now
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center bg-emerald-600 text-white rounded-xl p-1 shadow-xs">
                  <button
                    onClick={() => updateQuantity(selectedVariant.id, quantity - 1)}
                    className="p-1.5 hover:bg-emerald-700"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                  <span className="text-xs font-black px-2.5">{quantity}</span>
                  <button
                    onClick={() => {
                      if (quantity < stock) {
                        updateQuantity(selectedVariant.id, quantity + 1);
                      }
                    }}
                    disabled={quantity >= stock}
                    className="p-1.5 hover:bg-emerald-700 disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </div>
                <button
                  onClick={handleBuyNow}
                  className="py-2 px-3 bg-amber-400 text-slate-950 font-black text-xs rounded-xl active:scale-95"
                >
                  Checkout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
