'use client';

import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Boxes,
  CheckCircle2,
  X,
  Store,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';
import { Product, ProductVariant, ProductStatus } from '@/types';
import { formatPrice } from '@/lib/utils';

export default function AdminProductsPage() {
  const { products, categories, updateProduct, addProduct } = useStore();

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form state for creating/editing
  const [formData, setFormData] = useState<{
    name: string;
    brand: string;
    categoryId: string;
    subcategoryId: string;
    description: string;
    status: ProductStatus;
    image: string;
    variants: {
      title: string;
      sku: string;
      unit: string;
      mrp: number;
      price: number;
      stock: number;
    }[];
  }>({
    name: '',
    brand: '',
    categoryId: categories[0]?.id || '',
    subcategoryId: categories[0]?.subcategories[0]?.id || '',
    description: '',
    status: 'PUBLISHED',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    variants: [
      {
        title: '1 KG',
        sku: 'NEW-SKU-1KG',
        unit: '1 kg Pack',
        mrp: 100,
        price: 85,
        stock: 50,
      },
    ],
  });

  const filteredProducts = products.filter((p) => {
    if (selectedCat !== 'all' && p.categoryId !== selectedCat) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchBrand = p.brand.toLowerCase().includes(q);
      const matchSku = p.variants.some((v) => v.sku.toLowerCase().includes(q));
      if (!matchName && !matchBrand && !matchSku) return false;
    }
    return true;
  });

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setIsCreatingNew(false);
    setFormData({
      name: p.name,
      brand: p.brand,
      categoryId: p.categoryId,
      subcategoryId: p.subcategoryId,
      description: p.description,
      status: p.status,
      image: p.images[0] || '',
      variants: p.variants.map((v) => ({
        title: v.title,
        sku: v.sku,
        unit: v.unit,
        mrp: v.mrp,
        price: v.price,
        stock: v.stock,
      })),
    });
  };

  const openCreateModal = () => {
    setIsCreatingNew(true);
    setEditingProduct(null);
    setFormData({
      name: '',
      brand: '',
      categoryId: categories[0]?.id || '',
      subcategoryId: categories[0]?.subcategories[0]?.id || '',
      description: '',
      status: 'PUBLISHED',
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
      variants: [
        {
          title: '1 KG',
          sku: `SKU-${Date.now().toString().slice(-4)}-1KG`,
          unit: '1 kg Pack',
          mrp: 120,
          price: 99,
          stock: 40,
        },
      ],
    });
  };

  const handleAddVariantRow = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        {
          title: '5 KG',
          sku: `SKU-${Date.now().toString().slice(-4)}-5KG`,
          unit: '5 kg Bag',
          mrp: 550,
          price: 470,
          stock: 20,
        },
      ],
    });
  };

  const handleRemoveVariantRow = (index: number) => {
    if (formData.variants.length <= 1) return;
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index),
    });
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.brand) return;

    if (editingProduct) {
      const updated: Product = {
        ...editingProduct,
        name: formData.name,
        brand: formData.brand,
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId,
        description: formData.description,
        status: formData.status,
        images: [formData.image],
        variants: formData.variants.map((v, i) => {
          const oldVar = editingProduct.variants[i];
          return {
            id: oldVar?.id || `var-${Date.now()}-${i}`,
            productId: editingProduct.id,
            sku: v.sku,
            title: v.title,
            unit: v.unit,
            mrp: Number(v.mrp),
            price: Number(v.price),
            stock: Number(v.stock),
            reservedStock: oldVar?.reservedStock || 0,
            image: formData.image,
          };
        }),
      };
      updateProduct(updated);
    } else {
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const prodId = `prod-${Date.now()}`;
      addProduct({
        name: formData.name,
        slug,
        brand: formData.brand,
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId,
        description: formData.description,
        images: [formData.image],
        rating: 4.8,
        reviewCount: 1,
        status: formData.status,
        variants: formData.variants.map((v, i) => ({
          id: `var-${Date.now()}-${i}`,
          productId: prodId,
          sku: v.sku,
          title: v.title,
          unit: v.unit,
          mrp: Number(v.mrp),
          price: Number(v.price),
          stock: Number(v.stock),
          reservedStock: 0,
          image: formData.image,
        })),
      });
    }

    setEditingProduct(null);
    setIsCreatingNew(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Products & Multi-Variant Catalog
          </h1>
          <p className="text-xs text-slate-500">
            Maintain SKUs, weight packs, pricing, image media, and active storefront visibility
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search products, brands, or SKUs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-semibold hidden sm:inline">Category:</span>
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="text-xs font-semibold p-2 border border-slate-300 rounded-xl outline-none"
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Product & Brand</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Variants (SKU / Price / Stock)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredProducts.map((p) => {
                const cat = categories.find((c) => c.id === p.categoryId);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 flex items-center gap-3">
                      <img
                        src={p.images[0]}
                        alt=""
                        className="w-12 h-12 object-cover rounded-xl border border-slate-200 flex-shrink-0"
                      />
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {p.brand}
                        </span>
                        <p className="font-bold text-slate-900 text-xs line-clamp-1">{p.name}</p>
                        <span className="text-[10px] text-slate-500">
                          {p.variants.length} variant{p.variants.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-800">
                        {cat?.name || 'Groceries'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1.5 max-w-sm">
                        {p.variants.map((v) => (
                          <div
                            key={v.id}
                            className="bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg text-[10px]"
                          >
                            <span className="font-bold text-slate-800">{v.title}</span>: {formatPrice(v.price)}{' '}
                            <span
                              className={`font-black ${
                                v.stock <= 5 ? 'text-amber-700' : 'text-emerald-700'
                              }`}
                            >
                              ({v.stock} in stock)
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          p.status === 'PUBLISHED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'OUT_OF_STOCK'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openEditModal(p)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs inline-flex items-center gap-1 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {(editingProduct || isCreatingNew) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingProduct ? 'Edit Product & Variants' : 'Add New Product to Catalog'}
              </h3>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsCreatingNew(false);
                }}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Product Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Product Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Aashirvaad Superior MP Shudh Chakki Atta"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Brand Name</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Aashirvaad, Amul, Tata"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => {
                      const newCatId = e.target.value;
                      const cat = categories.find((c) => c.id === newCatId);
                      setFormData({
                        ...formData,
                        categoryId: newCatId,
                        subcategoryId: cat?.subcategories[0]?.id || '',
                      });
                    }}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as ProductStatus })
                    }
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                  >
                    <option value="PUBLISHED">Published (Visible in shop)</option>
                    <option value="DRAFT">Draft</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Image URL</label>
                  <input
                    type="url"
                    required
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed product information, origin, freshness promise..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              {/* Variants Section */}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Purchasable Variants & SKUs
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Configure sizes, SKUs, MRPs, and selling prices
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVariantRow}
                    className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold"
                  >
                    + Add Variant Size
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.variants.map((v, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-6 gap-2.5 items-end"
                    >
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                          Variant Name
                        </label>
                        <input
                          type="text"
                          required
                          value={v.title}
                          onChange={(e) => {
                            const updated = [...formData.variants];
                            updated[idx].title = e.target.value;
                            setFormData({ ...formData, variants: updated });
                          }}
                          placeholder="e.g. 5 KG"
                          className="w-full text-xs p-1.5 rounded-lg border border-slate-300"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                          SKU Code
                        </label>
                        <input
                          type="text"
                          required
                          value={v.sku}
                          onChange={(e) => {
                            const updated = [...formData.variants];
                            updated[idx].sku = e.target.value;
                            setFormData({ ...formData, variants: updated });
                          }}
                          className="w-full text-xs p-1.5 rounded-lg border border-slate-300 font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                          MRP (₹)
                        </label>
                        <input
                          type="number"
                          required
                          value={v.mrp}
                          onChange={(e) => {
                            const updated = [...formData.variants];
                            updated[idx].mrp = Number(e.target.value);
                            setFormData({ ...formData, variants: updated });
                          }}
                          className="w-full text-xs p-1.5 rounded-lg border border-slate-300 font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                          Price (₹)
                        </label>
                        <input
                          type="number"
                          required
                          value={v.price}
                          onChange={(e) => {
                            const updated = [...formData.variants];
                            updated[idx].price = Number(e.target.value);
                            setFormData({ ...formData, variants: updated });
                          }}
                          className="w-full text-xs p-1.5 rounded-lg border border-slate-300 font-bold text-emerald-800"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                          Stock
                        </label>
                        <input
                          type="number"
                          required
                          value={v.stock}
                          onChange={(e) => {
                            const updated = [...formData.variants];
                            updated[idx].stock = Number(e.target.value);
                            setFormData({ ...formData, variants: updated });
                          }}
                          className="w-full text-xs p-1.5 rounded-lg border border-slate-300 font-bold"
                        />
                      </div>

                      <div className="flex justify-end">
                        {formData.variants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveVariantRow(idx)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setIsCreatingNew(false);
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Save Product to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
