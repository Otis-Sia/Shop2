import React, { useState } from "react";
import { motion } from "motion/react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";

export default function Login({ setUser }: { setUser: any }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok) {
        setUser(data);
        const redirect = searchParams.get("redirect") || "/";
        navigate(redirect);
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="container mx-auto px-4 py-20 flex justify-center"
    >
      <div className="card p-8 md:p-12 w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold mb-2">Welcome Back</h1>
          <p className="text-secondary-500">Login to your ShopHub account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-12" 
                placeholder="name@example.com" 
              />
            </div>
          </div>

          <div className="form-group">
            <div className="flex justify-between items-center mb-2">
              <label className="form-label mb-0">Password</label>
              <a href="#" className="text-xs font-bold text-primary-500 hover:text-primary-600">Forgot Password?</a>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-12" 
                placeholder="••••••••" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary w-full btn-lg group"
          >
            {loading ? "Signing in..." : "Sign In"}
            {!loading && <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-secondary-100 text-center">
          <p className="text-secondary-500">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary-500 font-bold hover:text-primary-600">Create Account</Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
