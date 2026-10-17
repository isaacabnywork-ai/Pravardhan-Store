import React, { useState, useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from './ProductCard';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import {
  ChevronRight,
  Heart,
  Star,
  Clock,
  ShieldCheck,
  Share2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const ProductDetailScreen: React.FC = () => {
  const {
    products,
    activeProductId,
    addToCart,
    updateCartQuantity,
    getItemQuantity,
    isInWishlist,
    toggleWishlist,
    setCustomerPage,
    navigateToCategory,
    categories,
    showToast,
  } = useStore();

  const product = useMemo(() => {
    return products.find((p) => p.id === activeProductId) || products[0];
  }, [products, activeProductId]);

  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product?.variants.find((v) => v.isDefault)?.id || product?.variants[0]?.id || ''
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isDescExpanded, setIsDescExpanded] = useState<boolean>(false);

  if (!product) return null;

  const currentVariant =
    product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];

  const currentQuantity = getItemQuantity(product.id, currentVariant.id);
  const isWishlisted = isInWishlist(product.id);
  const isOutOfStock = currentVariant.stock <= 0;

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 6);

  const matchedCategory = categories.find((c) => c.name === product.category);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Product link copied to clipboard', 'info');
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-20">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 flex-wrap px-1">
        <button onClick={() => setCustomerPage('home')} className="hover:text-[#0C831F]">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <button
          onClick={() => {
            if (matchedCategory) navigateToCategory(matchedCategory.id);
          }}
          className="hover:text-[#0C831F]"
        >
          {product.category}
        </button>
        {product.subCategory && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-600">{product.subCategory}</span>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="font-bold text-[#1C1C1C] truncate max-w-[200px]">
          {product.name}
        </span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 bg-white p-4 sm:p-7 rounded-2xl border border-gray-200/80 shadow-soft">
        {/* Left Column: Image Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative aspect-square w-full rounded-xl bg-white border border-gray-100 p-4 sm:p-6 flex items-center justify-center overflow-hidden">
            {/* Diet indicator */}
            <span
              className="absolute top-3 left-3 w-4 h-4 rounded border flex items-center justify-center bg-white z-10 shadow-2xs"
              style={{ borderColor: product.isVeg ? '#0C831F' : '#DC2626' }}
              title={product.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: product.isVeg ? '#0C831F' : '#DC2626' }}
              />
            </span>

            {/* Actions: Wishlist & Share */}
            <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
              <button
                type="button"
                onClick={handleShare}
                aria-label="Share product"
                className="p-1.5 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                aria-label="Save to wishlist"
                className={`p-1.5 rounded-full transition-colors ${
                  isWishlisted
                    ? 'text-rose-600 bg-rose-50'
                    : 'text-gray-400 hover:text-gray-600 bg-gray-50'
                }`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
              </button>
            </div>

            {/* Main Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.name}
              className={`w-full h-full object-contain mix-blend-multiply ${
                isOutOfStock ? 'opacity-40 grayscale' : ''
              }`}
            />

            {isOutOfStock && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                <span className="text-xs font-bold text-gray-700 bg-white px-3 py-1 rounded shadow-xs uppercase tracking-wider border border-gray-300">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail Gallery switcher */}
          {product.images.length > 1 && (
            <div className="flex gap-2 justify-center">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-14 h-14 rounded-lg border p-1 bg-white transition-all overflow-hidden ${
                    selectedImageIndex === idx
                      ? 'border-[#0C831F] ring-1 ring-[#0C831F]'
                      : 'border-gray-200 hover:border-gray-300 opacity-70'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Actions (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          {/* Brand & ETA */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {product.brand}
            </span>
            <span className="text-[10px] font-extrabold uppercase text-[#0C831F] bg-[#F0F8F1] px-2 py-0.5 rounded flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#0C831F]" />
              <span>15 MINS DELIVERY</span>
            </span>
          </div>

          {/* Title */}
          <h1 className="text-lg sm:text-2xl font-black text-[#1C1C1C] leading-snug">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 bg-[#0C831F] text-white px-2 py-0.5 rounded font-bold text-[11px]">
              <span>{product.rating}</span>
              <Star className="w-3 h-3 fill-white" />
            </span>
            <span className="text-gray-500 font-medium">
              {product.ratingCount.toLocaleString('en-IN')} ratings
            </span>
          </div>

          {/* Weight options as selectable chips */}
          <div className="pt-2 border-t border-gray-100">
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-2">
              Select Pack Size
            </label>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => {
                const isSelected = v.id === currentVariant.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-left flex items-center gap-3 ${
                      isSelected
                        ? 'border-[#0C831F] bg-[#F0F8F1] text-[#0C831F] ring-1 ring-[#0C831F]'
                        : 'border-gray-200 hover:border-gray-300 bg-white text-gray-800'
                    }`}
                  >
                    <span>{v.weight}</span>
                    <span className="font-extrabold text-[#1C1C1C]">₹{v.price}</span>
                    {v.discountPercent > 0 && (
                      <span className="text-[10px] text-[#B45309] font-extrabold bg-[#FFF7E6] px-1 rounded">
                        {v.discountPercent}% OFF
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price & Add to Cart (Desktop row) */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-gray-400 block mb-0.5">Price</span>
              <PriceDisplay
                price={currentVariant.price}
                mrp={currentVariant.mrp}
                size="lg"
                showSavings
              />
            </div>

            <div className="w-32 sm:w-36">
              <QuantitySelector
                quantity={currentQuantity}
                maxStock={currentVariant.stock}
                size="md"
                fullWidth
                disabled={isOutOfStock}
                onIncrement={() => addToCart(product, currentVariant.id, 1)}
                onDecrement={() =>
                  updateCartQuantity(product.id, currentVariant.id, currentQuantity - 1)
                }
              />
            </div>
          </div>

          {/* Short Description (max 3 lines, expandable) */}
          {product.description && (
            <div className="pt-3 border-t border-gray-100">
              <h3 className="text-xs font-bold text-[#1C1C1C] uppercase tracking-wider mb-1">
                Product Details
              </h3>
              <p
                className={`text-xs text-gray-600 leading-relaxed ${
                  !isDescExpanded ? 'line-clamp-3' : ''
                }`}
              >
                {product.description}
              </p>
              {product.description.length > 140 && (
                <button
                  type="button"
                  onClick={() => setIsDescExpanded(!isDescExpanded)}
                  className="text-xs font-bold text-[#0C831F] mt-1 inline-flex items-center gap-0.5 hover:underline"
                >
                  <span>{isDescExpanded ? 'Show Less' : 'Show More'}</span>
                  {isDescExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          )}

          {/* Key Product Details Compact List */}
          <div className="pt-3 border-t border-gray-100 space-y-1.5 text-xs">
            <h3 className="text-xs font-bold text-[#1C1C1C] uppercase tracking-wider mb-2">
              Key Information
            </h3>
            <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
              {product.shelfLife && (
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Shelf Life</span>
                  <span className="font-semibold text-gray-800">{product.shelfLife}</span>
                </div>
              )}
              {product.origin && (
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Origin</span>
                  <span className="font-semibold text-gray-800">{product.origin}</span>
                </div>
              )}
              {product.storageInfo && (
                <div className="col-span-2">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Storage</span>
                  <span className="font-semibold text-gray-800">{product.storageInfo}</span>
                </div>
              )}
              {product.nutrition && (
                <div className="col-span-2 pt-1 border-t border-gray-200">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">
                    Nutrition (per 100g)
                  </span>
                  <div className="flex gap-4 text-[11px] font-semibold text-gray-700">
                    <span>{product.nutrition.calories}</span>
                    <span>Protein: {product.nutrition.protein}</span>
                    <span>Carbs: {product.nutrition.carbs}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Similar Products Carousel */}
      {relatedProducts.length > 0 && (
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-extrabold text-[#1C1C1C] tracking-tight">
              Similar Products in {product.category}
            </h2>
            <button
              onClick={() => {
                if (matchedCategory) navigateToCategory(matchedCategory.id);
              }}
              className="text-xs font-bold text-[#0C831F] hover:underline flex items-center gap-0.5"
            >
              <span>See All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {relatedProducts.map((prod) => (
              <div key={prod.id} className="w-[155px] sm:w-[185px] lg:w-[200px] shrink-0">
                <ProductCard product={prod} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sticky Bottom Bar on Mobile */}
      <div className="fixed bottom-0 inset-x-0 lg:hidden bg-white border-t border-gray-200 px-4 py-2.5 z-30 flex items-center justify-between shadow-drawer">
        <div>
          <span className="text-[10px] text-gray-400 uppercase font-bold block">
            {currentVariant.weight}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-black text-[#1C1C1C]">
              ₹{currentVariant.price}
            </span>
            {currentVariant.mrp > currentVariant.price && (
              <span className="text-xs text-gray-400 line-through">
                ₹{currentVariant.mrp}
              </span>
            )}
          </div>
        </div>

        <div className="w-32">
          <QuantitySelector
            quantity={currentQuantity}
            maxStock={currentVariant.stock}
            size="md"
            fullWidth
            disabled={isOutOfStock}
            onIncrement={() => addToCart(product, currentVariant.id, 1)}
            onDecrement={() =>
              updateCartQuantity(product.id, currentVariant.id, currentQuantity - 1)
            }
          />
        </div>
      </div>
    </div>
  );
};
