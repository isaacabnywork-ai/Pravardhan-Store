import { Prisma, ProductStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { NotFoundError, ConflictError } from '@/lib/errors';
import {
  ProductListQuery,
  createProductSchema,
  updateProductSchema,
  createCategorySchema,
} from './schemas';
import { z } from 'zod';

export class CatalogService {
  /**
   * List all active categories with their active subcategories
   */
  async listCategories() {
    return prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        subcategories: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });
  }

  /**
   * Get category by unique slug with subcategories and product counts
   */
  async getCategoryBySlug(slug: string) {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        subcategories: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category || !category.isActive) {
      throw new NotFoundError('Category');
    }

    return category;
  }

  /**
   * Paginated product search, filtering, and sorting
   */
  async listProducts(query: ProductListQuery) {
    const {
      category,
      subcategory,
      brand,
      search,
      featured,
      popular,
      sortBy,
      page,
      pageSize,
      storeId,
    } = query;

    const where: Prisma.ProductWhereInput = {
      status: ProductStatus.PUBLISHED,
    };

    if (category) {
      where.category = { slug: category };
    }

    if (subcategory) {
      where.subcategory = { slug: subcategory };
    }

    if (brand) {
      where.brand = { equals: brand, mode: 'insensitive' };
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    if (popular === 'true') {
      where.isPopular = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Determine sorting criteria
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (sortBy === 'rating_desc') {
      orderBy = { rating: 'desc' };
    } else if (sortBy === 'popular') {
      orderBy = { isPopular: 'desc' };
    } else if (sortBy === 'newest') {
      orderBy = { createdAt: 'desc' };
    }

    const skip = (page - 1) * pageSize;

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          subcategory: {
            select: { id: true, name: true, slug: true },
          },
          variants: {
            where: { isActive: true },
            include: {
              inventory: storeId
                ? {
                    where: { storeId },
                  }
                : true,
            },
          },
        },
      }),
    ]);

    // Format consistent DTO
    const formatted = products.map((p) => {
      const primaryVariant = p.variants[0];
      const stockItem = primaryVariant?.inventory?.[0];
      const availableStock = stockItem
        ? Math.max(0, stockItem.quantity - stockItem.reservedQuantity)
        : 100;

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        brand: p.brand,
        description: p.description,
        rating: p.rating,
        reviewCount: p.reviewCount,
        isFeatured: p.isFeatured,
        isPopular: p.isPopular,
        isOrganic: p.isOrganic,
        category: p.category,
        subcategory: p.subcategory,
        images: p.images,
        primaryVariant: primaryVariant
          ? {
              id: primaryVariant.id,
              sku: primaryVariant.sku,
              title: primaryVariant.title,
              unit: primaryVariant.unit,
              mrp: primaryVariant.mrp,
              price: primaryVariant.price,
              inStock: availableStock > 0,
              availableStock,
            }
          : null,
        variantsCount: p.variants.length,
      };
    });

    return {
      products: formatted,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Retrieve single product by slug with all variants and stock levels
   */
  async getProductBySlug(slug: string, storeId?: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        subcategory: {
          select: { id: true, name: true, slug: true },
        },
        variants: {
          where: { isActive: true },
          include: {
            inventory: storeId
              ? {
                  where: { storeId },
                }
              : true,
          },
        },
      },
    });

    if (!product || product.status === ProductStatus.ARCHIVED) {
      throw new NotFoundError('Product');
    }

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      brand: product.brand,
      description: product.description,
      features: product.features,
      images: product.images,
      rating: product.rating,
      reviewCount: product.reviewCount,
      isOrganic: product.isOrganic,
      category: product.category,
      subcategory: product.subcategory,
      variants: product.variants.map((v) => {
        const stockItem = v.inventory?.[0];
        const availableStock = stockItem
          ? Math.max(0, stockItem.quantity - stockItem.reservedQuantity)
          : 50;

        return {
          id: v.id,
          sku: v.sku,
          title: v.title,
          unit: v.unit,
          mrp: v.mrp,
          price: v.price,
          image: v.image,
          inStock: availableStock > 0,
          availableStock,
        };
      }),
    };
  }

  /**
   * Admin: Create a product and its initial variants atomically
   */
  async createProduct(data: z.infer<typeof createProductSchema>, actorId?: string) {
    const existing = await prisma.product.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      throw new ConflictError(`Product with slug "${data.slug}" already exists`);
    }

    // Find default store for initial inventory
    const defaultStore = await prisma.store.findFirst();

    return prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: data.name,
          slug: data.slug,
          brand: data.brand,
          categoryId: data.categoryId,
          subcategoryId: data.subcategoryId,
          description: data.description,
          features: data.features,
          images: data.images,
          isFeatured: data.isFeatured,
          isPopular: data.isPopular,
          isOrganic: data.isOrganic,
          status: ProductStatus.PUBLISHED,
          variants: {
            create: data.variants.map((v) => ({
              sku: v.sku,
              title: v.title,
              unit: v.unit,
              mrp: v.mrp,
              price: v.price,
              image: v.image,
            })),
          },
        },
        include: {
          variants: true,
        },
      });

      // Initialize inventory if a store exists
      if (defaultStore) {
        for (const variant of product.variants) {
          const matchingInput = data.variants.find((v) => v.sku === variant.sku);
          const initialStock = matchingInput?.initialStock ?? 50;

          await tx.inventory.create({
            data: {
              storeId: defaultStore.id,
              variantId: variant.id,
              quantity: initialStock,
              lowStockThreshold: 5,
            },
          });
        }
      }

      // Record audit log
      if (actorId) {
        await tx.auditLog.create({
          data: {
            actorId,
            action: 'PRODUCT_CREATED',
            entity: 'Product',
            entityId: product.id,
            details: { name: product.name, slug: product.slug },
          },
        });
      }

      return product;
    });
  }

  /**
   * Admin: Update product details
   */
  async updateProduct(
    id: string,
    data: z.infer<typeof updateProductSchema>,
    actorId?: string
  ) {
    const product = await prisma.product.update({
      where: { id },
      data,
    });

    if (actorId) {
      await prisma.auditLog.create({
        data: {
          actorId,
          action: 'PRODUCT_UPDATED',
          entity: 'Product',
          entityId: id,
          details: data,
        },
      }).catch(() => null);
    }

    return product;
  }

  /**
   * Admin: Create a category
   */
  async createCategory(data: z.infer<typeof createCategorySchema>) {
    const existing = await prisma.category.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      throw new ConflictError(`Category with slug "${data.slug}" already exists`);
    }

    return prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        icon: data.icon,
        image: data.image,
        description: data.description,
        displayOrder: data.displayOrder,
      },
    });
  }
}

export const catalogService = new CatalogService();
