import { z } from 'zod';
import { paginationQuerySchema } from './common';

export const createProductVariantSchema = z.object({
  sku: z.string().trim().min(3, 'SKU must be at least 3 characters').max(50),
  title: z.string().trim().min(1, 'Title required (e.g. 1 KG, 500g)').max(100),
  unit: z.string().trim().min(1, 'Unit description required').max(50),
  mrp: z.number().int('MRP must be in paise').min(100, 'MRP must be at least 100 paise (₹1.00)'),
  price: z.number().int('Price must be in paise').min(100, 'Price must be at least 100 paise (₹1.00)'),
  image: z.string().optional(),
  initialStock: z.number().int().min(0, 'Initial stock cannot be negative').default(50),
}).refine((data) => data.price <= data.mrp, {
  message: 'Selling price cannot exceed Maximum Retail Price (MRP)',
  path: ['price'],
});

export const createProductSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(200, 'Name cannot exceed 200 characters'),
  slug: z.string().trim().min(2).max(200).toLowerCase(),
  brand: z.string().trim().min(1, 'Brand is required').max(100),
  categoryId: z.string().min(1, 'Category is required'),
  subcategoryId: z.string().optional(),
  description: z.string().trim().max(2000, 'Description cannot exceed 2000 characters').optional(),
  features: z.array(z.string().trim()).default([]),
  images: z.array(z.string()).min(1, 'At least one product image is required'),
  isFeatured: z.boolean().default(false),
  isPopular: z.boolean().default(false),
  isOrganic: z.boolean().default(false),
  variants: z.array(createProductVariantSchema).min(1, 'At least one variant is required'),
});

export const updateProductSchema = z.object({
  name: z.string().trim().min(2).max(200).optional(),
  brand: z.string().trim().min(1).max(100).optional(),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional().nullable(),
  description: z.string().trim().max(2000).optional().nullable(),
  features: z.array(z.string().trim()).optional(),
  images: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  isPopular: z.boolean().optional(),
  isOrganic: z.boolean().optional(),
  status: z.enum(['PUBLISHED', 'DRAFT', 'OUT_OF_STOCK', 'ARCHIVED']).optional(),
});

export const productListQuerySchema = paginationQuerySchema.extend({
  category: z.string().optional(),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  search: z.string().trim().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  featured: z.enum(['true', 'false']).optional(),
  popular: z.enum(['true', 'false']).optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'rating_desc', 'newest', 'popular']).optional().default('popular'),
  storeId: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateVariantInput = z.infer<typeof createProductVariantSchema>;
export type ProductListQueryInput = z.infer<typeof productListQuerySchema>;
