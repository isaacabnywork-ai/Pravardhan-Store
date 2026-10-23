import crypto from 'crypto';
import { env } from '@/lib/env';

export interface CloudinarySignatureResult {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
  allowedFormats: string[];
  maxFileSize: number; // 5 MB
}

export interface ImageTransformationOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'limit' | 'pad' | 'thumb';
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
}

export class CloudinaryService {
  private readonly cloudName = env.CLOUDINARY_CLOUD_NAME || 'pravdhan-store';
  private readonly apiKey = env.CLOUDINARY_API_KEY || '';
  private readonly apiSecret = env.CLOUDINARY_API_SECRET || '';

  /**
   * Generates a signed upload configuration for direct, secure browser uploads
   */
  generateUploadSignature(folder = 'pravdhan-store/products'): CloudinarySignatureResult {
    const timestamp = Math.round(Date.now() / 1000);
    const maxFileSize = 5 * 1024 * 1024; // 5 MB
    const allowedFormats = ['jpg', 'jpeg', 'png', 'webp'];

    // Sorted string for Cloudinary SHA signature
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
    const signature = crypto
      .createHash('sha1')
      .update(paramsToSign + (this.apiSecret || 'dev_secret'))
      .digest('hex');

    return {
      signature,
      timestamp,
      cloudName: this.cloudName,
      apiKey: this.apiKey || 'dev_api_key',
      folder,
      allowedFormats,
      maxFileSize,
    };
  }

  /**
   * Builds an optimized CDN image URL with transformations
   */
  buildOptimizedUrl(publicIdOrUrl: string, options: ImageTransformationOptions = {}): string {
    if (!publicIdOrUrl) return '';

    // If it's already an external non-cloudinary URL, return as-is
    if (!publicIdOrUrl.includes('cloudinary.com') && (publicIdOrUrl.startsWith('http://') || publicIdOrUrl.startsWith('https://'))) {
      return publicIdOrUrl;
    }

    const {
      width = 400,
      height = 400,
      crop = 'fill',
      quality = 'auto',
      format = 'auto',
    } = options;

    const transforms = `w_${width},h_${height},c_${crop},q_${quality},f_${format}`;

    // Extract public ID if full URL passed
    if (publicIdOrUrl.includes('/upload/')) {
      return publicIdOrUrl.replace('/upload/', `/upload/${transforms}/`);
    }

    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transforms}/${publicIdOrUrl}`;
  }

  /**
   * Safe server-side deletion of Cloudinary assets
   */
  async deleteAsset(publicId: string): Promise<boolean> {
    if (!this.apiKey || !this.apiSecret) {
      console.warn('[Cloudinary] Skipping deletion: API credentials not configured');
      return true;
    }

    try {
      const timestamp = Math.round(Date.now() / 1000);
      const signature = crypto
        .createHash('sha1')
        .update(`public_id=${publicId}&timestamp=${timestamp}${this.apiSecret}`)
        .digest('hex');

      const formData = new URLSearchParams({
        public_id: publicId,
        timestamp: timestamp.toString(),
        api_key: this.apiKey,
        signature,
      });

      const res = await fetch(`https://api.cloudinary.com/v1_1/${this.cloudName}/image/destroy`, {
        method: 'POST',
        body: formData,
      });

      return res.ok;
    } catch (err) {
      console.error('[Cloudinary Deletion Error]:', err);
      return false;
    }
  }
}

export const cloudinaryService = new CloudinaryService();
