import { Category, Product, Address, DeliverySlot, Promotion, Order, Customer } from '@/types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-groceries',
    name: 'Groceries & Staples',
    slug: 'groceries',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
    itemCount: 42,
    subCategories: ['Atta & Flours', 'Rice & Poha', 'Dals & Pulses', 'Edible Oils & Ghee', 'Salt, Sugar & Jaggery', 'Spices & Masalas']
  },
  {
    id: 'cat-fruits-veg',
    name: 'Fruits & Vegetables',
    slug: 'fruits-vegetables',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80',
    itemCount: 38,
    subCategories: ['Fresh Fruits', 'Fresh Vegetables', 'Leafy Greens', 'Seasonal Special', 'Organic Picks']
  },
  {
    id: 'cat-dairy',
    name: 'Dairy & Breakfast',
    slug: 'dairy-breakfast',
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=400&q=80',
    itemCount: 29,
    subCategories: ['Milk & Curd', 'Paneer & Tofu', 'Butter & Cheese', 'Bread & Bakery', 'Eggs', 'Cereals & Oats']
  },
  {
    id: 'cat-snacks',
    name: 'Snacks & Munchies',
    slug: 'snacks',
    image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=400&q=80',
    itemCount: 54,
    subCategories: ['Biscuits & Cookies', 'Namkeen & Bhujia', 'Chips & Crisps', 'Chocolates & Candies', 'Noodles & Pasta']
  },
  {
    id: 'cat-beverages',
    name: 'Beverages & Drinks',
    slug: 'beverages',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=400&q=80',
    itemCount: 31,
    subCategories: ['Tea & Chai', 'Coffee', 'Juices & Fruit Drinks', 'Soft Drinks', 'Energy & Health Drinks']
  },
  {
    id: 'cat-household',
    name: 'Household & Cleaning',
    slug: 'household-cleaning',
    image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=400&q=80',
    itemCount: 26,
    subCategories: ['Detergents & Fabric Care', 'Dishwashers', 'Floor & Surface Cleaners', 'Pooja Needs', 'Kitchen Rolls & Trash Bags']
  },
  {
    id: 'cat-personal-care',
    name: 'Personal Care',
    slug: 'personal-care',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
    itemCount: 35,
    subCategories: ['Soaps & Body Wash', 'Hair Care & Shampoo', 'Oral Care', 'Skin Care & Lotions', 'Sanitary & Wellness']
  },
  {
    id: 'cat-instant',
    name: 'Instant & Frozen',
    slug: 'instant-frozen',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80',
    itemCount: 18,
    subCategories: ['Frozen Veg & Peas', 'Ready to Cook', 'Batters & Chutneys', 'Instant Soups & Mixes']
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-atta-1',
    name: 'Aashirvaad Shudh Chakki Atta',
    brand: 'Aashirvaad',
    category: 'Groceries & Staples',
    subCategory: 'Atta & Flours',
    description: '100% pure whole wheat grain flour made with traditional chakki grinding process. High in fiber, creates soft, fluffy rotis naturally rich in nutrients.',
    images: [
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80'
    ],
    rating: 4.8,
    ratingCount: 3420,
    isVeg: true,
    tags: ['Bestseller', 'Daily Essential'],
    featured: true,
    status: 'active',
    createdAt: '2026-01-10T10:00:00Z',
    storageInfo: 'Store in an airtight container in a cool, dry place away from moisture.',
    shelfLife: '3 Months from Packaging',
    origin: 'Madhya Pradesh, India',
    nutrition: {
      calories: '364 kcal/100g',
      protein: '11.8g',
      carbs: '74g',
      fat: '1.6g'
    },
    variants: [
      { id: 'var-atta-1kg', weight: '1 KG', price: 62, mrp: 68, discountPercent: 9, stock: 45, sku: 'AASH-ATT-1K' },
      { id: 'var-atta-5kg', weight: '5 KG', price: 280, mrp: 320, discountPercent: 12, stock: 80, sku: 'AASH-ATT-5K', isDefault: true },
      { id: 'var-atta-10kg', weight: '10 KG', price: 540, mrp: 610, discountPercent: 11, stock: 24, sku: 'AASH-ATT-10K' }
    ]
  },
  {
    id: 'prod-oil-fortune',
    name: 'Fortune Sunlite Refined Sunflower Oil',
    brand: 'Fortune',
    category: 'Groceries & Staples',
    subCategory: 'Edible Oils & Ghee',
    description: 'Enriched with Vitamin A and Vitamin D. Light, clear, and cholesterol-friendly cooking oil suited for everyday frying and curries.',
    images: [
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80'
    ],
    rating: 4.7,
    ratingCount: 1850,
    isVeg: true,
    tags: ['Deal of the Day'],
    featured: true,
    status: 'active',
    createdAt: '2026-01-12T10:00:00Z',
    storageInfo: 'Store away from direct sunlight.',
    shelfLife: '9 Months',
    origin: 'Gujarat, India',
    variants: [
      { id: 'var-oil-1l', weight: '1 L Pouch', price: 135, mrp: 165, discountPercent: 18, stock: 60, sku: 'FORT-SUN-1L', isDefault: true },
      { id: 'var-oil-5l', weight: '5 L Jar', price: 660, mrp: 799, discountPercent: 17, stock: 18, sku: 'FORT-SUN-5L' }
    ]
  },
  {
    id: 'prod-amul-milk',
    name: 'Amul Taaza Homogenised Toned Milk',
    brand: 'Amul',
    category: 'Dairy & Breakfast',
    subCategory: 'Milk & Curd',
    description: 'Fresh toned milk processed with ultra-high temperature (UHT) technology. Delicious, safe, and ready to consume without boiling.',
    images: [
      'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80'
    ],
    rating: 4.9,
    ratingCount: 5210,
    isVeg: true,
    tags: ['Fresh Daily', 'Top Pick'],
    featured: true,
    status: 'active',
    createdAt: '2026-01-15T10:00:00Z',
    storageInfo: 'Refrigerate once opened and consume within 2 days.',
    shelfLife: '180 Days (Unopened)',
    origin: 'Anand, Gujarat',
    nutrition: {
      calories: '58 kcal/100ml',
      protein: '3.1g',
      carbs: '4.7g',
      fat: '3.0g'
    },
    variants: [
      { id: 'var-milk-500ml', weight: '500 ML', price: 27, mrp: 28, discountPercent: 4, stock: 120, sku: 'AMUL-TZ-500' },
      { id: 'var-milk-1l', weight: '1 Litre Tetra', price: 72, mrp: 75, discountPercent: 4, stock: 95, sku: 'AMUL-TZ-1L', isDefault: true }
    ]
  },
  {
    id: 'prod-tata-salt',
    name: 'Tata Salt Vacuum Evaporated Iodized Salt',
    brand: 'Tata',
    category: 'Groceries & Staples',
    subCategory: 'Salt, Sugar & Jaggery',
    description: 'Desh Ka Namak with guaranteed iodine content that supports cognitive development in children. Pure, free-flowing crystal white salt.',
    images: [
      'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?auto=format&fit=crop&w=600&q=80'
    ],
    rating: 4.9,
    ratingCount: 4200,
    isVeg: true,
    tags: ['Pantry Essential'],
    featured: false,
    status: 'active',
    createdAt: '2026-01-08T10:00:00Z',
    variants: [
      { id: 'var-salt-1kg', weight: '1 KG', price: 27, mrp: 28, discountPercent: 4, stock: 200, sku: 'TATA-SLT-1K', isDefault: true }
    ]
  },
  {
    id: 'prod-mango-alphonso',
    name: 'Ratnagiri Alphonso Mango (Hapus)',
    brand: 'Farm Fresh',
    category: 'Fruits & Vegetables',
    subCategory: 'Fresh Fruits',
    description: 'Naturally ripened, premium Grade-A Ratnagiri Alphonso mangoes. Golden aroma, rich creamy pulp, and exquisite sweetness straight from certified orchards.',
    images: [
      'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80'
    ],
    rating: 4.8,
    ratingCount: 940,
    isVeg: true,
    tags: ['Fresh Picks', 'Season Special'],
    featured: true,
    status: 'active',
    createdAt: '2026-02-01T10:00:00Z',
    storageInfo: 'Keep at room temperature until fully ripe, then chill before eating.',
    shelfLife: '4-5 Days',
    origin: 'Ratnagiri, Maharashtra',
    variants: [
      { id: 'var-mango-box6', weight: 'Box of 6 Pcs', price: 499, mrp: 650, discountPercent: 23, stock: 35, sku: 'FRT-ALPH-6P', isDefault: true },
      { id: 'var-mango-box12', weight: 'Box of 12 Pcs (1 Dozen)', price: 949, mrp: 1250, discountPercent: 24, stock: 15, sku: 'FRT-ALPH-12P' }
    ]
  },
  {
    id: 'prod-shimla-apple',
    name: 'Crisp Shimla Royal Delicious Apples',
    brand: 'Farm Fresh',
    category: 'Fruits & Vegetables',
    subCategory: 'Fresh Fruits',
    description: 'Freshly harvested handpicked juicy apples from Himachal orchards. Crisp texture, balanced sweetness, packed with healthy dietary fiber.',
    images: [
      'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80'
    ],
    rating: 4.6,
    ratingCount: 620,
    isVeg: true,
    tags: ['Fresh Picks'],
    featured: false,
    status: 'active',
    createdAt: '2026-02-05T10:00:00Z',
    variants: [
      { id: 'var-apple-500g', weight: '500 G (3-4 pcs)', price: 95, mrp: 120, discountPercent: 21, stock: 40, sku: 'FRT-APL-500' },
      { id: 'var-apple-1kg', weight: '1 KG (6-8 pcs)', price: 179, mrp: 230, discountPercent: 22, stock: 55, sku: 'FRT-APL-1K', isDefault: true }
    ]
  },
  {
    id: 'prod-veg-tomato',
    name: 'Farm Fresh Hybrid Red Tomatoes',
    brand: 'Farm Fresh',
    category: 'Fruits & Vegetables',
    subCategory: 'Fresh Vegetables',
    description: 'Firm, juicy, ripe red farm tomatoes, ideal for curries, salads, and fresh gravies. Washed and hygienically packed.',
    images: [
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80'
    ],
    rating: 4.7,
    ratingCount: 1420,
    isVeg: true,
    tags: ['Fresh Daily'],
    featured: true,
    status: 'active',
    createdAt: '2026-02-10T10:00:00Z',
    variants: [
      { id: 'var-tomato-500g', weight: '500 G', price: 22, mrp: 30, discountPercent: 27, stock: 75, sku: 'VEG-TOM-500' },
      { id: 'var-tomato-1kg', weight: '1 KG', price: 39, mrp: 55, discountPercent: 29, stock: 110, sku: 'VEG-TOM-1K', isDefault: true }
    ]
  },
  {
    id: 'prod-veg-potato',
    name: 'Fresh Jyoti Table Potatoes',
    brand: 'Farm Fresh',
    category: 'Fruits & Vegetables',
    subCategory: 'Fresh Vegetables',
    description: 'Fresh new-crop earth-dusted starchy potatoes, perfect for crisp sabzis, parathas, and roasting.',
    images: [
      'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80'
    ],
    rating: 4.7,
    ratingCount: 980,
    isVeg: true,
    tags: ['Kitchen Staple'],
    featured: false,
    status: 'active',
    createdAt: '2026-02-10T10:00:00Z',
    variants: [
      { id: 'var-potato-1kg', weight: '1 KG', price: 32, mrp: 40, discountPercent: 20, stock: 130, sku: 'VEG-POT-1K', isDefault: true },
      { id: 'var-potato-2kg', weight: '2 KG', price: 59, mrp: 78, discountPercent: 24, stock: 85, sku: 'VEG-POT-2K' }
    ]
  },
  {
    id: 'prod-veg-onion',
    name: 'Nashik Red Onions',
    brand: 'Farm Fresh',
    category: 'Fruits & Vegetables',
    subCategory: 'Fresh Vegetables',
    description: 'Crisp, pungent red onions sourced directly from Maharashtra farmers. Consistent size and superior cooking flavour.',
    images: [
      'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=600&q=80'
    ],
    rating: 4.8,
    ratingCount: 2100,
    isVeg: true,
    tags: ['Daily Essential'],
    featured: true,
    status: 'active',
    createdAt: '2026-02-10T10:00:00Z',
    variants: [
      { id: 'var-onion-1kg', weight: '1 KG', price: 38, mrp: 50, discountPercent: 24, stock: 160, sku: 'VEG-ONI-1K', isDefault: true },
      { id: 'var-onion-2kg', weight: '2 KG', price: 72, mrp: 95, discountPercent: 24, stock: 90, sku: 'VEG-ONI-2K' }
    ]
  },
  {
    id: 'prod-amul-butter',
    name: 'Amul Pasteurized Butter',
    brand: 'Amul',
    category: 'Dairy & Breakfast',
    subCategory: 'Butter & Cheese',
    description: 'The utterly butterly delicious salted butter made from pure fresh cream. Loved across Indian households for breakfast and gourmet cooking.',
    images: [
      'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=600&q=80'
    ],
    rating: 4.9,
    ratingCount: 3950,
    isVeg: true,
    tags: ['Bestseller'],
    featured: true,
    status: 'active',
    createdAt: '2026-01-20T10:00:00Z',
    variants: [
      { id: 'var-butter-100g', weight: '100 G', price: 58, mrp: 60, discountPercent: 3, stock: 75, sku: 'AMUL-BTR-100' },
      { id: 'var-butter-500g', weight: '500 G', price: 275, mrp: 285, discountPercent: 4, stock: 45, sku: 'AMUL-BTR-500', isDefault: true }
    ]
  },
  {
    id: 'prod-amul-paneer',
    name: 'Amul Fresh Malai Paneer',
    brand: 'Amul',
    category: 'Dairy & Breakfast',
    subCategory: 'Paneer & Tofu',
    description: 'Rich, soft, and moist malai paneer packed with milk protein. Retains softness when cooked in curries, tikkas, and gravies.',
    images: [
      'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80'
    ],
    rating: 4.8,
    ratingCount: 1680,
    isVeg: true,
    tags: ['Fresh Daily'],
    featured: false,
    status: 'active',
    createdAt: '2026-01-22T10:00:00Z',
    variants: [
      { id: 'var-paneer-200g', weight: '200 G', price: 92, mrp: 95, discountPercent: 3, stock: 50, sku: 'AMUL-PAN-200', isDefault: true }
    ]
  },
  {
    id: 'prod-maggi-noodles',
    name: 'Maggi 2-Minute Masala Instant Noodles',
    brand: 'Nestle',
    category: 'Snacks & Munchies',
    subCategory: 'Noodles & Pasta',
    description: 'India’s favorite instant snack enriched with iron and roasted signature Indian spices. Ready in just 2 minutes for delicious comfort.',
    images: [
      'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80'
    ],
    rating: 4.8,
    ratingCount: 4890,
    isVeg: true,
    tags: ['Instant Craving', 'Deal of the Day'],
    featured: true,
    status: 'active',
    createdAt: '2026-01-18T10:00:00Z',
    variants: [
      { id: 'var-maggi-pack4', weight: 'Pack of 4 (280g)', price: 54, mrp: 60, discountPercent: 10, stock: 85, sku: 'MAG-MAS-4P', isDefault: true },
      { id: 'var-maggi-pack8', weight: 'Pack of 8 (560g)', price: 105, mrp: 120, discountPercent: 12, stock: 40, sku: 'MAG-MAS-8P' }
    ]
  },
  {
    id: 'prod-britannia-goodday',
    name: 'Britannia Good Day Cashew Cookies',
    brand: 'Britannia',
    category: 'Snacks & Munchies',
    subCategory: 'Biscuits & Cookies',
    description: 'Butter cookies loaded with crunch of rich cashews and wholesome baked goodness with every delightful smile.',
    images: [
      'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80'
    ],
    rating: 4.7,
    ratingCount: 2450,
    isVeg: true,
    tags: ['Tea Partner'],
    featured: false,
    status: 'active',
    createdAt: '2026-01-19T10:00:00Z',
    variants: [
      { id: 'var-goodday-600g', weight: '600 G Super Saver', price: 125, mrp: 150, discountPercent: 17, stock: 65, sku: 'BRIT-GD-600', isDefault: true }
    ]
  },
  {
    id: 'prod-tata-tea-gold',
    name: 'Tata Tea Gold Leaf & Dust Blend',
    brand: 'Tata Tea',
    category: 'Beverages & Drinks',
    subCategory: 'Tea & Chai',
    description: 'Exquisite balance of strong Assam tea leaves with gently rolled aromatic long leaves for an unmistakable rich aroma and kadak taste.',
    images: [
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80'
    ],
    rating: 4.8,
    ratingCount: 1980,
    isVeg: true,
    tags: ['Morning Chai'],
    featured: true,
    status: 'active',
    createdAt: '2026-01-25T10:00:00Z',
    variants: [
      { id: 'var-tea-500g', weight: '500 G', price: 295, mrp: 340, discountPercent: 13, stock: 50, sku: 'TATA-TG-500', isDefault: true },
      { id: 'var-tea-1kg', weight: '1 KG Jar', price: 560, mrp: 650, discountPercent: 14, stock: 25, sku: 'TATA-TG-1K' }
    ]
  },
  {
    id: 'prod-surf-excel',
    name: 'Surf Excel Matic Top Load Detergent Powder',
    brand: 'Surf Excel',
    category: 'Household & Cleaning',
    subCategory: 'Detergents & Fabric Care',
    description: 'Designed specifically for top load washing machines. Fast stain removal in the machine without manual scrubbing while keeping fabrics bright.',
    images: [
      'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=600&q=80'
    ],
    rating: 4.8,
    ratingCount: 3100,
    isVeg: true,
    tags: ['Mega Savings'],
    featured: true,
    status: 'active',
    createdAt: '2026-01-14T10:00:00Z',
    variants: [
      { id: 'var-surf-2kg', weight: '2 KG Pack', price: 385, mrp: 460, discountPercent: 16, stock: 40, sku: 'SURF-TL-2K', isDefault: true },
      { id: 'var-surf-4kg', weight: '4 KG (+ 1 KG Free)', price: 790, mrp: 980, discountPercent: 19, stock: 20, sku: 'SURF-TL-4K' }
    ]
  },
  {
    id: 'prod-vim-gel',
    name: 'Vim Lemon Dishwash Gel with Power of 100 Lemons',
    brand: 'Vim',
    category: 'Household & Cleaning',
    subCategory: 'Dishwashers',
    description: 'Concentrated gel with active lemon juice that leaves vessels grease-free, sparkling clean, and scratch-free with refreshing lime fragrance.',
    images: [
      'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=600&q=80'
    ],
    rating: 4.8,
    ratingCount: 2200,
    isVeg: true,
    tags: ['Kitchen Essential'],
    featured: false,
    status: 'active',
    createdAt: '2026-01-16T10:00:00Z',
    variants: [
      { id: 'var-vim-750ml', weight: '750 ML Bottle', price: 165, mrp: 199, discountPercent: 17, stock: 55, sku: 'VIM-GEL-750', isDefault: true }
    ]
  },
  {
    id: 'prod-dettol-liquid',
    name: 'Dettol Original Liquid Handwash Refill',
    brand: 'Dettol',
    category: 'Personal Care',
    subCategory: 'Soaps & Body Wash',
    description: 'Trusted 100% germ protection formula enriched with moisturizers. Keeps hands clean, soft, and hygienic everyday.',
    images: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80'
    ],
    rating: 4.9,
    ratingCount: 4100,
    isVeg: true,
    tags: ['Hygiene Choice'],
    featured: false,
    status: 'active',
    createdAt: '2026-01-11T10:00:00Z',
    variants: [
      { id: 'var-dettol-1500ml', weight: '1500 ML Saver Pouch', price: 219, mrp: 289, discountPercent: 24, stock: 35, sku: 'DET-HW-1500', isDefault: true }
    ]
  }
];

export const INITIAL_ADDRESSES: Address[] = [
  {
    id: 'addr-1',
    name: 'Rahul Sharma',
    phone: '+91 98765 43210',
    type: 'home',
    houseNo: 'Flat 402, Shanti Heights',
    street: '14th Cross, 5th Main Road',
    area: 'Indiranagar',
    city: 'Bengaluru',
    pincode: '560038',
    isDefault: true
  },
  {
    id: 'addr-2',
    name: 'Rahul Sharma (Office)',
    phone: '+91 98765 43210',
    type: 'work',
    houseNo: 'Desk #12, Innov8 Hub',
    street: 'Old Airport Road',
    area: 'Domlur',
    city: 'Bengaluru',
    pincode: '560071',
    isDefault: false
  }
];

export const INITIAL_DELIVERY_SLOTS: DeliverySlot[] = [
  { id: 'slot-today-1', date: 'Today, Oct 5', time: '2:00 PM – 4:00 PM', available: true, badge: 'Fast' },
  { id: 'slot-today-2', date: 'Today, Oct 5', time: '4:00 PM – 6:00 PM', available: true, badge: 'Standard' },
  { id: 'slot-today-3', date: 'Today, Oct 5', time: '6:00 PM – 8:00 PM', available: false },
  { id: 'slot-today-4', date: 'Today, Oct 5', time: '8:00 PM – 10:00 PM', available: true, badge: 'Standard' },
  { id: 'slot-tmr-1', date: 'Tomorrow, Oct 6', time: '7:00 AM – 9:00 AM', available: true, badge: 'Eco' },
  { id: 'slot-tmr-2', date: 'Tomorrow, Oct 6', time: '9:00 AM – 11:00 AM', available: true, badge: 'Standard' },
  { id: 'slot-tmr-3', date: 'Tomorrow, Oct 6', time: '2:00 PM – 4:00 PM', available: true, badge: 'Standard' },
];

export const INITIAL_PROMOTIONS: Promotion[] = [
  {
    id: 'promo-fresh50',
    code: 'FRESH50',
    title: '₹50 Flat Off on Fresh Produce',
    description: 'Get ₹50 flat discount on orders above ₹399 with fresh vegetables & fruits',
    discountType: 'flat',
    discountValue: 50,
    minOrderValue: 399,
    validUntil: 'Oct 31, 2026',
    category: 'Fruits & Vegetables'
  },
  {
    id: 'promo-prabhandhan100',
    code: 'PRABHANDHAN100',
    title: '₹100 Off on Family Grocery Cart',
    description: 'Save ₹100 instantly on your monthly staples and grocery cart above ₹999',
    discountType: 'flat',
    discountValue: 100,
    minOrderValue: 999,
    validUntil: 'Oct 25, 2026'
  },
  {
    id: 'promo-mega15',
    code: 'MEGA15',
    title: '15% Off Bestsellers (Up to ₹150)',
    description: 'Enjoy 15% instant discount on orders above ₹699 across pantry essentials',
    discountType: 'percent',
    discountValue: 15,
    minOrderValue: 699,
    maxDiscount: 150,
    validUntil: 'Nov 15, 2026'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 'PB-98241',
    createdAt: '2026-10-05T12:15:00Z',
    status: 'READY',
    items: [
      {
        productId: 'prod-atta-1',
        variantId: 'var-atta-5kg',
        product: INITIAL_PRODUCTS[0],
        variant: INITIAL_PRODUCTS[0].variants[1],
        quantity: 1
      },
      {
        productId: 'prod-amul-milk',
        variantId: 'var-milk-1l',
        product: INITIAL_PRODUCTS[2],
        variant: INITIAL_PRODUCTS[2].variants[1],
        quantity: 2
      },
      {
        productId: 'prod-veg-tomato',
        variantId: 'var-tomato-1kg',
        product: INITIAL_PRODUCTS[6],
        variant: INITIAL_PRODUCTS[6].variants[1],
        quantity: 1
      }
    ],
    address: INITIAL_ADDRESSES[0],
    deliverySlot: INITIAL_DELIVERY_SLOTS[0],
    paymentMethod: 'UPI (Google Pay)',
    paymentStatus: 'PAID',
    subtotal: 463,
    savings: 64,
    couponDiscount: 50,
    couponCode: 'FRESH50',
    deliveryFee: 0,
    total: 413,
    estimatedDelivery: 'Today by 3:30 PM',
    deliveryPartner: {
      name: 'Ramesh Kumar',
      phone: '+91 98450 12345',
      vehicleNo: 'KA-03-EM-8421'
    },
    timeline: [
      { status: 'PLACED', label: 'Order Placed', time: '12:15 PM', completed: true, current: false },
      { status: 'CONFIRMED', label: 'Order Confirmed', time: '12:20 PM', completed: true, current: false },
      { status: 'PREPARING', label: 'Being Prepared at Indiranagar Hub', time: '12:40 PM', completed: true, current: false },
      { status: 'READY', label: 'Packed & Ready for Dispatch', time: '01:10 PM', completed: true, current: true },
      { status: 'OUT FOR DELIVERY', label: 'Out for Delivery with Ramesh', time: 'Expected 02:15 PM', completed: false, current: false },
      { status: 'DELIVERED', label: 'Delivered at Doorstep', time: 'Expected 03:00 PM', completed: false, current: false }
    ]
  },
  {
    id: 'ord-100',
    orderNumber: 'PB-97810',
    createdAt: '2026-10-02T09:30:00Z',
    status: 'DELIVERED',
    items: [
      {
        productId: 'prod-oil-fortune',
        variantId: 'var-oil-5l',
        product: INITIAL_PRODUCTS[1],
        variant: INITIAL_PRODUCTS[1].variants[1],
        quantity: 1
      },
      {
        productId: 'prod-tata-tea-gold',
        variantId: 'var-tea-500g',
        product: INITIAL_PRODUCTS[12],
        variant: INITIAL_PRODUCTS[12].variants[0],
        quantity: 1
      }
    ],
    address: INITIAL_ADDRESSES[0],
    deliverySlot: { id: 'slot-past-1', date: 'Oct 2, 2026', time: '11:00 AM – 1:00 PM', available: true },
    paymentMethod: 'Credit Card',
    paymentStatus: 'PAID',
    subtotal: 955,
    savings: 184,
    couponDiscount: 0,
    deliveryFee: 0,
    total: 955,
    estimatedDelivery: 'Delivered on Oct 2, 12:05 PM',
    timeline: [
      { status: 'PLACED', label: 'Order Placed', time: '09:30 AM', completed: true, current: false },
      { status: 'CONFIRMED', label: 'Order Confirmed', time: '09:35 AM', completed: true, current: false },
      { status: 'PREPARING', label: 'Being Prepared', time: '10:00 AM', completed: true, current: false },
      { status: 'READY', label: 'Ready for Dispatch', time: '10:45 AM', completed: true, current: false },
      { status: 'OUT FOR DELIVERY', label: 'Out for Delivery', time: '11:15 AM', completed: true, current: false },
      { status: 'DELIVERED', label: 'Delivered', time: '12:05 PM', completed: true, current: true }
    ]
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'cust-1', name: 'Rahul Sharma', phone: '+91 98765 43210', email: 'rahul.sharma@example.com', totalOrders: 14, totalSpend: 12450, joinedDate: 'Jan 2026' },
  { id: 'cust-2', name: 'Priya Sundaram', phone: '+91 98123 67890', email: 'priya.s@example.com', totalOrders: 9, totalSpend: 8200, joinedDate: 'Feb 2026' },
  { id: 'cust-3', name: 'Amitabh Sen', phone: '+91 97654 32109', email: 'a.sen@example.com', totalOrders: 22, totalSpend: 24100, joinedDate: 'Nov 2025' },
  { id: 'cust-4', name: 'Sunita Patel', phone: '+91 99234 56781', email: 'sunita.p@example.com', totalOrders: 5, totalSpend: 3950, joinedDate: 'Mar 2026' },
];
