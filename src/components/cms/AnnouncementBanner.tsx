'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, ChevronRight } from 'lucide-react';
import { useCms } from '@/lib/context/CmsContext';

export function AnnouncementBanner() {
  const { headerConfig } = useCms();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!headerConfig.showAnnouncementBar || isDismissed || !headerConfig.announcementBarText) {
    return null;
  }

  const content = (
    <div
      className="w-full py-1.5 px-4 text-center text-xs font-bold transition-all relative flex items-center justify-center gap-2"
      style={{
        backgroundColor: headerConfig.announcementBarBg || '#0F5132',
        color: headerConfig.announcementBarTextColor || '#FFFFFF',
      }}
    >
      <span className="truncate">{headerConfig.announcementBarText}</span>
      {headerConfig.announcementBarLink && (
        <span className="hidden sm:inline-flex items-center gap-0.5 underline hover:opacity-80">
          <span>Claim Offer</span>
          <ChevronRight className="w-3 h-3" />
        </span>
      )}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDismissed(true);
        }}
        className="absolute right-3 p-0.5 rounded hover:bg-black/20 text-white/80 hover:text-white"
        aria-label="Dismiss banner"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  if (headerConfig.announcementBarLink) {
    return <Link href={headerConfig.announcementBarLink}>{content}</Link>;
  }

  return content;
}
