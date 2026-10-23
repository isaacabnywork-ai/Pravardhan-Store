'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Search,
  ExternalLink,
  Layout,
  Copy,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  ArrowRight,
  X,
  Globe,
  Settings,
} from 'lucide-react';
import { useCms } from '@/lib/context/CmsContext';
import { CmsPage, PageStatus, PageTemplate } from '@/modules/cms/types';
import { formatDateTime } from '@/lib/utils';

export default function PagesManagementPage() {
  const { pages, createPage, duplicatePage, deletePage, updatePage } = useCms();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | PageStatus>('ALL');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [seoModalPage, setSeoModalPage] = useState<CmsPage | null>(null);

  // New Page Form State
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newTemplate, setNewTemplate] = useState<PageTemplate>('DEFAULT');

  const filteredPages = pages.filter((page) => {
    if (statusFilter !== 'ALL' && page.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return page.title.toLowerCase().includes(q) || page.slug.toLowerCase().includes(q);
    }
    return true;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created = await createPage({
      title: newTitle.trim(),
      slug: (newSlug.trim() || newTitle.trim().toLowerCase().replace(/[^a-z0-9]/g, '-')),
      template: newTemplate,
      status: 'DRAFT',
      blocks: [
        {
          id: `block-h-${Date.now()}`,
          type: 'heading',
          label: 'Page Title',
          content: { level: 'h1', text: newTitle.trim() },
          styles: { textAlign: 'center', paddingTop: 24, paddingBottom: 16 },
        },
        {
          id: `block-t-${Date.now()}`,
          type: 'text',
          label: 'Paragraph',
          content: { text: '<p>Start editing this page in the visual builder.</p>' },
          styles: { paddingTop: 16, paddingBottom: 16 },
        },
      ],
    });

    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewSlug('');
  };

  const handleDuplicate = async (id: string) => {
    await duplicatePage(id);
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      await deletePage(id);
    }
  };

  const handleSaveSeo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seoModalPage) return;
    await updatePage(seoModalPage.id, { seo: seoModalPage.seo });
    setSeoModalPage(null);
  };

  return (
    <div className="space-y-8 max-w-full font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="p-2 rounded-xl bg-slate-900 text-white shadow-xs">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                  Page Management
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                  {pages.length} Pages
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Create, customize, schedule, and publish landing pages with custom URLs and SEO metadata
              </p>
            </div>
          </div>
        </div>

        {/* Create Action */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-700/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Page</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200/80 overflow-x-auto">
          {[
            { key: 'ALL', label: `All (${pages.length})` },
            { key: 'PUBLISHED', label: `Published (${pages.filter((p) => p.status === 'PUBLISHED').length})` },
            { key: 'DRAFT', label: `Drafts (${pages.filter((p) => p.status === 'DRAFT').length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === tab.key
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search pages by title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 pl-8 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Pages Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-4">Page Title & Slug</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Template</th>
                <th className="py-3 px-4">Revisions</th>
                <th className="py-3 px-4">Last Updated</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredPages.map((page) => (
                <tr key={page.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        {page.title}
                      </span>
                      {page.isHomepage && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Homepage
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      /{page.slug === 'home' ? '' : page.slug}
                    </p>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        page.status === 'PUBLISHED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          page.status === 'PUBLISHED' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      />
                      {page.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-semibold">
                      {page.template.replace(/_/g, ' ')}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{page.revisions.length} revs</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-500">
                    <p>{formatDateTime(page.updatedAt)}</p>
                    <p className="text-[10px] text-slate-400">By {page.authorName}</p>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={page.isHomepage ? '/' : `/${page.slug}`}
                        target="_blank"
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="View Live Page"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => setSeoModalPage(page)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit SEO"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDuplicate(page.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Duplicate Page"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {!page.isHomepage && (
                        <button
                          type="button"
                          onClick={() => handleDelete(page.id, page.title)}
                          className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Page"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <Link
                        href={`/admin/builder/editor?id=${page.id}`}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1 transition-colors"
                      >
                        <Layout className="w-3 h-3" />
                        <span>Edit</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE PAGE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Create New Store Page</h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-700 block font-bold mb-1">Page Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bulk Corporate Orders"
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    if (!newSlug) {
                      setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">URL Slug</label>
                <div className="flex items-center rounded-xl border border-slate-300 overflow-hidden px-3 bg-slate-50">
                  <span className="text-slate-400 font-mono">/</span>
                  <input
                    type="text"
                    placeholder="bulk-orders"
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-'))}
                    className="w-full py-2 px-1 bg-transparent focus:outline-none font-mono text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">Layout Template</label>
                <select
                  value={newTemplate}
                  onChange={(e) => setNewTemplate(e.target.value as PageTemplate)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="DEFAULT">Standard Layout (Max Width Container)</option>
                  <option value="FULL_WIDTH">Full Width (Edge-to-Edge)</option>
                  <option value="LANDING_PAGE">Landing Page (No Breadcrumbs)</option>
                  <option value="MINIMAL_HEADER_FOOTER">Minimal Header & Footer</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs transition-colors"
                >
                  Create & Launch Editor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SEO QUICK SETTINGS MODAL */}
      {seoModalPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">SEO Settings for {seoModalPage.title}</h3>
                <p className="text-xs text-slate-500">Google search preview & meta tags</p>
              </div>
              <button
                type="button"
                onClick={() => setSeoModalPage(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSeo} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-700 block font-bold mb-1">Meta Title</label>
                <input
                  type="text"
                  value={seoModalPage.seo?.metaTitle || ''}
                  onChange={(e) =>
                    setSeoModalPage({
                      ...seoModalPage,
                      seo: { ...seoModalPage.seo, metaTitle: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">Meta Description</label>
                <textarea
                  rows={3}
                  value={seoModalPage.seo?.metaDescription || ''}
                  onChange={(e) =>
                    setSeoModalPage({
                      ...seoModalPage,
                      seo: { ...seoModalPage.seo, metaDescription: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">Robots Directives</label>
                <select
                  value={seoModalPage.seo?.robotsDirectives || 'index,follow'}
                  onChange={(e) =>
                    setSeoModalPage({
                      ...seoModalPage,
                      seo: { ...seoModalPage.seo, robotsDirectives: e.target.value as any },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="index,follow">Index, Follow (Standard Google Indexing)</option>
                  <option value="noindex,follow">No-Index, Follow (Hidden from search engines)</option>
                  <option value="noindex,nofollow">No-Index, No-Follow (Private landing)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSeoModalPage(null)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs"
                >
                  Save SEO Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
