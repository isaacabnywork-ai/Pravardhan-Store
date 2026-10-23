import { Role } from '@/types';
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
  PageStatus,
} from './types';
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
} from './default-data';

// In-memory runtime cache with initial deep copies
let pagesCache: CmsPage[] = JSON.parse(JSON.stringify(DEFAULT_PAGES));
let themeCache: CmsThemeSettings = JSON.parse(JSON.stringify(DEFAULT_THEME_SETTINGS));
let headerCache: CmsHeaderConfig = JSON.parse(JSON.stringify(DEFAULT_HEADER_CONFIG));
let footerCache: CmsFooterConfig = JSON.parse(JSON.stringify(DEFAULT_FOOTER_CONFIG));
const menusCache: CmsMenu[] = JSON.parse(JSON.stringify(DEFAULT_MENUS));
let mediaCache: CmsMediaItem[] = JSON.parse(JSON.stringify(DEFAULT_MEDIA_ITEMS));
const popupsCache: CmsPopupConfig[] = [JSON.parse(JSON.stringify(DEFAULT_POPUP))];
let sectionsCache: CmsReusableSection[] = JSON.parse(JSON.stringify(DEFAULT_REUSABLE_SECTIONS));
const templatesCache: CmsTemplate[] = JSON.parse(JSON.stringify(DEFAULT_TEMPLATES));
let settingsCache: CmsWebsiteSettings = JSON.parse(JSON.stringify(DEFAULT_WEBSITE_SETTINGS));
let redirectsCache: CmsRedirect[] = [
  {
    id: 'redir-1',
    fromPath: '/fresh',
    toPath: '/shop?category=fruits-vegetables',
    statusCode: 301,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'redir-2',
    fromPath: '/atta',
    toPath: '/shop?category=groceries-staples',
    statusCode: 301,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

export class CmsService {
  /**
   * Check whether a role has permission for a CMS action
   */
  hasPermission(role: Role, action: 'VIEW' | 'EDIT_PAGE' | 'PUBLISH' | 'THEME' | 'MENUS' | 'SETTINGS'): boolean {
    if (role === 'SUPER_ADMIN') return true;

    if (role === 'PRODUCT_MANAGER') {
      return action === 'VIEW' || action === 'EDIT_PAGE' || action === 'PUBLISH' || action === 'MENUS';
    }

    if (role === 'STORE_MANAGER' || role === 'ORDER_MANAGER') {
      return action === 'VIEW';
    }

    return false;
  }

  // ==================== PAGES ====================

  listPages(statusFilter?: PageStatus): CmsPage[] {
    if (!statusFilter) return pagesCache;
    return pagesCache.filter((p) => p.status === statusFilter);
  }

  getPageById(id: string): CmsPage | undefined {
    return pagesCache.find((p) => p.id === id);
  }

  getPageBySlug(slug: string): CmsPage | undefined {
    const clean = slug.replace(/^\/+/, '').trim();
    if (!clean || clean === 'home') {
      return pagesCache.find((p) => p.isHomepage || p.slug === 'home');
    }
    return pagesCache.find((p) => p.slug === clean);
  }

  createPage(
    data: Omit<CmsPage, 'id' | 'createdAt' | 'updatedAt' | 'revisions'>,
    author: { name: string; role: Role }
  ): CmsPage {
    const newPage: CmsPage = {
      ...data,
      id: `page-${Date.now()}`,
      slug: data.slug.toLowerCase().replace(/[^a-z0-9-_]/g, '-').replace(/--+/g, '-'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorName: author.name,
      authorRole: author.role,
      draftBlocks: data.blocks || [],
      revisions: [
        {
          id: `rev-${Date.now()}-1`,
          pageId: `page-${Date.now()}`,
          version: 1,
          blocks: data.blocks || [],
          note: 'Initial page creation',
          createdAt: new Date().toISOString(),
          createdByName: author.name,
          createdByRole: author.role,
        },
      ],
    };

    pagesCache = [newPage, ...pagesCache];
    return newPage;
  }

  updatePage(
    id: string,
    updates: Partial<CmsPage>,
    author: { name: string; role: Role }
  ): CmsPage {
    const pageIndex = pagesCache.findIndex((p) => p.id === id);
    if (pageIndex === -1) {
      throw new Error(`Page with id ${id} not found`);
    }

    const current = pagesCache[pageIndex];
    const updatedPage: CmsPage = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    pagesCache[pageIndex] = updatedPage;
    return updatedPage;
  }

  saveDraft(
    id: string,
    draftBlocks: CmsBlock[],
    author: { name: string; role: Role }
  ): CmsPage {
    const page = this.getPageById(id);
    if (!page) throw new Error(`Page with id ${id} not found`);

    page.draftBlocks = draftBlocks;
    page.updatedAt = new Date().toISOString();
    return page;
  }

  publishPage(id: string, author: { name: string; role: Role }): CmsPage {
    const page = this.getPageById(id);
    if (!page) throw new Error(`Page with id ${id} not found`);

    const blocksToPublish = page.draftBlocks && page.draftBlocks.length > 0 ? page.draftBlocks : page.blocks;

    // Create a new revision point
    const newVersion = (page.revisions.length > 0 ? Math.max(...page.revisions.map((r) => r.version)) : 0) + 1;
    const newRevision = {
      id: `rev-${Date.now()}-${newVersion}`,
      pageId: page.id,
      version: newVersion,
      blocks: JSON.parse(JSON.stringify(blocksToPublish)),
      note: `Published version ${newVersion} by ${author.name}`,
      createdAt: new Date().toISOString(),
      createdByName: author.name,
      createdByRole: author.role,
    };

    page.blocks = JSON.parse(JSON.stringify(blocksToPublish));
    page.status = 'PUBLISHED';
    page.publishedAt = new Date().toISOString();
    page.updatedAt = new Date().toISOString();
    page.revisions = [newRevision, ...page.revisions];

    return page;
  }

  restoreRevision(pageId: string, revisionId: string, author: { name: string; role: Role }): CmsPage {
    const page = this.getPageById(pageId);
    if (!page) throw new Error(`Page ${pageId} not found`);

    const rev = page.revisions.find((r) => r.id === revisionId);
    if (!rev) throw new Error(`Revision ${revisionId} not found`);

    page.draftBlocks = JSON.parse(JSON.stringify(rev.blocks));
    page.blocks = JSON.parse(JSON.stringify(rev.blocks));
    page.updatedAt = new Date().toISOString();

    return page;
  }

  duplicatePage(id: string, author: { name: string; role: Role }): CmsPage {
    const source = this.getPageById(id);
    if (!source) throw new Error(`Source page not found`);

    const duplicated: CmsPage = {
      ...JSON.parse(JSON.stringify(source)),
      id: `page-${Date.now()}`,
      title: `${source.title} (Copy)`,
      slug: `${source.slug}-copy-${Date.now().toString().slice(-4)}`,
      status: 'DRAFT',
      isHomepage: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: undefined,
      authorName: author.name,
      authorRole: author.role,
      revisions: [],
    };

    pagesCache = [duplicated, ...pagesCache];
    return duplicated;
  }

  deletePage(id: string): boolean {
    const page = this.getPageById(id);
    if (!page) return false;
    if (page.isHomepage) {
      throw new Error('Cannot delete the homepage.');
    }
    pagesCache = pagesCache.filter((p) => p.id !== id);
    return true;
  }

  // ==================== THEME & GLOBAL STYLES ====================

  getThemeSettings(): CmsThemeSettings {
    return themeCache;
  }

  updateThemeSettings(updates: Partial<CmsThemeSettings>): CmsThemeSettings {
    themeCache = { ...themeCache, ...updates };
    return themeCache;
  }

  // ==================== HEADER & FOOTER ====================

  getHeaderConfig(): CmsHeaderConfig {
    return headerCache;
  }

  updateHeaderConfig(updates: Partial<CmsHeaderConfig>): CmsHeaderConfig {
    headerCache = { ...headerCache, ...updates };
    return headerCache;
  }

  getFooterConfig(): CmsFooterConfig {
    return footerCache;
  }

  updateFooterConfig(updates: Partial<CmsFooterConfig>): CmsFooterConfig {
    footerCache = { ...footerCache, ...updates };
    return footerCache;
  }

  // ==================== MENUS ====================

  listMenus(): CmsMenu[] {
    return menusCache;
  }

  getMenuById(id: string): CmsMenu | undefined {
    return menusCache.find((m) => m.id === id);
  }

  updateMenu(id: string, updates: Partial<CmsMenu>): CmsMenu {
    const idx = menusCache.findIndex((m) => m.id === id);
    if (idx === -1) throw new Error(`Menu ${id} not found`);
    menusCache[idx] = { ...menusCache[idx], ...updates };
    return menusCache[idx];
  }

  // ==================== MEDIA LIBRARY ====================

  listMedia(): CmsMediaItem[] {
    return mediaCache;
  }

  addMedia(item: Omit<CmsMediaItem, 'id' | 'uploadedAt'>): CmsMediaItem {
    const newMedia: CmsMediaItem = {
      ...item,
      id: `media-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
    };
    mediaCache = [newMedia, ...mediaCache];
    return newMedia;
  }

  deleteMedia(id: string): boolean {
    mediaCache = mediaCache.filter((m) => m.id !== id);
    return true;
  }

  // ==================== REUSABLE SECTIONS & TEMPLATES ====================

  listSections(): CmsReusableSection[] {
    return sectionsCache;
  }

  createSection(title: string, category: string, block: CmsBlock): CmsReusableSection {
    const newSection: CmsReusableSection = {
      id: `sec-${Date.now()}`,
      title,
      category,
      block: JSON.parse(JSON.stringify(block)),
      createdAt: new Date().toISOString(),
    };
    sectionsCache = [newSection, ...sectionsCache];
    return newSection;
  }

  deleteSection(id: string): boolean {
    sectionsCache = sectionsCache.filter((s) => s.id !== id);
    return true;
  }

  listTemplates(): CmsTemplate[] {
    return templatesCache;
  }

  // ==================== POPUPS & BANNERS ====================

  listPopups(): CmsPopupConfig[] {
    return popupsCache;
  }

  updatePopup(id: string, updates: Partial<CmsPopupConfig>): CmsPopupConfig {
    const idx = popupsCache.findIndex((p) => p.id === id);
    if (idx === -1) {
      const created: CmsPopupConfig = {
        id,
        title: 'New Announcement Popup',
        content: '',
        trigger: 'TIME_DELAY',
        delaySeconds: 3,
        isActive: true,
        ...updates,
      };
      popupsCache.push(created);
      return created;
    }
    popupsCache[idx] = { ...popupsCache[idx], ...updates };
    return popupsCache[idx];
  }

  // ==================== REDIRECTS ====================

  listRedirects(): CmsRedirect[] {
    return redirectsCache;
  }

  createRedirect(fromPath: string, toPath: string, statusCode: 301 | 302): CmsRedirect {
    const newRedirect: CmsRedirect = {
      id: `redir-${Date.now()}`,
      fromPath: fromPath.startsWith('/') ? fromPath : `/${fromPath}`,
      toPath: toPath.startsWith('/') ? toPath : `/${toPath}`,
      statusCode,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    redirectsCache = [newRedirect, ...redirectsCache];
    return newRedirect;
  }

  deleteRedirect(id: string): boolean {
    redirectsCache = redirectsCache.filter((r) => r.id !== id);
    return true;
  }

  // ==================== WEBSITE SETTINGS ====================

  getWebsiteSettings(): CmsWebsiteSettings {
    return settingsCache;
  }

  updateWebsiteSettings(updates: Partial<CmsWebsiteSettings>): CmsWebsiteSettings {
    settingsCache = { ...settingsCache, ...updates };
    return settingsCache;
  }
}

export const cmsService = new CmsService();
