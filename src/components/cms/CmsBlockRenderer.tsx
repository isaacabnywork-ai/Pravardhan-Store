'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Zap,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Clock,
  ArrowRight,
  ChevronDown,
  Star,
  Copy,
  Check,
  ExternalLink,
  ChevronLeft,
  ShoppingBag,
  Trash2,
  Copy as CopyIcon,
  ArrowUp,
  ArrowDown,
  Settings,
} from 'lucide-react';
import { CmsBlock } from '@/modules/cms/types';
import { useStore } from '@/lib/context/StoreContext';
import { useCart } from '@/lib/context/CartContext';
import { ProductCard } from '@/components/products/ProductCard';
import { formatPrice } from '@/lib/utils';

interface CmsBlockRendererProps {
  block: CmsBlock;
  isEditor?: boolean;
  isSelected?: boolean;
  onSelect?: (block: CmsBlock) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function CmsBlockRenderer({
  block,
  isEditor = false,
  isSelected = false,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
}: CmsBlockRendererProps) {
  const { products, categories } = useStore();
  const { applyCoupon } = useCart();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 3,
    minutes: 45,
    seconds: 12,
  });

  useEffect(() => {
    if (block.type !== 'countdown_timer') return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [block.type]);

  const handleCopyCoupon = (code: string) => {
    applyCoupon(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const renderBlockContent = () => {
    const { type, content, styles } = block;

    switch (type) {
      // 1. Heading
      case 'heading': {
        const Tag = (content.level || 'h2') as 'h1' | 'h2' | 'h3' | 'h4';
        return (
          <div
            className="w-full"
            style={{
              textAlign: styles.textAlign || 'left',
              paddingTop: styles.paddingTop ? `${styles.paddingTop}px` : undefined,
              paddingBottom: styles.paddingBottom ? `${styles.paddingBottom}px` : undefined,
            }}
          >
            {content.tag && (
              <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full mb-2">
                {content.tag}
              </span>
            )}
            <Tag
              className={`font-black tracking-tight text-slate-900 ${
                content.level === 'h1'
                  ? 'text-2xl sm:text-4xl lg:text-5xl'
                  : content.level === 'h3'
                  ? 'text-lg sm:text-xl'
                  : content.level === 'h4'
                  ? 'text-base sm:text-lg'
                  : 'text-xl sm:text-3xl'
              }`}
              style={{
                color: styles.textColor || undefined,
                fontSize: styles.fontSize || undefined,
              }}
            >
              {content.text || 'Heading text'}
            </Tag>
            {content.subtext && (
              <p
                className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-2xl"
                style={{
                  margin: styles.textAlign === 'center' ? '0.375rem auto 0' : undefined,
                }}
              >
                {content.subtext}
              </p>
            )}
          </div>
        );
      }

      // 2. Rich Text
      case 'text': {
        return (
          <div
            className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm sm:text-base"
            style={{
              textAlign: styles.textAlign || 'left',
              maxWidth: styles.maxWidth || undefined,
              paddingTop: styles.paddingTop ? `${styles.paddingTop}px` : undefined,
              paddingBottom: styles.paddingBottom ? `${styles.paddingBottom}px` : undefined,
            }}
            dangerouslySetInnerHTML={{
              __html: content.text || '<p>Enter your content text here...</p>',
            }}
          />
        );
      }

      // 3. Image
      case 'image': {
        return (
          <div
            className="w-full overflow-hidden"
            style={{
              paddingTop: styles.paddingTop ? `${styles.paddingTop}px` : undefined,
              paddingBottom: styles.paddingBottom ? `${styles.paddingBottom}px` : undefined,
              borderRadius: styles.borderRadius ? `${styles.borderRadius}px` : '16px',
            }}
          >
            <img
              src={content.url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80'}
              alt={content.altText || 'Pravdhan Store Image'}
              className="w-full h-auto object-cover max-h-[500px]"
              style={{
                borderRadius: styles.borderRadius ? `${styles.borderRadius}px` : '16px',
              }}
            />
            {content.caption && (
              <p className="text-center text-xs text-slate-500 mt-2 font-medium">
                {content.caption}
              </p>
            )}
          </div>
        );
      }

      // 4. Hero Promotional Banner Carousel
      case 'hero_banner': {
        const slides = content.slides || [
          {
            tag: '12-MIN EXPRESS IN GURUGRAM',
            title: 'Farm Fresh Produce & Chakki Atta',
            subtitle: 'Pure, unadulterated essentials delivered straight from local mandis to Sector 14.',
            buttonText: 'Order Essentials',
            buttonUrl: '/shop',
            imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
            badge: 'Zero Delivery Fee',
          },
        ];

        return (
          <div className="w-full space-y-4">
            {slides.map((slide: any, idx: number) => (
              <div
                key={slide.id || idx}
                className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white min-h-[260px] sm:min-h-[320px] flex items-center p-6 sm:p-10 shadow-sm"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-25"
                  style={{ backgroundImage: `url(${slide.imageUrl})` }}
                />
                <div className="relative z-10 max-w-xl space-y-3">
                  {slide.tag && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {slide.tag}
                    </span>
                  )}
                  <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                    {slide.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {slide.subtitle}
                  </p>
                  <div className="pt-2 flex items-center gap-3">
                    <Link
                      href={slide.buttonUrl || '/shop'}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-950/20 flex items-center gap-2 transition-transform hover:scale-105"
                    >
                      <span>{slide.buttonText || 'Shop Now'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    {slide.badge && (
                      <span className="text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-3 py-2 rounded-xl">
                        {slide.badge}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      }

      // 5. Category Grid / Rail
      case 'category_grid': {
        const displayCategories = categories.slice(0, content.limit || 7);
        return (
          <div className="w-full space-y-4">
            {(content.title || content.subtitle) && (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    {content.title || 'Explore Categories'}
                  </h3>
                  {content.subtitle && (
                    <p className="text-xs text-slate-500">{content.subtitle}</p>
                  )}
                </div>
                <Link
                  href="/shop"
                  className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3 sm:gap-4">
              {displayCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className="group flex flex-col items-center text-center p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-500 hover:shadow-md transition-all"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center overflow-hidden mb-2 group-hover:scale-105 transition-transform">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="w-6 h-6 text-emerald-600" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 line-clamp-1">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        );
      }

      // 6. Countdown Timer Block
      case 'countdown_timer': {
        return (
          <div
            className="w-full p-5 sm:p-7 rounded-3xl text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5"
            style={{
              backgroundColor: styles.backgroundColor || '#0F5132',
              color: styles.textColor || '#FFFFFF',
            }}
          >
            <div className="space-y-1.5 max-w-lg">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/20 text-white">
                <Clock className="w-3.5 h-3.5" /> Flash Timer
              </span>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                {content.headline || 'Lightning Deals'}
              </h3>
              <p className="text-xs text-white/80">{content.subheadline}</p>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              {/* Timer Counters */}
              <div className="flex items-center gap-2 font-mono">
                <div className="bg-white/15 backdrop-blur-xs px-3 py-2 rounded-xl text-center min-w-[50px]">
                  <span className="text-xl sm:text-2xl font-black block">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-white/70">Hours</span>
                </div>
                <span className="text-xl font-bold">:</span>
                <div className="bg-white/15 backdrop-blur-xs px-3 py-2 rounded-xl text-center min-w-[50px]">
                  <span className="text-xl sm:text-2xl font-black block">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-white/70">Mins</span>
                </div>
                <span className="text-xl font-bold">:</span>
                <div className="bg-white/15 backdrop-blur-xs px-3 py-2 rounded-xl text-center min-w-[50px]">
                  <span className="text-xl sm:text-2xl font-black block text-amber-300">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-white/70">Secs</span>
                </div>
              </div>

              {content.couponCode && (
                <button
                  type="button"
                  onClick={() => handleCopyCoupon(content.couponCode)}
                  className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer"
                >
                  {copiedCode === content.couponCode ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-800" />
                      <span>Applied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>{content.couponCode}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        );
      }

      // 7. Product Grid & Product Carousel
      case 'product_grid':
      case 'product_carousel':
      case 'featured_products':
      case 'new_arrivals':
      case 'best_sellers': {
        const filtered = content.categorySlug
          ? products.filter((p) => p.categoryId === content.categorySlug || p.subcategoryId === content.categorySlug)
          : products;
        const displayProducts = filtered.slice(0, content.limit || 8);

        return (
          <div className="w-full space-y-4">
            {(content.title || content.subtitle) && (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    {content.title || 'Featured Products'}
                  </h3>
                  {content.subtitle && (
                    <p className="text-xs text-slate-500">{content.subtitle}</p>
                  )}
                </div>
                {content.viewAllUrl && (
                  <Link
                    href={content.viewAllUrl}
                    className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    View All ({filtered.length}) <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {displayProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        );
      }

      // 8. Testimonials
      case 'testimonials': {
        const reviews = content.reviews || [];
        return (
          <div className="w-full space-y-4">
            {(content.title || content.subtitle) && (
              <div className="text-center max-w-xl mx-auto space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {content.title}
                </h3>
                {content.subtitle && (
                  <p className="text-xs sm:text-sm text-slate-500">{content.subtitle}</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {reviews.map((rev: any, i: number) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: rev.rating || 5 }).map((_, starIdx) => (
                      <Star key={starIdx} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-700 italic leading-relaxed">
                    &quot;{rev.text}&quot;
                  </p>
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{rev.name}</p>
                    <p className="text-[10px] text-slate-400">{rev.area}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // 9. FAQs Accordion
      case 'faqs': {
        const items = content.items || [];
        return (
          <div className="w-full max-w-3xl mx-auto space-y-3">
            {content.title && (
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight text-center mb-3">
                {content.title}
              </h3>
            )}
            <div className="space-y-2">
              {items.map((item: any, idx: number) => {
                const isOpen = activeFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveFaqIndex(isOpen ? null : idx)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <span className="text-xs sm:text-sm font-bold text-slate-800">
                        {item.question}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          isOpen ? 'rotate-180 text-emerald-600' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="p-4 pt-1 border-t border-slate-100 text-xs text-slate-600 leading-relaxed bg-slate-50/50">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      // 10. Newsletter Form
      case 'newsletter': {
        return (
          <div
            className="w-full p-6 sm:p-10 rounded-3xl text-center space-y-4"
            style={{
              backgroundColor: styles.backgroundColor || '#1E293B',
              color: styles.textColor || '#FFFFFF',
            }}
          >
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              {content.title || 'Subscribe for Fresh Deals'}
            </h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              {content.subtitle || 'Get weekly alerts on fresh arrivals & discounts.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto pt-2">
              <input
                type="text"
                placeholder={content.placeholder || 'Enter WhatsApp or email...'}
                className="w-full px-4 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold whitespace-nowrap shadow-xs transition-colors cursor-pointer"
              >
                {content.buttonText || 'Subscribe'}
              </button>
            </div>
          </div>
        );
      }

      // 11. Generic Container
      case 'container': {
        if (content.badges) {
          return (
            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
              style={{
                backgroundColor: styles.backgroundColor || '#F0FDF4',
                borderColor: styles.borderColor || '#BBF7D0',
                borderWidth: styles.borderWidth ? `${styles.borderWidth}px` : undefined,
                borderRadius: styles.borderRadius ? `${styles.borderRadius}px` : '20px',
                padding: styles.paddingTop ? `${styles.paddingTop}px` : '24px',
              }}
            >
              {content.badges.map((b: any, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold shadow-xs">
                    {b.icon === 'Zap' ? (
                      <Zap className="w-5 h-5" />
                    ) : b.icon === 'ShieldCheck' ? (
                      <ShieldCheck className="w-5 h-5" />
                    ) : (
                      <Sparkles className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{b.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{b.description}</p>
                  </div>
                </div>
              ))}
            </div>
          );
        }

        return (
          <div
            className="w-full"
            style={{
              backgroundColor: styles.backgroundColor || undefined,
              borderRadius: styles.borderRadius ? `${styles.borderRadius}px` : undefined,
              padding: styles.paddingTop ? `${styles.paddingTop}px` : undefined,
            }}
          >
            {content.title && (
              <h3 className="text-lg font-bold text-slate-900 mb-3">{content.title}</h3>
            )}
            {content.items && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {content.items.map((it: any, i: number) => (
                  <div key={i} className="p-4 rounded-xl bg-white border border-slate-200">
                    <p className="text-xs font-bold text-slate-900">{it.title}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{it.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      // Default fallback
      default:
        return (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            Block: <strong>{type}</strong> ({block.label || 'Generic Block'})
          </div>
        );
    }
  };

  return (
    <div
      onClick={() => onSelect && onSelect(block)}
      className={`relative group transition-all ${
        isEditor
          ? isSelected
            ? 'ring-2 ring-emerald-600 shadow-md rounded-2xl'
            : 'hover:ring-1 hover:ring-emerald-400/80 rounded-2xl'
          : ''
      }`}
    >
      {/* Editor Floating Actions Bar */}
      {isEditor && (
        <div
          className={`absolute -top-3.5 right-3 z-30 flex items-center gap-1 bg-slate-900 text-white px-2 py-1 rounded-lg text-[10px] font-bold shadow-lg transition-opacity ${
            isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <span className="text-emerald-400 mr-1 uppercase tracking-wider">{block.type.replace(/_/g, ' ')}</span>
          {onMoveUp && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp(block.id);
              }}
              className="p-1 hover:bg-slate-800 rounded"
              title="Move Up"
            >
              <ArrowUp className="w-3 h-3" />
            </button>
          )}
          {onMoveDown && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown(block.id);
              }}
              className="p-1 hover:bg-slate-800 rounded"
              title="Move Down"
            >
              <ArrowDown className="w-3 h-3" />
            </button>
          )}
          {onDuplicate && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(block.id);
              }}
              className="p-1 hover:bg-slate-800 rounded"
              title="Duplicate"
            >
              <CopyIcon className="w-3 h-3" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(block.id);
              }}
              className="p-1 hover:bg-rose-900/60 text-rose-300 rounded"
              title="Delete Block"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Render actual content */}
      {renderBlockContent()}
    </div>
  );
}
