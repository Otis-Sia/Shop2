export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image_url: string[];
  category: string;
  stock: number;
  tags: string[];
  colors: string[];
  sizes: string[];
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'user' | 'admin';
  token: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}
