import { env } from '@/lib/env';

export interface StorageConfig {
  provider: 'S3' | 'CLOUDINARY';
  bucket?: string;
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
}

export interface StorageSignature {
  provider: 'S3' | 'CLOUDINARY';
  uploadUrl: string;
  fields: Record<string, string>;
  maxFileSize: number; // 5 MB
  allowedMimeTypes: string[];
}

export class StorageService {
  private readonly provider: 'S3' | 'CLOUDINARY';

  constructor() {
    this.provider = (process.env.STORAGE_PROVIDER as 'S3' | 'CLOUDINARY') || 'S3';
  }

  getProvider(): 'S3' | 'CLOUDINARY' {
    return (process.env.STORAGE_PROVIDER as 'S3' | 'CLOUDINARY') || 'S3';
  }

  isConfigured(): boolean {
    const prov = this.getProvider();
    if (prov === 'S3') {
      const bucket = process.env.STORAGE_BUCKET || process.env.AWS_S3_BUCKET;
      const accessKeyId = process.env.STORAGE_API_KEY || process.env.AWS_ACCESS_KEY_ID;
      return Boolean(bucket && accessKeyId);
    }
    const cloudName = env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY;
    return Boolean(cloudName && apiKey);
  }

  /**
   * Generates a signed direct-upload configuration.
   * Invariant: Production POD storage strictly fails closed if credentials are absent.
   */
  generateUploadSignature(folder: string): StorageSignature {
    const isProd = process.env.NODE_ENV === 'production';
    const provider = this.getProvider();

    if (provider === 'S3') {
      const bucket = process.env.STORAGE_BUCKET || process.env.AWS_S3_BUCKET;
      const region = process.env.AWS_REGION || 'ap-south-1';
      const accessKeyId = process.env.STORAGE_API_KEY || process.env.AWS_ACCESS_KEY_ID;

      if (isProd && (!bucket || !accessKeyId)) {
        throw new Error('S3 production storage is unconfigured. Uploads fail closed for security.');
      }

      return {
        provider: 'S3',
        uploadUrl: `https://${bucket || 'pravdhan-store-pod'}.s3.${region}.amazonaws.com`,
        fields: {
          key: `${folder}/\${filename}`,
          'Content-Type': 'image/jpeg',
          acl: 'private',
        },
        maxFileSize: 5 * 1024 * 1024,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      };
    }

    // Cloudinary provider adapter
    const cloudName = env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY;

    if (isProd && (!cloudName || !apiKey)) {
      throw new Error('Cloudinary storage is unconfigured. Uploads fail closed for security.');
    }

    return {
      provider: 'CLOUDINARY',
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName || 'pravdhan-store'}/image/upload`,
      fields: {
        folder,
        api_key: apiKey || 'dev_key',
      },
      maxFileSize: 5 * 1024 * 1024,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    };
  }
}

export const storageService = new StorageService();
