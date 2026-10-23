'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Menu as MenuIcon,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Save,
  ExternalLink,
  ChevronRight,
  FolderTree,
} from 'lucide-react';
import { useCms } from '@/lib/context/CmsContext';
import { useStore } from '@/lib/context/StoreContext';
import { CmsMenuItem } from '@/modules/cms/types';

export default function MenusManagerPage() {
  const { menus, updateMenu, pages } = useCms();
  const { categories } = useStore();
  const [selectedMenuId, setSelectedMenuId] = useState<string>(menus[0]?.id || 'menu-primary');
  const [saveToast, setSaveToast] = useState(false);

  const activeMenu = menus.find((m) => m.id === selectedMenuId) || menus[0];
  const [items, setItems] = useState<CmsMenuItem[]>(activeMenu?.items || []);

  // Sync when menu selection changes
  React.useEffect(() => {
    if (activeMenu) {
      setItems(activeMenu.items);
    }
  }, [selectedMenuId, activeMenu]);

  // New Item State
  const [newLabel, setNewLabel] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newBadge, setNewBadge] = useState('');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel || !newUrl) return;

    const newItem: CmsMenuItem = {
      id: `item-${Date.now()}`,
      label: newLabel,
      url: newUrl,
      badge: newBadge.trim() ? newBadge.trim() : undefined,
    };

    const next = [...items, newItem];
    setItems(next);
    setNewLabel('');
    setNewUrl('');
    setNewBadge('');
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const next = [...items];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    setItems(next);
  };

  const handleMoveDown = (index: number) => {
    if (index >= items.length - 1) return;
    const next = [...items];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    setItems(next);
  };

  const handleDelete = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const handleSaveMenu = async () => {
    if (!activeMenu) return;
    await updateMenu(activeMenu.id, items);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-full font-sans">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-500/40 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Menu saved & updated across storefront!</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
              <MenuIcon className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                  Navigation Menus Manager
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Site Navigation
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Configure primary desktop menu, mobile drawer items, and footer category navigation
              </p>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveMenu}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-sm shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Menu</span>
          </button>
        </div>
      </div>

      {/* Menu Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <span className="text-xs font-bold text-slate-400 mr-2 shrink-0">Select Menu:</span>
        {menus.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedMenuId(m.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedMenuId === m.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {m.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Items Hierarchy */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Menu Structure: {activeMenu?.name}
              </h3>
              <p className="text-xs text-slate-500">
                Drag, reorder, or edit links in this navigation menu
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                    {index + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{item.label}</span>
                      {item.badge && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">{item.url}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-white disabled:opacity-30"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === items.length - 1}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-white disabled:opacity-30"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg border border-slate-200 text-rose-500 hover:bg-rose-50"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Add New Item */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Add Menu Item</h3>
            <p className="text-xs text-slate-500">Insert custom URLs or link to pages</p>
          </div>

          <form onSubmit={handleAddItem} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-700 font-bold block mb-1">Navigation Label *</label>
              <input
                type="text"
                required
                placeholder="e.g. Flash Deals"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">Target URL *</label>
              <input
                type="text"
                required
                placeholder="e.g. /deals or /shop?category=fruits-vegetables"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">Pill Badge (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Hot or 20% Off"
                value={newBadge}
                onChange={(e) => setNewBadge(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
            >
              Add to Menu
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
