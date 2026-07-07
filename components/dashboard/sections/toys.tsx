'use client';

import { useState } from 'react';
import { useProductStore } from '@/stores/productStore';
import { Product } from '@/types';
import { 
  Plus, Search, Edit2, Trash2, Tag, Archive, 
  DollarSign, Image as ImageIcon, FileText, FolderPlus 
} from 'lucide-react';
import { toast } from 'sonner';

export function ToysSection() {
  const { products, addProduct, updateProduct, deleteProduct } = useProductStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingToy, setEditingToy] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [categoryId, setCategoryId] = useState('building');
  const [categoryName, setCategoryName] = useState('Building Toys');
  const [image, setImage] = useState('');

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setCompareAtPrice('');
    setStockQuantity('');
    setCategoryId('building');
    setCategoryName('Building Toys');
    setImage('');
    setEditingToy(null);
    setIsFormOpen(false);
  };

  const handleOpenAddForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (toy: Product) => {
    setEditingToy(toy);
    setName(toy.name);
    setDescription(toy.description);
    setPrice(toy.price.toString());
    setCompareAtPrice(toy.compare_at_price ? toy.compare_at_price.toString() : '');
    setStockQuantity(toy.stock_quantity.toString());
    setCategoryId(toy.category_id);
    setCategoryName(toy.category_name || 'Building Toys');
    setImage(toy.images[0] || '');
    setIsFormOpen(true);
  };

  const handleCategoryChange = (val: string) => {
    setCategoryId(val);
    if (val === 'building') setCategoryName('Building Toys');
    else if (val === 'rc') setCategoryName('RC Toys');
    else if (val === 'puzzles') setCategoryName('Puzzles');
    else if (val === 'figures') setCategoryName('Action Figures');
    else if (val === 'drones') setCategoryName('Drones');
    else if (val === 'games') setCategoryName('Games');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !description || !price || !stockQuantity || !image) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const priceNum = parseFloat(price);
    const comparePriceNum = compareAtPrice ? parseFloat(compareAtPrice) : undefined;
    const stockNum = parseInt(stockQuantity);

    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('Please enter a valid price.');
      return;
    }

    if (isNaN(stockNum) || stockNum < 0) {
      toast.error('Please enter a valid stock quantity.');
      return;
    }

    const toyData = {
      name,
      description,
      price: priceNum,
      compare_at_price: comparePriceNum,
      stock_quantity: stockNum,
      category_id: categoryId,
      category_name: categoryName,
      images: [image],
    };

    if (editingToy) {
      updateProduct(editingToy.id, toyData);
      toast.success('Toy updated successfully!');
    } else {
      addProduct(toyData);
      toast.success('New toy added successfully!');
    }

    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this toy?')) {
      deleteProduct(id);
      toast.success('Toy deleted successfully!');
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.category_name && p.category_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search toys or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent transition-all duration-200"
          />
        </div>

        <button
          onClick={handleOpenAddForm}
          className="w-full sm:w-auto h-9 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all duration-300"
        >
          <Plus className="w-4 h-4" />
          Add Product / Toy
        </button>
      </div>

      {/* Form Area */}
      {isFormOpen && (
        <div className="glass-card border-accent/20 rounded-2xl p-6 relative animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-cyan-400" />
            {editingToy ? 'Edit Product Details' : 'Add New Toy to Inventory'}
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Toy Name *</label>
              <input
                type="text"
                placeholder="e.g. Laser Tag Blaster Pack"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Category *</label>
              <select
                value={categoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="building" className="bg-slate-900">Building Toys</option>
                <option value="rc" className="bg-slate-900">RC Toys</option>
                <option value="puzzles" className="bg-slate-900">Puzzles</option>
                <option value="figures" className="bg-slate-900">Action Figures</option>
                <option value="drones" className="bg-slate-900">Drones</option>
                <option value="games" className="bg-slate-900">Games</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Price ($) *</label>
              <input
                type="number"
                step="0.01"
                placeholder="29.99"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Discount Price ($) (Optional)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Compare at price e.g. 39.99"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Inventory Quantity *</label>
              <input
                type="number"
                placeholder="50"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Image URL *</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Product Description *</label>
              <textarea
                placeholder="Detailed description of the product features, specs, age limit..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-24 p-3 rounded-lg bg-secondary/50 border border-border text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                required
              />
            </div>

            <div className="flex gap-3 justify-end md:col-span-2 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 h-10 rounded-lg border border-border text-sm font-semibold text-slate-300 hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 h-10 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-semibold text-sm transition-all duration-300 shadow-lg shadow-green-500/20"
              >
                {editingToy ? 'Save Changes' : 'Publish Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toys Grid/List */}
      <div className="glass-card border-border/40 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-secondary/40 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="p-4">Product Info</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const isDiscounted = product.compare_at_price && product.compare_at_price > product.price;
                const discountPercentage = isDiscounted 
                  ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
                  : 0;

                return (
                  <tr key={product.id} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                    {/* Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg bg-slate-800 overflow-hidden shrink-0 border border-border/40">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm">{product.name}</div>
                          <div className="text-slate-400 text-xs truncate max-w-[200px]">{product.description}</div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {product.category_name}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="p-4 font-semibold text-white">
                      ${product.price.toFixed(2)}
                    </td>

                    {/* Discount */}
                    <td className="p-4">
                      {isDiscounted ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                          -{discountPercentage}%
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">—</span>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="p-4">
                      {product.stock_quantity > 0 ? (
                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          {product.stock_quantity} available
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-red-400 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                          Out of stock
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditForm(product)}
                          className="p-1.5 rounded-md hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/20 text-cyan-400 transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 rounded-md hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-red-400 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 text-sm">
                    No products found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
