import { z } from 'zod';

export const productListQuerySchema = z.object({
  category: z.string().optional(),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  featured: z.enum(['true', 'false']).optional(),
  popular: z.enum(['true', 'false']).optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'rating_desc', 'newest', 'popular']).optional().default('popular'),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
  storeId: z.string().optional(),
});

export type ProductListQuery = z.infer<typeof productListQuerySchema>;

export const createProductVariantSchema = z.object({
  sku: z.string().min(3, 'SKU must be at least 3 characters'),
  title: z.string().min(1, 'Variant title is required (e.g. 1 KG)'),
  unit: z.string().min(1, 'Unit description is required'),
  mrp: z.number().int().min(100, 'MRP must be at least 100 paise (₹1.00)'),
  price: z.number().int().min(100, 'Price must be at least 100 paise (₹1.00)'),
  image: z.string().url().optional(),
  initialStock: z.number().int().min(0).default(50),
});

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  slug: z.string().min(2, 'Product slug is required'),
  brand: z.string().min(1, 'Brand is required'),
  categoryId: z.string().min(1, 'Category ID is required'),
  subcategoryId: z.string().optional(),
  description: z.string().optional(),
  features: z.array(z.string()).default([]),
  images: z.array(z.string().url()).min(1, 'At least one product image is required'),
  isFeatured: z.boolean().default(false),
  isPopular: z.boolean().default(false),
  isOrganic: z.boolean().default(false),
  variants: z.array(createProductVariantSchema).min(1, 'At least one product variant is required'),
});

export const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  brand: z.string().optional(),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional().nullable(),
  description: z.string().optional(),
  features: z.array(z.string()).optional(),
  images: z.array(z.string().url()).optional(),
  isFeatured: z.boolean().optional(),
  isPopular: z.boolean().optional(),
  isOrganic: z.boolean().optional(),
  status: z.enum(['PUBLISHED', 'DRAFT', 'OUT_OF_STOCK', 'ARCHIVED']).optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  slug: z.string().min(2, 'Category slug is required'),
  icon: z.string().optional(),
  image: z.string().url().optional(),
  description: z.string().optional(),
  displayOrder: z.number().int().default(0),
});
