'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Image as ImageIcon,
  Upload,
  Search,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Filter,
  Eye,
  X,
  FileText,
  FolderOpen,
  Sparkles,
} from 'lucide-react';
import { useCms } from '@/lib/context/CmsContext';
import { CmsMediaItem } from '@/modules/cms/types';

export default function MediaLibraryPage() {
  const { mediaItems, addMedia, deleteMedia } = useCms();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'IMAGE' | 'SVG' | 'OTHER'>('ALL');
  const [selectedMedia, setSelectedMedia] = useState<CmsMediaItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // New Upload Form State
  const [newUrl, setNewUrl] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [newAltText, setNewAltText] = useState('');

  const filteredMedia = mediaItems.filter((item) => {
    const matchesSearch =
      item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.altText.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterType === 'IMAGE') return item.mimeType.startsWith('image/') && !item.mimeType.includes('svg');
    if (filterType === 'SVG') return item.mimeType.includes('svg');
    return true;
  });

  const handleCopyUrl = (item: CmsMediaItem) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      const newItem = await addMedia({
        fileName: file.name,
        url: dataUrl,
        size: file.size,
        mimeType: file.type || 'image/jpeg',
        altText: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        width: 800,
        height: 600,
      });
      setSelectedMedia(newItem);
    };
    reader.readAsDataURL(file);
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;

    setIsUploading(true);
    const fileName = newFileName.trim() || newUrl.split('/').pop()?.split('?')[0] || 'media-asset.jpg';
    const altText = newAltText.trim() || fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

    const item = await addMedia({
      fileName,
      url: newUrl,
      size: 154200,
      mimeType: newUrl.endsWith('.svg') ? 'image/svg+xml' : 'image/jpeg',
      altText,
      width: 1200,
      height: 800,
    });

    setIsUploading(false);
    setUploadModalOpen(false);
    setNewUrl('');
    setNewFileName('');
    setNewAltText('');
    setSelectedMedia(item);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this media item? Pages using this URL will show a broken image.')) {
      await deleteMedia(id);
      if (selectedMedia?.id === id) {
        setSelectedMedia(null);
      }
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8 max-w-full font-sans">
      {/* Top Breadcrumb & Header */}
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
              Media Library
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
            Centralized Media Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl font-medium">
            Manage high-resolution banners, product photos, icons, and vector graphics used across the storefront, visual builder, and promotional popups.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950/10 cursor-pointer transition-colors">
            <Upload className="w-4 h-4" />
            <span>Upload Device File</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Add via URL</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by filename or alt text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {[
            { id: 'ALL', label: 'All Media' },
            { id: 'IMAGE', label: 'Photos / JPEGs' },
            { id: 'SVG', label: 'SVGs / Logos' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                filterType === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid & Inspector Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Media Grid */}
        <div className="lg:col-span-2">
          {filteredMedia.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <FolderOpen className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-700">No media assets found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No images matched your search criteria. Try a different query or upload a new asset.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {filteredMedia.map((item) => {
                const isSelected = selectedMedia?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedMedia(item)}
                    className={`group relative bg-white rounded-xl border overflow-hidden cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                        : 'border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="aspect-square relative bg-slate-50 overflow-hidden flex items-center justify-center">
                      {item.url.startsWith('data:') || item.url.startsWith('http') || item.url.startsWith('/') ? (
                        <img
                          src={item.url}
                          alt={item.altText || item.fileName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-slate-300" />
                      )}
                      <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyUrl(item);
                          }}
                          className="p-1.5 bg-white/90 rounded-lg text-slate-800 hover:bg-white text-xs shadow-xs"
                          title="Copy direct URL"
                        >
                          {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMedia(item);
                          }}
                          className="p-1.5 bg-white/90 rounded-lg text-slate-800 hover:bg-white text-xs shadow-xs"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="p-2 border-t border-slate-100 bg-white">
                      <p className="text-[11px] font-bold text-slate-800 truncate" title={item.fileName}>
                        {item.fileName}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {formatBytes(item.size)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Media Inspector Drawer */}
        <div className="lg:col-span-1">
          {selectedMedia ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs sticky top-20 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Asset Details
                </h3>
                <button
                  onClick={() => setSelectedMedia(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Large Preview */}
              <div className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50 aspect-video flex items-center justify-center p-2 relative">
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.altText}
                  className="max-h-full max-w-full object-contain rounded-lg"
                />
              </div>

              {/* Attributes */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    File Name
                  </label>
                  <p className="font-semibold text-slate-800 break-all bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {selectedMedia.fileName}
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Direct Asset URL
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={selectedMedia.url}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 font-mono select-all truncate"
                    />
                    <button
                      onClick={() => handleCopyUrl(selectedMedia)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 shrink-0"
                      title="Copy URL"
                    >
                      {copiedId === selectedMedia.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block">File Size:</span>
                    <span className="font-bold text-slate-700">{formatBytes(selectedMedia.size)}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block">MIME Type:</span>
                    <span className="font-bold text-slate-700 truncate block">{selectedMedia.mimeType}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Alt Text (Accessibility & SEO)
                  </label>
                  <p className="font-medium text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100 text-xs">
                    {selectedMedia.altText || 'No descriptive alt text set.'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <a
                  href={selectedMedia.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Full Image</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleDelete(selectedMedia.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400">
              <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-semibold">Select an asset from the library to inspect dimensions, copy URL, or delete.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add via URL Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-sm">Add Media via Web URL</h3>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualAdd} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Image Source URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Friendly File Name
                </label>
                <input
                  type="text"
                  placeholder="fresh-fruits-hero.jpg"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Alt Text (for SEO & Screen Readers)
                </label>
                <input
                  type="text"
                  placeholder="Assorted farm-fresh organic mangoes and bananas"
                  value={newAltText}
                  onChange={(e) => setNewAltText(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
                >
                  {isUploading ? 'Registering...' : 'Add to Media Library'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
