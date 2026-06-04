'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { sellerApi, categoriesApi } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', price: '', comparePrice: '', stock: '',
    categoryId: '', thumbnail: '', images: '', tags: '', sku: '',
    isFlashSale: false, flashSalePrice: '', lowStockAlert: '5', status: 'DRAFT',
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll().then(r => r.data.data),
  });

  // Load existing product data from seller products list
  const { data: productsData } = useQuery({
    queryKey: ['seller-products-all'],
    queryFn: () => sellerApi.getProducts({ limit: 100 }).then(r => r.data.data),
  });

  useEffect(() => {
    if (productsData) {
      const product = (productsData as Array<{
        id: string; name: string; description: string; price: number; comparePrice?: number;
        stock: number; categoryId: string; thumbnail?: string; images?: string[];
        tags?: string[]; sku?: string; isFlashSale: boolean; flashSalePrice?: number;
        lowStockAlert: number; status: string;
      }>).find(p => p.id === productId);
      if (product) {
        setForm({
          name: product.name || '',
          description: product.description || '',
          price: String(product.price || ''),
          comparePrice: String(product.comparePrice || ''),
          stock: String(product.stock || ''),
          categoryId: product.categoryId || '',
          thumbnail: product.thumbnail || '',
          images: (product.images || []).join('\n'),
          tags: (product.tags || []).join(', '),
          sku: product.sku || '',
          isFlashSale: product.isFlashSale || false,
          flashSalePrice: String(product.flashSalePrice || ''),
          lowStockAlert: String(product.lowStockAlert || 5),
          status: product.status || 'DRAFT',
        });
      }
    }
  }, [productsData, productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await sellerApi.updateProduct(productId, {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        comparePrice: form.comparePrice ? Number(form.comparePrice) : undefined,
        stock: Number(form.stock),
        categoryId: form.categoryId,
        thumbnail: form.thumbnail || undefined,
        images: form.images.split('\n').map(s => s.trim()).filter(Boolean),
        tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
        sku: form.sku || undefined,
        isFlashSale: form.isFlashSale,
        flashSalePrice: form.flashSalePrice ? Number(form.flashSalePrice) : undefined,
        lowStockAlert: Number(form.lowStockAlert),
        status: form.status,
      });
      toast.success('Product updated successfully!');
      router.push('/seller/products');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to update product');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-amazon-orange";
  const labelClass = "block text-sm font-medium text-foreground mb-1";

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/seller/products" className="p-2 hover:bg-muted rounded-md transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Edit Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Status */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold text-foreground mb-4">Status</h2>
          <div className="flex gap-3">
            {['DRAFT', 'ACTIVE', 'INACTIVE'].map(s => (
              <label key={s} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="status" value={s} checked={form.status === s}
                  onChange={() => setForm(f => ({ ...f, status: s }))}
                  className="accent-amazon-orange" />
                <span className="text-sm text-foreground">{s}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Basic info */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-foreground">Basic Information</h2>
          <div>
            <label className={labelClass}>Product Name *</label>
            <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Description *</label>
            <textarea required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={5} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Category *</label>
            <select required value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} className={inputClass}>
              <option value="">Select category</option>
              {(categoriesData as Array<{ id: string; name: string }>)?.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-foreground">Pricing</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Sale Price (EGP) *</label>
              <input required type="number" min="0" step="0.01" value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Original Price (EGP)</label>
              <input type="number" min="0" step="0.01" value={form.comparePrice}
                onChange={e => setForm(f => ({ ...f, comparePrice: e.target.value }))} className={inputClass} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="flashSaleEdit" checked={form.isFlashSale}
              onChange={e => setForm(f => ({ ...f, isFlashSale: e.target.checked }))}
              className="rounded accent-amazon-orange" />
            <label htmlFor="flashSaleEdit" className="text-sm font-medium text-foreground cursor-pointer">Enable Flash Sale</label>
          </div>
          {form.isFlashSale && (
            <div>
              <label className={labelClass}>Flash Sale Price (EGP)</label>
              <input type="number" min="0" step="0.01" value={form.flashSalePrice}
                onChange={e => setForm(f => ({ ...f, flashSalePrice: e.target.value }))} className={inputClass} />
            </div>
          )}
        </div>

        {/* Inventory */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-foreground">Inventory</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Stock *</label>
              <input required type="number" min="0" value={form.stock}
                onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Low Stock Alert</label>
              <input type="number" min="0" value={form.lowStockAlert}
                onChange={e => setForm(f => ({ ...f, lowStockAlert: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>SKU</label>
              <input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Media */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-foreground">Images</h2>
          <div>
            <label className={labelClass}>Thumbnail URL</label>
            <input value={form.thumbnail} onChange={e => setForm(f => ({ ...f, thumbnail: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Additional Images (one URL per line)</label>
            <textarea value={form.images} onChange={e => setForm(f => ({ ...f, images: e.target.value }))}
              rows={4} className={inputClass} />
          </div>
        </div>

        {/* Tags */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold text-foreground mb-4">Tags</h2>
          <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
            placeholder="tag1, tag2, tag3" className={inputClass} />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={isLoading}
            className="flex items-center gap-2 bg-amazon-orange hover:bg-amazon-orange-dark text-white px-8 py-3 rounded-md font-semibold transition-colors">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
          <Link href="/seller/products" className="border border-border text-foreground px-6 py-3 rounded-md text-sm font-medium hover:bg-muted transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
