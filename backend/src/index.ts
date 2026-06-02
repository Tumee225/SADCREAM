import express from "express";
import type { NextFunction, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:4173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);

app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "sadcream_secret_key";

type UserRole = "CLIENT" | "ADMIN";
type ProductCategory = "outerwear" | "hoodies" | "tshirts" | "pants" | "accessories";
type ProductStatus = "in_stock" | "low_stock" | "pre_order" | "sold_out";
type AdminProductStatus = "draft" | "active" | "hidden";
type PaymentMethod = "qpay" | "socialpay" | "operator";
type DeliveryArea = "ub-a-zone" | "ub-other" | "local";
type PaymentStatus = "unpaid" | "checking" | "paid" | "refunded";
type OrderStatus = "new" | "payment_checking" | "shipping" | "delivered" | "cancelled";

type User = {
  id: number;
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
};

type Product = {
  id: number;
  slug: string;
  name: string;
  collection: string;
  category: ProductCategory;
  price: number;
  salePrice?: number;
  originalStock: number;
  stock: number;
  status: ProductStatus;
  adminStatus: AdminProductStatus;
  sizes: string[];
  sizeInventory: Record<string, number>;
  sizeGuide: string;
  accent: string;
  description: string;
  details: string[];
  mediaUrls: string[];
  reelUrl?: string;
  createdAt: string;
  updatedAt: string;
};

type Order = {
  id: number;
  customerName: string;
  phone: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  deliveryArea: DeliveryArea;
  address: string;
  items: Array<Product & { quantity: number; selectedSize?: string }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
  updatedAt: string;
};

type AuthRequest = Request & {
  user?: {
    id: number;
    email: string;
    role: UserRole;
  };
};

const now = () => new Date().toISOString();

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const getStockStatus = (stock: number, requestedStatus?: ProductStatus): ProductStatus => {
  if (requestedStatus === "pre_order") return "pre_order";
  if (stock <= 0) return "sold_out";
  if (stock <= 5) return "low_stock";
  return "in_stock";
};

const getInventoryTotal = (sizeInventory: Record<string, number>) =>
  Object.values(sizeInventory).reduce((sum, quantity) => sum + Number(quantity || 0), 0);

const deliveryFees: Record<DeliveryArea, number> = {
  "ub-a-zone": 10000,
  "ub-other": 15000,
  local: 0,
};

const users: User[] = [
  {
    id: 1,
    fullName: "Sadcream Admin",
    email: "admin@sadcream.mn",
    password: bcrypt.hashSync("admin123", 10),
    role: "ADMIN",
  },
];

const products: Product[] = [
  {
    id: 1,
    slug: "never-die-spiked-hoodie",
    name: "Never Die Spiked Hoodie",
    collection: "Never Die",
    category: "hoodies",
    price: 189000,
    salePrice: 169000,
    originalStock: 40,
    stock: 5,
    status: "low_stock",
    adminStatus: "active",
    sizes: ["L", "XL"],
    sizeInventory: { L: 2, XL: 3 },
    sizeGuide: "L: 160-175cm, XL: 176-190cm",
    accent: "#18f08b",
    description:
      "Oversized zip hoodie with thorn embroidery, rhinestone hits, and heavy street silhouette.",
    details: [
      "Limited 40 shirheg drop",
      "Hatgamal Never Die artwork",
      "Unisex oversized fit",
      "Made in Mongolia since 2022",
    ],
    mediaUrls: [],
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 2,
    slug: "dark-heart-varsity-jacket",
    name: "Dark Heart Varsity Jacket",
    collection: "Dark Heart",
    category: "outerwear",
    price: 279000,
    originalStock: 24,
    stock: 8,
    status: "in_stock",
    adminStatus: "active",
    sizes: ["M", "L", "XL"],
    sizeInventory: { M: 2, L: 4, XL: 2 },
    sizeGuide: "M: 155-168cm, L: 169-180cm, XL: 181-190cm",
    accent: "#ff2d71",
    description:
      "Black varsity jacket with gothic patch work, contrast rib, and cyber-rock attitude.",
    details: [
      "Wool blend body",
      "Premium chenille patches",
      "Street shoot ready cut",
      "A bus hurgelt bolomjtoi",
    ],
    mediaUrls: [],
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 3,
    slug: "mongol-chain-leather-jacket",
    name: "Mongol Chain Leather Jacket",
    collection: "Never Die",
    category: "outerwear",
    price: 389000,
    originalStock: 18,
    stock: 0,
    status: "sold_out",
    adminStatus: "hidden",
    sizes: ["L", "XL"],
    sizeInventory: { L: 0, XL: 0 },
    sizeGuide: "L: 165-178cm, XL: 179-190cm",
    accent: "#c9d1d9",
    description:
      "Leather look outerwear with chain details, metal energy, and night-city presence.",
    details: [
      "Metal chain detail",
      "Boxy cropped shoulder",
      "Rock horror inspired finish",
      "Daraagiin drop deer dahin garna",
    ],
    mediaUrls: [],
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 4,
    slug: "rhinestone-y2k-tee",
    name: "Rhinestone Y2K Tee",
    collection: "Cyber Bloom",
    category: "tshirts",
    price: 99000,
    originalStock: 60,
    stock: 12,
    status: "in_stock",
    adminStatus: "active",
    sizes: ["S", "M", "L", "XL"],
    sizeInventory: { S: 3, M: 4, L: 3, XL: 2 },
    sizeGuide: "S: 150-160cm, M: 161-170cm, L: 171-180cm, XL: 181-190cm",
    accent: "#6ee7ff",
    description:
      "Black tee with rhinestone front mark, slim Y2K mood, and clean unisex sizing.",
    details: [
      "Shigtgeetei artwork",
      "Soft cotton jersey",
      "Daily streetwear fit",
      "Shop pick-up bolomjtoi",
    ],
    mediaUrls: [],
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 5,
    slug: "black-leather-flare-pants",
    name: "Black Leather Flare Pants",
    collection: "Night Signal",
    category: "pants",
    price: 219000,
    originalStock: 22,
    stock: 3,
    status: "low_stock",
    adminStatus: "active",
    sizes: ["M", "L", "XL"],
    sizeInventory: { M: 1, L: 2, XL: 0 },
    sizeGuide: "M: 155-168cm, L: 169-180cm, XL: 181-190cm",
    accent: "#b874ff",
    description:
      "Leather look pants with a sharp flare line for dark stage and street fits.",
    details: [
      "Tsoon uldsen drop",
      "High-rise silhouette",
      "Unisex styling",
      "Hurem, hoodie-tei layering hiihhed tohiromjtoi",
    ],
    mediaUrls: [],
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 6,
    slug: "preorder-horror-knit",
    name: "Horror Knit Sweater",
    collection: "Never Die",
    category: "hoodies",
    price: 169000,
    originalStock: 30,
    stock: 30,
    status: "pre_order",
    adminStatus: "draft",
    sizes: ["L", "XL"],
    sizeInventory: { L: 15, XL: 15 },
    sizeGuide: "L: 160-175cm, XL: 176-190cm",
    accent: "#ff3b30",
    description:
      "Pre-order gothic knit with oversized sleeves and distressed Never Die lettering.",
    details: [
      "Urdchilsan zahialga",
      "Gothic knit artwork",
      "Oversized sleeve",
      "Zahialga batalgaajsan daraa operator holbogdono",
    ],
    mediaUrls: [],
    createdAt: now(),
    updatedAt: now(),
  },
];

const orders: Order[] = [];

const getPublicProducts = () =>
  products
    .filter((product) => product.adminStatus === "active")
    .map((product) => ({
      ...product,
      lowStock: product.status === "low_stock" || product.stock <= 5,
    }));

const calculateSubtotal = (items: Array<{ id: number; quantity: number }>) =>
  items.reduce((total, item) => {
    const product = products.find((entry) => entry.id === item.id);
    return total + (product ? (product.salePrice || product.price) * item.quantity : 0);
  }, 0);

const signToken = (user: User) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthRequest["user"];
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  authenticate(req, res, () => {
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    return next();
  });
};

const getAnalytics = () => {
  const deliveredOrPaidOrders = orders.filter(
    (order) => order.paymentStatus === "paid" || order.orderStatus === "delivered"
  );
  const todayKey = new Date().toISOString().slice(0, 10);
  const monthKey = new Date().toISOString().slice(0, 7);
  const yearKey = new Date().toISOString().slice(0, 4);

  const revenueFor = (prefix: string) =>
    deliveredOrPaidOrders
      .filter((order) => order.createdAt.startsWith(prefix))
      .reduce((sum, order) => sum + order.total, 0);

  const salesByProduct = new Map<string, { name: string; collection: string; quantity: number }>();

  deliveredOrPaidOrders.forEach((order) => {
    order.items.forEach((item) => {
      const existing = salesByProduct.get(item.slug) || {
        name: item.name,
        collection: item.collection,
        quantity: 0,
      };
      salesByProduct.set(item.slug, {
        ...existing,
        quantity: existing.quantity + item.quantity,
      });
    });
  });

  return {
    revenueToday: revenueFor(todayKey),
    revenueThisMonth: revenueFor(monthKey),
    revenueThisYear: revenueFor(yearKey),
    totalOrders: orders.length,
    pendingOrders: orders.filter((order) => order.orderStatus !== "delivered").length,
    activeProducts: products.filter((product) => product.adminStatus === "active").length,
    lowStockAlerts: products.flatMap((product) =>
      Object.entries(product.sizeInventory)
        .filter(([, quantity]) => quantity <= 2)
        .map(([size, quantity]) => ({
          productId: product.id,
          name: product.name,
          size,
          quantity,
        }))
    ),
    topProducts: Array.from(salesByProduct.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5),
  };
};

app.get("/", (_req, res) => {
  res.json({ message: "Sadcream backend is running" });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/products", (_req, res) => {
  res.json({ success: true, data: getPublicProducts() });
});

app.get("/api/products/:slug", (req, res) => {
  const product = getPublicProducts().find((item) => item.slug === req.params.slug);

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  return res.json({ success: true, data: product });
});

app.post("/api/orders", (req, res) => {
  const { customerName, phone, paymentMethod, deliveryArea, address, items } = req.body;

  if (!customerName || !phone || !paymentMethod || !deliveryArea || !address) {
    return res.status(400).json({
      success: false,
      message: "Zahialgiin medeellee buren oruulna uu",
    });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: "Sags hooson baina" });
  }

  const orderItems: Array<Product & { quantity: number; selectedSize?: string }> = items.flatMap(
    (item) => {
      const product = products.find((entry) => entry.id === item.id);
      if (!product) return [];
      return [
        {
          ...product,
          quantity: Number(item.quantity) || 1,
          selectedSize: item.selectedSize,
        },
      ];
    }
  );

  const subtotal = calculateSubtotal(orderItems);
  const deliveryFee = deliveryFees[deliveryArea as DeliveryArea] ?? 0;
  const paymentStatus: PaymentStatus =
    paymentMethod === "qpay" || paymentMethod === "socialpay" ? "checking" : "unpaid";

  const order: Order = {
    id: orders.length + 1,
    customerName,
    phone,
    paymentMethod,
    paymentStatus,
    orderStatus: paymentStatus === "checking" ? "payment_checking" : "new",
    deliveryArea,
    address,
    items: orderItems,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    createdAt: now(),
    updatedAt: now(),
  };

  orders.push(order);

  return res.status(201).json({
    success: true,
    message: "Zahialga burtgegdlee. Sadcream operator udahgui holbogdono.",
    data: order,
  });
});

app.post("/api/auth/register", async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ success: false, message: "Buh talbariig buglunu uu" });
  }

  const existingUser = users.find((user) => user.email === email);

  if (existingUser) {
    return res.status(409).json({ success: false, message: "Ene email burtgeltei baina" });
  }

  const newUser: User = {
    id: users.length + 1,
    fullName,
    email,
    password: await bcrypt.hash(password, 10),
    role: "CLIENT",
  };

  users.push(newUser);

  const token = signToken(newUser);

  return res.status(201).json({
    success: true,
    message: "Amjilttai burtgegdlee",
    token,
    user: {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
    },
  });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email bolon password oruulna uu" });
  }

  const user = users.find((item) => item.email === email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ success: false, message: "Email esvel password buruu baina" });
  }

  return res.json({
    success: true,
    message: "Amjilttai nevterlee",
    token: signToken(user),
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  });
});

app.get("/api/admin/overview", requireAdmin, (_req, res) => {
  res.json({ success: true, data: getAnalytics() });
});

app.get("/api/admin/products", requireAdmin, (_req, res) => {
  res.json({ success: true, data: products });
});

app.post("/api/admin/products", requireAdmin, (req, res) => {
  const {
    name,
    collection,
    category,
    price,
    salePrice,
    description,
    details,
    sizeInventory,
    adminStatus,
    status,
    mediaUrls,
    reelUrl,
    accent,
  } = req.body;

  if (!name || !collection || !category || !price || !sizeInventory) {
    return res.status(400).json({ success: false, message: "Product data is incomplete" });
  }

  const stock = getInventoryTotal(sizeInventory);
  const sizes = Object.keys(sizeInventory);
  const product: Product = {
    id: Math.max(...products.map((item) => item.id), 0) + 1,
    slug: `${slugify(name)}-${Date.now()}`,
    name,
    collection,
    category,
    price: Number(price),
    salePrice: salePrice ? Number(salePrice) : undefined,
    originalStock: stock,
    stock,
    status: getStockStatus(stock, status),
    adminStatus: adminStatus || "draft",
    sizes,
    sizeInventory,
    sizeGuide: sizes.map((size) => `${size}: ${sizeInventory[size]}sh`).join(", "),
    accent: accent || "#18f08b",
    description: description || "",
    details: Array.isArray(details) ? details : [],
    mediaUrls: Array.isArray(mediaUrls) ? mediaUrls : [],
    reelUrl,
    createdAt: now(),
    updatedAt: now(),
  };

  products.push(product);

  return res.status(201).json({ success: true, data: product });
});

app.patch("/api/admin/products/:id", requireAdmin, (req, res) => {
  const product = products.find((item) => item.id === Number(req.params.id));

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  const nextSizeInventory = req.body.sizeInventory || product.sizeInventory;
  const nextStock = getInventoryTotal(nextSizeInventory);
  const nextSizes = Object.keys(nextSizeInventory);

  Object.assign(product, {
    ...req.body,
    price: req.body.price !== undefined ? Number(req.body.price) : product.price,
    salePrice: req.body.salePrice !== undefined ? Number(req.body.salePrice) : product.salePrice,
    sizeInventory: nextSizeInventory,
    sizes: nextSizes,
    originalStock: req.body.originalStock !== undefined ? Number(req.body.originalStock) : nextStock,
    stock: nextStock,
    status: getStockStatus(nextStock, req.body.status || product.status),
    sizeGuide:
      req.body.sizeGuide || nextSizes.map((size) => `${size}: ${nextSizeInventory[size]}sh`).join(", "),
    updatedAt: now(),
  });

  return res.json({ success: true, data: product });
});

app.delete("/api/admin/products/:id", requireAdmin, (req, res) => {
  const product = products.find((item) => item.id === Number(req.params.id));

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  product.adminStatus = "hidden";
  product.updatedAt = now();

  return res.json({ success: true, data: product });
});

app.get("/api/admin/orders", requireAdmin, (_req, res) => {
  res.json({ success: true, data: orders });
});

app.patch("/api/admin/orders/:id", requireAdmin, (req, res) => {
  const order = orders.find((item) => item.id === Number(req.params.id));

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  if (req.body.orderStatus) order.orderStatus = req.body.orderStatus;
  if (req.body.paymentStatus) order.paymentStatus = req.body.paymentStatus;
  order.updatedAt = now();

  return res.json({ success: true, data: order });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
