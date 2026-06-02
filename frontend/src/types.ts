export type ProductCategory = "outerwear" | "hoodies" | "tshirts" | "pants" | "accessories";

export type ProductStatus = "in_stock" | "low_stock" | "pre_order" | "sold_out";
export type AdminProductStatus = "draft" | "active" | "hidden";
export type OrderStatus = "new" | "payment_checking" | "shipping" | "delivered" | "cancelled";
export type PaymentStatus = "unpaid" | "checking" | "paid" | "refunded";

export type Product = {
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
  lowStock: boolean;
};

export type CartItem = Product & {
  quantity: number;
  selectedSize?: string;
};

export type AdminOrder = {
  id: number;
  customerName: string;
  phone: string;
  paymentMethod: "qpay" | "socialpay" | "operator";
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  deliveryArea: "ub-a-zone" | "ub-other" | "local";
  address: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminOverview = {
  revenueToday: number;
  revenueThisMonth: number;
  revenueThisYear: number;
  totalOrders: number;
  pendingOrders: number;
  activeProducts: number;
  lowStockAlerts: Array<{
    productId: number;
    name: string;
    size: string;
    quantity: number;
  }>;
  topProducts: Array<{
    name: string;
    collection: string;
    quantity: number;
  }>;
};
