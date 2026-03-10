import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, Truck, ShieldCheck, Star, Clock, Zap, Heart, ShoppingCart } from "lucide-react";
import { Product } from "../types";

export default function Home({ addToCart }: { addToCart: any }) {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        setFeaturedProducts(data.slice(0, 4));
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-20 pb-20"
    >
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center overflow-hidden bg-secondary-900">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-40"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary-900 via-secondary-900/60 to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl"
          >
            <span className="inline-block px-4 py-1 rounded-full bg-primary-500/20 text-primary-400 text-sm font-bold mb-6 border border-primary-500/30">
              NEW SEASON ARRIVALS
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
              Elevate Your <span className="text-primary-500">Lifestyle</span> With Premium Tech.
            </h1>
            <p className="text-xl text-secondary-300 mb-10 leading-relaxed">
              Discover our curated collection of high-performance electronics and modern essentials designed for the way you live.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="btn btn-primary btn-lg group">
                Shop Collection
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/products" className="btn bg-white/10 text-white hover:bg-white/20 backdrop-blur-md border border-white/20 btn-lg">
                View Deals
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <FeatureCard 
            icon={<Truck className="w-8 h-8 text-primary-500" />}
            title="Free Shipping"
            desc="On all orders over KSh 100"
          />
          <FeatureCard 
            icon={<ShieldCheck className="w-8 h-8 text-primary-500" />}
            title="Secure Payment"
            desc="100% secure checkout"
          />
          <FeatureCard 
            icon={<Clock className="w-8 h-8 text-primary-500" />}
            title="24/7 Support"
            desc="Dedicated support team"
          />
          <FeatureCard 
            icon={<Zap className="w-8 h-8 text-primary-500" />}
            title="Fast Delivery"
            desc="Get it in 2-3 business days"
          />
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2">Featured Products</h2>
            <p className="text-secondary-500">Handpicked items from our latest collection</p>
          </div>
          <Link to="/products" className="text-primary-500 font-bold flex items-center gap-1 hover:gap-2 transition-all">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            Array(4).fill(0).map((_, i) => <ProductSkeleton key={i} />)
          ) : (
            featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} addToCart={addToCart} />
            ))
          )}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="container mx-auto px-4">
        <div className="relative rounded-3xl overflow-hidden h-[400px] flex items-center">
          <img 
            src="https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=1200&q=80" 
            className="absolute inset-0 w-full h-full object-cover"
            alt="Promo"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-primary-900/40 backdrop-blur-[2px]" />
          <div className="relative z-10 p-12 max-w-xl text-white">
            <h2 className="text-4xl font-bold mb-6">Join the ShopHub Club</h2>
            <p className="text-lg mb-8 opacity-90">
              Subscribe to our newsletter and get 15% off your first order, plus early access to new drops and exclusive deals.
            </p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-grow px-6 py-3 rounded-xl bg-white/20 border border-white/30 backdrop-blur-md focus:outline-none focus:bg-white/30 text-white placeholder:text-white/60"
              />
              <button className="btn btn-primary">Join Now</button>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <div className="p-8 rounded-2xl bg-secondary-50 border border-secondary-100 flex flex-col items-center text-center hover:bg-white hover:shadow-xl transition-all duration-300">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-secondary-500 text-sm">{desc}</p>
    </div>
  );
}

export function ProductCard({ product, addToCart, ...props }: { product: Product, addToCart: any, [key: string]: any }) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="card group"
      {...props}
    >
      <Link to={`/products/${product.id}`} className="block relative aspect-square overflow-hidden bg-secondary-50">
        <img 
          src={product.image_url?.[0] || "https://via.placeholder.com/300"} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.tags.map(tag => (
            <span key={tag} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              tag === 'new' ? 'bg-green-500 text-white' : 
              tag === 'deal' ? 'bg-red-500 text-white' : 
              'bg-primary-500 text-white'
            }`}>
              {tag}
            </span>
          ))}
        </div>
        <button 
          onClick={(e) => {
            e.preventDefault();
            // Wishlist logic placeholder
          }}
          className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full text-secondary-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Heart className="w-5 h-5" />
        </button>
      </Link>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-bold text-primary-500 uppercase tracking-widest">{product.category}</span>
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="w-3 h-3 fill-current" />
            <span className="text-xs font-bold text-secondary-900">4.8</span>
          </div>
        </div>
        <Link to={`/products/${product.id}`} className="block text-lg font-bold mb-4 hover:text-primary-500 transition-colors line-clamp-1">
          {product.name}
        </Link>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-extrabold text-secondary-900">KSh {product.price}</span>
          <button 
            onClick={() => addToCart(product)}
            className="p-3 bg-secondary-900 text-white rounded-xl hover:bg-primary-500 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
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
