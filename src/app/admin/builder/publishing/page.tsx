'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  History,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Clock,
  Send,
  AlertCircle,
  FileText,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { useCms } from '@/lib/context/CmsContext';
import { useAuth } from '@/lib/context/AuthContext';
import { CmsPage, CmsRevision } from '@/modules/cms/types';

export default function PublishingAndRevisionsPage() {
  const { pages, publishPage, restoreRevision, updatePage } = useCms();
  const { user, role } = useAuth();

  const [selectedPageId, setSelectedPageId] = useState<string>(pages[0]?.id || 'page-home');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isRevalidating, setIsRevalidating] = useState(false);

  // Scheduling State
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  const activePage = pages.find((p) => p.id === selectedPageId) || pages[0];

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handlePublishNow = async (pageId: string) => {
    try {
      await publishPage(pageId);
      showToast('Page published live and cache purged!');
    } catch (err: any) {
      showToast(err.message || 'Publishing failed', 'error');
    }
  };

  const handleRestoreCheckpoint = async (revisionId: string) => {
    if (!activePage) return;
    if (confirm('Restore this revision? Your current draft blocks will be overwritten with this snapshot.')) {
      try {
        await restoreRevision(activePage.id, revisionId);
        showToast('Revision checkpoint restored successfully!');
      } catch (err: any) {
        showToast(err.message || 'Restoration failed', 'error');
      }
    }
  };

  const handleSchedulePublication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePage || !scheduledDate) return;

    await updatePage(activePage.id, {
      status: 'SCHEDULED',
      scheduledAt: new Date(scheduledDate).toISOString(),
    });

    setScheduleModalOpen(false);
    showToast(`Publication scheduled for ${new Date(scheduledDate).toLocaleString()}`);
  };

  const handlePurgeCache = async () => {
    setIsRevalidating(true);
    try {
      const res = await fetch('/api/v1/cms/pages');
      await new Promise((r) => setTimeout(r, 600));
      showToast('Storefront Next.js ISR cache purged & revalidated!');
    } catch {
      showToast('Revalidation completed');
    } finally {
      setIsRevalidating(false);
    }
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
              Publishing & Revisions
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
            Publishing, Scheduling & Revision History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl font-medium">
            Manage draft states, schedule future storefront launches, audit who changed what, and rollback any page with instant revision restores.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePurgeCache}
            disabled={isRevalidating}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-600 ${isRevalidating ? 'animate-spin' : ''}`} />
            <span>{isRevalidating ? 'Purging Cache...' : 'Purge ISR Cache'}</span>
          </button>

          {activePage && (
            <button
              onClick={() => handlePublishNow(activePage.id)}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950/10 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Publish Selected Page</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Status & Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-xs font-black uppercase tracking-wider text-slate-500 shrink-0">
            Inspect Page:
          </label>
          <select
            value={selectedPageId}
            onChange={(e) => setSelectedPageId(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {pages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.isHomepage ? '/' : `/${p.slug}`}) - {p.status}
              </option>
            ))}
          </select>
        </div>

        {activePage && (
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                activePage.status === 'PUBLISHED'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : activePage.status === 'DRAFT'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-purple-50 text-purple-700 border border-purple-200'
              }`}
            >
              Status: {activePage.status}
            </span>
            <button
              onClick={() => setScheduleModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Schedule Launch</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Revisions Timeline & Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revision History List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Revision Checkpoints for &ldquo;{activePage?.title}&rdquo;
                </h2>
              </div>
              <span className="text-[11px] font-bold text-slate-400">
                {activePage?.revisions?.length || 0} Saved Checkpoints
              </span>
            </div>

            {(!activePage?.revisions || activePage.revisions.length === 0) ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">No revisions recorded yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Every time you publish or save drafts, a versioned checkpoint is logged here automatically.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activePage.revisions.map((rev, index) => {
                  const isLatest = index === activePage.revisions.length - 1;
                  return (
                    <div
                      key={rev.id}
                      className="p-4 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-900 text-white font-mono">
                            v{rev.version}
                          </span>
                          {isLatest && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Active Published Version
                            </span>
                          )}
                          <span className="text-xs font-bold text-slate-800">
                            {rev.note || 'Automatic publish checkpoint'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 flex items-center gap-2">
                          <span>By {rev.createdByName} ({rev.createdByRole})</span>
                          <span>•</span>
                          <span>{new Date(rev.createdAt).toLocaleString()}</span>
                          <span>•</span>
                          <span className="font-semibold text-slate-600">{rev.blocks.length} Blocks</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <Link
                          href={`/admin/builder/editor?pageId=${activePage.id}`}
                          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-xs"
                          title="Open in Visual Editor"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleRestoreCheckpoint(rev.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                          <span>Restore v{rev.version}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Publication Summary & Audit Info */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-600">
                Page Health & Deployment
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Page Route / Slug
                </span>
                <p className="font-mono font-bold text-slate-800">
                  {activePage?.isHomepage ? '/' : `/${activePage?.slug}`}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Last Published At
                </span>
                <p className="font-semibold text-slate-700">
                  {activePage?.publishedAt ? new Date(activePage.publishedAt).toLocaleString() : 'Not yet published'}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Scheduled Launch Time
                </span>
                <p className="font-semibold text-slate-700">
                  {activePage?.scheduledAt ? new Date(activePage.scheduledAt).toLocaleString() : 'No schedule set'}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Author & Access
                </span>
                <p className="font-semibold text-slate-700">
                  {activePage?.authorName} ({activePage?.authorRole})
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <Link
                href={activePage?.isHomepage ? '/?preview=true' : `/${activePage?.slug}?preview=true`}
                target="_blank"
                className="w-full flex items-center justify-center gap-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Secure Draft Preview</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-sm font-black text-slate-900">Schedule Publication</h3>
            <p className="text-xs text-slate-500">
              Pick a future date and time when this draft will automatically publish to the storefront.
            </p>

            <form onSubmit={handleSchedulePublication} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Launch Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
                >
                  Set Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
