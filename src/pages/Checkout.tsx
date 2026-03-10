import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, CreditCard, Truck, ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react";
import { CartItem, User } from "../types";

export default function Checkout({ cart, user, clearCart }: { cart: CartItem[], user: User | null, clearCart: any }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 15;
  const total = subtotal + shipping;

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate("/login?redirect=/checkout");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          total,
          items: cart.map(item => ({
            product_id: item.product.id,
            quantity: item.quantity,
            price: item.product.price
          }))
        })
      });

      if (res.ok) {
        setOrderComplete(true);
        clearCart();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (orderComplete) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="container mx-auto px-4 py-32 text-center"
      >
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <h1 className="text-4xl font-extrabold mb-4">Order Confirmed!</h1>
        <p className="text-secondary-500 mb-10 max-w-md mx-auto">
          Thank you for your purchase. Your order has been placed successfully and will be shipped soon. 
          Check your email for order details.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/products" className="btn btn-primary btn-lg">
            Continue Shopping
          </Link>
          <Link to="/" className="btn bg-secondary-50 text-secondary-900 hover:bg-secondary-100 btn-lg">
            Back to Home
          </Link>
        </div>
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
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-4xl font-extrabold">Checkout</h1>
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-primary-500 text-white' : 'bg-secondary-100 text-secondary-400'}`}>1</div>
          <div className={`w-12 h-1 bg-secondary-100 rounded-full overflow-hidden`}>
            <div className={`h-full bg-primary-500 transition-all duration-500 ${step >= 2 ? 'w-full' : 'w-0'}`} />
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-primary-500 text-white' : 'bg-secondary-100 text-secondary-400'}`}>2</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Checkout Forms */}
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="card p-8">
                  <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                    <Truck className="w-6 h-6 text-primary-500" />
                    Shipping Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                      <label className="form-label">First Name</label>
                      <input type="text" className="input" defaultValue={user?.first_name} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Last Name</label>
                      <input type="text" className="input" defaultValue={user?.last_name} />
                    </div>
                    <div className="form-group md:col-span-2">
                      <label className="form-label">Email Address</label>
                      <input type="email" className="input" defaultValue={user?.email} />
                    </div>
                    <div className="form-group md:col-span-2">
                      <label className="form-label">Street Address</label>
                      <input type="text" className="input" placeholder="123 Main St" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input type="text" className="input" placeholder="New York" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Postal Code</label>
                      <input type="text" className="input" placeholder="10001" />
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setStep(2)}
                  className="btn btn-primary w-full btn-lg group"
                >
                  Continue to Payment
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="card p-8">
                  <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-primary-500" />
                    Payment Method
                  </h2>
                  <div className="space-y-6">
                    <div className="p-6 rounded-2xl border-2 border-primary-500 bg-primary-50 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                          <CreditCard className="w-6 h-6 text-primary-500" />
                        </div>
                        <div>
                          <p className="font-bold">Credit / Debit Card</p>
                          <p className="text-xs text-secondary-500">Pay securely with your card</p>
                        </div>
                      </div>
                      <div className="w-6 h-6 rounded-full border-4 border-primary-500 bg-white" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="form-group md:col-span-2">
                        <label className="form-label">Card Number</label>
                        <input type="text" className="input" placeholder="0000 0000 0000 0000" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Expiry Date</label>
                        <input type="text" className="input" placeholder="MM/YY" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">CVV</label>
                        <input type="text" className="input" placeholder="123" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setStep(1)}
                    className="btn bg-secondary-50 text-secondary-900 hover:bg-secondary-100 btn-lg flex items-center gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                  </button>
                  <button 
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="btn btn-primary flex-grow btn-lg group"
                  >
                    {loading ? "Processing..." : "Place Order Now"}
                    {!loading && <ShieldCheck className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-8 sticky top-32">
            <h2 className="text-2xl font-bold mb-8">Order Summary</h2>
            
            <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2">
              {cart.map(item => (
                <div key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`} className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-secondary-50 flex-shrink-0">
                    <img src={item.product.image_url?.[0] || "https://via.placeholder.com/150"} alt={item.product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-bold line-clamp-1">{item.product.name}</p>
                    <p className="text-xs text-secondary-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-bold">KSh {(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-8 border-t border-secondary-100">
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
              <div className="border-t border-secondary-100 pt-4 flex justify-between items-end">
                <span className="text-lg font-bold">Total</span>
                <span className="text-3xl font-extrabold text-primary-500">KSh {total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
