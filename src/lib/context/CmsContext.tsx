'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CmsPage,
  CmsBlock,
  CmsThemeSettings,
  CmsHeaderConfig,
  CmsFooterConfig,
  CmsMenu,
  CmsMediaItem,
  CmsPopupConfig,
  CmsReusableSection,
  CmsTemplate,
  CmsWebsiteSettings,
  CmsRedirect,
  CmsMenuItem,
} from '@/modules/cms/types';
import {
  DEFAULT_PAGES,
  DEFAULT_THEME_SETTINGS,
  DEFAULT_HEADER_CONFIG,
  DEFAULT_FOOTER_CONFIG,
  DEFAULT_MENUS,
  DEFAULT_MEDIA_ITEMS,
  DEFAULT_POPUP,
  DEFAULT_REUSABLE_SECTIONS,
  DEFAULT_TEMPLATES,
  DEFAULT_WEBSITE_SETTINGS,
} from '@/modules/cms/default-data';
import { useAuth } from './AuthContext';

interface CmsContextType {
  pages: CmsPage[];
  themeSettings: CmsThemeSettings;
  headerConfig: CmsHeaderConfig;
  footerConfig: CmsFooterConfig;
  menus: CmsMenu[];
  mediaItems: CmsMediaItem[];
  popups: CmsPopupConfig[];
  sections: CmsReusableSection[];
  templates: CmsTemplate[];
  redirects: CmsRedirect[];
  websiteSettings: CmsWebsiteSettings;
  activePreviewDevice: 'desktop' | 'tablet' | 'mobile';
  setActivePreviewDevice: (device: 'desktop' | 'tablet' | 'mobile') => void;
  isDraftMode: boolean;
  setIsDraftMode: (val: boolean) => void;
  // Methods
  getPageBySlug: (slug: string) => CmsPage | undefined;
  getPageById: (id: string) => CmsPage | undefined;
  createPage: (page: Partial<CmsPage>) => Promise<CmsPage>;
  updatePage: (id: string, updates: Partial<CmsPage>) => Promise<CmsPage>;
  saveDraft: (id: string, blocks: CmsBlock[]) => Promise<void>;
  publishPage: (id: string) => Promise<void>;
  restoreRevision: (pageId: string, revisionId: string) => Promise<void>;
  duplicatePage: (id: string) => Promise<CmsPage>;
  deletePage: (id: string) => Promise<boolean>;
  updateTheme: (updates: Partial<CmsThemeSettings>) => Promise<void>;
  updateHeader: (updates: Partial<CmsHeaderConfig>) => Promise<void>;
  updateFooter: (updates: Partial<CmsFooterConfig>) => Promise<void>;
  updateMenu: (id: string, items: CmsMenuItem[]) => Promise<void>;
  addMedia: (item: Omit<CmsMediaItem, 'id' | 'uploadedAt'>) => Promise<CmsMediaItem>;
  deleteMedia: (id: string) => Promise<void>;
  createSection: (title: string, category: string, block: CmsBlock) => Promise<CmsReusableSection>;
  deleteSection: (id: string) => Promise<void>;
  updatePopup: (id: string, updates: Partial<CmsPopupConfig>) => Promise<void>;
  createRedirect: (fromPath: string, toPath: string, statusCode: 301 | 302) => Promise<void>;
  deleteRedirect: (id: string) => Promise<void>;
  updateWebsiteSettings: (updates: Partial<CmsWebsiteSettings>) => Promise<void>;
}

const CmsContext = createContext<CmsContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PAGES: 'pravdhan_cms_pages_v1',
  THEME: 'pravdhan_cms_theme_v1',
  HEADER: 'pravdhan_cms_header_v1',
  FOOTER: 'pravdhan_cms_footer_v1',
  MENUS: 'pravdhan_cms_menus_v1',
  MEDIA: 'pravdhan_cms_media_v1',
  POPUPS: 'pravdhan_cms_popups_v1',
  SECTIONS: 'pravdhan_cms_sections_v1',
  REDIRECTS: 'pravdhan_cms_redirects_v1',
  SETTINGS: 'pravdhan_cms_settings_v1',
};

export function CmsProvider({ children }: { children: React.ReactNode }) {
  const { user, role } = useAuth();

  const [pages, setPages] = useState<CmsPage[]>(DEFAULT_PAGES);
  const [themeSettings, setThemeSettings] = useState<CmsThemeSettings>(DEFAULT_THEME_SETTINGS);
  const [headerConfig, setHeaderConfig] = useState<CmsHeaderConfig>(DEFAULT_HEADER_CONFIG);
  const [footerConfig, setFooterConfig] = useState<CmsFooterConfig>(DEFAULT_FOOTER_CONFIG);
  const [menus, setMenus] = useState<CmsMenu[]>(DEFAULT_MENUS);
  const [mediaItems, setMediaItems] = useState<CmsMediaItem[]>(DEFAULT_MEDIA_ITEMS);
  const [popups, setPopups] = useState<CmsPopupConfig[]>([DEFAULT_POPUP]);
  const [sections, setSections] = useState<CmsReusableSection[]>(DEFAULT_REUSABLE_SECTIONS);
  const [templates] = useState<CmsTemplate[]>(DEFAULT_TEMPLATES);
  const [websiteSettings, setWebsiteSettings] = useState<CmsWebsiteSettings>(DEFAULT_WEBSITE_SETTINGS);
  const [redirects, setRedirects] = useState<CmsRedirect[]>([
    {
      id: 'redir-1',
      fromPath: '/fresh',
      toPath: '/shop?category=fruits-vegetables',
      statusCode: 301,
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ]);

  const [activePreviewDevice, setActivePreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isDraftMode, setIsDraftMode] = useState<boolean>(false);

  // Initialize from LocalStorage or Backend API
  useEffect(() => {
    try {
      const p = localStorage.getItem(STORAGE_KEYS.PAGES);
      if (p) setPages(JSON.parse(p));

      const t = localStorage.getItem(STORAGE_KEYS.THEME);
      if (t) setThemeSettings(JSON.parse(t));

      const h = localStorage.getItem(STORAGE_KEYS.HEADER);
      if (h) setHeaderConfig(JSON.parse(h));

      const f = localStorage.getItem(STORAGE_KEYS.FOOTER);
      if (f) setFooterConfig(JSON.parse(f));

      const m = localStorage.getItem(STORAGE_KEYS.MENUS);
      if (m) setMenus(JSON.parse(m));

      const med = localStorage.getItem(STORAGE_KEYS.MEDIA);
      if (med) setMediaItems(JSON.parse(med));

      const pop = localStorage.getItem(STORAGE_KEYS.POPUPS);
      if (pop) setPopups(JSON.parse(pop));

      const sec = localStorage.getItem(STORAGE_KEYS.SECTIONS);
      if (sec) setSections(JSON.parse(sec));

      const r = localStorage.getItem(STORAGE_KEYS.REDIRECTS);
      if (r) setRedirects(JSON.parse(r));

      const s = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (s) setWebsiteSettings(JSON.parse(s));
    } catch {
      // fallback
    }

    // Sync with backend API silently
    fetch('/api/v1/cms/pages')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setPages(json.data);
        }
      })
      .catch(() => null);
  }, []);

  // Save to localStorage whenever state changes
  const persistPages = (newPages: CmsPage[]) => {
    setPages(newPages);
    try {
      localStorage.setItem(STORAGE_KEYS.PAGES, JSON.stringify(newPages));
    } catch {
      // ignore
    }
  };

  const getPageBySlug = (slug: string): CmsPage | undefined => {
    const clean = slug.replace(/^\/+/, '').trim();
    if (!clean || clean === 'home') {
      return pages.find((p) => p.isHomepage || p.slug === 'home');
    }
    return pages.find((p) => p.slug === clean);
  };

  const getPageById = (id: string): CmsPage | undefined => {
    return pages.find((p) => p.id === id);
  };

  const createPage = async (pageData: Partial<CmsPage>): Promise<CmsPage> => {
    const newPage: CmsPage = {
      id: `page-${Date.now()}`,
      title: pageData.title || 'Untitled Page',
      slug: (pageData.slug || `page-${Date.now().toString().slice(-4)}`)
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, '-'),
      status: pageData.status || 'DRAFT',
      template: pageData.template || 'DEFAULT',
      isHomepage: false,
      blocks: pageData.blocks || [],
      draftBlocks: pageData.blocks || [],
      seo: pageData.seo || {
        metaTitle: pageData.title,
        metaDescription: '',
        robotsDirectives: 'index,follow',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorName: user?.name || 'Administrator',
      authorRole: role,
      revisions: [
        {
          id: `rev-${Date.now()}-1`,
          pageId: `page-${Date.now()}`,
          version: 1,
          blocks: pageData.blocks || [],
          note: 'Initial page creation',
          createdAt: new Date().toISOString(),
          createdByName: user?.name || 'Admin',
          createdByRole: role,
        },
      ],
    };

    const nextPages = [newPage, ...pages];
    persistPages(nextPages);

    fetch('/api/v1/cms/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPage),
    }).catch(() => null);

    return newPage;
  };

  const updatePage = async (id: string, updates: Partial<CmsPage>): Promise<CmsPage> => {
    const idx = pages.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error(`Page ${id} not found`);

    const updated: CmsPage = {
      ...pages[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const nextPages = [...pages];
    nextPages[idx] = updated;
    persistPages(nextPages);

    fetch(`/api/v1/cms/pages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(() => null);

    return updated;
  };

  const saveDraft = async (id: string, blocks: CmsBlock[]): Promise<void> => {
    const idx = pages.findIndex((p) => p.id === id);
    if (idx === -1) return;

    const nextPages = [...pages];
    nextPages[idx] = {
      ...nextPages[idx],
      draftBlocks: blocks,
      updatedAt: new Date().toISOString(),
    };

    persistPages(nextPages);

    fetch(`/api/v1/cms/pages/${id}/draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks }),
    }).catch(() => null);
  };

  const publishPage = async (id: string): Promise<void> => {
    const idx = pages.findIndex((p) => p.id === id);
    if (idx === -1) return;

    const current = pages[idx];
    const blocksToPublish = current.draftBlocks && current.draftBlocks.length > 0 ? current.draftBlocks : current.blocks;
    const versionNum = current.revisions.length + 1;

    const newRev = {
      id: `rev-${Date.now()}-${versionNum}`,
      pageId: current.id,
      version: versionNum,
      blocks: JSON.parse(JSON.stringify(blocksToPublish)),
      note: `Published version ${versionNum} by ${user?.name || 'Admin'}`,
      createdAt: new Date().toISOString(),
      createdByName: user?.name || 'Administrator',
      createdByRole: role,
    };

    const nextPages = [...pages];
    nextPages[idx] = {
      ...current,
      blocks: JSON.parse(JSON.stringify(blocksToPublish)),
      status: 'PUBLISHED',
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      revisions: [newRev, ...current.revisions],
    };

    persistPages(nextPages);

    fetch(`/api/v1/cms/pages/${id}/publish`, {
      method: 'POST',
    }).catch(() => null);
  };

  const restoreRevision = async (pageId: string, revisionId: string): Promise<void> => {
    const idx = pages.findIndex((p) => p.id === pageId);
    if (idx === -1) return;

    const current = pages[idx];
    const rev = current.revisions.find((r) => r.id === revisionId);
    if (!rev) return;

    const restoredBlocks = JSON.parse(JSON.stringify(rev.blocks));
    const nextPages = [...pages];
    nextPages[idx] = {
      ...current,
      draftBlocks: restoredBlocks,
      blocks: restoredBlocks,
      updatedAt: new Date().toISOString(),
    };

    persistPages(nextPages);

    fetch(`/api/v1/cms/pages/${pageId}/revisions/${revisionId}/restore`, {
      method: 'POST',
    }).catch(() => null);
  };

  const duplicatePage = async (id: string): Promise<CmsPage> => {
    const source = pages.find((p) => p.id === id);
    if (!source) throw new Error('Page not found');

    const copy: CmsPage = {
      ...JSON.parse(JSON.stringify(source)),
      id: `page-${Date.now()}`,
      title: `${source.title} (Copy)`,
      slug: `${source.slug}-copy-${Date.now().toString().slice(-4)}`,
      status: 'DRAFT',
      isHomepage: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: undefined,
      authorName: user?.name || 'Administrator',
      authorRole: role,
      revisions: [],
    };

    const nextPages = [copy, ...pages];
    persistPages(nextPages);
    return copy;
  };

  const deletePage = async (id: string): Promise<boolean> => {
    const target = pages.find((p) => p.id === id);
    if (!target || target.isHomepage) return false;

    const nextPages = pages.filter((p) => p.id !== id);
    persistPages(nextPages);

    fetch(`/api/v1/cms/pages/${id}`, { method: 'DELETE' }).catch(() => null);
    return true;
  };

  const updateTheme = async (updates: Partial<CmsThemeSettings>): Promise<void> => {
    const updated = { ...themeSettings, ...updates };
    setThemeSettings(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(updated));
    } catch {
      // ignore
    }

    fetch('/api/v1/cms/theme', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(() => null);
  };

  const updateHeader = async (updates: Partial<CmsHeaderConfig>): Promise<void> => {
    const updated = { ...headerConfig, ...updates };
    setHeaderConfig(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.HEADER, JSON.stringify(updated));
    } catch {
      // ignore
    }

    fetch('/api/v1/cms/header', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(() => null);
  };

  const updateFooter = async (updates: Partial<CmsFooterConfig>): Promise<void> => {
    const updated = { ...footerConfig, ...updates };
    setFooterConfig(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.FOOTER, JSON.stringify(updated));
    } catch {
      // ignore
    }

    fetch('/api/v1/cms/footer', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(() => null);
  };

  const updateMenu = async (id: string, items: CmsMenuItem[]): Promise<void> => {
    const idx = menus.findIndex((m) => m.id === id);
    if (idx === -1) return;

    const next = [...menus];
    next[idx] = { ...next[idx], items };
    setMenus(next);
    try {
      localStorage.setItem(STORAGE_KEYS.MENUS, JSON.stringify(next));
    } catch {
      // ignore
    }

    fetch('/api/v1/cms/menus', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, items }),
    }).catch(() => null);
  };

  const addMedia = async (item: Omit<CmsMediaItem, 'id' | 'uploadedAt'>): Promise<CmsMediaItem> => {
    const newItem: CmsMediaItem = {
      ...item,
      id: `media-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
    };

    const next = [newItem, ...mediaItems];
    setMediaItems(next);
    try {
      localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(next));
    } catch {
      // ignore
    }

    fetch('/api/v1/cms/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    }).catch(() => null);

    return newItem;
  };

  const deleteMedia = async (id: string): Promise<void> => {
    const next = mediaItems.filter((m) => m.id !== id);
    setMediaItems(next);
    try {
      localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(next));
    } catch {
      // ignore
    }

    fetch('/api/v1/cms/media', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch(() => null);
  };

  const createSection = async (title: string, category: string, block: CmsBlock): Promise<CmsReusableSection> => {
    const newSection: CmsReusableSection = {
      id: `sec-${Date.now()}`,
      title,
      category,
      block: JSON.parse(JSON.stringify(block)),
      createdAt: new Date().toISOString(),
    };

    const next = [newSection, ...sections];
    setSections(next);
    try {
      localStorage.setItem(STORAGE_KEYS.SECTIONS, JSON.stringify(next));
    } catch {
      // ignore
    }

    fetch('/api/v1/cms/sections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, category, block }),
    }).catch(() => null);

    return newSection;
  };

  const deleteSection = async (id: string): Promise<void> => {
    const next = sections.filter((s) => s.id !== id);
    setSections(next);
    try {
      localStorage.setItem(STORAGE_KEYS.SECTIONS, JSON.stringify(next));
    } catch {
      // ignore
    }

    fetch('/api/v1/cms/sections', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch(() => null);
  };

  const updatePopup = async (id: string, updates: Partial<CmsPopupConfig>): Promise<void> => {
    const next = popups.map((p) => (p.id === id ? { ...p, ...updates } : p));
    setPopups(next);
    try {
      localStorage.setItem(STORAGE_KEYS.POPUPS, JSON.stringify(next));
    } catch {
      // ignore
    }

    fetch('/api/v1/cms/popups', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    }).catch(() => null);
  };

  const createRedirect = async (fromPath: string, toPath: string, statusCode: 301 | 302): Promise<void> => {
    const newRedirect: CmsRedirect = {
      id: `redir-${Date.now()}`,
      fromPath: fromPath.startsWith('/') ? fromPath : `/${fromPath}`,
      toPath: toPath.startsWith('/') ? toPath : `/${toPath}`,
      statusCode,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const next = [newRedirect, ...redirects];
    setRedirects(next);
    try {
      localStorage.setItem(STORAGE_KEYS.REDIRECTS, JSON.stringify(next));
    } catch {
      // ignore
    }

    fetch('/api/v1/cms/redirects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromPath, toPath, statusCode }),
    }).catch(() => null);
  };

  const deleteRedirect = async (id: string): Promise<void> => {
    const next = redirects.filter((r) => r.id !== id);
    setRedirects(next);
    try {
      localStorage.setItem(STORAGE_KEYS.REDIRECTS, JSON.stringify(next));
    } catch {
      // ignore
    }

    fetch('/api/v1/cms/redirects', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch(() => null);
  };

  const updateWebsiteSettings = async (updates: Partial<CmsWebsiteSettings>): Promise<void> => {
    const next = { ...websiteSettings, ...updates };
    setWebsiteSettings(next);
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(next));
    } catch {
      // ignore
    }

    fetch('/api/v1/cms/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(() => null);
  };

  return (
    <CmsContext.Provider
      value={{
        pages,
        themeSettings,
        headerConfig,
        footerConfig,
        menus,
        mediaItems,
        popups,
        sections,
        templates,
        redirects,
        websiteSettings,
        activePreviewDevice,
        setActivePreviewDevice,
        isDraftMode,
        setIsDraftMode,
        getPageBySlug,
        getPageById,
        createPage,
        updatePage,
        saveDraft,
        publishPage,
        restoreRevision,
        duplicatePage,
        deletePage,
        updateTheme,
        updateHeader,
        updateFooter,
        updateMenu,
        addMedia,
        deleteMedia,
        createSection,
        deleteSection,
        updatePopup,
        createRedirect,
        deleteRedirect,
        updateWebsiteSettings,
      }}
    >
      {children}
    </CmsContext.Provider>
  );
}

export function useCms() {
  const context = useContext(CmsContext);
  if (!context) {
    throw new Error('useCms must be used within a CmsProvider');
  }
  return context;
}
