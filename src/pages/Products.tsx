import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, SlidersHorizontal, Grid, List as ListIcon } from "lucide-react";
import { Product } from "../types";
import { ProductCard } from "./Home";

export default function Products({ addToCart }: { addToCart: any }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "All" || p.category === category;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      return b.id - a.id;
    });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-12"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold mb-2">Shop All Products</h1>
          <p className="text-secondary-500">Explore our full range of premium items</p>
        </div>
        
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <input 
              type="text" 
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-12"
            />
          </div>
          <button className="btn bg-secondary-50 text-secondary-900 hover:bg-secondary-100 flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5" />
            Filters
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 space-y-8">
          <div>
            <h3 className="font-bold mb-4 uppercase text-xs tracking-widest text-secondary-400">Categories</h3>
            <div className="flex flex-col gap-2">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`text-left px-4 py-2 rounded-xl transition-colors ${
                    category === cat ? 'bg-primary-500 text-white font-bold' : 'hover:bg-secondary-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-4 uppercase text-xs tracking-widest text-secondary-400">Sort By</h3>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm text-secondary-500 font-medium">
              Showing {filteredProducts.length} results
            </span>
            <div className="flex gap-2">
              <button className="p-2 bg-secondary-900 text-white rounded-lg"><Grid className="w-5 h-5" /></button>
              <button className="p-2 bg-secondary-50 text-secondary-400 rounded-lg hover:bg-secondary-100"><ListIcon className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              Array(6).fill(0).map((_, i) => <ProductSkeleton key={i} />)
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} addToCart={addToCart} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold mb-2">No products found</h3>
                <p className="text-secondary-500">Try adjusting your search or filters to find what you're looking for.</p>
                <button 
                  onClick={() => { setSearch(""); setCategory("All"); }}
                  className="btn btn-primary mt-6"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProductSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="aspect-square bg-secondary-100" />
      <div className="p-6 space-y-4">
        <div className="h-4 bg-secondary-100 rounded w-1/4" />
        <div className="h-6 bg-secondary-100 rounded w-3/4" />
        <div className="flex justify-between items-center">
          <div className="h-8 bg-secondary-100 rounded w-1/3" />
          <div className="h-10 bg-secondary-100 rounded w-10" />
        </div>
      </div>
    </div>
  );
}
