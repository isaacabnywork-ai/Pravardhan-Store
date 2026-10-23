import { Role } from '@/types';

export type CmsBlockType =
  // Basic & Layout
  | 'container'
  | 'columns'
  | 'heading'
  | 'text'
  | 'image'
  | 'gallery'
  | 'video'
  | 'button'
  | 'icon'
  | 'divider'
  | 'spacer'
  // Commerce & Storefront
  | 'hero_banner'
  | 'slider'
  | 'product_grid'
  | 'product_carousel'
  | 'category_grid'
  | 'featured_products'
  | 'new_arrivals'
  | 'best_sellers'
  | 'promotional_banner'
  | 'countdown_timer'
  // Content & Social
  | 'testimonials'
  | 'faqs'
  | 'newsletter'
  | 'custom_html';

export interface CmsBlockStyles {
  textColor?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: 'cover' | 'contain' | 'auto';
  backgroundPosition?: 'center' | 'top' | 'bottom';
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  marginTop?: number;
  marginBottom?: number;
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  boxShadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  maxWidth?: string;
  fontSize?: string;
  fontWeight?: string;
  letterSpacing?: string;
  lineHeight?: string;
}

export interface CmsBlockResponsive {
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  hideOnDesktop?: boolean;
  mobilePadding?: number;
  mobileFontSize?: string;
}

export interface CmsBlock {
  id: string;
  type: CmsBlockType;
  label?: string;
  content: Record<string, any>;
  styles: CmsBlockStyles;
  responsive?: CmsBlockResponsive;
  children?: CmsBlock[];
}

export type PageStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';

export type PageTemplate = 'DEFAULT' | 'FULL_WIDTH' | 'LANDING_PAGE' | 'MINIMAL_HEADER_FOOTER';

export interface CmsPageSeo {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
  robotsDirectives?: 'index,follow' | 'noindex,follow' | 'noindex,nofollow';
  structuredDataType?: 'WebPage' | 'Article' | 'FAQPage' | 'AboutPage' | 'ContactPage';
}

export interface CmsRevision {
  id: string;
  pageId: string;
  version: number;
  blocks: CmsBlock[];
  note?: string;
  createdAt: string;
  createdByName: string;
  createdByRole: Role;
}

export interface CmsPage {
  id: string;
  title: string;
  slug: string;
  status: PageStatus;
  template: PageTemplate;
  isHomepage?: boolean;
  blocks: CmsBlock[];          // Published blocks
  draftBlocks?: CmsBlock[];     // Working draft blocks
  seo: CmsPageSeo;
  scheduledAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  authorName: string;
  authorRole: Role;
  revisions: CmsRevision[];
}

export interface CmsThemeSettings {
  siteTitle: string;
  tagline: string;
  logoUrl: string;
  mobileLogoUrl?: string;
  faviconUrl?: string;
  // Colors
  primaryColor: string;
  primaryHoverColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  mutedTextColor: string;
  borderColor: string;
  // Typography
  fontFamily: string;
  headingFontFamily: string;
  baseFontSize: number; // in px
  // Layout & Elements
  containerWidth: string; // e.g. "1280px"
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  buttonStyle: 'rounded' | 'pill' | 'square';
  shadows: 'subtle' | 'medium' | 'prominent' | 'none';
  // Product Cards
  productCardStyle: 'minimal' | 'bordered' | 'elevated';
  productImageRatio: '1:1' | '4:3' | '3:4';
  discountBadgeColor: string;
  customCss?: string;
}

export interface CmsHeaderConfig {
  showAnnouncementBar: boolean;
  announcementBarText: string;
  announcementBarLink?: string;
  announcementBarBg: string;
  announcementBarTextColor: string;
  isSticky: boolean;
  logoPosition: 'left' | 'center';
  showSearchBar: boolean;
  showLocationPicker: boolean;
  showCategoryPills: boolean;
  showAccount: boolean;
  showCart: boolean;
  showThemeToggle: boolean;
  primaryMenuId: string;
  headerBg: string;
  headerTextColor: string;
  mobileMenuEnabled: boolean;
}

export interface CmsFooterColumn {
  id: string;
  title: string;
  type: 'LINKS' | 'TEXT' | 'NEWSLETTER' | 'CONTACT';
  links?: { id: string; label: string; url: string; target?: '_self' | '_blank' }[];
  text?: string;
}

export interface CmsFooterConfig {
  showFooter: boolean;
  columns: CmsFooterColumn[];
  aboutText: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  socialLinks: { platform: string; url: string }[];
  newsletterTitle: string;
  newsletterSubtitle: string;
  showPaymentIcons: boolean;
  paymentBadges: string[];
  copyrightText: string;
  footerBg: string;
  footerTextColor: string;
}

export interface CmsMenuItem {
  id: string;
  label: string;
  url: string;
  target?: '_self' | '_blank';
  badge?: string;
  icon?: string;
  children?: CmsMenuItem[];
}

export interface CmsMenu {
  id: string;
  name: string;
  location: 'PRIMARY' | 'FOOTER_QUICK' | 'FOOTER_CATEGORIES' | 'TOP_BAR' | 'MOBILE';
  items: CmsMenuItem[];
}

export interface CmsMediaItem {
  id: string;
  fileName: string;
  url: string;
  size: number;
  mimeType: string;
  altText: string;
  width?: number;
  height?: number;
  uploadedAt: string;
}

export interface CmsRedirect {
  id: string;
  fromPath: string;
  toPath: string;
  statusCode: 301 | 302;
  isActive: boolean;
  createdAt: string;
}

export interface CmsPopupConfig {
  id: string;
  title: string;
  content: string;
  couponCode?: string;
  buttonText?: string;
  buttonUrl?: string;
  trigger: 'ON_LOAD' | 'EXIT_INTENT' | 'TIME_DELAY' | 'SCROLL';
  delaySeconds: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  image?: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface CmsReusableSection {
  id: string;
  title: string;
  category: string;
  block: CmsBlock;
  createdAt: string;
}

export interface CmsTemplate {
  id: string;
  name: string;
  description: string;
  category: 'HOMEPAGE' | 'LANDING' | 'ABOUT' | 'CONTACT' | 'SALE';
  previewImage: string;
  blocks: CmsBlock[];
}

export interface CmsWebsiteSettings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  customHeadCode?: string;
  customFooterCode?: string;
  enableCustomerReviews: boolean;
  enableWishlist: boolean;
  enableSearchSuggestions: boolean;
}
