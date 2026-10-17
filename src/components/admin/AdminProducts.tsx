import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Product, ProductVariant } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';

export const AdminProducts: React.FC = () => {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    navigateToProduct,
    setAppMode,
  } = useStore();

  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formCategory, setFormCategory] = useState(categories[0]?.name || 'Groceries & Staples');
  const [formSubCategory, setFormSubCategory] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formIsVeg, setFormIsVeg] = useState(true);
  const [formWeight, setFormWeight] = useState('1 KG');
  const [formPrice, setFormPrice] = useState('150');
  const [formMrp, setFormMrp] = useState('180');
  const [formStock, setFormStock] = useState('50');
  const [formSku, setFormSku] = useState('PRD-101');

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormName('');
    setFormBrand('');
    setFormCategory(categories[0]?.name || 'Groceries & Staples');
    setFormSubCategory('');
    setFormDescription('');
    setFormImage('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80');
    setFormIsVeg(true);
    setFormWeight('1 KG');
    setFormPrice('120');
    setFormMrp('150');
    setFormStock('60');
    setFormSku(`PRD-${Math.floor(100 + Math.random() * 900)}`);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormBrand(p.brand);
    setFormCategory(p.category);
    setFormSubCategory(p.subCategory || '');
    setFormDescription(p.description);
    setFormImage(p.images[0] || '');
    setFormIsVeg(p.isVeg);
    const defVariant = p.variants[0];
    setFormWeight(defVariant?.weight || '1 KG');
    setFormPrice(defVariant?.price.toString() || '100');
    setFormMrp(defVariant?.mrp.toString() || '120');
    setFormStock(defVariant?.stock.toString() || '50');
    setFormSku(defVariant?.sku || 'SKU-001');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = Number(formPrice) || 100;
    const mrpNum = Number(formMrp) || priceNum;
    const stockNum = Number(formStock) || 0;
    const discount = mrpNum > priceNum ? Math.round(((mrpNum - priceNum) / mrpNum) * 100) : 0;

    const variant: ProductVariant = {
      id: editingProduct ? editingProduct.variants[0].id : `var-${Date.now()}`,
      weight: formWeight,
      price: priceNum,
      mrp: mrpNum,
      discountPercent: discount,
      stock: stockNum,
      sku: formSku,
      isDefault: true,
    };

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        name: formName,
        brand: formBrand,
        category: formCategory,
        subCategory: formSubCategory,
        description: formDescription,
        images: [formImage],
        isVeg: formIsVeg,
        variants: [variant, ...editingProduct.variants.slice(1)],
      });
    } else {
      addProduct({
        name: formName,
        brand: formBrand,
        category: formCategory,
        subCategory: formSubCategory,
        description: formDescription,
        images: [formImage],
        rating: 4.8,
        ratingCount: 1,
        isVeg: formIsVeg,
        variants: [variant],
        status: 'active',
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Product Catalog Management
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Add new products, adjust pricing, manage variants and packaging
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenAdd}
        >
          Add New Product
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by product name or brand..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2E7D32]"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-gray-500 font-medium">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#2E7D32]"
          >
            <option value="All">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Data Table (Requirement #30) */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Variants</th>
                <th className="px-4 py-3">Selling Price</th>
                <th className="px-4 py-3">MRP</th>
                <th className="px-4 py-3">Stock Units</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredProducts.map((p) => {
                const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
                const defaultVariant = p.variants[0];

                return (
                  <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.images[0]}
                          alt=""
                          className="w-10 h-10 object-contain rounded bg-[#FAFAF7] border border-gray-100 p-1 shrink-0"
                        />
                        <div className="min-w-0 max-w-xs">
                          <p className="font-bold text-gray-900 truncate">{p.name}</p>
                          <p className="text-[11px] text-[#2E7D32] font-semibold">{p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {p.category}
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-mono font-semibold">
                        {p.variants.length} pack{p.variants.length > 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900">
                      ₹{defaultVariant.price}
                    </td>
                    <td className="px-4 py-3 text-gray-400 line-through">
                      ₹{defaultVariant.mrp}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                          totalStock === 0
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : totalStock <= 25
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-emerald-50 text-[#1B5E20] border border-emerald-200'
                        }`}
                      >
                        {totalStock} units
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-bold bg-[#E8F5E9] text-[#1B5E20] px-2 py-0.5 rounded">
                        Active
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            navigateToProduct(p.id);
                            setAppMode('customer');
                          }}
                          className="p-1.5 text-gray-500 hover:text-[#2E7D32] hover:bg-gray-100 rounded"
                          title="View on Storefront"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-gray-100 rounded"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Grocery Product' : 'Add New Product to Catalog'}
        subtitle="Manage product details, pricing, stock, and photography"
        maxWidth="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Product Title</label>
              <input
                required
                type="text"
                placeholder="e.g. Aashirvaad Shudh Chakki Atta"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#2E7D32]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Brand Name</label>
              <input
                required
                type="text"
                placeholder="e.g. Aashirvaad"
                value={formBrand}
                onChange={(e) => setFormBrand(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#2E7D32]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#2E7D32] bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Subcategory</label>
              <input
                type="text"
                placeholder="e.g. Atta & Flours"
                value={formSubCategory}
                onChange={(e) => setFormSubCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#2E7D32]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Description</label>
            <textarea
              rows={2}
              required
              placeholder="Freshly milled grains, rich in dietary fiber..."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#2E7D32]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Studio Image URL</label>
            <input
              required
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={formImage}
              onChange={(e) => setFormImage(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#2E7D32]"
            />
          </div>

          {/* Variant & Pricing Section */}
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Primary Pack Variant & Stock
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold text-gray-600 block mb-1">Weight / Pack</label>
                <input
                  required
                  type="text"
                  placeholder="5 KG"
                  value={formWeight}
                  onChange={(e) => setFormWeight(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-md bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-600 block mb-1">Selling Price (₹)</label>
                <input
                  required
                  type="number"
                  placeholder="280"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-md bg-white font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-600 block mb-1">MRP (₹)</label>
                <input
                  required
                  type="number"
                  placeholder="320"
                  value={formMrp}
                  onChange={(e) => setFormMrp(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-md bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-600 block mb-1">Stock Count</label>
                <input
                  required
                  type="number"
                  placeholder="50"
                  value={formStock}
                  onChange={(e) => setFormStock(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-md bg-white font-bold"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" fullWidth>
              {editingProduct ? 'Update Product' : 'Add to Catalog'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
