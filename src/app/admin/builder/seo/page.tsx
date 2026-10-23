'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Globe,
  Share2,
  ArrowRight,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Save,
  FileCode,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useCms } from '@/lib/context/CmsContext';
import { CmsRedirect } from '@/modules/cms/types';

export default function SeoManagerPage() {
  const { pages, updatePage, redirects, createRedirect, deleteRedirect } = useCms();
  const [selectedPageId, setSelectedPageId] = useState<string>(pages[0]?.id || 'page-home');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Active Selected Page for SEO
  const activePage = pages.find((p) => p.id === selectedPageId) || pages[0];

  // Editable SEO state
  const [metaTitle, setMetaTitle] = useState(activePage?.seo?.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(activePage?.seo?.metaDescription || '');
  const [ogImage, setOgImage] = useState(activePage?.seo?.ogImage || '');
  const [canonicalUrl, setCanonicalUrl] = useState(activePage?.seo?.canonicalUrl || '');
  const [robotsDirectives, setRobotsDirectives] = useState<'index,follow' | 'noindex,follow' | 'noindex,nofollow'>(
    activePage?.seo?.robotsDirectives || 'index,follow'
  );
  const [structuredDataType, setStructuredDataType] = useState<any>(
    activePage?.seo?.structuredDataType || 'WebPage'
  );

  // New Redirect Form
  const [fromPath, setFromPath] = useState('');
  const [toPath, setToPath] = useState('');
  const [statusCode, setStatusCode] = useState<301 | 302>(301);

  React.useEffect(() => {
    if (activePage) {
      setMetaTitle(activePage.seo?.metaTitle || activePage.title);
      setMetaDescription(activePage.seo?.metaDescription || '');
      setOgImage(activePage.seo?.ogImage || '');
      setCanonicalUrl(activePage.seo?.canonicalUrl || `https://pravdhanstore.com/${activePage.slug === 'home' ? '' : activePage.slug}`);
      setRobotsDirectives(activePage.seo?.robotsDirectives || 'index,follow');
      setStructuredDataType(activePage.seo?.structuredDataType || 'WebPage');
    }
  }, [selectedPageId, activePage]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveSeo = async () => {
    if (!activePage) return;
    await updatePage(activePage.id, {
      seo: {
        metaTitle,
        metaDescription,
        ogImage,
        canonicalUrl,
        robotsDirectives,
        structuredDataType,
      },
    });
    showToast('Page SEO metadata saved successfully!');
  };

  const handleAddRedirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromPath || !toPath) return;

    const formattedFrom = fromPath.startsWith('/') ? fromPath : `/${fromPath}`;
    const formattedTo = toPath.startsWith('/') || toPath.startsWith('http') ? toPath : `/${toPath}`;

    await createRedirect(formattedFrom, formattedTo, statusCode);
    setFromPath('');
    setToPath('');
    showToast(`Redirect from ${formattedFrom} created!`);
  };

  const handleDeleteRedirect = async (id: string) => {
    await deleteRedirect(id);
    showToast('Redirect removed');
  };

  return (
    <div className="space-y-8 max-w-full font-sans">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border text-xs font-bold animate-in fade-in slide-in-from-bottom-2 ${
            toast.type === 'success'
              ? 'bg-slate-900 text-white border-emerald-500/40'
              : 'bg-rose-900 text-white border-rose-500/40'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href="/admin/builder"
              className="text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors"
            >
              CMS Overview
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              SEO & Redirects
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
            SEO & URL Redirect Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl font-medium">
            Fine-tune search engine meta titles, descriptions, OpenGraph social sharing snippets, robots crawling directives, and 301/302 redirects for all pages.
          </p>
        </div>

        <button
          onClick={handleSaveSeo}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950/10 transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>Save Page SEO</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Page Selection & SEO Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Page Picker */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 shrink-0">
              Target Page:
            </label>
            <select
              value={selectedPageId}
              onChange={(e) => setSelectedPageId(e.target.value)}
              className="w-full sm:w-auto flex-1 max-w-md px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {pages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.isHomepage ? '/' : `/${p.slug}`}) - {p.status}
                </option>
              ))}
            </select>
          </div>

          {/* Metadata Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Globe className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Search Metadata
              </h2>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">SEO Meta Title</label>
                  <span className={`text-[11px] font-semibold ${metaTitle.length > 60 ? 'text-amber-600' : 'text-slate-400'}`}>
                    {metaTitle.length} / 60 chars recommended
                  </span>
                </div>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Pravdhan Store | 10-Min Grocery & Daily Staples"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Meta Description</label>
                  <span className={`text-[11px] font-semibold ${metaDescription.length > 160 ? 'text-amber-600' : 'text-slate-400'}`}>
                    {metaDescription.length} / 160 chars recommended
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Order fresh vegetables, fruits, dairy, snacks, and household essentials in 10 minutes at best prices."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Canonical URL</label>
                  <input
                    type="url"
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    placeholder="https://pravdhanstore.com/about-us"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Robots Crawling Directive</label>
                  <select
                    value={robotsDirectives}
                    onChange={(e) => setRobotsDirectives(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="index,follow">Index, Follow (Recommended)</option>
                    <option value="noindex,follow">No-Index, Follow</option>
                    <option value="noindex,nofollow">No-Index, No-Follow (Private)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">OpenGraph Share Image URL</label>
                  <input
                    type="text"
                    value={ogImage}
                    onChange={(e) => setOgImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Schema.org Structured Data</label>
                  <select
                    value={structuredDataType}
                    onChange={(e) => setStructuredDataType(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="WebPage">WebPage Schema</option>
                    <option value="FAQPage">FAQPage Schema</option>
                    <option value="AboutPage">AboutPage Schema</option>
                    <option value="ContactPage">ContactPage Schema</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* URL Redirects Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  301 / 302 URL Redirects
                </h2>
              </div>
              <span className="text-[10px] font-bold text-slate-400">
                {redirects.length} Active Redirects
              </span>
            </div>

            {/* Add New Redirect Form */}
            <form onSubmit={handleAddRedirect} className="bg-slate-50 p-4 rounded-xl border border-slate-200/90 space-y-3">
              <p className="text-xs font-bold text-slate-700">Add New URL Redirect</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                    From Path (Old)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="/old-summer-offers"
                    value={fromPath}
                    onChange={(e) => setFromPath(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                    To Path (New Destination)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="/summer-sale"
                    value={toPath}
                    onChange={(e) => setToPath(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                    Redirect Code
                  </label>
                  <select
                    value={statusCode}
                    onChange={(e) => setStatusCode(Number(e.target.value) as 301 | 302)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value={301}>301 Permanent</option>
                    <option value={302}>302 Temporary</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Redirect</span>
                </button>
              </div>
            </form>

            {/* List of Redirects */}
            <div className="space-y-2">
              {redirects.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No redirects registered yet.</p>
              ) : (
                redirects.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 text-xs transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-slate-700">{r.fromPath}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono font-bold text-emerald-600">{r.toPath}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {r.statusCode}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteRedirect(r.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete redirect"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Previews */}
        <div className="space-y-6">
          {/* Google Search Result Preview */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Search className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-600">
                Google SERP Preview
              </h3>
            </div>

            <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1.5 font-sans">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[9px]">
                  P
                </span>
                <span className="truncate">https://pravdhanstore.com › {activePage?.slug}</span>
              </div>
              <h4 className="text-sm font-bold text-blue-700 hover:underline cursor-pointer leading-snug">
                {metaTitle || activePage?.title || 'Pravdhan Store'}
              </h4>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {metaDescription ||
                  'Shop farm-fresh groceries, daily pantry essentials, dairy, and household items delivered right to your doorstep in 10 minutes.'}
              </p>
            </div>
            <p className="text-[10px] text-slate-400">
              Live visual simulation of your snippet on Google Search desktop and mobile browsers.
            </p>
          </div>

          {/* Social Share (OpenGraph) Preview */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Share2 className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-600">
                Social Card Preview (OG)
              </h3>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-xs">
              <div className="aspect-video relative bg-slate-100 overflow-hidden flex items-center justify-center">
                {ogImage ? (
                  <img src={ogImage} alt="OG Card" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <Globe className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                    <span className="text-[11px] text-slate-400 font-semibold">No OG Image defined</span>
                  </div>
                )}
              </div>
              <div className="p-3 bg-slate-50/50 space-y-1 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  pravdhanstore.com
                </span>
                <p className="text-xs font-bold text-slate-800 line-clamp-1">
                  {metaTitle || activePage?.title}
                </p>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  {metaDescription || 'Quick-commerce grocery deliveries at best prices.'}
                </p>
              </div>
            </div>
          </div>

          {/* Sitemap & Robots Status */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-600">
                Indexing Diagnostics
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 font-semibold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Sitemap XML
                </span>
                <span className="text-[11px] font-bold">Dynamic (Active)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 font-semibold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Robots.txt
                </span>
                <span className="text-[11px] font-bold">Allowed</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-slate-700 border border-slate-100 font-medium">
                <span>Total Indexable Pages</span>
                <span className="font-bold text-slate-900">{pages.filter((p) => p.status === 'PUBLISHED').length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
