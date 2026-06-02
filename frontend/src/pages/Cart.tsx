import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, QrCode, Trash2 } from "lucide-react";
import { api } from "../services/api";
import type { CartItem } from "../types";

const deliveryFees = {
  "ub-a-zone": 10000,
  "ub-other": 15000,
  local: 0,
};

function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"qpay" | "socialpay" | "operator">("qpay");
  const [deliveryArea, setDeliveryArea] = useState<"ub-a-zone" | "ub-other" | "local">(
    "ub-a-zone"
  );
  const [message, setMessage] = useState("");

  const loadCart = () => {
    const savedCart = localStorage.getItem("sadcream_cart");
    setCartItems(savedCart ? JSON.parse(savedCart) : []);
  };

  useEffect(() => {
    loadCart();
  }, []);

  const saveCart = (items: CartItem[]) => {
    localStorage.setItem("sadcream_cart", JSON.stringify(items));
    setCartItems(items);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const updateQuantity = (id: number, selectedSize: string | undefined, delta: number) => {
    const updated = cartItems
      .map((item) =>
        item.id === id && item.selectedSize === selectedSize
          ? { ...item, quantity: item.quantity + delta }
          : item
      )
      .filter((item) => item.quantity > 0);

    saveCart(updated);
  };

  const removeItem = (id: number, selectedSize: string | undefined) => {
    saveCart(cartItems.filter((item) => item.id !== id || item.selectedSize !== selectedSize));
  };

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );
  const deliveryFee = deliveryFees[deliveryArea];
  const totalPrice = subtotal + deliveryFee;

  const submitOrder = async () => {
    try {
      const res = await api.post("/orders", {
        customerName,
        phone,
        address,
        paymentMethod,
        deliveryArea,
        items: cartItems,
      });

      setMessage(res.data.message);
      saveCart([]);
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Захиалга илгээхэд алдаа гарлаа");
    }
  };

  return (
    <main className="page cart-page">
      <div className="shop-header">
        <span className="badge">Sadcream cart</span>
        <h1>Захиалга</h1>
        <p className="page-desc">QPay, SocialPay эсвэл оператороор холбогдох flow.</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <h2>{message || "Сагс хоосон байна"}</h2>
          <p>Limited drop дуусахаас өмнө өөрийн fit-ээ сонгоорой.</p>
          <Link to="/products">Shop руу очих</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-list">
            {cartItems.map((item) => (
              <article className="cart-item" key={`${item.id}-${item.selectedSize}`}>
                <div
                  className={`cart-image ${item.category}`}
                  style={{ "--accent": item.accent } as CSSProperties}
                >
                  {item.collection}
                </div>

                <div className="cart-info">
                  <h3>{item.name}</h3>
                  <p>
                    Size {item.selectedSize || item.sizes[0]} · {item.description}
                  </p>
                  <strong>{item.price.toLocaleString()}₮</strong>
                </div>

                <div className="cart-qty">
                  <button onClick={() => updateQuantity(item.id, item.selectedSize, -1)}>
                    <Minus size={16} />
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.selectedSize, 1)}>
                    <Plus size={16} />
                  </button>
                </div>

                <button className="remove-btn" onClick={() => removeItem(item.id, item.selectedSize)}>
                  <Trash2 size={16} />
                </button>
              </article>
            ))}
          </div>

          <aside className="cart-summary">
            <h2>Checkout</h2>

            {message && <div className="order-message">{message}</div>}

            <label>
              Нэр
              <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} />
            </label>
            <label>
              Утас
              <input value={phone} onChange={(event) => setPhone(event.target.value)} />
            </label>
            <label>
              Хаяг
              <textarea value={address} onChange={(event) => setAddress(event.target.value)} />
            </label>

            <label>
              Төлбөр
              <select
                value={paymentMethod}
                onChange={(event) =>
                  setPaymentMethod(event.target.value as "qpay" | "socialpay" | "operator")
                }
              >
                <option value="qpay">QPay QR</option>
                <option value="socialpay">SocialPay</option>
                <option value="operator">Дугаараа үлдээгээд оператороор</option>
              </select>
            </label>

            <label>
              Хүргэлт
              <select
                value={deliveryArea}
                onChange={(event) =>
                  setDeliveryArea(event.target.value as "ub-a-zone" | "ub-other" | "local")
                }
              >
                <option value="ub-a-zone">УБ А бүс - 10k</option>
                <option value="ub-other">УБ бусад бүс - 15k</option>
                <option value="local">Орон нутгийн унаанд тавина</option>
              </select>
            </label>

            <div className="qr-preview">
              <QrCode size={44} />
              <span>{paymentMethod === "operator" ? "Оператор холбогдоно" : "QR demo"}</span>
            </div>

            <div className="summary-row">
              <span>Бараа</span>
              <strong>{subtotal.toLocaleString()}₮</strong>
            </div>
            <div className="summary-row">
              <span>Хүргэлт</span>
              <strong>{deliveryFee.toLocaleString()}₮</strong>
            </div>
            <div className="summary-row total">
              <span>Нийт</span>
              <strong>{totalPrice.toLocaleString()}₮</strong>
            </div>

            <button className="checkout-btn" onClick={submitOrder}>
              Захиалга илгээх
            </button>
            <button className="clear-btn" onClick={() => saveCart([])}>
              Сагс хоослох
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}

export default Cart;
