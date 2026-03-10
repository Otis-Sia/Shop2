import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import { CartItem } from "../types";

export default function Cart({ cart, updateQuantity, remove }: { cart: CartItem[], updateQuantity: any, remove: any }) {
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 15;
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="container mx-auto px-4 py-32 text-center"
      >
        <div className="w-24 h-24 bg-secondary-50 rounded-full flex items-center justify-center mx-auto mb-8">
          <ShoppingBag className="w-12 h-12 text-secondary-300" />
        </div>
        <h1 className="text-3xl font-extrabold mb-4">Your cart is empty</h1>
        <p className="text-secondary-500 mb-10 max-w-md mx-auto">
          Looks like you haven't added anything to your cart yet. Explore our products and find something you love!
        </p>
        <Link to="/products" className="btn btn-primary btn-lg">
          Start Shopping
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-12"
    >
      <h1 className="text-4xl font-extrabold mb-12">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item, index) => (
            <motion.div 
              key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-6 flex flex-col sm:flex-row gap-6 items-center"
            >
              <div className="w-32 h-32 rounded-2xl overflow-hidden bg-secondary-50 flex-shrink-0">
                <img 
                  src={item.product.image_url?.[0] || "https://via.placeholder.com/150"} 
                  alt={item.product.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div className="flex-grow text-center sm:text-left">
                <Link to={`/products/${item.product.id}`} className="text-xl font-bold hover:text-primary-500 transition-colors block mb-2">
                  {item.product.name}
                </Link>
                <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-secondary-500 font-medium mb-4">
                  {item.selectedColor && (
                    <span className="flex items-center gap-1">
                      Color: <span className="text-secondary-900 font-bold">{item.selectedColor}</span>
                    </span>
                  )}
                  {item.selectedSize && (
                    <span className="flex items-center gap-1">
                      Size: <span className="text-secondary-900 font-bold">{item.selectedSize}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    Price: <span className="text-secondary-900 font-bold">KSh {item.product.price}</span>
                  </span>
                </div>
                
                <div className="flex items-center justify-center sm:justify-start gap-6">
                  <div className="flex items-center border-2 border-secondary-100 rounded-xl overflow-hidden">
                    <button 
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedColor, item.selectedSize)}
                      className="p-2 hover:bg-secondary-50 transition-colors"
                    ><Minus className="w-4 h-4" /></button>
                    <span className="px-4 font-bold min-w-[40px] text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedColor, item.selectedSize)}
                      className="p-2 hover:bg-secondary-50 transition-colors"
                    ><Plus className="w-4 h-4" /></button>
                  </div>
                  <button 
                    onClick={() => remove(item.product.id, item.selectedColor, item.selectedSize)}
                    className="text-secondary-400 hover:text-red-500 transition-colors p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="text-right sm:min-w-[120px]">
                <p className="text-2xl font-extrabold text-secondary-900">
                  KSh {(item.product.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-8 sticky top-32">
            <h2 className="text-2xl font-bold mb-8">Order Summary</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-secondary-500 font-medium">
                <span>Subtotal</span>
                <span className="text-secondary-900">KSh {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-secondary-500 font-medium">
                <span>Shipping</span>
                <span className={shipping === 0 ? "text-green-500 font-bold" : "text-secondary-900"}>
                  {shipping === 0 ? "FREE" : `KSh ${shipping.toFixed(2)}`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-secondary-400 italic">
                  Add KSh {(100 - subtotal).toFixed(2)} more to get FREE shipping!
                </p>
              )}
              <div className="border-t border-secondary-100 pt-4 flex justify-between items-end">
                <span className="text-lg font-bold">Total</span>
                <span className="text-3xl font-extrabold text-primary-500">KSh {total.toFixed(2)}</span>
              </div>
            </div>

            <Link to="/checkout" className="btn btn-primary w-full btn-lg group">
              Proceed to Checkout
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <div className="mt-8 pt-8 border-t border-secondary-100 space-y-4">
              <div className="flex items-center gap-3 text-sm text-secondary-500">
                <span className="text-xl">🛡️</span>
                <span>Secure Checkout Guaranteed</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-secondary-500">
                <span className="text-xl">📦</span>
                <span>Fast & Reliable Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
