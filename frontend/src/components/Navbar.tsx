import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

type CartItem = {
  quantity: number;
};

function Navbar() {
  const [cartCount, setCartCount] = useState(0);

  const updateCartCount = () => {
    const savedCart = localStorage.getItem("sadcream_cart");
    const cart: CartItem[] = savedCart ? JSON.parse(savedCart) : [];

    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(count);
  };

  useEffect(() => {
    updateCartCount();

    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  return (
    <header className="navbar dark-navbar">
      <Link to="/" className="brand-logo">
        <div className="logo-circle">S</div>
        <span>SADCREAM</span>
      </Link>

      <nav className="main-nav">
        <Link to="/">НҮҮР</Link>
        <Link to="/products">БҮТЭЭГДЭХҮҮН</Link>
      </nav>

      <div className="nav-actions">
        <Link to="/login" className="login-pill">
          НЭВТРЭХ
        </Link>

        <Link to="/cart" className="cart-pill">
          <ShoppingCart size={18} />
          <span>Cart</span>
          <strong>{cartCount}</strong>
        </Link>
      </div>
    </header>
  );
}

export default Navbar;