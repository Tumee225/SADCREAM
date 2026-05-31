import { useEffect, useState } from "react";

type CartItem = {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  quantity: number;
};

function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

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

  const increaseQty = (id: number) => {
    const updated = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    );

    saveCart(updated);
  };

  const decreaseQty = (id: number) => {
    const updated = cartItems
      .map((item) =>
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item
      )
      .filter((item) => item.quantity > 0);

    saveCart(updated);
  };

  const removeItem = (id: number) => {
    const updated = cartItems.filter((item) => item.id !== id);
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <main className="page cart-page">
      <div className="shop-header">
        <span className="badge">SADCREAM CART</span>
        <h1>Миний сагс</h1>
        <p className="page-desc">Таны сонгосон бүтээгдэхүүнүүд</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <h2>Сагс хоосон байна</h2>
          <p>Дэлгүүрээс бүтээгдэхүүн сонгоод сагсанд нэмээрэй.</p>
          <a href="/products">Дэлгүүр рүү очих</a>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-list">
            {cartItems.map((item) => (
              <div className="cart-item" key={item.id}>
                <div className={`cart-image ${item.category}`}>
                  {item.category.toUpperCase()}
                </div>

                <div className="cart-info">
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <strong>{item.price.toLocaleString()}₮</strong>
                </div>

                <div className="cart-qty">
                  <button onClick={() => decreaseQty(item.id)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => increaseQty(item.id)}>+</button>
                </div>

                <button className="remove-btn" onClick={() => removeItem(item.id)}>
                  Устгах
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Захиалгын дүн</h2>

            <div className="summary-row">
              <span>Нийт бараа</span>
              <strong>
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
              </strong>
            </div>

            <div className="summary-row total">
              <span>Нийт үнэ</span>
              <strong>{totalPrice.toLocaleString()}₮</strong>
            </div>

            <button className="checkout-btn">Захиалах</button>
            <button className="clear-btn" onClick={clearCart}>
              Сагс хоослох
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default Cart;