import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, ShoppingBag, UserRound, X } from "lucide-react";
import type { CartItem } from "../types";

const navItems = [
  { label: "Shop All", to: "/products" },
  { label: "Outerwear", to: "/products?category=outerwear" },
  { label: "Hoodies", to: "/products?category=hoodies" },
  { label: "T-Shirts", to: "/products?category=tshirts" },
  { label: "Pants", to: "/products?category=pants" },
  { label: "Accessories", to: "/products?category=accessories" },
];

function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const updateCartCount = () => {
    const savedCart = localStorage.getItem("sadcream_cart");
    const cart: CartItem[] = savedCart ? JSON.parse(savedCart) : [];
    setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
  };

  useEffect(() => {
    updateCartCount();
    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  return (
    <header className="navbar">
      <Link to="/" className="brand-logo" onClick={() => setIsOpen(false)}>
        <span className="logo-mark">SC</span>
        <span className="logo-text">SADCREAM</span>
      </Link>

      <button
        className="nav-toggle"
        type="button"
        aria-label="Toggle menu"
        onClick={() => setIsOpen((value) => !value)}
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <nav className={`main-nav ${isOpen ? "open" : ""}`}>
        {navItems.map((item) => (
          <NavLink key={item.label} to={item.to} onClick={() => setIsOpen(false)}>
            {item.label}
          </NavLink>
        ))}
        <a href="/#manifesto" onClick={() => setIsOpen(false)}>
          Never Die
        </a>
      </nav>

      <div className="nav-actions">
        <Link to="/login" className="icon-pill" aria-label="Login">
          <UserRound size={18} />
          <span>Login</span>
        </Link>

        <Link to="/cart" className="cart-pill" aria-label="Cart">
          <ShoppingBag size={18} />
          <span>Cart</span>
          <strong>{cartCount}</strong>
        </Link>
      </div>
    </header>
  );
}

export default Navbar;
