import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Package, Plus, Edit, Trash2, Search, LayoutDashboard, Users, ShoppingBag, DollarSign, X, Sparkles, Loader2 } from "lucide-react";
import { Product, User } from "../types";
import { generateProductDetails } from "../services/aiService";

export default function Admin({ user }: { user: User | null }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate("/");
      return;
    }
    fetchProducts();
  }, [user, navigate]);

  const fetchProducts = () => {
    setLoading(true);
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  };

  const handleOpenModal = (product?: Product) => {
    setEditingProduct(product || {
      name: "",
      price: 0,
      description: "",
      category: "Electronics",
      stock: 10,
      image_url: [""],
      tags: [],
      colors: [],
      sizes: []
    });
    setIsModalOpen(true);
  };

  const handleGenerateDescription = async () => {
    if (!editingProduct?.name && (!editingProduct?.image_url || editingProduct.image_url.length === 0)) {
      alert("Please enter a product name or provide an image first.");
      return;
    }

    setIsGenerating(true);
    const { description, category } = await generateProductDetails(
      editingProduct.name || "", 
      editingProduct.category || "",
      editingProduct.image_url?.[0] || ""
    );
    setEditingProduct(prev => ({ ...prev!, description, category }));
    setIsGenerating(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditingProduct(prev => ({ 
        ...prev!, 
        image_url: [...(prev?.image_url || []).filter(u => u !== ""), reader.result as string] 
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingProduct?.id ? "PUT" : "POST";
    const url = editingProduct?.id ? `/api/products/${editingProduct.id}` : "/api/products";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingProduct)
      });

      if (response.ok) {
        alert(editingProduct?.id ? "Product updated successfully" : "Product created successfully");
        setIsModalOpen(false);
        fetchProducts();
      } else {
        const data = await response.json();
        alert(data.message || "Error saving product");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert("An error occurred while saving the product.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        alert("Product deleted successfully");
        fetchProducts();
      } else {
        const data = await response.json();
        alert(data.message || "Error deleting product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("An error occurred while deleting the product.");
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  if (!user || user.role !== 'admin') return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-12"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold mb-2">Admin Dashboard</h1>
          <p className="text-secondary-500">Manage your store products and orders</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add New Product
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard icon={<Package className="text-blue-500" />} label="Total Products" value={products.length.toString()} />
        <StatCard icon={<ShoppingBag className="text-green-500" />} label="Total Orders" value="156" />
        <StatCard icon={<Users className="text-purple-500" />} label="Total Customers" value="1,240" />
        <StatCard icon={<DollarSign className="text-primary-500" />} label="Total Revenue" value="KSh 45,230" />
      </div>

      <div className="card overflow-hidden">
        <div className="p-6 border-b border-secondary-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-xl font-bold">Product Inventory</h2>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input 
              type="text" 
              placeholder="Search inventory..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10 py-2 text-sm" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-secondary-50 text-secondary-500 text-xs uppercase tracking-widest font-bold">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Tags</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center">Loading inventory...</td></tr>
              ) : filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-secondary-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img src={product.image_url?.[0] || "https://via.placeholder.com/150"} alt={product.name} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                      <span className="font-bold text-sm">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md bg-secondary-100 text-secondary-600 text-[10px] font-bold uppercase">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-sm">KSh {product.price}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-sm font-medium">{product.stock} in stock</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {product.tags?.slice(0, 2).map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-primary-50 text-primary-600 text-[10px] font-bold uppercase">
                          {tag}
                        </span>
                      ))}
                      {product.tags?.length > 2 && (
                        <span className="px-2 py-0.5 rounded-md bg-secondary-100 text-secondary-600 text-[10px] font-bold">
                          +{product.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenModal(product)}
                        className="p-2 hover:bg-primary-50 text-secondary-400 hover:text-primary-500 transition-colors rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-2 hover:bg-red-50 text-secondary-400 hover:text-red-500 transition-colors rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-secondary-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-secondary-100 flex justify-between items-center">
                <h2 className="text-2xl font-bold">{editingProduct?.id ? "Edit Product" : "Add New Product"}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-secondary-50 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label className="form-label">Product Name</label>
                    <input 
                      type="text" 
                      required 
                      value={editingProduct?.name}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev!, name: e.target.value }))}
                      className="input" 
                      placeholder="e.g. Sony WH-1000XM5" 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select 
                      value={editingProduct?.category || "Electronics"}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev!, category: e.target.value }))}
                      className="input"
                    >
                      <option>Electronics</option>
                      <option>Phones & Tablets</option>
                      <option>Computing</option>
                      <option>Gaming</option>
                      <option>Fashion</option>
                      <option>Health & Beauty</option>
                      <option>Home & Kitchen</option>
                      <option>Furniture</option>
                      <option>Appliances</option>
                      <option>Decor</option>
                      <option>Bedding & Bath</option>
                      <option>Cleaning Supplies</option>
                      <option>Garden & Outdoors</option>
                      <option>Tools & Home Improvement</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price (KSh)</label>
                    <input 
                      type="number" 
                      required 
                      step="0.01"
                      value={Number.isNaN(editingProduct?.price) ? "" : editingProduct?.price ?? ""}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev!, price: parseFloat(e.target.value) }))}
                      className="input" 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock</label>
                    <input 
                      type="number" 
                      required 
                      value={Number.isNaN(editingProduct?.stock) ? "" : editingProduct?.stock ?? ""}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev!, stock: parseInt(e.target.value) }))}
                      className="input" 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="flex justify-between items-center mb-2">
                    <label className="form-label mb-0">Description</label>
                    <button 
                      type="button"
                      onClick={handleGenerateDescription}
                      disabled={isGenerating}
                      className="text-xs font-bold text-primary-500 flex items-center gap-1 hover:text-primary-600 disabled:opacity-50"
                    >
                      {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      Generate with AI
                    </button>
                  </div>
                  <textarea 
                    required 
                    rows={4}
                    value={editingProduct?.description}
                    onChange={(e) => setEditingProduct(prev => ({ ...prev!, description: e.target.value }))}
                    className="input resize-none" 
                    placeholder="Describe the product..." 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editingProduct?.tags?.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-primary-50 text-primary-600 rounded-md text-xs font-bold flex items-center gap-1">
                        {tag}
                        <button 
                          type="button" 
                          onClick={() => {
                            const newTags = [...(editingProduct.tags || [])];
                            newTags.splice(index, 1);
                            setEditingProduct(prev => ({ ...prev!, tags: newTags }));
                          }}
                          className="hover:text-primary-800"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                  <input 
                    type="text" 
                    placeholder="Type a tag and press Enter" 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = e.currentTarget.value.trim();
                        if (val && !editingProduct?.tags?.includes(val)) {
                          setEditingProduct(prev => ({ ...prev!, tags: [...(prev?.tags || []), val] }));
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                    className="input" 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Product Images</label>
                  <div className="flex flex-col gap-3">
                    {(editingProduct?.image_url || []).map((url, index) => (
                      <div key={index} className="flex gap-3 items-center">
                        {url && (
                          <img 
                            src={url} 
                            alt="Preview" 
                            className="w-12 h-12 object-cover rounded-xl border border-secondary-200"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <input 
                          type="url" 
                          value={url}
                          onChange={(e) => {
                            const newUrls = [...(editingProduct?.image_url || [])];
                            newUrls[index] = e.target.value;
                            setEditingProduct(prev => ({ ...prev!, image_url: newUrls }));
                          }}
                          className="input flex-1" 
                          placeholder="Image URL (https://...)" 
                        />
                        <button 
                          type="button"
                          onClick={() => {
                            const newUrls = [...(editingProduct?.image_url || [])];
                            newUrls.splice(index, 1);
                            setEditingProduct(prev => ({ ...prev!, image_url: newUrls }));
                          }}
                          className="p-2 text-danger-500 hover:bg-danger-50 rounded-xl"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                    <div className="flex gap-3 items-center">
                      <button 
                        type="button"
                        onClick={() => {
                          setEditingProduct(prev => ({ ...prev!, image_url: [...(prev?.image_url || []), ""] }));
                        }}
                        className="btn bg-secondary-100 text-secondary-700 hover:bg-secondary-200 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> Add Another URL
                      </button>
                      <span className="text-secondary-400 font-bold text-xs uppercase">OR</span>
                      <label className="btn bg-secondary-100 text-secondary-700 cursor-pointer hover:bg-secondary-200 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap">
                        Upload File
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleImageUpload} 
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn bg-secondary-50 text-secondary-900 flex-1">Cancel</button>
                  <button type="submit" className="btn btn-primary flex-1">Save Product</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StatCard({ icon, label, value }: any) {
  return (
    <div className="card p-6 flex items-center gap-6">
      <div className="w-14 h-14 rounded-2xl bg-secondary-50 flex items-center justify-center text-2xl">
        {icon}
      </div>
      <div>
        <p className="text-sm text-secondary-500 font-medium mb-1">{label}</p>
        <p className="text-2xl font-extrabold">{value}</p>
      </div>
    </div>
  );
}
