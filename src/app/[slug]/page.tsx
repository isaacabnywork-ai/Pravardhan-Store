import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home, ShieldCheck } from 'lucide-react';
import { cmsService } from '@/modules/cms/service';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CmsBlockRenderer } from '@/components/cms/CmsBlockRenderer';
import { CmsPage } from '@/modules/cms/types';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}

// Generate Dynamic SEO Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = cmsService.getPageBySlug(slug);

  if (!page) {
    return {
      title: 'Page Not Found | Pravdhan Store',
    };
  }

  return {
    title: page.seo?.metaTitle || `${page.title} | Pravdhan Store`,
    description:
      page.seo?.metaDescription ||
      `Learn more about ${page.title} at Pravdhan Store, Gurugram's express grocery delivery.`,
    keywords: page.seo?.keywords,
    robots: page.seo?.robotsDirectives || 'index,follow',
    openGraph: {
      title: page.seo?.metaTitle || page.title,
      description: page.seo?.metaDescription,
      images: page.seo?.ogImage ? [{ url: page.seo.ogImage }] : undefined,
    },
  };
}

export default async function DynamicCmsPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { preview } = await searchParams;

  const page = cmsService.getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const isPreviewMode = preview === 'true';

  // Unpublished drafts can only be previewed if preview flag is present
  if (page.status !== 'PUBLISHED' && !isPreviewMode) {
    notFound();
  }

  const blocksToRender = isPreviewMode && page.draftBlocks && page.draftBlocks.length > 0
    ? page.draftBlocks
    : page.blocks;

  const isFullWidth = page.template === 'FULL_WIDTH' || page.template === 'LANDING_PAGE';

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#111827]">
      <Navbar />

      {/* Draft Preview Mode Alert Banner */}
      {isPreviewMode && (
        <div className="bg-amber-500 text-slate-950 font-bold text-xs py-2 px-4 text-center sticky top-16 z-40 shadow-xs flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-900" />
          <span>
            You are viewing an unpublished draft preview of <strong>&quot;{page.title}&quot;</strong>.
          </span>
          <Link
            href={`/admin/builder/editor?id=${page.id}`}
            className="underline ml-2 hover:opacity-80"
          >
            Back to Visual Editor
          </Link>
        </div>
      )}

      {/* Breadcrumb (only for non-landing pages) */}
      {page.template !== 'LANDING_PAGE' && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Link href="/" className="hover:text-emerald-700 flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-800 font-bold truncate">{page.title}</span>
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full pb-16">
        <div
          className={`mx-auto ${
            isFullWidth ? 'w-full px-4 sm:px-6' : 'max-w-5xl px-4 sm:px-6'
          } space-y-8`}
        >
          {blocksToRender.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <p className="text-base font-bold text-slate-600">This page has no content blocks yet.</p>
              <p className="text-xs text-slate-400 mt-1">Open the Website Builder to add headings, text, or products.</p>
            </div>
          ) : (
            blocksToRender.map((block) => (
              <CmsBlockRenderer key={block.id} block={block} />
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
