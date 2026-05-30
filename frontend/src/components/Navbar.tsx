import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="logo">
        SADCREAM
      </Link>

      <nav>
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
        <Link to="/login">Login</Link>
        <Link to="/register" className="nav-btn">
          Register
        </Link>
      </nav>
    </header>
  );
}

export default Navbar;