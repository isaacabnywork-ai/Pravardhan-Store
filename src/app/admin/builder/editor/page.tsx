'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Layout,
  Globe,
  ArrowLeft,
  Smartphone,
  Tablet,
  Monitor,
  Undo2,
  Redo2,
  Save,
  Send,
  Eye,
  Plus,
  Trash2,
  Copy,
  ChevronDown,
  Layers,
  Palette,
  Sliders,
  Settings,
  X,
  CheckCircle2,
  Clock,
  Sparkles,
  ShoppingBag,
  Zap,
  Tag,
  Star,
  Search,
  FolderTree,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useCms } from '@/lib/context/CmsContext';
import { CmsBlock, CmsBlockType, CmsPage } from '@/modules/cms/types';
import { CmsBlockRenderer } from '@/components/cms/CmsBlockRenderer';
import { DEFAULT_HOMEPAGE_BLOCKS } from '@/modules/cms/default-data';

// Available Palette Elements
interface PaletteElement {
  type: CmsBlockType;
  label: string;
  icon: any;
  category: 'BASIC' | 'LAYOUT' | 'COMMERCE' | 'CONTENT';
  description: string;
  defaultContent: Record<string, any>;
  defaultStyles?: Record<string, any>;
}

const PALETTE_ELEMENTS: PaletteElement[] = [
  // Layout
  {
    type: 'container',
    label: 'Container',
    icon: Layout,
    category: 'LAYOUT',
    description: 'Enclosing container with background and padding',
    defaultContent: { title: '' },
    defaultStyles: { backgroundColor: '#F8FAFC', paddingTop: 24, paddingBottom: 24, borderRadius: 20 },
  },
  {
    type: 'columns',
    label: '3 Columns Grid',
    icon: Layers,
    category: 'LAYOUT',
    description: 'Multi-column feature grid layout',
    defaultContent: {
      columns: [
        { title: 'Chakki Atta', detail: '100% stone ground fresh', badge: 'Pure' },
        { title: 'Fresh Greens', detail: 'Harvested at dawn', badge: 'Farm' },
        { title: 'Zero Delivery Fee', detail: 'On all orders above ₹100', badge: 'Free' },
      ],
    },
    defaultStyles: { paddingTop: 20, paddingBottom: 20 },
  },
  // Basic
  {
    type: 'heading',
    label: 'Headline',
    icon: Tag,
    category: 'BASIC',
    description: 'H1, H2, or H3 section title',
    defaultContent: { level: 'h2', text: 'Fresh Grocery Headline', subtext: 'Subtitle describing your fresh products' },
    defaultStyles: { textAlign: 'left', paddingTop: 16, paddingBottom: 16 },
  },
  {
    type: 'text',
    label: 'Rich Text',
    icon: Layers,
    category: 'BASIC',
    description: 'Rich paragraph with formatting',
    defaultContent: { text: '<p>Pravdhan Store delivers unadulterated kitchen essentials to your doorstep.</p>' },
    defaultStyles: { paddingTop: 12, paddingBottom: 12 },
  },
  {
    type: 'image',
    label: 'Image Banner',
    icon: Globe,
    category: 'BASIC',
    description: 'High-resolution photo or product illustration',
    defaultContent: {
      url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
      altText: 'Fresh vegetables in basket',
      caption: 'Pravdhan Store Gurugram Hub',
    },
    defaultStyles: { borderRadius: 20, paddingTop: 16, paddingBottom: 16 },
  },
  {
    type: 'divider',
    label: 'Divider Line',
    icon: Sliders,
    category: 'BASIC',
    description: 'Clean visual horizontal separator',
    defaultContent: {},
    defaultStyles: { paddingTop: 16, paddingBottom: 16 },
  },
  {
    type: 'spacer',
    label: 'Spacer',
    icon: Sliders,
    category: 'BASIC',
    description: 'Empty vertical space',
    defaultContent: {},
    defaultStyles: { paddingTop: 32, paddingBottom: 32 },
  },
  // Commerce
  {
    type: 'hero_banner',
    label: 'Hero Carousel',
    icon: Sparkles,
    category: 'COMMERCE',
    description: 'Multi-slide banner carousel with action buttons',
    defaultContent: {
      slides: [
        {
          tag: '12-MIN EXPRESS IN GURUGRAM',
          title: 'Farm Fresh Produce & Chakki Atta',
          subtitle: 'Pure, unadulterated essentials delivered within 15 minutes.',
          buttonText: 'Order Essentials',
          buttonUrl: '/shop',
          imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
          badge: 'Zero Delivery Fee',
        },
      ],
    },
    defaultStyles: { paddingTop: 16, paddingBottom: 24 },
  },
  {
    type: 'category_grid',
    label: 'Category Rail',
    icon: ShoppingBag,
    category: 'COMMERCE',
    description: 'Interactive aisles grid from active categories',
    defaultContent: { title: 'Explore Daily Categories', subtitle: 'Hand-curated aisles for fastest delivery', limit: 7 },
    defaultStyles: { paddingTop: 20, paddingBottom: 20 },
  },
  {
    type: 'countdown_timer',
    label: 'Flash Deal Timer',
    icon: Clock,
    category: 'COMMERCE',
    description: 'Urgency countdown with coupon code button',
    defaultContent: {
      headline: '⚡ Lightning Morning Deals — Ends in 4 Hours!',
      subheadline: 'Up to 30% off on fresh produce and kitchen staples.',
      couponCode: 'FLASH30',
      actionText: 'Shop Deals',
      actionUrl: '/deals',
    },
    defaultStyles: { backgroundColor: '#0F5132', textColor: '#FFFFFF', paddingTop: 24, paddingBottom: 24, borderRadius: 20 },
  },
  {
    type: 'product_carousel',
    label: 'Product Rail',
    icon: ShoppingBag,
    category: 'COMMERCE',
    description: 'Horizontal product carousel for a category',
    defaultContent: {
      title: 'Fresh Farm Produce',
      subtitle: 'Handpicked daily from local cultivators',
      categorySlug: 'fruits-vegetables',
      limit: 6,
      viewAllUrl: '/shop?category=fruits-vegetables',
    },
    defaultStyles: { paddingTop: 24, paddingBottom: 24 },
  },
  {
    type: 'featured_products',
    label: 'Product Grid',
    icon: ShoppingBag,
    category: 'COMMERCE',
    description: '4-column product grid with live Add-to-Cart',
    defaultContent: {
      title: 'Kitchen Staples & Chakki Atta',
      subtitle: 'Pure mustard oil, basmati rice, and whole wheat flour',
      categorySlug: 'groceries-staples',
      limit: 8,
      viewAllUrl: '/shop?category=groceries-staples',
    },
    defaultStyles: { paddingTop: 24, paddingBottom: 24 },
  },
  // Content & Trust
  {
    type: 'testimonials',
    label: 'Testimonials',
    icon: Star,
    category: 'CONTENT',
    description: 'Neighborhood customer reviews with star ratings',
    defaultContent: {
      title: 'Loved by 5,000+ Families in Gurugram',
      subtitle: 'Real reviews from verified residents of DLF Phase 1 & Model Town',
      reviews: [
        {
          name: 'Neha Kapoor',
          area: 'Sector 14, Gurugram',
          rating: 5,
          text: 'Pravdhan Store delivered my Chakki Atta and fresh spinach in just 11 minutes!',
        },
        {
          name: 'Rajesh Mehra',
          area: 'DLF Phase 1',
          rating: 5,
          text: 'Quality is top-notch. Paying via UPI at doorstep is completely hassle-free.',
        },
      ],
    },
    defaultStyles: { paddingTop: 28, paddingBottom: 28 },
  },
  {
    type: 'faqs',
    label: 'FAQs Accordion',
    icon: AlertCircle,
    category: 'CONTENT',
    description: 'Collapsible accordion for customer support questions',
    defaultContent: {
      title: 'Frequently Asked Questions',
      items: [
        { question: 'What is the delivery charge?', answer: 'Delivery is 100% free with a minimum order of ₹100.' },
        { question: 'What are the operating hours?', answer: 'We are open from 7:00 AM to 10:00 PM, 7 days a week.' },
      ],
    },
    defaultStyles: { paddingTop: 20, paddingBottom: 28 },
  },
  {
    type: 'newsletter',
    label: 'Newsletter Strip',
    icon: Zap,
    category: 'CONTENT',
    description: 'Subscription bar for discounts and WhatsApp updates',
    defaultContent: {
      title: 'Get Weekend Mandi Rates & Secret Deals',
      subtitle: 'Subscribe to receive Friday specials directly on your phone.',
      buttonText: 'Subscribe',
      placeholder: 'Enter WhatsApp or email...',
    },
    defaultStyles: { backgroundColor: '#1E293B', textColor: '#FFFFFF', paddingTop: 32, paddingBottom: 32, borderRadius: 24 },
  },
];

function VisualPageBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageId = searchParams.get('id') || 'page-home';

  const {
    pages,
    saveDraft,
    publishPage,
    updatePage,
    sections,
    createSection,
    templates,
  } = useCms();

  const currentPage = pages.find((p) => p.id === pageId) || pages[0];

  // Editor State
  const [blocks, setBlocks] = useState<CmsBlock[]>(() => {
    if (!currentPage) return DEFAULT_HOMEPAGE_BLOCKS;
    return currentPage.draftBlocks && currentPage.draftBlocks.length > 0
      ? currentPage.draftBlocks
      : currentPage.blocks;
  });

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [leftTab, setLeftTab] = useState<'ELEMENTS' | 'LAYERS' | 'TEMPLATES'>('ELEMENTS');
  const [rightTab, setRightTab] = useState<'CONTENT' | 'STYLE' | 'PAGE'>('CONTENT');
  const [elementFilter, setElementFilter] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'SAVED' | 'SAVING' | 'PUBLISHED'>('SAVED');
  const [notification, setNotification] = useState<string | null>(null);

  // Undo / Redo History
  const [history, setHistory] = useState<CmsBlock[][]>([blocks]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Sync when page changes
  useEffect(() => {
    if (currentPage) {
      const initial = currentPage.draftBlocks && currentPage.draftBlocks.length > 0
        ? currentPage.draftBlocks
        : currentPage.blocks;
      setBlocks(initial);
      setHistory([initial]);
      setHistoryIndex(0);
      setHasUnsavedChanges(false);
      if (initial.length > 0) {
        setSelectedBlockId(initial[0].id);
      }
    }
  }, [pageId, currentPage?.id]);

  // Push history on changes
  const pushState = (newBlocks: CmsBlock[]) => {
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(newBlocks);
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
    setBlocks(newBlocks);
    setHasUnsavedChanges(true);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1;
      setHistoryIndex(nextIndex);
      setBlocks(history[nextIndex]);
      setHasUnsavedChanges(true);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setBlocks(history[nextIndex]);
      setHasUnsavedChanges(true);
    }
  };

  // Add Element
  const handleAddElement = (elem: PaletteElement, insertIndex?: number) => {
    const newBlock: CmsBlock = {
      id: `block-${elem.type}-${Date.now()}`,
      type: elem.type,
      label: elem.label,
      content: JSON.parse(JSON.stringify(elem.defaultContent)),
      styles: JSON.parse(JSON.stringify(elem.defaultStyles || {})),
    };

    const nextBlocks = [...blocks];
    if (insertIndex !== undefined && insertIndex >= 0) {
      nextBlocks.splice(insertIndex + 1, 0, newBlock);
    } else {
      nextBlocks.push(newBlock);
    }

    pushState(nextBlocks);
    setSelectedBlockId(newBlock.id);
    setRightTab('CONTENT');
    notify(`Added ${elem.label} to canvas`);
  };

  // Reorder Blocks
  const handleMoveUp = (id: string) => {
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx <= 0) return;
    const next = [...blocks];
    const temp = next[idx - 1];
    next[idx - 1] = next[idx];
    next[idx] = temp;
    pushState(next);
  };

  const handleMoveDown = (id: string) => {
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx === -1 || idx >= blocks.length - 1) return;
    const next = [...blocks];
    const temp = next[idx + 1];
    next[idx + 1] = next[idx];
    next[idx] = temp;
    pushState(next);
  };

  // Duplicate Block
  const handleDuplicate = (id: string) => {
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx === -1) return;
    const original = blocks[idx];
    const copy: CmsBlock = {
      ...JSON.parse(JSON.stringify(original)),
      id: `block-${original.type}-${Date.now()}`,
    };
    const next = [...blocks];
    next.splice(idx + 1, 0, copy);
    pushState(next);
    setSelectedBlockId(copy.id);
    notify(`Duplicated ${original.label || original.type}`);
  };

  // Delete Block
  const handleDelete = (id: string) => {
    const next = blocks.filter((b) => b.id !== id);
    pushState(next);
    if (selectedBlockId === id) {
      setSelectedBlockId(next[0]?.id || null);
    }
    notify('Element removed from canvas');
  };

  // Save Draft
  const handleSaveDraft = async () => {
    if (!currentPage) return;
    setSaveStatus('SAVING');
    await saveDraft(currentPage.id, blocks);
    setHasUnsavedChanges(false);
    setSaveStatus('SAVED');
    notify('Draft saved successfully');
  };

  // Publish Page
  const handlePublish = async () => {
    if (!currentPage) return;
    setSaveStatus('SAVING');
    await saveDraft(currentPage.id, blocks);
    await publishPage(currentPage.id);
    setHasUnsavedChanges(false);
    setSaveStatus('PUBLISHED');
    notify('Page published live to storefront!');
  };

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);

  // Update selected block content
  const updateSelectedContent = (key: string, value: any) => {
    if (!selectedBlockId) return;
    const next = blocks.map((b) => {
      if (b.id === selectedBlockId) {
        return {
          ...b,
          content: { ...b.content, [key]: value },
        };
      }
      return b;
    });
    pushState(next);
  };

  // Update selected block style
  const updateSelectedStyle = (key: string, value: any) => {
    if (!selectedBlockId) return;
    const next = blocks.map((b) => {
      if (b.id === selectedBlockId) {
        return {
          ...b,
          styles: { ...b.styles, [key]: value },
        };
      }
      return b;
    });
    pushState(next);
  };

  const filteredPalette = PALETTE_ELEMENTS.filter(
    (el) =>
      el.label.toLowerCase().includes(elementFilter.toLowerCase()) ||
      el.category.toLowerCase().includes(elementFilter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xl flex items-center gap-2 border border-emerald-400 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* TOP HEADER BAR */}
      <header className="h-14 bg-slate-950 border-b border-slate-800 px-3 sm:px-6 flex items-center justify-between shrink-0 shadow-md">
        {/* Left: Back & Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/admin/builder"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Exit Visual Builder"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-white truncate">
                {currentPage?.title || 'Visual Builder'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
                /{currentPage?.slug === 'home' ? '' : currentPage?.slug}
              </span>
              {hasUnsavedChanges && (
                <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                  ● Unsaved
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400">
              {currentPage?.isHomepage ? 'Storefront Homepage Canvas' : 'Custom Page Canvas'}
            </p>
          </div>
        </div>

        {/* Center: Device Viewport Switcher & Undo/Redo */}
        <div className="hidden md:flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setDeviceMode('desktop')}
            className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
              deviceMode === 'desktop' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
            title="Desktop View (100%)"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeviceMode('tablet')}
            className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
              deviceMode === 'tablet' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
            title="Tablet View (768px)"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeviceMode('mobile')}
            className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
              deviceMode === 'mobile' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
            title="Mobile View (375px)"
          >
            <Smartphone className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-slate-800 mx-1" />

          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Preview, Save Draft & Publish */}
        <div className="flex items-center gap-2">
          <Link
            href={currentPage?.isHomepage ? '/?preview=true' : `/${currentPage?.slug}?preview=true`}
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-800 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </Link>

          <button
            type="button"
            onClick={handleSaveDraft}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={handlePublish}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-950/20 transition-all hover:scale-105 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish</span>
          </button>
        </div>
      </header>

      {/* MAIN 3-COLUMN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ================= LEFT SIDEBAR (PALETTE & TREE) ================= */}
        <aside className="w-80 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
          {/* Tabs */}
          <div className="flex border-b border-slate-800 text-xs font-bold">
            <button
              onClick={() => setLeftTab('ELEMENTS')}
              className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                leftTab === 'ELEMENTS'
                  ? 'border-emerald-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Elements
            </button>
            <button
              onClick={() => setLeftTab('LAYERS')}
              className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                leftTab === 'LAYERS'
                  ? 'border-emerald-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Layers ({blocks.length})
            </button>
            <button
              onClick={() => setLeftTab('TEMPLATES')}
              className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                leftTab === 'TEMPLATES'
                  ? 'border-emerald-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Templates
            </button>
          </div>

          {/* Tab 1: Elements Palette */}
          {leftTab === 'ELEMENTS' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-3 border-b border-slate-800/80">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search elements..."
                    value={elementFilter}
                    onChange={(e) => setElementFilter(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {['COMMERCE', 'LAYOUT', 'BASIC', 'CONTENT'].map((category) => {
                  const items = filteredPalette.filter((el) => el.category === category);
                  if (items.length === 0) return null;

                  return (
                    <div key={category} className="space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block px-1">
                        {category}
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {items.map((elem) => {
                          const Icon = elem.icon;
                          return (
                            <button
                              key={elem.type}
                              type="button"
                              onClick={() => handleAddElement(elem)}
                              className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/60 text-left transition-all group flex flex-col justify-between cursor-pointer"
                            >
                              <div className="w-8 h-8 rounded-lg bg-slate-800 group-hover:bg-emerald-600/20 text-slate-300 group-hover:text-emerald-400 flex items-center justify-center mb-2 transition-colors">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                                  {elem.label}
                                </p>
                                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                                  {elem.description}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Layers Tree */}
          {leftTab === 'LAYERS' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {blocks.map((block, index) => {
                const isSelected = block.id === selectedBlockId;
                return (
                  <div
                    key={block.id}
                    onClick={() => {
                      setSelectedBlockId(block.id);
                      setRightTab('CONTENT');
                    }}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-xs'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-bold text-slate-500 w-4">
                        {index + 1}.
                      </span>
                      <span className="text-xs font-bold truncate">
                        {block.label || block.type.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveUp(block.id);
                        }}
                        disabled={index === 0}
                        className="p-1 rounded hover:bg-slate-800 disabled:opacity-20"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveDown(block.id);
                        }}
                        disabled={index === blocks.length - 1}
                        className="p-1 rounded hover:bg-slate-800 disabled:opacity-20"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(block.id);
                        }}
                        className="p-1 rounded hover:bg-rose-900/40 text-rose-400"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 3: Templates & Sections */}
          {leftTab === 'TEMPLATES' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block px-1">
                Insert Ready-Made Templates
              </span>
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="p-3 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 hover:border-slate-700 transition-all"
                >
                  <p className="text-xs font-bold text-white">{tpl.name}</p>
                  <p className="text-[10px] text-slate-400 leading-relaxed">{tpl.description}</p>
                  <button
                    type="button"
                    onClick={() => {
                      pushState(JSON.parse(JSON.stringify(tpl.blocks)));
                      notify(`Loaded ${tpl.name}`);
                    }}
                    className="w-full py-1.5 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Replace Canvas with Template
                  </button>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* ================= CENTRAL CANVASS ================= */}
        <main className="flex-1 bg-slate-900 overflow-y-auto flex flex-col items-center p-4 sm:p-8">
          <div
            className={`w-full bg-[#F8F9FA] text-[#111827] rounded-3xl min-h-[85vh] shadow-2xl transition-all duration-300 overflow-hidden flex flex-col border border-slate-800 ${
              deviceMode === 'tablet'
                ? 'max-w-[768px]'
                : deviceMode === 'mobile'
                ? 'max-w-[375px]'
                : 'max-w-6xl'
            }`}
          >
            {/* Mock Browser Header inside canvas */}
            <div className="bg-slate-100 border-b border-slate-200/80 px-4 py-2 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                https://pravdhanstore.in/{currentPage?.slug === 'home' ? '' : currentPage?.slug}
              </span>
              <span className="text-[10px] font-bold uppercase text-slate-400">
                {deviceMode} Preview
              </span>
            </div>

            {/* Live Canvas Blocks Area */}
            <div className="p-4 sm:p-8 space-y-6 flex-1">
              {blocks.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-slate-300 rounded-3xl p-8 space-y-3">
                  <Layout className="w-10 h-10 mx-auto text-slate-400" />
                  <h4 className="text-base font-bold text-slate-700">Empty Page Canvas</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Choose any element from the left palette to add hero banners, product grids, countdown timers, or headings.
                  </p>
                </div>
              ) : (
                blocks.map((block, index) => (
                  <div key={block.id} className="relative group/drop">
                    <CmsBlockRenderer
                      block={block}
                      isEditor={true}
                      isSelected={block.id === selectedBlockId}
                      onSelect={(b) => {
                        setSelectedBlockId(b.id);
                        setRightTab('CONTENT');
                      }}
                      onMoveUp={handleMoveUp}
                      onMoveDown={handleMoveDown}
                      onDuplicate={handleDuplicate}
                      onDelete={handleDelete}
                    />

                    {/* Quick Add Insert Zone Below */}
                    <div className="h-2 group-hover/drop:h-8 transition-all flex items-center justify-center opacity-0 group-hover/drop:opacity-100 my-1">
                      <button
                        type="button"
                        onClick={() => handleAddElement(PALETTE_ELEMENTS[2], index)}
                        className="px-2.5 py-1 bg-emerald-600 text-white rounded-full text-[10px] font-bold shadow-md flex items-center gap-1 hover:scale-105 transition-transform"
                      >
                        <Plus className="w-3 h-3" /> Add Section
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>

        {/* ================= RIGHT SIDEBAR (SETTINGS & INSPECTOR) ================= */}
        <aside className="w-80 bg-slate-950 border-l border-slate-800 flex flex-col shrink-0">
          {/* Tabs */}
          <div className="flex border-b border-slate-800 text-xs font-bold">
            <button
              onClick={() => setRightTab('CONTENT')}
              className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                rightTab === 'CONTENT'
                  ? 'border-emerald-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Content
            </button>
            <button
              onClick={() => setRightTab('STYLE')}
              className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                rightTab === 'STYLE'
                  ? 'border-emerald-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Styles
            </button>
            <button
              onClick={() => setRightTab('PAGE')}
              className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                rightTab === 'PAGE'
                  ? 'border-emerald-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Page Info
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* Tab 1: Content Inspector */}
            {rightTab === 'CONTENT' && selectedBlock && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      Active Element
                    </span>
                    <h3 className="text-sm font-bold text-white capitalize">
                      {selectedBlock.type.replace(/_/g, ' ')}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedBlockId(null)}
                    className="p-1 rounded text-slate-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Heading Block Inputs */}
                {selectedBlock.type === 'heading' && (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1 font-bold">Tag Pill (Optional)</label>
                      <input
                        type="text"
                        value={selectedBlock.content.tag || ''}
                        onChange={(e) => updateSelectedContent('tag', e.target.value)}
                        placeholder="e.g. 12-MIN EXPRESS"
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 font-bold">Title Text</label>
                      <input
                        type="text"
                        value={selectedBlock.content.text || ''}
                        onChange={(e) => updateSelectedContent('text', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 font-bold">Subtitle</label>
                      <textarea
                        rows={2}
                        value={selectedBlock.content.subtext || ''}
                        onChange={(e) => updateSelectedContent('subtext', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}

                {/* Countdown Block Inputs */}
                {selectedBlock.type === 'countdown_timer' && (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1 font-bold">Headline</label>
                      <input
                        type="text"
                        value={selectedBlock.content.headline || ''}
                        onChange={(e) => updateSelectedContent('headline', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 font-bold">Coupon Code</label>
                      <input
                        type="text"
                        value={selectedBlock.content.couponCode || ''}
                        onChange={(e) => updateSelectedContent('couponCode', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 uppercase"
                      />
                    </div>
                  </div>
                )}

                {/* Product Rail Block Inputs */}
                {(selectedBlock.type === 'product_carousel' || selectedBlock.type === 'featured_products') && (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1 font-bold">Rail Title</label>
                      <input
                        type="text"
                        value={selectedBlock.content.title || ''}
                        onChange={(e) => updateSelectedContent('title', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 font-bold">Filter by Category Slug</label>
                      <select
                        value={selectedBlock.content.categorySlug || ''}
                        onChange={(e) => updateSelectedContent('categorySlug', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="">All Categories</option>
                        <option value="groceries-staples">Groceries & Staples</option>
                        <option value="fruits-vegetables">Vegetables & Fruits</option>
                        <option value="dairy-bread-eggs">Dairy & Breakfast</option>
                        <option value="snacks-munchies">Snacks & Munchies</option>
                        <option value="beverages">Beverages</option>
                        <option value="cleaning-essentials">Cleaning Essentials</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 font-bold">Max Products Limit</label>
                      <input
                        type="number"
                        value={selectedBlock.content.limit || 8}
                        onChange={(e) => updateSelectedContent('limit', Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}

                {/* Image Block Inputs */}
                {selectedBlock.type === 'image' && (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1 font-bold">Image URL</label>
                      <input
                        type="text"
                        value={selectedBlock.content.url || ''}
                        onChange={(e) => updateSelectedContent('url', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 font-bold">Alt Text (SEO)</label>
                      <input
                        type="text"
                        value={selectedBlock.content.altText || ''}
                        onChange={(e) => updateSelectedContent('altText', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Style Inspector */}
            {rightTab === 'STYLE' && selectedBlock && (
              <div className="space-y-4 text-xs">
                <div className="pb-3 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white">Visual Styling</h3>
                  <p className="text-[10px] text-slate-400">Background, padding, and borders</p>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-bold">Background Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedBlock.styles.backgroundColor || '#ffffff'}
                      onChange={(e) => updateSelectedStyle('backgroundColor', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={selectedBlock.styles.backgroundColor || ''}
                      onChange={(e) => updateSelectedStyle('backgroundColor', e.target.value)}
                      placeholder="#0F5132 or transparent"
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-bold">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedBlock.styles.textColor || '#111827'}
                      onChange={(e) => updateSelectedStyle('textColor', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={selectedBlock.styles.textColor || ''}
                      onChange={(e) => updateSelectedStyle('textColor', e.target.value)}
                      placeholder="#111827"
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-bold">Padding Top & Bottom</label>
                  <input
                    type="range"
                    min="0"
                    max="64"
                    step="4"
                    value={selectedBlock.styles.paddingTop || 16}
                    onChange={(e) => {
                      updateSelectedStyle('paddingTop', Number(e.target.value));
                      updateSelectedStyle('paddingBottom', Number(e.target.value));
                    }}
                    className="w-full accent-emerald-500"
                  />
                  <span className="text-[10px] text-slate-500 block text-right">
                    {selectedBlock.styles.paddingTop || 16}px
                  </span>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-bold">Border Radius</label>
                  <input
                    type="range"
                    min="0"
                    max="32"
                    step="4"
                    value={selectedBlock.styles.borderRadius || 16}
                    onChange={(e) => updateSelectedStyle('borderRadius', Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <span className="text-[10px] text-slate-500 block text-right">
                    {selectedBlock.styles.borderRadius || 16}px
                  </span>
                </div>
              </div>
            )}

            {/* Tab 3: Page Meta & Settings */}
            {(rightTab === 'PAGE' || !selectedBlock) && (
              <div className="space-y-4 text-xs">
                <div className="pb-3 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white">Page Settings & SEO</h3>
                  <p className="text-[10px] text-slate-400">Configure titles, slugs, and templates</p>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-bold">Page Title</label>
                  <input
                    type="text"
                    value={currentPage?.title || ''}
                    onChange={(e) => updatePage(currentPage.id, { title: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-bold">URL Slug</label>
                  <input
                    type="text"
                    disabled={currentPage?.isHomepage}
                    value={currentPage?.slug || ''}
                    onChange={(e) => updatePage(currentPage.id, { slug: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-bold">Page Template</label>
                  <select
                    value={currentPage?.template || 'DEFAULT'}
                    onChange={(e) => updatePage(currentPage.id, { template: e.target.value as any })}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="DEFAULT">Standard Layout (Max Width)</option>
                    <option value="FULL_WIDTH">Full Width (Edge-to-Edge)</option>
                    <option value="LANDING_PAGE">Landing Page (No Breadcrumbs)</option>
                    <option value="MINIMAL_HEADER_FOOTER">Minimal Header & Footer</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                    SEO Meta Tags
                  </span>
                  <div>
                    <label className="text-slate-400 block mb-1">Meta Description</label>
                    <textarea
                      rows={3}
                      value={currentPage?.seo?.metaDescription || ''}
                      onChange={(e) =>
                        updatePage(currentPage.id, {
                          seo: { ...currentPage.seo, metaDescription: e.target.value },
                        })
                      }
                      placeholder="Brief description for Google search results..."
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function VisualPageBuilder() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs font-bold">
          Loading Visual Page Builder...
        </div>
      }
    >
      <VisualPageBuilderContent />
    </Suspense>
  );
}
