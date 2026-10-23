'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Boxes,
  Layout,
  Plus,
  Trash2,
  Copy,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Layers,
  ArrowRight,
  Sparkles,
  Eye,
  FileText,
} from 'lucide-react';
import { useCms } from '@/lib/context/CmsContext';
import { CmsReusableSection, CmsTemplate } from '@/modules/cms/types';

export default function SectionsAndTemplatesPage() {
  const router = useRouter();
  const { sections, templates, deleteSection, createSection, createPage } = useCms();
  const [activeTab, setActiveTab] = useState<'TEMPLATES' | 'SECTIONS'>('TEMPLATES');
  const [selectedTemplate, setSelectedTemplate] = useState<CmsTemplate | null>(templates[0] || null);
  const [toast, setToast] = useState<string | null>(null);

  // New Section State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Marketing');
  const [newBlockType, setNewBlockType] = useState('promotional_banner');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreatePageFromTemplate = async (template: CmsTemplate) => {
    const newPageSlug = `${template.category.toLowerCase()}-${Date.now().toString().slice(-4)}`;
    const newPage = await createPage({
      title: `${template.name} (Copy)`,
      slug: newPageSlug,
      template: 'FULL_WIDTH',
      status: 'DRAFT',
      blocks: template.blocks,
      draftBlocks: template.blocks,
      seo: {
        metaTitle: `${template.name} - Pravdhan Store`,
        metaDescription: template.description,
      },
    });

    showToast(`Page created from template! Redirecting to Visual Editor...`);
    setTimeout(() => {
      router.push(`/admin/builder/editor?pageId=${newPage.id}`);
    }, 1200);
  };

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await createSection(newTitle.trim(), newCategory, {
      id: `block-${Date.now()}`,
      type: newBlockType as any,
      label: newTitle.trim(),
      content: {
        title: newTitle.trim(),
        subtitle: 'Reusable section ready to insert into any storefront page',
      },
      styles: {
        paddingTop: 48,
        paddingBottom: 48,
        backgroundColor: '#ffffff',
      },
    });

    setIsCreateOpen(false);
    setNewTitle('');
    showToast('Reusable section created!');
  };

  const handleDeleteSection = async (id: string) => {
    if (confirm('Are you sure you want to delete this reusable section?')) {
      await deleteSection(id);
      showToast('Reusable section deleted');
    }
  };

  return (
    <div className="space-y-8 max-w-full font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-500/40 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
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
              Templates & Reusable Sections
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
            Reusable Sections & Page Templates
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl font-medium">
            Jumpstart landing pages with ready-to-use storefront templates, or assemble consistent design systems using modular reusable sections.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950/10 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Reusable Section</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('TEMPLATES')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'TEMPLATES'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layout className="w-4 h-4 text-emerald-400" />
          <span>Full Page Templates ({templates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('SECTIONS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'SECTIONS'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Boxes className="w-4 h-4 text-emerald-400" />
          <span>Modular Reusable Sections ({sections.length})</span>
        </button>
      </div>

      {/* Content depending on Active Tab */}
      {activeTab === 'TEMPLATES' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="aspect-video relative bg-slate-100 overflow-hidden">
                  <img
                    src={tpl.previewImage}
                    alt={tpl.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full">
                    {tpl.category}
                  </span>
                  <span className="absolute bottom-3 right-3 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {tpl.blocks.length} Blocks Included
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="font-black text-slate-900 text-base">{tpl.name}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{tpl.description}</p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-slate-400">
                  Ready to deploy
                </span>
                <button
                  type="button"
                  onClick={() => handleCreatePageFromTemplate(tpl)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Use Template</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((sec) => (
              <div
                key={sec.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                      {sec.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Type: {sec.block.type}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mt-3">{sec.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Created on {new Date(sec.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Synchronized Section
                  </span>
                  <button
                    onClick={() => handleDeleteSection(sec.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete section"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Reusable Section Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-sm font-black text-slate-900">Create New Reusable Section</h3>
            <form onSubmit={handleCreateSection} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Section Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 10-Minute Fast Delivery Guarantee"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Marketing">Marketing / Banners</option>
                  <option value="Storefront">Storefront / Products</option>
                  <option value="Social Proof">Social Proof / Reviews</option>
                  <option value="Support">Support / FAQ</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Base Block Type
                </label>
                <select
                  value={newBlockType}
                  onChange={(e) => setNewBlockType(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="promotional_banner">Promotional Banner</option>
                  <option value="hero_banner">Hero Banner</option>
                  <option value="testimonials">Testimonials Carousel</option>
                  <option value="faqs">FAQs Accordion</option>
                  <option value="newsletter">Newsletter Form</option>
                  <option value="countdown_timer">Countdown Timer</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
                >
                  Save Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
