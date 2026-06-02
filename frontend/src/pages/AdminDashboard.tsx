import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BarChart3, ClipboardList, LogOut, Package, Plus, Save } from "lucide-react";
import { api } from "../services/api";
import type {
  AdminOrder,
  AdminOverview,
  AdminProductStatus,
  OrderStatus,
  PaymentStatus,
  Product,
  ProductCategory,
  ProductStatus,
} from "../types";

type AdminUser = {
  id: number;
  fullName: string;
  email: string;
  role: "CLIENT" | "ADMIN";
};

type ProductForm = {
  id?: number;
  name: string;
  collection: string;
  category: ProductCategory;
  price: string;
  salePrice: string;
  description: string;
  detailsText: string;
  sizesText: string;
  adminStatus: AdminProductStatus;
  status: ProductStatus;
  mediaText: string;
  reelUrl: string;
  accent: string;
};

const emptyForm: ProductForm = {
  name: "",
  collection: "Never Die",
  category: "hoodies",
  price: "",
  salePrice: "",
  description: "",
  detailsText: "",
  sizesText: "S:0, M:0, L:0, XL:0",
  adminStatus: "draft",
  status: "in_stock",
  mediaText: "",
  reelUrl: "",
  accent: "#18f08b",
};

const tabs = [
  { id: "overview", label: "Dashboard", icon: BarChart3 },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ClipboardList },
] as const;

const orderStatuses: OrderStatus[] = [
  "new",
  "payment_checking",
  "shipping",
  "delivered",
  "cancelled",
];

const paymentStatuses: PaymentStatus[] = ["unpaid", "checking", "paid", "refunded"];
const adminStatuses: AdminProductStatus[] = ["draft", "active", "hidden"];

const parseSizeInventory = (value: string) =>
  value.split(",").reduce<Record<string, number>>((inventory, item) => {
    const [size, quantity] = item.split(":").map((part) => part.trim());
    if (size) inventory[size.toUpperCase()] = Number(quantity || 0);
    return inventory;
  }, {});

const formatSizeInventory = (inventory: Record<string, number>) =>
  Object.entries(inventory)
    .map(([size, quantity]) => `${size}:${quantity}`)
    .join(", ");

const money = (value: number) => `${value.toLocaleString()}₮`;

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>("overview");
  const [email, setEmail] = useState("admin@sadcream.mn");
  const [password, setPassword] = useState("admin123");
  const [user, setUser] = useState<AdminUser | null>(() => {
    const savedUser = localStorage.getItem("sadcream_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [message, setMessage] = useState("");
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);

  const isAdmin = user?.role === "ADMIN";

  const totalInventory = useMemo(
    () => products.reduce((sum, product) => sum + product.stock, 0),
    [products]
  );

  const loadAdminData = async () => {
    const [overviewRes, productRes, orderRes] = await Promise.all([
      api.get("/admin/overview"),
      api.get("/admin/products"),
      api.get("/admin/orders"),
    ]);

    setOverview(overviewRes.data.data);
    setProducts(productRes.data.data);
    setOrders(orderRes.data.data);
  };

  useEffect(() => {
    if (!isAdmin) return;

    loadAdminData().catch((error) => {
      setMessage(error.response?.data?.message || "Admin data авахад алдаа гарлаа");
    });
  }, [isAdmin]);

  const login = async () => {
    try {
      const res = await api.post("/auth/login", { email, password });

      if (res.data.user.role !== "ADMIN") {
        setMessage("Энэ хэрэглэгч admin эрхгүй байна");
        return;
      }

      localStorage.setItem("sadcream_token", res.data.token);
      localStorage.setItem("sadcream_user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      setMessage("");
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Admin login амжилтгүй");
    }
  };

  const logout = () => {
    localStorage.removeItem("sadcream_token");
    localStorage.removeItem("sadcream_user");
    setUser(null);
  };

  const editProduct = (product: Product) => {
    setForm({
      id: product.id,
      name: product.name,
      collection: product.collection,
      category: product.category,
      price: String(product.price),
      salePrice: product.salePrice ? String(product.salePrice) : "",
      description: product.description,
      detailsText: product.details.join("\n"),
      sizesText: formatSizeInventory(product.sizeInventory),
      adminStatus: product.adminStatus,
      status: product.status,
      mediaText: product.mediaUrls.join("\n"),
      reelUrl: product.reelUrl || "",
      accent: product.accent,
    });
    setActiveTab("products");
  };

  const saveProduct = async () => {
    const payload = {
      name: form.name,
      collection: form.collection,
      category: form.category,
      price: Number(form.price),
      salePrice: form.salePrice ? Number(form.salePrice) : undefined,
      description: form.description,
      details: form.detailsText.split("\n").filter(Boolean),
      sizeInventory: parseSizeInventory(form.sizesText),
      adminStatus: form.adminStatus,
      status: form.status,
      mediaUrls: form.mediaText.split("\n").filter(Boolean),
      reelUrl: form.reelUrl || undefined,
      accent: form.accent,
    };

    try {
      if (form.id) {
        await api.patch(`/admin/products/${form.id}`, payload);
        setMessage("Product шинэчлэгдлээ");
      } else {
        await api.post("/admin/products", payload);
        setMessage("Шинэ product нэмэгдлээ");
      }

      setForm(emptyForm);
      await loadAdminData();
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Product хадгалахад алдаа гарлаа");
    }
  };

  const updateProductStatus = async (product: Product, adminStatus: AdminProductStatus) => {
    await api.patch(`/admin/products/${product.id}`, { adminStatus });
    await loadAdminData();
  };

  const hideProduct = async (product: Product) => {
    await api.delete(`/admin/products/${product.id}`);
    await loadAdminData();
  };

  const updateOrder = async (
    order: AdminOrder,
    payload: { orderStatus?: OrderStatus; paymentStatus?: PaymentStatus }
  ) => {
    await api.patch(`/admin/orders/${order.id}`, payload);
    await loadAdminData();
  };

  if (!isAdmin) {
    return (
      <main className="admin-login-page">
        <section className="admin-login-card">
          <span className="admin-kicker">Sadcream admin</span>
          <h1>Control panel</h1>
          <p>Product drop, inventory matrix, order tracking, analytics удирдах хэсэг.</p>

          {message && <div className="admin-error">{message}</div>}

          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          <button onClick={login} type="button">
            Admin нэвтрэх
          </button>

          <small>Demo: admin@sadcream.mn / admin123</small>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div>
          <span className="admin-logo">SC</span>
          <h1>Sadcream Admin</h1>
          <p>{user.fullName}</p>
        </div>

        <nav>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={activeTab === tab.id ? "active" : ""}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <button className="admin-logout" onClick={logout} type="button">
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-kicker">admin.sadcream.mn</span>
            <h2>
              {activeTab === "overview" && "Store dashboard"}
              {activeTab === "products" && "Product management"}
              {activeTab === "orders" && "Order tracking"}
            </h2>
          </div>
          <button onClick={loadAdminData} type="button">
            Refresh
          </button>
        </header>

        {message && <div className="admin-notice">{message}</div>}

        {activeTab === "overview" && overview && (
          <>
            <div className="admin-stats">
              <article>
                <span>Today revenue</span>
                <strong>{money(overview.revenueToday)}</strong>
              </article>
              <article>
                <span>This month</span>
                <strong>{money(overview.revenueThisMonth)}</strong>
              </article>
              <article>
                <span>Total orders</span>
                <strong>{overview.totalOrders}</strong>
              </article>
              <article>
                <span>Inventory</span>
                <strong>{totalInventory} pcs</strong>
              </article>
            </div>

            <div className="admin-grid-two">
              <section className="admin-panel">
                <h3>
                  <AlertTriangle size={18} />
                  Stock alerts
                </h3>
                <div className="admin-list">
                  {overview.lowStockAlerts.length === 0 ? (
                    <p>No low stock alerts.</p>
                  ) : (
                    overview.lowStockAlerts.map((alert) => (
                      <div key={`${alert.productId}-${alert.size}`}>
                        <strong>{alert.name}</strong>
                        <span>
                          Size {alert.size}: {alert.quantity} left
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="admin-panel">
                <h3>Top products</h3>
                <div className="admin-list">
                  {overview.topProducts.length === 0 ? (
                    <p>Paid/delivered order орж ирэхээр энд харагдана.</p>
                  ) : (
                    overview.topProducts.map((product) => (
                      <div key={product.name}>
                        <strong>{product.name}</strong>
                        <span>
                          {product.collection} · {product.quantity} sold
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </>
        )}

        {activeTab === "products" && (
          <div className="admin-products-layout">
            <section className="admin-panel product-form">
              <h3>
                <Plus size={18} />
                {form.id ? "Edit product" : "Create product"}
              </h3>

              <label>
                Name
                <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </label>
              <label>
                Description
                <textarea
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                />
              </label>
              <div className="admin-form-row">
                <label>
                  Collection
                  <input
                    value={form.collection}
                    onChange={(event) => setForm({ ...form, collection: event.target.value })}
                  />
                </label>
                <label>
                  Category
                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm({ ...form, category: event.target.value as ProductCategory })
                    }
                  >
                    <option value="outerwear">Outerwear</option>
                    <option value="hoodies">Hoodies</option>
                    <option value="tshirts">Tees</option>
                    <option value="pants">Pants</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </label>
              </div>
              <div className="admin-form-row">
                <label>
                  Price
                  <input
                    type="number"
                    value={form.price}
                    onChange={(event) => setForm({ ...form, price: event.target.value })}
                  />
                </label>
                <label>
                  Sale price
                  <input
                    type="number"
                    value={form.salePrice}
                    onChange={(event) => setForm({ ...form, salePrice: event.target.value })}
                  />
                </label>
              </div>
              <label>
                Size & inventory matrix
                <input
                  value={form.sizesText}
                  onChange={(event) => setForm({ ...form, sizesText: event.target.value })}
                />
              </label>
              <div className="admin-form-row">
                <label>
                  Store status
                  <select
                    value={form.adminStatus}
                    onChange={(event) =>
                      setForm({ ...form, adminStatus: event.target.value as AdminProductStatus })
                    }
                  >
                    {adminStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Stock status
                  <select
                    value={form.status}
                    onChange={(event) => setForm({ ...form, status: event.target.value as ProductStatus })}
                  >
                    <option value="in_stock">in_stock</option>
                    <option value="low_stock">low_stock</option>
                    <option value="pre_order">pre_order</option>
                    <option value="sold_out">sold_out</option>
                  </select>
                </label>
              </div>
              <label>
                Details
                <textarea
                  value={form.detailsText}
                  onChange={(event) => setForm({ ...form, detailsText: event.target.value })}
                />
              </label>
              <label>
                Media URLs
                <textarea
                  value={form.mediaText}
                  onChange={(event) => setForm({ ...form, mediaText: event.target.value })}
                />
              </label>
              <div className="admin-form-row">
                <label>
                  Reel URL
                  <input
                    value={form.reelUrl}
                    onChange={(event) => setForm({ ...form, reelUrl: event.target.value })}
                  />
                </label>
                <label>
                  Accent
                  <input
                    type="color"
                    value={form.accent}
                    onChange={(event) => setForm({ ...form, accent: event.target.value })}
                  />
                </label>
              </div>

              <div className="admin-actions">
                <button onClick={saveProduct} type="button">
                  <Save size={16} />
                  Save product
                </button>
                <button onClick={() => setForm(emptyForm)} type="button">
                  Clear
                </button>
              </div>
            </section>

            <section className="admin-panel admin-table-panel">
              <h3>Product list</h3>
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <strong>{product.name}</strong>
                          <span>{product.collection}</span>
                        </td>
                        <td>{product.category}</td>
                        <td>{money(product.salePrice || product.price)}</td>
                        <td>
                          {product.stock}
                          <small>{formatSizeInventory(product.sizeInventory)}</small>
                        </td>
                        <td>
                          <select
                            value={product.adminStatus}
                            onChange={(event) =>
                              updateProductStatus(product, event.target.value as AdminProductStatus)
                            }
                          >
                            {adminStatuses.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <button onClick={() => editProduct(product)} type="button">
                            Edit
                          </button>
                          <button onClick={() => hideProduct(product)} type="button">
                            Hide
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {activeTab === "orders" && (
          <section className="admin-panel admin-table-panel">
            <h3>Order list</h3>
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Order status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6}>Захиалга одоогоор байхгүй байна.</td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <strong>{order.customerName}</strong>
                          <span>{order.phone}</span>
                          <small>{order.address}</small>
                        </td>
                        <td>
                          {order.items.map((item) => (
                            <span key={`${item.id}-${item.selectedSize}`}>
                              {item.name} · {item.selectedSize} x{item.quantity}
                            </span>
                          ))}
                        </td>
                        <td>{money(order.total)}</td>
                        <td>
                          <small>{order.paymentMethod}</small>
                          <select
                            value={order.paymentStatus}
                            onChange={(event) =>
                              updateOrder(order, { paymentStatus: event.target.value as PaymentStatus })
                            }
                          >
                            {paymentStatuses.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <select
                            value={order.orderStatus}
                            onChange={(event) =>
                              updateOrder(order, { orderStatus: event.target.value as OrderStatus })
                            }
                          >
                            {orderStatuses.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>{new Date(order.createdAt).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

export default AdminDashboard;
