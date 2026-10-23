import {
  CmsBlock,
  CmsPage,
  CmsThemeSettings,
  CmsHeaderConfig,
  CmsFooterConfig,
  CmsMenu,
  CmsMediaItem,
  CmsPopupConfig,
  CmsReusableSection,
  CmsTemplate,
  CmsWebsiteSettings,
} from './types';

export const DEFAULT_HOMEPAGE_BLOCKS: CmsBlock[] = [
  {
    id: 'block-hero-01',
    type: 'hero_banner',
    label: 'Hero Promotional Banner Carousel',
    content: {
      slides: [
        {
          id: 'slide-1',
          tag: '12-MIN EXPRESS IN GURUGRAM',
          title: 'Farm Fresh Produce & Chakki Atta',
          subtitle: 'Pure, unadulterated essentials delivered straight from local mandis to Sector 14 within 15 minutes.',
          buttonText: 'Order Essentials',
          buttonUrl: '/shop',
          imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
          badge: 'Zero Delivery Fee',
          accentColor: '#10B981',
        },
        {
          id: 'slide-2',
          tag: 'FLAT ₹100 WELCOME DISCOUNT',
          title: 'Stock Up Your Kitchen Pantry',
          subtitle: 'Use code WELCOME100 at checkout for instant savings on premium basmati rice, organic pulses & pure ghee.',
          buttonText: 'Claim Coupon',
          buttonUrl: '/deals',
          imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80',
          badge: 'Save 20% Extra',
          accentColor: '#F59E0B',
        },
      ],
    },
    styles: {
      paddingTop: 16,
      paddingBottom: 24,
      borderRadius: 24,
    },
  },
  {
    id: 'block-cat-rail-01',
    type: 'category_grid',
    label: 'Quick Category Navigation Rail',
    content: {
      title: 'Explore Daily Categories',
      subtitle: 'Shop hand-curated aisles for fastest delivery',
      layout: 'grid', // 'grid' | 'carousel'
      columns: 7,
      limit: 7,
    },
    styles: {
      paddingTop: 20,
      paddingBottom: 20,
    },
  },
  {
    id: 'block-flash-deals-01',
    type: 'countdown_timer',
    label: 'Today’s Flash Deal Timer',
    content: {
      headline: '⚡ Lightning Morning Deals — Ends in 4 Hours!',
      subheadline: 'Up to 30% off on fresh farm veggies, desi chakki atta, and daily milk packs.',
      targetDate: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
      couponCode: 'FLASH30',
      actionText: 'Shop Flash Deals',
      actionUrl: '/deals',
    },
    styles: {
      backgroundColor: '#0F5132',
      textColor: '#FFFFFF',
      paddingTop: 24,
      paddingBottom: 24,
      borderRadius: 20,
      boxShadow: 'md',
    },
  },
  {
    id: 'block-produce-grid-01',
    type: 'product_carousel',
    label: 'Fresh Produce & Daily Greens',
    content: {
      title: 'Fresh Fruits & Farm Vegetables',
      subtitle: 'Crisp, handpicked daily from local cultivators',
      categorySlug: 'fruits-vegetables',
      limit: 6,
      viewAllUrl: '/shop?category=fruits-vegetables',
    },
    styles: {
      paddingTop: 24,
      paddingBottom: 24,
    },
  },
  {
    id: 'block-staples-grid-01',
    type: 'featured_products',
    label: 'Pantry Staples & Cooking Oils',
    content: {
      title: 'Kitchen Staples & Chakki Atta',
      subtitle: 'Pure mustard oil, basmati rice, unpolished dals, and whole wheat flour',
      categorySlug: 'groceries-staples',
      limit: 8,
      viewAllUrl: '/shop?category=groceries-staples',
    },
    styles: {
      paddingTop: 24,
      paddingBottom: 24,
    },
  },
  {
    id: 'block-trust-badges-01',
    type: 'container',
    label: 'Pravdhan Store Trust Badges',
    content: {
      badges: [
        {
          icon: 'Zap',
          title: '12-Minute Delivery',
          description: 'Instant hyper-local dark store dispatch across Sector 14, Gurugram',
        },
        {
          icon: 'ShieldCheck',
          title: '₹0 Delivery Fee',
          description: 'Enjoy completely free doorstep delivery with standard ₹100 minimum order',
        },
        {
          icon: 'Sparkles',
          title: '100% Quality Guarantee',
          description: 'Hassle-free replacement if any vegetable or pantry staple is unsatisfactory',
        },
      ],
    },
    styles: {
      backgroundColor: '#F0FDF4',
      borderColor: '#BBF7D0',
      borderWidth: 1,
      borderRadius: 20,
      paddingTop: 24,
      paddingBottom: 24,
      paddingLeft: 20,
      paddingRight: 20,
    },
  },
  {
    id: 'block-testimonials-01',
    type: 'testimonials',
    label: 'Neighborhood Customer Testimonials',
    content: {
      title: 'Loved by 5,000+ Families in Gurugram',
      subtitle: 'Real reviews from verified residents of DLF Phase 1 & Model Town',
      reviews: [
        {
          name: 'Neha Kapoor',
          area: 'Sector 14, Gurugram',
          rating: 5,
          text: 'Pravdhan Store delivered my Chakki Atta and fresh spinach in just 11 minutes! Incredible speed and clean packaging.',
        },
        {
          name: 'Rajesh Mehra',
          area: 'Arjun Marg, DLF Phase 1',
          rating: 5,
          text: 'I stopped going to the Mandi. Their tomato and potato quality is top-notch, and paying via UPI at doorstep is effortless.',
        },
        {
          name: 'Pooja Singhania',
          area: 'Cyber Hub Colony',
          rating: 5,
          text: 'Finally an Indian grocery app with no hidden delivery surcharges or fake discounts. Keep up the great service!',
        },
      ],
    },
    styles: {
      paddingTop: 28,
      paddingBottom: 28,
    },
  },
  {
    id: 'block-newsletter-01',
    type: 'newsletter',
    label: 'Weekly Deals Newsletter Signup',
    content: {
      title: 'Get Weekend Mandi Rates & Secret Promo Codes',
      subtitle: 'Subscribe to receive exclusive Friday specials directly on your phone or email.',
      buttonText: 'Subscribe Now',
      placeholder: 'Enter your WhatsApp number or email...',
    },
    styles: {
      backgroundColor: '#1E293B',
      textColor: '#FFFFFF',
      borderRadius: 24,
      paddingTop: 32,
      paddingBottom: 32,
      paddingLeft: 24,
      paddingRight: 24,
      textAlign: 'center',
    },
  },
];

export const DEFAULT_PAGES: CmsPage[] = [
  {
    id: 'page-home',
    title: 'Storefront Homepage',
    slug: 'home',
    status: 'PUBLISHED',
    template: 'DEFAULT',
    isHomepage: true,
    blocks: DEFAULT_HOMEPAGE_BLOCKS,
    draftBlocks: DEFAULT_HOMEPAGE_BLOCKS,
    seo: {
      metaTitle: 'Pravdhan Store | 12-Min Express Grocery Delivery in Gurugram',
      metaDescription: 'Order fresh vegetables, fruits, chakki atta, dairy, and daily kitchen staples delivered in 12–15 minutes with zero delivery charge.',
      keywords: ['grocery delivery', 'gurugram groceries', 'sector 14', 'chakki atta', 'quick commerce'],
      robotsDirectives: 'index,follow',
      structuredDataType: 'WebPage',
    },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    authorName: 'Vikram Mehta (Super Admin)',
    authorRole: 'SUPER_ADMIN',
    revisions: [
      {
        id: 'rev-home-v1',
        pageId: 'page-home',
        version: 1,
        blocks: DEFAULT_HOMEPAGE_BLOCKS,
        note: 'Initial production storefront homepage setup',
        createdAt: '2026-01-01T00:00:00.000Z',
        createdByName: 'Vikram Mehta',
        createdByRole: 'SUPER_ADMIN',
      },
    ],
  },
  {
    id: 'page-about-us',
    title: 'About Pravdhan Store',
    slug: 'about-us',
    status: 'PUBLISHED',
    template: 'DEFAULT',
    blocks: [
      {
        id: 'b-about-hero',
        type: 'heading',
        content: {
          level: 'h1',
          text: 'Pravdhan Store — Your Neighborhood Dark Store',
          subtext: 'Reimagining everyday grocery shopping for modern Indian homes with freshness, honesty, and ultra-fast speed.',
        },
        styles: { textAlign: 'center', paddingTop: 24, paddingBottom: 16 },
      },
      {
        id: 'b-about-img',
        type: 'image',
        content: {
          url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
          altText: 'Inside Pravdhan Store Dark Store',
          caption: 'Gurugram Dark Store Hub #01 — Sector 14, Model Town',
        },
        styles: { borderRadius: 20, marginBottom: 24 },
      },
      {
        id: 'b-about-text-1',
        type: 'text',
        content: {
          text: `<p class="text-base text-gray-700 leading-relaxed mb-4">
            Founded with a clear vision: eliminating middle-layer markups and stale produce from the grocery supply chain.
            Pravdhan Store operates automated, hyper-local dark stores within residential hubs, ensuring that farm produce harvested at dawn reaches your dining table within minutes.
          </p>
          <p class="text-base text-gray-700 leading-relaxed mb-4">
            Unlike traditional retail stores that stock packaged items for months, our rotation cycle is measured in hours.
            Our stone-ground chakki fresh atta is packed directly upon milling, guaranteeing authentic nutritional value and aroma in every roti.
          </p>`,
        },
        styles: { maxWidth: '800px', marginBottom: 24 },
      },
      {
        id: 'b-about-values',
        type: 'container',
        content: {
          title: 'Our Core Commitments',
          items: [
            { title: 'True 12-Minute Handover', desc: 'Real riders, dedicated dark-store pickers, and optimized neighborhood routes.' },
            { title: 'Zero Surcharges', desc: 'No platform fees, no packaging fees, no rain fees. Flat ₹0 delivery above ₹100 order.' },
            { title: 'Mandi-Direct Sourcing', desc: 'Direct partnerships with cultivators across Haryana and Western UP.' },
          ],
        },
        styles: {
          backgroundColor: '#F8FAFC',
          borderRadius: 20,
          paddingTop: 24,
          paddingBottom: 24,
          paddingLeft: 24,
          paddingRight: 24,
        },
      },
    ],
    seo: {
      metaTitle: 'About Us | Pravdhan Store Gurugram',
      metaDescription: 'Learn about Pravdhan Store, our direct mandi sourcing, 12-minute dark store fulfillment, and zero-fee customer promise.',
      robotsDirectives: 'index,follow',
    },
    createdAt: '2026-01-10T00:00:00.000Z',
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    authorName: 'Vikram Mehta',
    authorRole: 'SUPER_ADMIN',
    revisions: [],
  },
  {
    id: 'page-contact-us',
    title: 'Contact & Support',
    slug: 'contact-us',
    status: 'PUBLISHED',
    template: 'DEFAULT',
    blocks: [
      {
        id: 'b-contact-heading',
        type: 'heading',
        content: {
          level: 'h1',
          text: 'We’re Here to Help You',
          subtext: 'Questions about an order, delivery slot, or refund? Connect with our Gurugram support desk.',
        },
        styles: { textAlign: 'center', paddingTop: 20, paddingBottom: 16 },
      },
      {
        id: 'b-contact-info-cards',
        type: 'columns',
        content: {
          columns: [
            {
              title: 'Customer Care Hotline',
              detail: '+91 124 456 7890',
              sub: 'Available 7:00 AM - 10:00 PM Daily',
              badge: 'Fastest Response',
            },
            {
              title: 'Email Support',
              detail: 'care@pravdhanstore.in',
              sub: 'Replies within 15 minutes',
              badge: 'Official Inquiries',
            },
            {
              title: 'Dark Store Facility',
              detail: 'Sector 14, Model Town',
              sub: 'Gurugram, Haryana 122001',
              badge: 'Hub #01',
            },
          ],
        },
        styles: { paddingBottom: 24 },
      },
      {
        id: 'b-contact-faq-preview',
        type: 'faqs',
        content: {
          title: 'Quick Answers Before You Reach Out',
          items: [
            { question: 'What is the delivery charge?', answer: 'Delivery is 100% free with a minimum order of ₹100.' },
            { question: 'What are the dark store operating hours?', answer: 'We are open for dispatch from 7:00 AM to 10:00 PM, 7 days a week.' },
            { question: 'Can I pay via Cash on Delivery?', answer: 'Yes, we accept both Cash on Delivery (COD) and all online payment methods (UPI, GPay, PhonePe, Cards).' },
          ],
        },
        styles: { paddingTop: 16, paddingBottom: 24 },
      },
    ],
    seo: {
      metaTitle: 'Contact Customer Support | Pravdhan Store Gurugram',
      metaDescription: 'Reach Pravdhan Store customer support via phone at +91 124 456 7890 or email care@pravdhanstore.in for instant order assistance.',
      robotsDirectives: 'index,follow',
    },
    createdAt: '2026-01-12T00:00:00.000Z',
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    authorName: 'Vikram Mehta',
    authorRole: 'SUPER_ADMIN',
    revisions: [],
  },
  {
    id: 'page-faq',
    title: 'Frequently Asked Questions (FAQ)',
    slug: 'faq',
    status: 'PUBLISHED',
    template: 'DEFAULT',
    blocks: [
      {
        id: 'b-faq-heading',
        type: 'heading',
        content: {
          level: 'h1',
          text: 'Frequently Asked Questions',
          subtext: 'Everything you need to know about ordering, delivery speeds, payment methods, and quality checks.',
        },
        styles: { textAlign: 'center', paddingTop: 20, paddingBottom: 16 },
      },
      {
        id: 'b-faq-list',
        type: 'faqs',
        content: {
          title: 'Ordering & Delivery FAQs',
          items: [
            {
              question: 'How fast will my order arrive?',
              answer: 'Orders within our 5 km coverage radius of Sector 14, Model Town, Gurugram typically arrive within 10 to 15 minutes of placement.',
            },
            {
              question: 'Is there a minimum order value?',
              answer: 'Yes, our minimum order value is ₹100. Delivery is completely free (₹0 delivery charge) for all orders.',
            },
            {
              question: 'How does doorstep verification work?',
              answer: 'When our rider arrives at your doorstep, they will verify your 4-digit order OTP and take a quick photo of the delivered package as proof of delivery (POD).',
            },
            {
              question: 'What if an item is missing or damaged?',
              answer: 'We provide an instant refund or replacement guarantee. Just contact care@pravdhanstore.in or call our hotline, and our store manager will resolve it immediately.',
            },
            {
              question: 'How do I redeem coupons like WELCOME100?',
              answer: 'Simply type WELCOME100 into the coupon box in your cart or checkout page and click Apply to enjoy an instant discount on your order.',
            },
          ],
        },
        styles: { paddingTop: 16, paddingBottom: 32 },
      },
    ],
    seo: {
      metaTitle: 'FAQ | Pravdhan Store Grocery Delivery Questions',
      metaDescription: 'Find answers to common questions about Pravdhan Store 12-minute grocery delivery, minimum order value, OTP verification, and refunds.',
      robotsDirectives: 'index,follow',
    },
    createdAt: '2026-01-15T00:00:00.000Z',
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    authorName: 'Priya Verma',
    authorRole: 'PRODUCT_MANAGER',
    revisions: [],
  },
  {
    id: 'page-summer-sale',
    title: 'Super Saver Deals & Discounts',
    slug: 'summer-sale',
    status: 'PUBLISHED',
    template: 'LANDING_PAGE',
    blocks: [
      {
        id: 'b-sale-hero',
        type: 'promotional_banner',
        content: {
          tag: 'LIMITED TIME SUPER SAVER',
          title: 'Gurugram Kitchen Mega Savings Festival',
          subtitle: 'Massive price drops across premium atta, pure desi ghee, seasonal mangoes, and kitchen staples.',
          imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80',
          ctaText: 'Claim Deals Now',
          ctaLink: '/deals',
        },
        styles: { borderRadius: 24, paddingBottom: 20 },
      },
      {
        id: 'b-sale-countdown',
        type: 'countdown_timer',
        content: {
          headline: 'Mega Savings Timer — Grab Before Stock Runs Out!',
          subheadline: 'Exclusive pricing reserved for next 8 hours.',
          targetDate: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
          couponCode: 'SUPERDEAL50',
          actionText: 'Shop Best Sellers',
          actionUrl: '/shop',
        },
        styles: { backgroundColor: '#B91C1C', textColor: '#FFFFFF', borderRadius: 20 },
      },
      {
        id: 'b-sale-products',
        type: 'product_grid',
        content: {
          title: 'Top Discounted Items Today',
          subtitle: 'Handpicked products offering maximum savings',
          limit: 8,
        },
        styles: { paddingTop: 24, paddingBottom: 24 },
      },
    ],
    seo: {
      metaTitle: 'Super Saver Deals & Discounts | Pravdhan Store',
      metaDescription: 'Shop mega savings on everyday groceries, fresh produce, and cooking essentials in Gurugram.',
      robotsDirectives: 'index,follow',
    },
    createdAt: '2026-01-20T00:00:00.000Z',
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    authorName: 'Priya Verma',
    authorRole: 'PRODUCT_MANAGER',
    revisions: [],
  },
];

export const DEFAULT_THEME_SETTINGS: CmsThemeSettings = {
  siteTitle: 'Pravdhan Store',
  tagline: 'Your Trusted Neighborhood Grocery & Essentials',
  logoUrl: '',
  mobileLogoUrl: '',
  faviconUrl: '/favicon.ico',
  primaryColor: '#0F5132',        // Signature Pravdhan Emerald Green
  primaryHoverColor: '#0B3D26',
  secondaryColor: '#10B981',      // Vibrant Mint
  accentColor: '#F59E0B',         // Amber Accent
  backgroundColor: '#F8F9FA',
  textColor: '#111827',
  mutedTextColor: '#6B7280',
  borderColor: '#E5E7EB',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  headingFontFamily: 'system-ui, -apple-system, sans-serif',
  baseFontSize: 16,
  containerWidth: '1280px',
  borderRadius: 'lg',
  buttonStyle: 'rounded',
  shadows: 'subtle',
  productCardStyle: 'bordered',
  productImageRatio: '1:1',
  discountBadgeColor: '#0F5132',
};

export const DEFAULT_HEADER_CONFIG: CmsHeaderConfig = {
  showAnnouncementBar: true,
  announcementBarText: '⚡ Flat ₹100 OFF on your first order! Use code WELCOME100 • 12-Min Delivery in Sector 14, Gurugram',
  announcementBarLink: '/deals',
  announcementBarBg: '#0F5132',
  announcementBarTextColor: '#FFFFFF',
  isSticky: true,
  logoPosition: 'left',
  showSearchBar: true,
  showLocationPicker: true,
  showCategoryPills: true,
  showAccount: true,
  showCart: true,
  showThemeToggle: true,
  primaryMenuId: 'menu-primary',
  headerBg: '#FFFFFF',
  headerTextColor: '#111827',
  mobileMenuEnabled: true,
};

export const DEFAULT_FOOTER_CONFIG: CmsFooterConfig = {
  showFooter: true,
  columns: [
    {
      id: 'col-about',
      title: 'Pravdhan Store',
      type: 'TEXT',
      text: 'Gurugram’s trusted neighborhood dark store. Delivering farm-fresh vegetables, stone-ground flours, pure pulses, and daily essentials within 12–15 minutes.',
    },
    {
      id: 'col-links',
      title: 'Helpful Links',
      type: 'LINKS',
      links: [
        { id: 'l1', label: 'About Us', url: '/about-us' },
        { id: 'l2', label: 'Contact & Support', url: '/contact-us' },
        { id: 'l3', label: 'Frequently Asked Questions', url: '/faq' },
        { id: 'l4', label: 'Super Saver Deals', url: '/deals' },
        { id: 'l5', label: 'Track My Order', url: '/account/orders' },
      ],
    },
    {
      id: 'col-categories',
      title: 'Top Aisles',
      type: 'LINKS',
      links: [
        { id: 'c1', label: 'Fresh Fruits & Vegetables', url: '/shop?category=fruits-vegetables' },
        { id: 'c2', label: 'Atta, Flours & Grains', url: '/shop?category=groceries-staples' },
        { id: 'c3', label: 'Cooking Oils & Ghee', url: '/shop?category=groceries-staples' },
        { id: 'c4', label: 'Dairy, Milk & Curd', url: '/shop?category=dairy-bread-eggs' },
        { id: 'c5', label: 'Snacks & Munchies', url: '/shop?category=snacks-munchies' },
      ],
    },
    {
      id: 'col-contact',
      title: 'Dark Store Hub #01',
      type: 'CONTACT',
      text: 'Sector 14, Model Town, Gurugram, Haryana 122001',
    },
  ],
  aboutText: 'Pravdhan Store delivers farm-fresh groceries and household essentials in 12–15 minutes.',
  contactPhone: '+91 124 456 7890',
  contactEmail: 'care@pravdhanstore.in',
  address: 'Sector 14, Model Town, Gurugram, Haryana 122001',
  socialLinks: [
    { platform: 'Instagram', url: 'https://instagram.com' },
    { platform: 'Twitter', url: 'https://twitter.com' },
    { platform: 'Facebook', url: 'https://facebook.com' },
    { platform: 'WhatsApp', url: 'https://whatsapp.com' },
  ],
  newsletterTitle: 'Stay in the Fresh Loop',
  newsletterSubtitle: 'Receive fresh mandi arrival notifications and seasonal discounts.',
  showPaymentIcons: true,
  paymentBadges: ['UPI', 'Google Pay', 'PhonePe', 'Paytm', 'Visa', 'MasterCard', 'Cash on Delivery'],
  copyrightText: '© 2026 Pravdhan Store. All rights reserved. Made with pride in Gurugram.',
  footerBg: '#0F172A',
  footerTextColor: '#F8FAFC',
};

export const DEFAULT_MENUS: CmsMenu[] = [
  {
    id: 'menu-primary',
    name: 'Primary Navigation Bar',
    location: 'PRIMARY',
    items: [
      { id: 'm1', label: 'Storefront', url: '/' },
      { id: 'm2', label: 'Fresh Produce', url: '/shop?category=fruits-vegetables', badge: 'Farm Fresh' },
      { id: 'm3', label: 'Groceries & Staples', url: '/shop?category=groceries-staples' },
      { id: 'm4', label: 'Dairy & Breakfast', url: '/shop?category=dairy-bread-eggs' },
      { id: 'm5', label: 'Deals & Offers', url: '/deals', badge: 'Hot' },
      { id: 'm6', label: 'About Us', url: '/about-us' },
      { id: 'm7', label: 'Contact', url: '/contact-us' },
    ],
  },
  {
    id: 'menu-footer-quick',
    name: 'Footer Quick Links',
    location: 'FOOTER_QUICK',
    items: [
      { id: 'fq1', label: 'About Us', url: '/about-us' },
      { id: 'fq2', label: 'Contact & Support', url: '/contact-us' },
      { id: 'fq3', label: 'Frequently Asked Questions', url: '/faq' },
      { id: 'fq4', label: 'Delivery Terms', url: '/terms-and-conditions' },
      { id: 'fq5', label: 'Privacy Policy', url: '/privacy-policy' },
    ],
  },
];

export const DEFAULT_MEDIA_ITEMS: CmsMediaItem[] = [
  {
    id: 'media-hero-veggies',
    fileName: 'fresh-farm-produce-hero.jpg',
    url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
    size: 245000,
    mimeType: 'image/jpeg',
    altText: 'Fresh vegetables in a wicker basket at Gurugram mandi',
    width: 1200,
    height: 800,
    uploadedAt: '2026-01-01T10:00:00.000Z',
  },
  {
    id: 'media-kitchen-pantry',
    fileName: 'kitchen-pantry-staples.jpg',
    url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80',
    size: 312000,
    mimeType: 'image/jpeg',
    altText: 'Organic dals and pulses pantry storage',
    width: 1200,
    height: 800,
    uploadedAt: '2026-01-05T10:00:00.000Z',
  },
  {
    id: 'media-atta-chakki',
    fileName: 'chakki-fresh-wheat-atta.jpg',
    url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1200&q=80',
    size: 198000,
    mimeType: 'image/jpeg',
    altText: 'Stone ground whole wheat chakki atta',
    width: 1200,
    height: 800,
    uploadedAt: '2026-01-08T10:00:00.000Z',
  },
  {
    id: 'media-delivery-box',
    fileName: 'express-delivery-package.jpg',
    url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
    size: 145000,
    mimeType: 'image/jpeg',
    altText: 'Doorstep grocery delivery package in eco friendly bag',
    width: 800,
    height: 600,
    uploadedAt: '2026-01-10T10:00:00.000Z',
  },
];

export const DEFAULT_POPUP: CmsPopupConfig = {
  id: 'popup-welcome-100',
  title: '🎉 Welcome to Pravdhan Store!',
  content: 'Enjoy Flat ₹100 OFF on your first 3 grocery orders with instant 12-minute delivery in Sector 14, Gurugram.',
  couponCode: 'WELCOME100',
  buttonText: 'Claim ₹100 Discount',
  buttonUrl: '/deals',
  trigger: 'TIME_DELAY',
  delaySeconds: 4,
  isActive: true,
  image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
};

export const DEFAULT_REUSABLE_SECTIONS: CmsReusableSection[] = [
  {
    id: 'sec-trust-badges',
    title: '3-Point Trust Guarantee',
    category: 'Trust & Badges',
    block: DEFAULT_HOMEPAGE_BLOCKS[5],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'sec-newsletter-banner',
    title: 'Newsletter Email & WhatsApp Bar',
    category: 'Lead Generation',
    block: DEFAULT_HOMEPAGE_BLOCKS[7],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

export const DEFAULT_TEMPLATES: CmsTemplate[] = [
  {
    id: 'tpl-grocery-home',
    name: 'Quick Commerce Grocery Homepage',
    description: 'High-conversion quick commerce layout with hero slider, category rail, deals timer, and product rails.',
    category: 'HOMEPAGE',
    previewImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    blocks: DEFAULT_HOMEPAGE_BLOCKS,
  },
  {
    id: 'tpl-campaign-sale',
    name: 'Flash Sale & Festival Landing',
    description: 'Urgency-driven campaign landing page with headline countdown, discount banner, and product grid.',
    category: 'SALE',
    previewImage: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80',
    blocks: DEFAULT_PAGES[4].blocks,
  },
  {
    id: 'tpl-company-about',
    name: 'About Us Company Story',
    description: 'Brand storytelling layout with hero headline, dark store imagery, values grid, and testimonials.',
    category: 'ABOUT',
    previewImage: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    blocks: DEFAULT_PAGES[1].blocks,
  },
];

export const DEFAULT_WEBSITE_SETTINGS: CmsWebsiteSettings = {
  siteName: 'Pravdhan Store',
  siteDescription: '12-Minute Express Grocery Delivery in Sector 14, Model Town, Gurugram.',
  maintenanceMode: false,
  maintenanceMessage: 'We are restocking fresh inventory! Pravdhan Store will be back online shortly.',
  enableCustomerReviews: true,
  enableWishlist: true,
  enableSearchSuggestions: true,
};
