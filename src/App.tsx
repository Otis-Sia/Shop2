import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, User as UserIcon, LogOut, Menu, X, Search, Heart, Package, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product, User, CartItem } from "./types";

// Pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("shophub_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("shophub_cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("shophub_user", JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem("shophub_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, quantity: number = 1, color?: string, size?: string) => {
    setCart(prev => {
      const existing = prev.find(item => 
        item.product.id === product.id && 
        item.selectedColor === color && 
        item.selectedSize === size
      );
      if (existing) {
        return prev.map(item => 
          item === existing ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { product, quantity, selectedColor: color, selectedSize: size }];
    });
  };

  const removeFromCart = (productId: number, color?: string, size?: string) => {
    setCart(prev => prev.filter(item => 
      !(item.product.id === productId && item.selectedColor === color && item.selectedSize === size)
    ));
  };

  const updateCartQuantity = (productId: number, quantity: number, color?: string, size?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, color, size);
      return;
    }
    setCart(prev => prev.map(item => 
      (item.product.id === productId && item.selectedColor === color && item.selectedSize === size)
        ? { ...item, quantity }
        : item
    ));
  };

  const clearCart = () => setCart([]);

  const logout = () => {
    setUser(null);
    localStorage.removeItem("shophub_user");
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header 
          user={user} 
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} 
          logout={logout}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
        />
        
        <main className="flex-grow">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home addToCart={addToCart} />} />
              <Route path="/products" element={<Products addToCart={addToCart} />} />
              <Route path="/products/:id" element={<ProductDetail addToCart={addToCart} />} />
              <Route path="/cart" element={<Cart cart={cart} updateQuantity={updateCartQuantity} remove={removeFromCart} />} />
              <Route path="/checkout" element={<Checkout cart={cart} user={user} clearCart={clearCart} />} />
              <Route path="/login" element={<Login setUser={setUser} />} />
              <Route path="/register" element={<Register setUser={setUser} />} />
              <Route path="/admin" element={<Admin user={user} />} />
            </Routes>
          </AnimatePresence>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

function Header({ user, cartCount, logout, isMenuOpen, setIsMenuOpen }: any) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location, setIsMenuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-secondary-100">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="text-2xl font-extrabold text-primary-500 tracking-tighter flex items-center gap-2">
          <Package className="w-8 h-8" />
          ShopHub
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="font-medium hover:text-primary-500 transition-colors">Home</Link>
          <Link to="/products" className="font-medium hover:text-primary-500 transition-colors">Shop</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
              <LayoutDashboard className="w-4 h-4" />
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-secondary-50 rounded-full transition-colors hidden sm:block">
            <Search className="w-6 h-6" />
          </button>
          
          <Link to="/cart" className="p-2 hover:bg-secondary-50 rounded-full transition-colors relative">
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-primary-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs text-secondary-500">Hello,</span>
                <span className="text-sm font-semibold">{user.first_name}</span>
              </div>
              <button 
                onClick={logout}
                className="p-2 hover:bg-danger-50 text-secondary-500 hover:text-red-500 rounded-full transition-colors"
                title="Logout"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm hidden sm:flex">
              Login
            </Link>
          )}

          <button 
            className="md:hidden p-2 hover:bg-secondary-50 rounded-full"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 w-full bg-white border-b border-secondary-100 shadow-xl p-4 flex flex-col gap-4"
          >
            <Link to="/" className="p-3 font-medium hover:bg-primary-50 hover:text-primary-500 rounded-xl">Home</Link>
            <Link to="/products" className="p-3 font-medium hover:bg-primary-50 hover:text-primary-500 rounded-xl">Shop</Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="p-3 font-medium text-primary-600 hover:bg-primary-50 rounded-xl flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5" />
                Admin Dashboard
              </Link>
            )}
            {!user && (
              <Link to="/login" className="btn btn-primary w-full">Login</Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-secondary-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="text-3xl font-extrabold text-primary-500 tracking-tighter mb-6 block">
              ShopHub
            </Link>
            <p className="text-secondary-400 max-w-md mb-6">
              Your premium destination for high-quality electronics, fashion, and lifestyle products. 
              We bring you the best brands with unbeatable service.
            </p>
            <div className="flex gap-4">
              {/* Social Icons Placeholder */}
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full bg-secondary-800 flex items-center justify-center hover:bg-primary-500 transition-colors cursor-pointer">
                  <div className="w-5 h-5 bg-white/20 rounded-sm" />
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-6">Quick Links</h4>
            <ul className="flex flex-col gap-4 text-secondary-400">
              <li><Link to="/" className="hover:text-primary-500 transition-colors">Home</Link></li>
              <li><Link to="/products" className="hover:text-primary-500 transition-colors">Shop All</Link></li>
              <li><Link to="/cart" className="hover:text-primary-500 transition-colors">My Cart</Link></li>
              <li><Link to="/login" className="hover:text-primary-500 transition-colors">Account</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-6">Support</h4>
            <ul className="flex flex-col gap-4 text-secondary-400">
              <li><a href="#" className="hover:text-primary-500 transition-colors">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-primary-500 transition-colors">Returns & Refunds</a></li>
              <li><a href="#" className="hover:text-primary-500 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary-500 transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-secondary-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-secondary-500">
          <p>© 2026 ShopHub. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="flex items-center gap-1">💳 Secure Payments</span>
            <span className="flex items-center gap-1">🚚 Global Shipping</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
