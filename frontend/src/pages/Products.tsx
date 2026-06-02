import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { api } from "../services/api";
import type { CartItem, Product, ProductCategory } from "../types";

const categories: Array<{ label: string; value: ProductCategory | "all" }> = [
  { label: "Shop All", value: "all" },
  { label: "Outerwear", value: "outerwear" },
  { label: "Hoodies", value: "hoodies" },
  { label: "T-Shirts", value: "tshirts" },
  { label: "Pants", value: "pants" },
  { label: "Accessories", value: "accessories" },
];

const statusLabel = {
  in_stock: "Бэлэн",
  low_stock: "Цөөхөн үлдсэн",
  pre_order: "Pre-order",
  sold_out: "Sold out",
};

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState("");
  const activeCategory = searchParams.get("category") || "all";

  useEffect(() => {
    api
      .get("/products")
      .then((res) => {
        setProducts(res.data.data);
      })
      .catch((err) => {
        console.error("Products авахад алдаа гарлаа:", err);
      });
  }, []);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") return products;
    return products.filter((product) => product.category === activeCategory);
  }, [activeCategory, products]);

  const addToCart = (product: Product) => {
    if (product.status === "sold_out") return;

    const savedCart = localStorage.getItem("sadcream_cart");
    const cart: CartItem[] = savedCart ? JSON.parse(savedCart) : [];
    const selectedSize = product.sizes[0];
    const existingItem = cart.find(
      (item) => item.id === product.id && item.selectedSize === selectedSize
    );

    const updatedCart = existingItem
      ? cart.map((item) =>
          item.id === product.id && item.selectedSize === selectedSize
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      : [...cart, { ...product, quantity: 1, selectedSize }];

    localStorage.setItem("sadcream_cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));

    setMessage(`${product.name} сагсанд нэмэгдлээ`);
    window.setTimeout(() => setMessage(""), 2200);
  };

  const selectCategory = (value: string) => {
    if (value === "all") {
      setSearchParams({});
      return;
    }

    setSearchParams({ category: value });
  };

  return (
    <main className="page shop-page">
      <div className="shop-header">
        <span className="badge">Sadcream shop</span>
        <h1>Limited drop store</h1>
        <p className="page-desc">
          Unisex fit. Hoodie, outerwear, tee, pants. Stock badge харж байгаад
          хурдан шийдээрэй.
        </p>
      </div>

      {message && <div className="cart-message">{message}</div>}

      <div className="category-tabs">
        {categories.map((category) => (
          <button
            key={category.value}
            className={activeCategory === category.value ? "active" : ""}
            onClick={() => selectCategory(category.value)}
            type="button"
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="product-grid">
        {filteredProducts.map((product) => (
          <article className="product-card" key={product.id}>
            <Link
              to={`/products/${product.slug}`}
              className={`product-image ${product.category}`}
              style={{ "--accent": product.accent } as CSSProperties}
            >
              <span>{product.collection}</span>
            </Link>

            <div className="product-meta">
              <span className={`stock-badge ${product.status}`}>
                {statusLabel[product.status]}
              </span>
              <span>{product.stock > 0 ? `Үлдэгдэл: ${product.stock}` : "0"}</span>
            </div>

            <h3>{product.name}</h3>
            <p>{product.description}</p>

            <div className="product-bottom">
              <strong>{product.price.toLocaleString()}₮</strong>
              <button
                onClick={() => addToCart(product)}
                disabled={product.status === "sold_out"}
                type="button"
              >
                <ShoppingBag size={17} />
                {product.status === "sold_out" ? "Sold out" : "Сагсанд нэмэх"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

export default Products;
