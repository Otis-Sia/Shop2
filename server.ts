import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("ecommerce.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    first_name TEXT,
    last_name TEXT,
    role TEXT DEFAULT 'user'
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price REAL,
    description TEXT,
    image_url TEXT,
    category TEXT,
    stock INTEGER,
    tags TEXT, -- JSON array
    colors TEXT, -- JSON array
    sizes TEXT -- JSON array
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    total REAL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    price REAL,
    FOREIGN KEY(order_id) REFERENCES orders(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
  );
`);

// Seed Admin User
const adminEmail = "admin@shophub.com";
const adminExists = db.prepare("SELECT * FROM users WHERE email = ?").get(adminEmail);
if (!adminExists) {
  db.prepare("INSERT INTO users (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)").run(
    adminEmail,
    "admin123",
    "Admin",
    "User",
    "admin"
  );
}

// Seed Products if empty
const productCount = db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number };
if (productCount.count === 0) {
  const seedProducts = [
    {
      "name": "Sony WH-1000XM5 Wireless Headphones",
      "price": 349.99,
      "description": "Industry-leading noise cancellation with 8 microphones for crystal clear audio. 30-hour battery life and quick charging.",
      "image_url": "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&q=80",
      "category": "Electronics",
      "stock": 45,
      "tags": JSON.stringify(["express", "bestseller"]),
      "colors": JSON.stringify(["Black", "Silver", "Blue"]),
      "sizes": JSON.stringify(["One Size"])
    },
    {
      "name": "Samsung Galaxy S24 Ultra",
      "price": 1199.99,
      "description": "The ultimate smartphone experience with AI features, 200MP camera, and S-Pen integration. 512GB Storage.",
      "image_url": "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&q=80",
      "category": "Phones & Tablets",
      "stock": 15,
      "tags": JSON.stringify(["new", "express"]),
      "colors": JSON.stringify(["Titanium Black", "Titanium Gray", "Titanium Violet"]),
      "sizes": JSON.stringify(["256GB", "512GB", "1TB"])
    },
    {
      "name": "Nike Air Zoom Pegasus 40",
      "price": 129.95,
      "description": "Responsive road running shoes with breathable mesh upper and Nike React foam for a springy ride.",
      "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80",
      "category": "Fashion",
      "stock": 80,
      "tags": JSON.stringify(["deal"]),
      "colors": JSON.stringify(["Black/White", "Pure Platinum", "University Red"]),
      "sizes": JSON.stringify(["US 7", "US 8", "US 9", "US 10", "US 11"])
    },
    {
      "name": "MacBook Air M2 13-inch",
      "price": 1099.00,
      "description": "Supercharged by M2. Strikingly thin design with the power of the next-generation M2 chip. 18 hours battery.",
      "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=500&q=80",
      "category": "Computing",
      "stock": 25,
      "tags": JSON.stringify(["express"]),
      "colors": JSON.stringify(["Midnight", "Starlight", "Space Gray", "Silver"]),
      "sizes": JSON.stringify(["256GB SSD", "512GB SSD"])
    },
    {
      "name": "Nespresso Vertuo Coffee Machine",
      "price": 159.00,
      "description": "Versatile automatic coffee maker for authentic espresso and coffee. One-touch brewing system.",
      "image_url": "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&q=80",
      "category": "Home & Office",
      "stock": 30,
      "tags": JSON.stringify(["deal"]),
      "colors": JSON.stringify(["Matte Black", "Cherry Red", "Dark Grey"]),
      "sizes": JSON.stringify(["Standard"])
    },
    {
      "name": "La Roche-Posay Vitamin C Serum",
      "price": 39.99,
      "description": "Anti-aging serum with 10% pure vitamin C, salicylic acid, and neurosensine for radiant skin.",
      "image_url": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80",
      "category": "Health & Beauty",
      "stock": 100,
      "tags": JSON.stringify(["bestseller"]),
      "colors": JSON.stringify([]),
      "sizes": JSON.stringify(["30ml"])
    }
  ];

  const insert = db.prepare(`
    INSERT INTO products (name, price, description, image_url, category, stock, tags, colors, sizes)
    VALUES (@name, @price, @description, @image_url, @category, @stock, @tags, @colors, @sizes)
  `);

  for (const p of seedProducts) {
    insert.run(p);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API Routes
  app.post("/api/auth/register", (req, res) => {
    const { email, password, first_name, last_name } = req.body;
    const role = email.endsWith("@shophub.com") ? "admin" : "user";
    try {
      const info = db.prepare("INSERT INTO users (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)").run(email, password, first_name, last_name, role);
      res.json({ id: info.lastInsertRowid, email, first_name, last_name, role, token: "mock-token-" + info.lastInsertRowid });
    } catch (e) {
      res.status(400).json({ message: "Email already exists" });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password) as any;
    if (user) {
      res.json({ id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role, token: "mock-token-" + user.id });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  });

  app.get("/api/products", (req, res) => {
    const products = db.prepare("SELECT * FROM products").all() as any[];
    res.json(products.map(p => {
      let parsedImages = [];
      try {
        parsedImages = p.image_url && p.image_url.startsWith('[') ? JSON.parse(p.image_url) : [p.image_url].filter(Boolean);
      } catch(e) {
        parsedImages = [p.image_url].filter(Boolean);
      }
      return {
        ...p,
        image_url: parsedImages,
        tags: JSON.parse(p.tags || "[]"),
        colors: JSON.parse(p.colors || "[]"),
        sizes: JSON.parse(p.sizes || "[]")
      };
    }));
  });

  app.get("/api/products/:id", (req, res) => {
    const product = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id) as any;
    if (product) {
      let parsedImages = [];
      try {
        parsedImages = product.image_url && product.image_url.startsWith('[') ? JSON.parse(product.image_url) : [product.image_url].filter(Boolean);
      } catch(e) {
        parsedImages = [product.image_url].filter(Boolean);
      }
      res.json({
        ...product,
        image_url: parsedImages,
        tags: JSON.parse(product.tags || "[]"),
        colors: JSON.parse(product.colors || "[]"),
        sizes: JSON.parse(product.sizes || "[]")
      });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  });

  app.post("/api/products", (req, res) => {
    const { name, price, description, image_url, category, stock, tags, colors, sizes } = req.body;
    try {
      const info = db.prepare(`
        INSERT INTO products (name, price, description, image_url, category, stock, tags, colors, sizes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        name, 
        price, 
        description, 
        JSON.stringify(Array.isArray(image_url) ? image_url : [image_url].filter(Boolean)), 
        category, 
        stock, 
        JSON.stringify(tags || []), 
        JSON.stringify(colors || []), 
        JSON.stringify(sizes || [])
      );
      res.json({ id: info.lastInsertRowid, message: "Product created successfully" });
    } catch (e) {
      res.status(500).json({ message: "Error creating product" });
    }
  });

  app.put("/api/products/:id", (req, res) => {
    const { name, price, description, image_url, category, stock, tags, colors, sizes } = req.body;
    try {
      db.prepare(`
        UPDATE products 
        SET name = ?, price = ?, description = ?, image_url = ?, category = ?, stock = ?, tags = ?, colors = ?, sizes = ?
        WHERE id = ?
      `).run(
        name, 
        price, 
        description, 
        JSON.stringify(Array.isArray(image_url) ? image_url : [image_url].filter(Boolean)), 
        category, 
        stock, 
        JSON.stringify(tags || []), 
        JSON.stringify(colors || []), 
        JSON.stringify(sizes || []),
        req.params.id
      );
      res.json({ message: "Product updated successfully" });
    } catch (e) {
      res.status(500).json({ message: "Error updating product" });
    }
  });

  app.delete("/api/products/:id", (req, res) => {
    try {
      db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
      res.json({ message: "Product deleted successfully" });
    } catch (e) {
      res.status(500).json({ message: "Error deleting product" });
    }
  });

  app.post("/api/orders", (req, res) => {
    const { user_id, items, total } = req.body;
    const info = db.prepare("INSERT INTO orders (user_id, total) VALUES (?, ?)").run(user_id, total);
    const orderId = info.lastInsertRowid;

    const insertItem = db.prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
    for (const item of items) {
      insertItem.run(orderId, item.product_id, item.quantity, item.price);
    }

    res.json({ id: orderId, message: "Order placed successfully" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
