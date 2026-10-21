'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import {
  Heart,
  Search,
  Share2,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Clock,
  RotateCcw,
  Plus,
  Minus,
  CheckCircle2,
  Package,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { ProductCard } from '@/components/products/ProductCard';
import { useStore } from '@/lib/context/StoreContext';
import { useCart } from '@/lib/context/CartContext';
import { ProductVariant } from '@/types';
import { formatPrice, calculateDiscountPercentage } from '@/lib/utils';

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { products, categories, storeSettings } = useStore();
  const {
    items,
    addToCart,
    updateQuantity,
  } = useCart();

  const product = products.find(
    (p) => p.slug === resolvedParams.slug || p.id === resolvedParams.slug
  );

  if (!product) {
    notFound();
  }

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants[0]
  );
  const [selectedImage, setSelectedImage] = useState<string>(
    product.images[0]
  );
  const [mainImageError, setMainImageError] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const cartItem = items.find((i) => i.variantId === selectedVariant.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const discount = calculateDiscountPercentage(
    selectedVariant.mrp,
    selectedVariant.price
  );

  const category = categories.find((c) => c.id === product.categoryId);

  // Prioritize same subcategory first, then category
  const similarProducts = products
    .filter((p) => p.subcategoryId === product.subcategoryId && p.id !== product.id)
    .concat(
      products.filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    )
    .filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i)
    .slice(0, 4);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      if (navigator.share) {
        navigator.share({
          title: product.name,
          text: `Check out ${product.name} on Pravdhan Store`,
          url: window.location.href,
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    }
  };

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/shop');
    }
  };

  // Structured Data
  const productStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.description,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    sku: selectedVariant.sku || product.id,
    offers: {
      '@type': 'Offer',
      url: `https://pravdhanstore.in/product/${product.slug}`,
      priceCurrency: 'INR',
      price: selectedVariant.price,
      priceValidUntil: '2026-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability:
        selectedVariant.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Pravdhan Store',
      },
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] pb-24 text-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productStructuredData),
        }}
      />

      <main className="flex-1 w-full max-w-3xl mx-auto">
        {/* ================= 1. HERO IMAGE CONTAINER STARTING FLUSH FROM TOP ================= */}
        <div className="relative w-full aspect-square sm:aspect-[4/3] bg-white overflow-hidden shadow-xs flex items-center justify-center rounded-b-3xl sm:rounded-3xl sm:mt-4 sm:border sm:border-gray-200/80">
          {/* Top Floating Action Bar */}
          <div className="absolute top-3 sm:top-4 inset-x-3 sm:inset-x-4 z-20 flex items-center justify-between pointer-events-auto">
            {/* Left: Back Button */}
            <button
              type="button"
              onClick={handleGoBack}
              aria-label="Go back"
              className="w-10 h-10 rounded-full bg-white/90 hover:bg-white backdrop-blur-md shadow-xs flex items-center justify-center text-gray-800 transition-all active:scale-95 border border-gray-200/60"
            >
              <ChevronDown className="w-5 h-5 text-gray-700" />
            </button>

            {/* Right Action Icons: Heart, Search, Share */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFavorite(!isFavorite)}
                aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
                className="w-10 h-10 rounded-full bg-white/90 hover:bg-white backdrop-blur-md shadow-xs flex items-center justify-center text-gray-800 transition-all active:scale-95 border border-gray-200/60"
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${
                    isFavorite
                      ? 'text-red-500 fill-red-500'
                      : 'text-gray-700 hover:text-red-500'
                  }`}
                  strokeWidth={2}
                />
              </button>

              <Link
                href="/shop"
                aria-label="Search products"
                className="w-10 h-10 rounded-full bg-white/90 hover:bg-white backdrop-blur-md shadow-xs flex items-center justify-center text-gray-800 transition-all active:scale-95 border border-gray-200/60"
              >
                <Search className="w-4.5 h-4.5 text-gray-700" />
              </Link>

              <button
                type="button"
                onClick={handleShare}
                aria-label="Share product"
                className="w-10 h-10 rounded-full bg-white/90 hover:bg-white backdrop-blur-md shadow-xs flex items-center justify-center text-gray-800 transition-all active:scale-95 border border-gray-200/60 relative"
              >
                {copiedLink ? (
                  <Check className="w-4.5 h-4.5 text-emerald-600" />
                ) : (
                  <Share2 className="w-4.5 h-4.5 text-gray-700" />
                )}
              </button>
            </div>
          </div>

          {/* Product Image */}
          {!mainImageError ? (
            <img
              src={selectedVariant.image || selectedImage}
              alt={product.name}
              onError={() => setMainImageError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-gray-400 bg-gray-50">
              <Package className="w-16 h-16 text-[#0F5132]/60 mb-2" />
              <p className="font-bold text-gray-800 text-sm">{product.name}</p>
              <p className="text-xs text-gray-500">{product.brand}</p>
            </div>
          )}

          {/* Bottom-Center: 7 Dots Carousel Indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-full pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
            <span className="w-1 h-1 rounded-full bg-white/60"></span>
            <span className="w-1 h-1 rounded-full bg-white/60"></span>
            <span className="w-1 h-1 rounded-full bg-white/60"></span>
            <span className="w-1 h-1 rounded-full bg-white/60"></span>
            <span className="w-1 h-1 rounded-full bg-white/60"></span>
            <span className="w-1 h-1 rounded-full bg-white/60"></span>
          </div>

          {/* Bottom-Right: Indian Green Vegetarian Food Mark */}
          <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
            <div className="w-4 h-4 border-[1.5px] border-emerald-600 bg-white/95 backdrop-blur-xs rounded-[3px] flex items-center justify-center p-[2px] shadow-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-600"></div>
            </div>
          </div>
        </div>

        {/* ================= LOWER CONTENT BODY ================= */}
        <div className="px-3 sm:px-4 py-3 sm:py-4 space-y-3 sm:space-y-4">
          {/* ================= 2. KEY ATTRIBUTES ROW (SHELF LIFE / FLAVOUR / VIEW DETAILS) ================= */}
          <div className="grid grid-cols-12 gap-2">
            {/* Card 1: Shelf Life */}
            <div className="col-span-5 bg-white rounded-2xl p-2.5 sm:p-3 border border-gray-200/80 shadow-2xs">
              <span className="text-[10px] sm:text-[11px] text-gray-500 font-medium block">
                Shelf Life
              </span>
              <span className="text-xs sm:text-sm font-bold text-gray-900 block mt-0.5 truncate">
                9 months
              </span>
            </div>

            {/* Card 2: Flavour */}
            <div className="col-span-4 bg-white rounded-2xl p-2.5 sm:p-3 border border-gray-200/80 shadow-2xs">
              <span className="text-[10px] sm:text-[11px] text-gray-500 font-medium block">
                Flavour
              </span>
              <span className="text-xs sm:text-sm font-bold text-gray-900 block mt-0.5 truncate">
                {product.categoryId === 'cat-snacks'
                  ? 'Chocolate'
                  : product.categoryId === 'cat-fruits-veg'
                  ? 'Farm Fresh'
                  : product.categoryId === 'cat-dairy'
                  ? 'Classic Pure'
                  : 'Premium'}
              </span>
            </div>

            {/* Card 3: View details */}
            <button
              type="button"
              onClick={() => {
                document.getElementById('product-specs-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="col-span-3 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/70 rounded-2xl p-2 flex items-center justify-center text-center shadow-2xs transition-colors cursor-pointer group"
            >
              <span className="text-[11px] sm:text-xs font-bold text-[#0F5132] leading-tight group-hover:underline">
                View details
              </span>
            </button>
          </div>

          {/* ================= 3. PRODUCT INFO CARD & VARIANT SELECTOR ================= */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200/80 shadow-xs space-y-3.5">
            {/* Delivery Time & Star Rating Row */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1 font-semibold text-gray-700">
                <Clock className="w-3.5 h-3.5 text-gray-400 stroke-[2.2]" />
                <span>17 mins</span>
              </div>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-1 text-amber-500 text-xs">
                <span className="tracking-tighter">★★★★★</span>
                <span className="text-gray-600 font-bold ml-0.5">
                  {product.reviewCount > 0 ? `${product.rating} (${product.reviewCount})` : '2.2 lac'}
                </span>
              </div>
            </div>

            {/* Product Title */}
            <h1 className="text-base sm:text-lg md:text-xl font-extrabold text-gray-900 leading-snug">
              {product.name}
            </h1>

            {/* Variant Selector: "Select Unit" */}
            <div className="pt-1">
              <h2 className="text-xs sm:text-sm font-bold text-gray-900 mb-2.5">
                Select Unit
              </h2>
              <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                {product.variants.map((v) => {
                  const isSelected = v.id === selectedVariant.id;
                  const vDiscount = calculateDiscountPercentage(v.mrp, v.price);
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        setSelectedVariant(v);
                        setMainImageError(false);
                      }}
                      className={`flex-1 min-w-[125px] sm:min-w-[145px] p-3 rounded-2xl text-left transition-all ${
                        isSelected
                          ? 'border-[1.5px] border-emerald-600 bg-emerald-50/50 shadow-xs'
                          : 'border border-gray-200/90 bg-white hover:border-gray-300'
                      }`}
                    >
                      <span className="block text-xs sm:text-sm font-bold text-gray-900">
                        {v.title}
                      </span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-sm sm:text-base font-extrabold text-gray-900">
                          {formatPrice(v.price)}
                        </span>
                        {v.mrp > v.price && (
                          <span className="text-[11px] text-gray-400 line-through">
                            MRP {formatPrice(v.mrp)}
                          </span>
                        )}
                      </div>
                      {vDiscount > 0 ? (
                        <span className="block text-[10px] sm:text-[11px] font-bold text-blue-600 mt-0.5">
                          {vDiscount}% OFF on MRP
                        </span>
                      ) : (
                        <span className="block text-[10px] text-gray-400 mt-0.5">
                          Standard Pack
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ================= 4. BRAND EXPLORE CARD ================= */}
          <Link
            href={`/shop?brand=${encodeURIComponent(product.brand)}`}
            className="w-full bg-white hover:bg-gray-50/80 border border-gray-200/80 rounded-2xl p-3 flex items-center justify-between transition-all group shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-200/70 overflow-hidden flex items-center justify-center flex-shrink-0 text-[#0F5132] font-black text-xs">
                {product.brand.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                  {product.brand}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Explore all products
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {/* ================= 5. REPLACEMENT GUARANTEE CARD ================= */}
          <div className="w-full bg-white border border-gray-200/80 rounded-2xl p-3 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-700">
                <RotateCcw className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                  72 hours only replacement
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Instant doorstep pickup & refund
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>

          {/* ================= 6. SIMILAR PRODUCTS SHELF ================= */}
          {similarProducts.length > 0 && (
            <section className="pt-2">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3">
                Similar products
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
                {similarProducts.slice(0, 3).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}

          {/* ================= 7. PRODUCT SPECIFICATIONS & DETAILS (ANCHORED) ================= */}
          <section
            id="product-specs-section"
            className="bg-white rounded-3xl p-4 sm:p-6 border border-gray-200/80 shadow-xs space-y-4 pt-4"
          >
            <div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1.5">
                Product Details
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {product.features && product.features.length > 0 && (
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 mb-2">
                  Key Highlights
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700">
                  {product.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
              <span>Fulfillment Hub: Sector 14, Gurugram</span>
              <span>SKU: {selectedVariant.sku}</span>
            </div>
          </section>
        </div>
      </main>

      {/* ================= 8. FIXED BOTTOM STICKY ACTION BAR ================= */}
      <div className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200/90 py-2.5 px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          {/* Left Info: Unit, Price, Tax */}
          <div className="min-w-0">
            <span className="text-xs font-bold text-gray-700 block truncate">
              {selectedVariant.unit || selectedVariant.title}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-base sm:text-lg font-extrabold text-gray-900">
                {formatPrice(selectedVariant.price)}
              </span>
              {selectedVariant.mrp > selectedVariant.price && (
                <span className="text-xs text-gray-400 line-through">
                  MRP {formatPrice(selectedVariant.mrp)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-gray-400 block leading-tight">
              Inclusive of all taxes
            </span>
          </div>

          {/* Right Action: Add to Cart Button or Stepper */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {selectedVariant.stock <= 0 ? (
              <span className="px-6 py-2.5 bg-gray-100 text-gray-400 text-xs font-bold rounded-xl border border-gray-200">
                Out of Stock
              </span>
            ) : quantityInCart > 0 ? (
              <div className="h-10 sm:h-11 w-32 flex items-center justify-between bg-[#0F5132] text-white rounded-xl shadow-xs overflow-hidden border border-[#0F5132]">
                <button
                  type="button"
                  aria-label={`Decrease quantity of ${product.name}`}
                  onClick={() => updateQuantity(selectedVariant.id, quantityInCart - 1)}
                  className="w-10 h-full flex items-center justify-center hover:bg-[#054A29] active:bg-[#03301B] transition-colors"
                >
                  <Minus className="w-4 h-4 stroke-[2.5]" />
                </button>
                <span className="text-sm font-black select-none">
                  {quantityInCart}
                </span>
                <button
                  type="button"
                  aria-label={`Increase quantity of ${product.name}`}
                  onClick={() => updateQuantity(selectedVariant.id, quantityInCart + 1)}
                  disabled={quantityInCart >= selectedVariant.stock}
                  className="w-10 h-full flex items-center justify-center hover:bg-[#054A29] active:bg-[#03301B] disabled:opacity-40 transition-colors"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => addToCart(product, selectedVariant, 1)}
                className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#0F5132] hover:bg-[#054A29] active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center justify-center"
              >
                Add to cart
              </button>
            )}
          </div>
        </div>
      </div>

      <Footer />
      <CartDrawer />
    </div>
  );
}
