'use client';

import React from 'react';
import Link from 'next/link';
import {
  Layout,
  Globe,
  ArrowRight,
  ExternalLink,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Copy,
  CheckCircle2,
  Send,
  Eye,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { useCms } from '@/lib/context/CmsContext';

export default function HomepageBuilderPage() {
  const { pages, saveDraft, publishPage } = useCms();
  const homePage = pages.find((p) => p.isHomepage || p.slug === 'home') || pages[0];

  const blocks = homePage?.draftBlocks && homePage.draftBlocks.length > 0
    ? homePage.draftBlocks
    : homePage?.blocks || [];

  return (
    <div className="space-y-8 max-w-full font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="p-2 rounded-xl bg-teal-600 text-white shadow-xs">
              <Globe className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                  Homepage Section Builder
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
                  Storefront Front Page
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Organize, reorder, and configure high-converting rails, deals countdowns, and category aisles on your main storefront
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
            <span>View Live Home</span>
          </Link>
          <Link
            href="/admin/builder/editor?id=page-home"
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-teal-600/20 flex items-center gap-1.5 transition-all"
          >
            <Layout className="w-4 h-4" />
            <span>Open in Visual Canvas</span>
          </Link>
        </div>
      </div>

      {/* Hero Overview Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-3xl p-6 text-white shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-300">
            Live Storefront Telemetry
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {blocks.length} Configured Sections on Homepage
          </h2>
          <p className="text-xs text-slate-300">
            Powered by real backend products and category inventory. Changes sync immediately upon publishing.
          </p>
        </div>
        <Link
          href="/admin/builder/editor?id=page-home"
          className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-2xl text-xs flex items-center gap-2 shadow-lg transition-transform hover:scale-105 self-start md:self-auto"
        >
          <span>Launch Drag-and-Drop Editor</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Sections Sequence List */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Current Homepage Section Sequence</h3>
            <p className="text-xs text-slate-500">
              The exact top-to-bottom layout seen by customers visiting your website
            </p>
          </div>
          <Link
            href="/admin/builder/editor?id=page-home"
            className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1"
          >
            <span>Add or Reorder Sections</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-2.5">
          {blocks.map((block, index) => (
            <div
              key={block.id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/80 transition-colors flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {index + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs sm:text-sm font-bold text-slate-900">
                      {block.label || block.type.replace(/_/g, ' ')}
                    </p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 uppercase">
                      {block.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    {block.content?.title || block.content?.headline || block.content?.text || 'Section content configured'}
                  </p>
                </div>
              </div>

              <Link
                href={`/admin/builder/editor?id=page-home`}
                className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-white text-xs font-bold text-slate-700 transition-colors shrink-0"
              >
                Configure
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
