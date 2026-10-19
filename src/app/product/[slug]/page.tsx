'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  Clock,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { ProductCard } from '@/components/products/ProductCard';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { useStore } from '@/lib/context/StoreContext';
import { useCart } from '@/lib/context/CartContext';
import { ProductVariant } from '@/types';
import { formatPrice, calculateDiscountPercentage } from '@/lib/utils';

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const { products, categories, storeSettings } = useStore();
  const { items, addToCart, updateQuantity } = useCart();

  const product = products.find((p) => p.slug === resolvedParams.slug);

  if (!product) {
    notFound();
  }

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants[0]
  );
  const [selectedImage, setSelectedImage] = useState<string>(
    product.images[0]
  );

  const cartItem = items.find((i) => i.variantId === selectedVariant.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const discount = calculateDiscountPercentage(
    selectedVariant.mrp,
    selectedVariant.price
  );

  const category = categories.find((c) => c.id === product.categoryId);
  const subcategory = category?.subcategories.find(
    (s) => s.id === product.subcategoryId
  );

  const relatedProducts = products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/60 pb-24 md:pb-0">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500">
          <Link href="/" className="hover:text-emerald-700">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/shop" className="hover:text-emerald-700">Shop</Link>
          {category && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link href={`/shop?category=${category.slug}`} className="hover:text-emerald-700">
                {category.name}
              </Link>
            </>
          )}
          {subcategory && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link
                href={`/shop?category=${category?.slug}&sub=${subcategory.slug}`}
                className="hover:text-emerald-700"
              >
                {subcategory.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 font-semibold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs">
          {/* Left: Images */}
          <div className="space-y-4">
            <div className="relative aspect-square max-h-[460px] w-full rounded-2xl bg-slate-50 border border-slate-200/80 p-6 flex items-center justify-center overflow-hidden">
              {discount > 0 && (
                <span className="absolute top-4 left-4 bg-emerald-700 text-white text-xs font-black px-3 py-1 rounded-full shadow-sm">
                  {discount}% OFF
                </span>
              )}
              {product.isOrganic && (
                <span className="absolute top-4 right-4 bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-full">
                  🌱 100% Certified Organic
                </span>
              )}
              <img
                src={selectedVariant.image || selectedImage}
                alt={product.name}
                className="w-full h-full object-contain max-h-[380px]"
              />
            </div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`w-18 h-18 rounded-xl border-2 p-1 bg-white overflow-hidden transition-all ${
                      selectedImage === img
                        ? 'border-emerald-700 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info & Actions */}
          <div className="flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md">
                  {product.brand}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  SKU: {selectedVariant.sku}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-2">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg text-amber-900 font-bold text-xs border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span>{product.rating}</span>
                  <span className="text-slate-400">({product.reviewCount} customer reviews)</span>
                </div>
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Direct Store Inventory
                </span>
              </div>

              {/* Price Section */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 mb-6">
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-3xl font-black text-slate-900">
                    {formatPrice(selectedVariant.price)}
                  </span>
                  {selectedVariant.mrp > selectedVariant.price && (
                    <span className="text-base text-slate-400 line-through">
                      MRP {formatPrice(selectedVariant.mrp)}
                    </span>
                  )}
                  {discount > 0 && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      Save {formatPrice(selectedVariant.mrp - selectedVariant.price)} ({discount}%)
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Inclusive of all taxes. Free delivery on all orders today!
                </p>
              </div>

              {/* Variant Selector (Spec Section 4) */}
              <div className="space-y-2.5 mb-6">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Available Pack Sizes:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {product.variants.map((v) => {
                    const isSelected = v.id === selectedVariant.id;
                    const vDiscount = calculateDiscountPercentage(v.mrp, v.price);
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`p-3 rounded-xl border text-left transition-all relative ${
                          isSelected
                            ? 'border-emerald-700 bg-emerald-50/60 ring-2 ring-emerald-600/30 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <span className="font-bold text-xs text-slate-900 block">{v.title}</span>
                        <span className="text-xs font-black text-emerald-800 block mt-0.5">
                          {formatPrice(v.price)}
                        </span>
                        {vDiscount > 0 && (
                          <span className="text-[10px] text-slate-400 line-through">
                            {formatPrice(v.mrp)}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          {v.stock > 0 ? `${v.stock} in stock` : 'Out of Stock'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stock availability banner */}
              <div className="mb-6">
                {selectedVariant.stock > 5 ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>In Stock — {selectedVariant.stock} units available at warehouse</span>
                  </div>
                ) : selectedVariant.stock > 0 ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-700">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Hurry! Only {selectedVariant.stock} units remaining</span>
                  </div>
                ) : (
                  <div className="text-xs font-bold text-rose-600">
                    Out of Stock — check back tomorrow
                  </div>
                )}
              </div>

              {/* Add to Cart / Stepper */}
              <div className="flex items-center gap-4">
                {selectedVariant.stock <= 0 ? (
                  <button
                    disabled
                    className="w-full py-3.5 bg-slate-200 text-slate-500 text-sm font-bold rounded-2xl cursor-not-allowed"
                  >
                    Currently Out of Stock
                  </button>
                ) : quantityInCart > 0 ? (
                  <div className="w-full flex items-center justify-between p-2 rounded-2xl border-2 border-emerald-700 bg-emerald-50">
                    <span className="text-xs font-bold text-emerald-900 ml-2">
                      {quantityInCart} in Cart
                    </span>
                    <div className="flex items-center border border-emerald-700 rounded-xl overflow-hidden bg-white shadow-xs">
                      <button
                        onClick={() => updateQuantity(selectedVariant.id, quantityInCart - 1)}
                        className="w-9 h-9 flex items-center justify-center text-emerald-800 hover:bg-emerald-50 active:bg-emerald-100"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center text-sm font-black text-emerald-950">
                        {quantityInCart}
                      </span>
                      <button
                        onClick={() => updateQuantity(selectedVariant.id, quantityInCart + 1)}
                        disabled={quantityInCart >= selectedVariant.stock}
                        className="w-9 h-9 flex items-center justify-center text-emerald-800 hover:bg-emerald-50 active:bg-emerald-100 disabled:opacity-40"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(product, selectedVariant, 1)}
                    className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-black uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-700/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span>Add to Cart ({formatPrice(selectedVariant.price)})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Delivery & Security Badges */}
            <div className="pt-6 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-slate-700">
                <Truck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Next slot: Today 12-2 PM</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>100% Quality Mandi Grade</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Serving {storeSettings.serviceArea}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <RotateCcw className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Instant Doorstep Return</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description & Highlights */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Product Description</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {product.features && product.features.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3">Key Highlights</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700">
                {product.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Frequently Bought Together
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
        {/* Mobile Sticky Add-to-Cart Action Bar */}
        <div className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 sm:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between gap-3">
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
              <span className="text-[10px] text-emerald-700 font-bold block">
                {selectedVariant.title} ({selectedVariant.unit})
              </span>
            </div>

            <div className="flex-1 max-w-[180px]">
              {selectedVariant.stock <= 0 ? (
                <button
                  disabled
                  className="w-full py-2.5 bg-slate-200 text-slate-400 text-xs font-bold rounded-xl"
                >
                  Out of Stock
                </button>
              ) : quantityInCart > 0 ? (
                <div className="w-full flex items-center justify-between border-2 border-emerald-700 rounded-xl overflow-hidden bg-white shadow-xs">
                  <button
                    onClick={() => updateQuantity(selectedVariant.id, quantityInCart - 1)}
                    className="w-8 h-8 flex items-center justify-center text-emerald-800 hover:bg-emerald-50 active:bg-emerald-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center text-xs font-black text-emerald-950">
                    {quantityInCart}
                  </span>
                  <button
                    onClick={() => updateQuantity(selectedVariant.id, quantityInCart + 1)}
                    disabled={quantityInCart >= selectedVariant.stock}
                    className="w-8 h-8 flex items-center justify-center text-emerald-800 hover:bg-emerald-50 active:bg-emerald-100 disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => addToCart(product, selectedVariant, 1)}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-emerald-700/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <CartDrawer />
      <MobileBottomNav />
    </div>
  );
}
