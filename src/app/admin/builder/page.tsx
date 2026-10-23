'use client';

import React from 'react';
import Link from 'next/link';
import {
  Globe,
  Layout,
  FileText,
  Sliders,
  Palette,
  Menu as MenuIcon,
  Image as ImageIcon,
  Search,
  MessageSquare,
  ArrowRight,
  ExternalLink,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  Settings,
  RefreshCw,
  FolderTree,
} from 'lucide-react';
import { useCms } from '@/lib/context/CmsContext';
import { useAuth } from '@/lib/context/AuthContext';
import { formatDateTime } from '@/lib/utils';

export default function WebsiteBuilderDashboard() {
  const { pages, mediaItems, popups, themeSettings, headerConfig } = useCms();
  const { role } = useAuth();

  const publishedPages = pages.filter((p) => p.status === 'PUBLISHED');
  const draftPages = pages.filter((p) => p.status === 'DRAFT');

  return (
    <div className="space-y-8 max-w-full font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
              <Globe className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                  Website Builder & CMS
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  WordPress-Style Engine
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Visually customize your Next.js customer storefront, homepage rails, header, footer, global styles, and landing pages
              </p>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
          >
            <ExternalLink className="w-4 h-4 text-slate-500" />
            <span>View Live Site</span>
          </Link>
          <Link
            href="/admin/builder/pages?action=create"
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-700/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Page</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">CMS Pages</span>
            <FileText className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-3">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">
              {pages.length} Pages
            </h3>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1">
              {publishedPages.length} Published • {draftPages.length} Drafts
            </p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Homepage Status</span>
            <Layout className="w-5 h-5 text-teal-600" />
          </div>
          <div className="mt-3">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 flex items-center gap-2">
              <span>Active</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </h3>
            <p className="text-[11px] text-teal-700 font-semibold mt-1">
              Dynamic blocks schema live
            </p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Media Library</span>
            <ImageIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div className="mt-3">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">
              {mediaItems.length} Assets
            </h3>
            <p className="text-[11px] text-blue-700 font-semibold mt-1">
              Optimized web images & banners
            </p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Popups & Bar</span>
            <MessageSquare className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-3">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">
              {popups.filter((p) => p.isActive).length} Active
            </h3>
            <p className="text-[11px] text-amber-700 font-semibold mt-1">
              Top bar: {headerConfig.showAnnouncementBar ? 'ON' : 'OFF'}
            </p>
          </div>
        </div>
      </div>

      {/* Website Builder Quick Launchpad */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
          <span>Website Builder Modules</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
            14 Tools
          </span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* 1. Visual Drag-and-Drop Page Builder */}
          <Link
            href="/admin/builder/editor"
            className="p-5 rounded-2xl bg-white border border-emerald-200 hover:border-emerald-500 hover:shadow-md transition-all group flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Layout className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Visual Editor
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                Visual Page Builder
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Elementor & Gutenberg style canvas with live preview, desktop/tablet/mobile toggles, and drag-and-drop elements.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span>Open Canvas Editor</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 2. Homepage Builder */}
          <Link
            href="/admin/builder/homepage"
            className="p-5 rounded-2xl bg-white border border-teal-200 hover:border-teal-500 hover:shadow-md transition-all group flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="p-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
                  <Globe className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  Storefront Home
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-teal-700 transition-colors">
                Homepage Builder
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Customize hero banners, product rails, category grids, countdown timers, and promotional sections visually.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700">
              <span>Edit Homepage</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 3. Pages Management */}
          <Link
            href="/admin/builder/pages"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all group flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="p-2.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
                  <FileText className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {pages.length} Pages
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-slate-700 transition-colors">
                Page Manager
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Create, edit, duplicate, restore revisions, set URL slugs, and schedule publication for all store pages.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Manage All Pages</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 4. Header Builder */}
          <Link
            href="/admin/builder/header"
            className="p-5 rounded-2xl bg-white border border-blue-200 hover:border-blue-500 hover:shadow-md transition-all group flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                  <Sliders className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  Navigation
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition-colors">
                Header Builder
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Customize announcement bar, logos, search bar visibility, cart icons, and sticky navigation behavior.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700">
              <span>Customize Header</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 5. Footer Builder */}
          <Link
            href="/admin/builder/footer"
            className="p-5 rounded-2xl bg-white border border-indigo-200 hover:border-indigo-500 hover:shadow-md transition-all group flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Layers className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  4 Columns
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-700 transition-colors">
                Footer Builder
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Design multi-column layout, customer links, dark store address, social channels, and payment badges.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-700">
              <span>Customize Footer</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 6. Theme Customizer & Global Styles */}
          <Link
            href="/admin/builder/theme"
            className="p-5 rounded-2xl bg-white border border-purple-200 hover:border-purple-500 hover:shadow-md transition-all group flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="p-2.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
                  <Palette className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  Design Tokens
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-purple-700 transition-colors">
                Theme & Global Styles
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Configure primary emerald colors, typography, border radiuses, button styles, and product card ratios.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-700">
              <span>Theme Customizer</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 7. Menus & Navigation */}
          <Link
            href="/admin/builder/menus"
            className="p-5 rounded-2xl bg-white border border-amber-200 hover:border-amber-500 hover:shadow-md transition-all group flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                  <MenuIcon className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  Nav Hierarchies
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-amber-700 transition-colors">
                Menus & Navigation
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Manage Primary Nav, footer columns, nested category dropdowns, and custom URLs.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700">
              <span>Manage Menus</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 8. Media Library */}
          <Link
            href="/admin/builder/media"
            className="p-5 rounded-2xl bg-white border border-rose-200 hover:border-rose-500 hover:shadow-md transition-all group flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="p-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
                  <ImageIcon className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                  Media Vault
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-rose-700 transition-colors">
                Media Library
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Centralized storage for product banners, hero images, icons, alt tags, and copyable CDN URLs.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-rose-700">
              <span>Open Media Library</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 9. SEO & Redirects */}
          <Link
            href="/admin/builder/seo"
            className="p-5 rounded-2xl bg-white border border-cyan-200 hover:border-cyan-500 hover:shadow-md transition-all group flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="p-2.5 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-200">
                  <Search className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800">
                  SEO & 301s
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-cyan-700 transition-colors">
                SEO & Redirects
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Site-wide meta tags, sitemap configuration, Open Graph previews, and 301/302 URL redirect manager.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-cyan-700">
              <span>Manage SEO</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 10. Popups & Announcements */}
          <Link
            href="/admin/builder/popups"
            className="p-5 rounded-2xl bg-white border border-orange-200 hover:border-orange-500 hover:shadow-md transition-all group flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="p-2.5 rounded-xl bg-orange-50 text-orange-700 border border-orange-200">
                  <MessageSquare className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                  Campaigns
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-orange-700 transition-colors">
                Popups & Announcement Bars
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Configure promotional popup modals, discount coupon banners, and delay trigger rules.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-orange-700">
              <span>Configure Popups</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 11. Reusable Sections & Templates */}
          <Link
            href="/admin/builder/sections"
            className="p-5 rounded-2xl bg-white border border-emerald-200 hover:border-emerald-500 hover:shadow-md transition-all group flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <FolderTree className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Library
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                Sections & Templates
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Save pre-configured blocks as reusable components, and create full page layout templates.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span>Open Library</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 12. Publishing & Revisions */}
          <Link
            href="/admin/builder/publishing"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all group flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="p-2.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
                  <Clock className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  Audit Trail
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-slate-700 transition-colors">
                Drafts & Revisions
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Inspect published versions, restore historical checkpoints, review scheduled pages, and invalidate cache.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Revision History</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Pages Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Storefront Pages</h3>
            <p className="text-xs text-slate-500">
              Manage your landing pages, company profiles, and custom storefront routes
            </p>
          </div>
          <Link
            href="/admin/builder/pages"
            className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All ({pages.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {pages.slice(0, 6).map((page) => (
            <div
              key={page.id}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-xs sm:text-sm text-slate-900">
                    {page.title}
                  </span>
                  {page.isHomepage && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Front Page
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      page.status === 'PUBLISHED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {page.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Slug: <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">/{page.slug === 'home' ? '' : page.slug}</code> • Modified by {page.authorName} ({formatDateTime(page.updatedAt)})
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <Link
                  href={page.isHomepage ? '/' : `/${page.slug}`}
                  target="_blank"
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </Link>

                <Link
                  href={`/admin/builder/editor?id=${page.id}`}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1 transition-colors"
                >
                  <Layout className="w-3.5 h-3.5" />
                  <span>Edit in Canvas</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
