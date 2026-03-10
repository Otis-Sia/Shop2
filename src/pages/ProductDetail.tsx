import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ShoppingCart, Star, ArrowLeft, Heart, Share2, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { Product } from "../types";

export default function ProductDetail({ addToCart }: { addToCart: any }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        if (data.colors?.length) setSelectedColor(data.colors[0]);
        if (data.sizes?.length) setSelectedSize(data.sizes[0]);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="container mx-auto px-4 py-20 text-center">Loading...</div>;
  if (!product) return <div className="container mx-auto px-4 py-20 text-center">Product not found</div>;

  const images = product.image_url?.length > 0 ? product.image_url : ["https://via.placeholder.com/600"];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-12"
    >
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-secondary-500 hover:text-primary-500 transition-colors mb-8 font-medium"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Shop
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden bg-secondary-50 border border-secondary-100">
            <img 
              src={images[activeImage]} 
              alt={product.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {images.map((img, i) => (
                <div 
                  key={i} 
                  onClick={() => setActiveImage(i)}
                  className={`aspect-square rounded-xl overflow-hidden bg-secondary-50 border cursor-pointer transition-colors ${activeImage === i ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-secondary-100 hover:border-primary-300'}`}
                >
                  <img 
                    src={img} 
                    alt={`${product.name} ${i}`} 
                    className={`w-full h-full object-cover transition-opacity ${activeImage === i ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <span className="px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-xs font-bold uppercase tracking-widest">
                {product.category}
              </span>
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4" />
                <span className="text-sm font-bold text-secondary-900 ml-1">4.8 (120 reviews)</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">{product.name}</h1>
            <p className="text-3xl font-extrabold text-primary-500 mb-6">KSh {product.price}</p>
            <p className="text-secondary-500 leading-relaxed text-lg">
              {product.description}
            </p>
          </div>

          <div className="space-y-8 mb-10">
            {/* Color Selection */}
            {product.colors.length > 0 && (
              <div>
                <h3 className="font-bold mb-4 uppercase text-xs tracking-widest text-secondary-400">Select Color</h3>
                <div className="flex gap-3">
                  {product.colors.map(color => (
                    <button 
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-xl border-2 transition-all ${
                        selectedColor === color 
                          ? 'border-primary-500 bg-primary-50 text-primary-700 font-bold' 
                          : 'border-secondary-100 hover:border-secondary-300'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes.length > 0 && (
              <div>
                <h3 className="font-bold mb-4 uppercase text-xs tracking-widest text-secondary-400">Select Size</h3>
                <div className="flex gap-3">
                  {product.sizes.map(size => (
                    <button 
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-xl border-2 transition-all ${
                        selectedSize === size 
                          ? 'border-primary-500 bg-primary-50 text-primary-700 font-bold' 
                          : 'border-secondary-100 hover:border-secondary-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="font-bold mb-4 uppercase text-xs tracking-widest text-secondary-400">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-secondary-100 rounded-xl overflow-hidden">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-secondary-50 transition-colors font-bold"
                  >-</button>
                  <span className="px-6 py-2 font-bold min-w-[60px] text-center">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-4 py-2 hover:bg-secondary-50 transition-colors font-bold"
                  >+</button>
                </div>
                <span className="text-sm text-secondary-400 font-medium">
                  {product.stock} items available
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-12">
            <button 
              onClick={() => addToCart(product, quantity, selectedColor, selectedSize)}
              className="btn btn-primary btn-lg flex-grow md:flex-grow-0 md:min-w-[240px] gap-3"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>
            <button className="btn bg-secondary-50 text-secondary-900 hover:bg-secondary-100 btn-lg p-4">
              <Heart className="w-6 h-6" />
            </button>
            <button className="btn bg-secondary-50 text-secondary-900 hover:bg-secondary-100 btn-lg p-4">
              <Share2 className="w-6 h-6" />
            </button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-secondary-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-50 rounded-lg"><Truck className="w-5 h-5 text-primary-600" /></div>
              <span className="text-xs font-bold text-secondary-600 uppercase tracking-wider">Free Shipping</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-50 rounded-lg"><ShieldCheck className="w-5 h-5 text-primary-600" /></div>
              <span className="text-xs font-bold text-secondary-600 uppercase tracking-wider">2 Year Warranty</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-50 rounded-lg"><RotateCcw className="w-5 h-5 text-primary-600" /></div>
              <span className="text-xs font-bold text-secondary-600 uppercase tracking-wider">30 Day Returns</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
