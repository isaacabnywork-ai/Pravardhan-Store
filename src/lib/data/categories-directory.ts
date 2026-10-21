export interface CategoryDirectoryItem {
  id: string;
  name: string;
  image: string;
  categorySlug: string;
  subSlug?: string;
  pastelBg: string;
}

export interface CategoryDirectorySection {
  id: string;
  title: string;
  items: CategoryDirectoryItem[];
}

export const CATEGORY_DIRECTORY_SECTIONS: CategoryDirectorySection[] = [
  {
    id: 'groceries-staples',
    title: 'Groceries & Kitchen Staples',
    items: [
      {
        id: 'staples-atta',
        name: 'Atta & Flours',
        image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80',
        categorySlug: 'groceries-staples',
        subSlug: 'flour-atta',
        pastelBg: 'bg-[#FEF7EC]',
      },
      {
        id: 'staples-rice',
        name: 'Rice & Grains',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
        categorySlug: 'groceries-staples',
        subSlug: 'rice-grains',
        pastelBg: 'bg-[#E8F5FA]',
      },
      {
        id: 'staples-dal',
        name: 'Dals & Pulses',
        image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80',
        categorySlug: 'groceries-staples',
        subSlug: 'pulses-dal',
        pastelBg: 'bg-[#FEF7EC]',
      },
      {
        id: 'staples-oil',
        name: 'Cooking Oils & Ghee',
        image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=400&q=80',
        categorySlug: 'groceries-staples',
        subSlug: 'cooking-oils',
        pastelBg: 'bg-[#FEF7EC]',
      },
    ],
  },
  {
    id: 'snacks-drinks',
    title: 'Snacks & Drinks',
    items: [
      {
        id: 'snack-chips',
        name: 'Chips & Namkeen',
        image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80',
        categorySlug: 'snacks-munchies',
        subSlug: 'namkeen',
        pastelBg: 'bg-[#E8F5FA]',
      },
      {
        id: 'snack-sweets',
        name: 'Sweets & Chocolates',
        image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=400&q=80',
        categorySlug: 'snacks-munchies',
        subSlug: 'sweets-chocolates',
        pastelBg: 'bg-[#FDF2F4]',
      },
      {
        id: 'snack-drinks',
        name: 'Drinks & Juices',
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=400&q=80',
        categorySlug: 'beverages',
        subSlug: 'juices-sharbat',
        pastelBg: 'bg-[#FEF7EC]',
      },
      {
        id: 'snack-tea-coffee',
        name: 'Tea, Coffee & Milk Drinks',
        image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=400&q=80',
        categorySlug: 'beverages',
        subSlug: 'tea-coffee',
        pastelBg: 'bg-[#EBF7EE]',
      },
      {
        id: 'snack-instant-food',
        name: 'Instant Food',
        image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=400&q=80',
        categorySlug: 'snacks-munchies',
        subSlug: 'instant-food',
        pastelBg: 'bg-[#FEF7EC]',
      },
      {
        id: 'snack-sauces',
        name: 'Sauces & Spreads',
        image: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=400&q=80',
        categorySlug: 'groceries-staples',
        subSlug: 'sauces-spreads',
        pastelBg: 'bg-[#FDF2F4]',
      },
      {
        id: 'snack-paan',
        name: 'Paan Corner',
        image: 'https://images.unsplash.com/photo-1587393855524-087f83d95bc9?auto=format&fit=crop&w=400&q=80',
        categorySlug: 'snacks-munchies',
        subSlug: 'mouth-fresheners',
        pastelBg: 'bg-[#EBF7EE]',
      },
      {
        id: 'snack-ice-cream',
        name: 'Ice Creams & More',
        image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=400&q=80',
        categorySlug: 'dairy-breakfast',
        subSlug: 'ice-creams',
        pastelBg: 'bg-[#E8F5FA]',
      },
    ],
  },
  {
    id: 'beauty-personal-care',
    title: 'Beauty & Personal Care',
    items: [
      {
        id: 'beauty-bath',
        name: 'Bath & Body',
        image: 'https://images.unsplash.com/photo-1608248597359-5975549e31d0?auto=format&fit=crop&w=400&q=80',
        categorySlug: 'personal-care',
        subSlug: 'bath-soaps',
        pastelBg: 'bg-[#E8F5FA]',
      },
      {
        id: 'beauty-hair',
        name: 'Hair',
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80',
        categorySlug: 'personal-care',
        subSlug: 'haircare',
        pastelBg: 'bg-[#FDF2F4]',
      },
      {
        id: 'beauty-skin',
        name: 'Skin & Face',
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
        categorySlug: 'personal-care',
        subSlug: 'skin-care',
        pastelBg: 'bg-[#FEF7EC]',
      },
      {
        id: 'beauty-cosmetics',
        name: 'Beauty & Cosmetics',
        image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=400&q=80',
        categorySlug: 'personal-care',
        subSlug: 'cosmetics',
        pastelBg: 'bg-[#FDF2F4]',
      },
      {
        id: 'beauty-hygiene',
        name: 'Feminine Hygiene',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80',
        categorySlug: 'personal-care',
        subSlug: 'hygiene',
        pastelBg: 'bg-[#FDF2F4]',
      },
      {
        id: 'beauty-baby',
        name: 'Baby Care',
        image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=400&q=80',
        categorySlug: 'personal-care',
        subSlug: 'baby-care',
        pastelBg: 'bg-[#E8F5FA]',
      },
      {
        id: 'beauty-health',
        name: 'Health & Pharma',
        image: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?auto=format&fit=crop&w=400&q=80',
        categorySlug: 'personal-care',
        subSlug: 'health-pharma',
        pastelBg: 'bg-[#EBF7EE]',
      },
      {
        id: 'beauty-wellness',
        name: 'Sexual Wellness',
        image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=400&q=80',
        categorySlug: 'personal-care',
        subSlug: 'wellness',
        pastelBg: 'bg-[#F1F5F9]',
      },
    ],
  },
  {
    id: 'household-essentials',
    title: 'Household Essentials',
    items: [
      {
        id: 'house-lifestyle',
        name: 'Home & Lifestyle',
        image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=400&q=80',
        categorySlug: 'cleaning-household',
        subSlug: 'home-lifestyle',
        pastelBg: 'bg-[#FEF7EC]',
      },
      {
        id: 'house-cleaners',
        name: 'Cleaners & Repellents',
        image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=400&q=80',
        categorySlug: 'cleaning-household',
        subSlug: 'detergents',
        pastelBg: 'bg-[#E8F5FA]',
      },
      {
        id: 'house-electronics',
        name: 'Electronics',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',
        categorySlug: 'cleaning-household',
        subSlug: 'electronics',
        pastelBg: 'bg-[#E8F5FA]',
      },
      {
        id: 'house-stationery',
        name: 'Stationery & Games',
        image: 'https://images.unsplash.com/photo-1585336261026-7f41f12952bf?auto=format&fit=crop&w=400&q=80',
        categorySlug: 'cleaning-household',
        subSlug: 'stationery',
        pastelBg: 'bg-[#EBF7EE]',
      },
    ],
  },
  {
    id: 'farm-fresh-mandi',
    title: 'Farm Fresh & Mandi',
    items: [
      {
        id: 'fresh-veg',
        name: 'Fresh Vegetables',
        image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80',
        categorySlug: 'fruits-vegetables',
        subSlug: 'fresh-vegetables',
        pastelBg: 'bg-[#EBF7EE]',
      },
      {
        id: 'fresh-fruit',
        name: 'Fresh Fruits',
        image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80',
        categorySlug: 'fruits-vegetables',
        subSlug: 'fresh-fruits',
        pastelBg: 'bg-[#FDF2F4]',
      },
      {
        id: 'fresh-greens',
        name: 'Leafy Greens & Herbs',
        image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80',
        categorySlug: 'fruits-vegetables',
        subSlug: 'leafy-greens',
        pastelBg: 'bg-[#EBF7EE]',
      },
      {
        id: 'fresh-dairy',
        name: 'Dairy & Farm Eggs',
        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80',
        categorySlug: 'dairy-breakfast',
        subSlug: 'farm-eggs',
        pastelBg: 'bg-[#E8F5FA]',
      },
    ],
  },
];
