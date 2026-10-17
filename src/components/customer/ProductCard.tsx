import React, { useState } from 'react';
import { Product, ProductVariant } from '@/types';
import { useStore } from '@/context/StoreContext';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import { Heart, ChevronDown, Clock } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  variantLayout?: 'grid' | 'horizontal';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  variantLayout = 'grid',
}) => {
  const {
    addToCart,
    updateCartQuantity,
    getItemQuantity,
    isInWishlist,
    toggleWishlist,
    navigateToProduct,
  } = useStore();

  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product.variants.find((v) => v.isDefault)?.id || product.variants[0]?.id || ''
  );
  const [showVariantDropdown, setShowVariantDropdown] = useState<boolean>(false);
  const [imageError, setImageError] = useState(false);

  const activeVariant: ProductVariant =
    product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];

  const currentQuantity = getItemQuantity(product.id, activeVariant.id);
  const isWishlisted = isInWishlist(product.id);
  const isOutOfStock = activeVariant.stock <= 0;

  const handleCardClick = () => {
    navigateToProduct(product.id);
  };

  const handleVariantSelect = (e: React.MouseEvent, variantId: string) => {
    e.stopPropagation();
    setSelectedVariantId(variantId);
    setShowVariantDropdown(false);
  };

  const hasMultipleVariants = product.variants.length > 1;

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col bg-white rounded-xl border border-gray-200/80 hover:border-gray-300 hover:shadow-card transition-all duration-150 p-2.5 sm:p-3 cursor-pointer h-full select-none"
    >
      {/* Top row: Delivery ETA tag, Discount badge, Wishlist */}
      <div className="flex items-center justify-between gap-1 mb-1.5 z-10 min-h-[22px]">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Small Delivery ETA tag */}
          <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 flex items-center gap-0.5 tracking-tight">
            <Clock className="w-2.5 h-2.5 text-gray-500" />
            <span>15 MINS</span>
          </span>

          {activeVariant.discountPercent > 0 && (
            <span className="text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-[#FFF7E6] text-[#B45309] border border-[#FDE68A] uppercase">
              {activeVariant.discountPercent}% OFF
            </span>
          )}
        </div>

        <button
          type="button"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`p-1 rounded-full transition-colors ${
            isWishlisted
              ? 'text-rose-600 bg-rose-50 hover:bg-rose-100'
              : 'text-gray-300 hover:text-gray-500 hover:bg-gray-100'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
        </button>
      </div>

      {/* Product Image Area */}
      <div className="relative w-full aspect-square mb-2 rounded-lg overflow-hidden bg-white flex items-center justify-center p-1.5">
        {/* Veg/Non-Veg indicator */}
        <span
          className="absolute top-1 left-1 w-3.5 h-3.5 rounded border flex items-center justify-center bg-white/95 z-10 shadow-2xs"
          style={{ borderColor: product.isVeg ? '#0C831F' : '#DC2626' }}
          title={product.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: product.isVeg ? '#0C831F' : '#DC2626' }}
          />
        </span>

        {imageError || !product.images?.[0] ? (
          <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center p-2 text-center">
            <span className="text-[11px] font-medium text-gray-400 line-clamp-2">
              {product.name}
            </span>
          </div>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            onError={() => setImageError(true)}
            className={`w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-200 ${
              isOutOfStock ? 'opacity-40 grayscale' : ''
            }`}
          />
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
            <span className="text-[10px] font-bold text-gray-700 bg-white/90 border border-gray-300 px-2 py-0.5 rounded shadow-xs uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Brand & Name */}
      <div className="flex-1 flex flex-col justify-start">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate mb-0.5">
          {product.brand}
        </span>
        <h4 className="text-xs sm:text-[13px] font-semibold text-[#1C1C1C] leading-snug line-clamp-2 min-h-[2rem]">
          {product.name}
        </h4>
      </div>

      {/* Weight / Variant dropdown */}
      <div className="relative mt-1 mb-2">
        {hasMultipleVariants ? (
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowVariantDropdown(!showVariantDropdown);
              }}
              className="w-full text-left text-[11px] font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 flex items-center justify-between"
            >
              <span>{activeVariant.weight}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {showVariantDropdown && (
              <div
                className="absolute bottom-full mb-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-dropdown z-30 py-1"
                onClick={(e) => e.stopPropagation()}
              >
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={(e) => handleVariantSelect(e, v.id)}
                    className={`w-full px-2.5 py-1.5 text-xs text-left flex items-center justify-between hover:bg-gray-50 ${
                      v.id === activeVariant.id ? 'bg-[#F0F8F1] font-bold text-[#0C831F]' : 'text-gray-700'
                    }`}
                  >
                    <span>{v.weight}</span>
                    <span className="font-bold">₹{v.price}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <span className="text-[11px] text-gray-500 font-medium block">
            {activeVariant.weight}
          </span>
        )}
      </div>

      {/* Price & In-Place Stepper Action */}
      <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-1.5 mt-auto">
        <PriceDisplay
          price={activeVariant.price}
          mrp={activeVariant.mrp}
          size="sm"
        />

        <div className="w-20 sm:w-22 shrink-0">
          <QuantitySelector
            quantity={currentQuantity}
            maxStock={activeVariant.stock}
            size="sm"
            fullWidth
            disabled={isOutOfStock}
            onIncrement={() => addToCart(product, activeVariant.id, 1)}
            onDecrement={() =>
              updateCartQuantity(product.id, activeVariant.id, currentQuantity - 1)
            }
          />
        </div>
      </div>
    </div>
  );
};
