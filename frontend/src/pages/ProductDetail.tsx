import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Ruler, ShoppingBag } from "lucide-react";
import { api } from "../services/api";
import type { CartItem, Product } from "../types";

const statusLabel = {
  in_stock: "Бэлэн байгаа",
  low_stock: "Цөөхөн үлдсэн",
  pre_order: "Урьдчилсан захиалга",
  sold_out: "Дууссан",
};

const getRecommendedSize = (height: number, sizes: string[]) => {
  if (height <= 160 && sizes.includes("S")) return "S";
  if (height <= 170 && sizes.includes("M")) return "M";
  if (height <= 180 && sizes.includes("L")) return "L";
  if (sizes.includes("XL")) return "XL";
  return sizes[sizes.length - 1] || "";
};

function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [height, setHeight] = useState(175);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!slug) return;

    api
      .get(`/products/${slug}`)
      .then((res) => {
        setProduct(res.data.data);
        setSelectedSize(res.data.data.sizes[0]);
      })
      .catch((err) => {
        console.error("Product detail авахад алдаа гарлаа:", err);
      });
  }, [slug]);

  const recommendedSize = useMemo(() => {
    if (!product) return "";
    return getRecommendedSize(height, product.sizes);
  }, [height, product]);

  const addToCart = () => {
    if (!product || product.status === "sold_out") return;

    const savedCart = localStorage.getItem("sadcream_cart");
    const cart: CartItem[] = savedCart ? JSON.parse(savedCart) : [];
    const existingItem = cart.find(
      (item) => item.id === product.id && item.selectedSize === selectedSize
    );

    const updatedCart = existingItem
      ? cart.map((item) =>
          item.id === product.id && item.selectedSize === selectedSize
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      : [...cart, { ...product, selectedSize, quantity: 1 }];

    localStorage.setItem("sadcream_cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
    setMessage(`${product.name} (${selectedSize}) сагсанд нэмэгдлээ`);
  };

  if (!product) {
    return (
      <main className="page shop-page">
        <div className="empty-cart">
          <h2>Product loading...</h2>
          <Link to="/products">Shop руу буцах</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page detail-page">
      <Link className="back-link" to="/products">
        <ArrowLeft size={18} />
        Shop all
      </Link>

      <section className="detail-layout">
        <div
          className={`detail-visual ${product.category}`}
          style={{ "--accent": product.accent } as CSSProperties}
        >
          <span>{product.collection}</span>
          <strong>{product.name}</strong>
        </div>

        <div className="detail-info">
          <span className={`stock-badge ${product.status}`}>
            {statusLabel[product.status]}
          </span>
          <h1>{product.name}</h1>
          <p className="detail-desc">{product.description}</p>
          <strong className="detail-price">{product.price.toLocaleString()}₮</strong>

          <div className="detail-stock">
            <span>Нийт drop: {product.originalStock}ш</span>
            <span>Үлдэгдэл: {product.stock}ш</span>
          </div>

          <div className="size-panel">
            <div>
              <Ruler size={18} />
              <strong>Size calculator</strong>
            </div>
            <label>
              Өндөр: {height}cm
              <input
                type="range"
                min="150"
                max="195"
                value={height}
                onChange={(event) => setHeight(Number(event.target.value))}
              />
            </label>
            <p>
              Санал болгож буй size: <strong>{recommendedSize}</strong>
            </p>
            <small>{product.sizeGuide}</small>
          </div>

          <div className="size-options">
            {product.sizes.map((size) => (
              <button
                key={size}
                className={selectedSize === size ? "active" : ""}
                onClick={() => setSelectedSize(size)}
                type="button"
              >
                {size}
              </button>
            ))}
          </div>

          <ul className="detail-list">
            {product.details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>

          {message && <div className="cart-message inline">{message}</div>}

          <button
            className="detail-cart-btn"
            onClick={addToCart}
            disabled={product.status === "sold_out"}
            type="button"
          >
            <ShoppingBag size={18} />
            {product.status === "sold_out" ? "Sold out" : "Сагсанд нэмэх"}
          </button>
        </div>
      </section>
    </main>
  );
}

export default ProductDetail;
