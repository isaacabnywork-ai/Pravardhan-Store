import { PrismaClient, Role, ProductStatus, InventoryChangeType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_STORE_SETTINGS,
} from '../src/lib/data/mock-data';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Pravdhan Store database seed...');

  // 1. Seed Store Configuration
  console.log('📍 Seeding primary fulfillment store...');
  const store = await prisma.store.upsert({
    where: { code: 'STR-GGM-01' },
    update: {
      name: INITIAL_STORE_SETTINGS.storeName,
      serviceArea: INITIAL_STORE_SETTINGS.serviceArea,
      city: INITIAL_STORE_SETTINGS.city,
      minOrderValue: INITIAL_STORE_SETTINGS.minimumOrderValue * 100, // paise
      deliveryFee: INITIAL_STORE_SETTINGS.defaultDeliveryCharge * 100,
      freeDeliveryThreshold: INITIAL_STORE_SETTINGS.freeDeliveryThreshold * 100,
      operatingHours: INITIAL_STORE_SETTINGS.operatingHours,
      supportPhone: INITIAL_STORE_SETTINGS.supportPhone,
      supportEmail: INITIAL_STORE_SETTINGS.supportEmail,
    },
    create: {
      code: 'STR-GGM-01',
      name: INITIAL_STORE_SETTINGS.storeName,
      address: 'Shop No. 12-14, Main Market, Sector 14',
      city: INITIAL_STORE_SETTINGS.city,
      serviceArea: INITIAL_STORE_SETTINGS.serviceArea,
      minOrderValue: INITIAL_STORE_SETTINGS.minimumOrderValue * 100,
      deliveryFee: INITIAL_STORE_SETTINGS.defaultDeliveryCharge * 100,
      freeDeliveryThreshold: INITIAL_STORE_SETTINGS.freeDeliveryThreshold * 100,
      operatingHours: INITIAL_STORE_SETTINGS.operatingHours,
      supportPhone: INITIAL_STORE_SETTINGS.supportPhone,
      supportEmail: INITIAL_STORE_SETTINGS.supportEmail,
      isActive: true,
    },
  });

  // 2. Seed Staff Accounts with Argon2/Bcrypt Password Hashes
  console.log('👤 Seeding staff role accounts...');
  const salt = await bcrypt.genSalt(12);
  const defaultPasswordHash = await bcrypt.hash('PravdhanAdmin@2026!', salt);

  const staffUsers = [
    {
      email: 'admin@pravdhanstore.in',
      phone: '+919999900001',
      name: 'Super Admin',
      role: Role.SUPER_ADMIN,
    },
    {
      email: 'pm@pravdhanstore.in',
      phone: '+919999900002',
      name: 'Catalog Manager',
      role: Role.PRODUCT_MANAGER,
    },
    {
      email: 'om@pravdhanstore.in',
      phone: '+919999900003',
      name: 'Dispatch Manager',
      role: Role.ORDER_MANAGER,
    },
    {
      email: 'sm@pravdhanstore.in',
      phone: '+919999900004',
      name: 'Store Manager (Gurugram)',
      role: Role.STORE_MANAGER,
    },
    {
      email: 'rider@pravdhanstore.in',
      phone: '+919876543210',
      name: 'Rajesh Kumar (Express Delivery)',
      role: Role.DELIVERY_STAFF,
    },
  ];

  for (const staff of staffUsers) {
    await prisma.user.upsert({
      where: { email: staff.email },
      update: {
        name: staff.name,
        role: staff.role,
        isActive: true,
      },
      create: {
        email: staff.email,
        phone: staff.phone,
        passwordHash: defaultPasswordHash,
        name: staff.name,
        role: staff.role,
        isActive: true,
      },
    });
  }

  // 3. Seed Categories & Subcategories
  console.log('🏷️  Seeding product categories & subcategories...');
  for (let cIdx = 0; cIdx < INITIAL_CATEGORIES.length; cIdx++) {
    const cat = INITIAL_CATEGORIES[cIdx];
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        icon: cat.icon,
        image: cat.image,
        description: cat.description,
        displayOrder: cIdx + 1,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        image: cat.image,
        description: cat.description,
        displayOrder: cIdx + 1,
        isActive: true,
      },
    });

    if (cat.subcategories && cat.subcategories.length > 0) {
      for (let sIdx = 0; sIdx < cat.subcategories.length; sIdx++) {
        const sub = cat.subcategories[sIdx];
        await prisma.subcategory.upsert({
          where: { slug: sub.slug },
          update: {
            name: sub.name,
            image: sub.image,
            displayOrder: sIdx + 1,
            categoryId: category.id,
          },
          create: {
            categoryId: category.id,
            name: sub.name,
            slug: sub.slug,
            image: sub.image,
            displayOrder: sIdx + 1,
            isActive: true,
          },
        });
      }
    }
  }

  // 4. Seed Products, Variants, and Inventory
  console.log('📦 Seeding products, variants, and stock balances...');
  for (const p of INITIAL_PRODUCTS) {
    const category = await prisma.category.findUnique({
      where: { slug: p.categoryId.replace('cat-', '') },
    }).catch(() => null);

    // Resolve category id by fallback or direct search
    const actualCategory =
      category || (await prisma.category.findFirst({ where: { name: { contains: 'Groceries' } } }));

    if (!actualCategory) continue;

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        brand: p.brand,
        categoryId: actualCategory.id,
        description: p.description,
        features: p.features || [],
        images: p.images || [],
        isFeatured: p.isFeatured ?? false,
        isPopular: p.isPopular ?? false,
        isOrganic: p.isOrganic ?? false,
        rating: p.rating || 4.8,
        reviewCount: p.reviewCount || 10,
        status: ProductStatus.PUBLISHED,
      },
      create: {
        name: p.name,
        slug: p.slug,
        brand: p.brand,
        categoryId: actualCategory.id,
        description: p.description,
        features: p.features || [],
        images: p.images || [],
        isFeatured: p.isFeatured ?? false,
        isPopular: p.isPopular ?? false,
        isOrganic: p.isOrganic ?? false,
        rating: p.rating || 4.8,
        reviewCount: p.reviewCount || 10,
        status: ProductStatus.PUBLISHED,
      },
    });

    // Seed Variants & Store Stock
    for (const v of p.variants) {
      const variant = await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: {
          title: v.title,
          unit: v.unit,
          mrp: Math.round(v.mrp * 100), // in paise
          price: Math.round(v.price * 100), // in paise
          image: v.image,
          productId: product.id,
        },
        create: {
          productId: product.id,
          sku: v.sku,
          title: v.title,
          unit: v.unit,
          mrp: Math.round(v.mrp * 100),
          price: Math.round(v.price * 100),
          image: v.image,
          isActive: true,
        },
      });

      // Seed Inventory for this Store
      await prisma.inventory.upsert({
        where: {
          storeId_variantId: {
            storeId: store.id,
            variantId: variant.id,
          },
        },
        update: {
          quantity: v.stock,
          reservedQuantity: v.reservedStock || 0,
        },
        create: {
          storeId: store.id,
          variantId: variant.id,
          quantity: v.stock,
          reservedQuantity: v.reservedStock || 0,
          lowStockThreshold: 5,
        },
      });
    }
  }

  console.log('✅ Pravdhan Store database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
