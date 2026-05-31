import { useEffect, useState } from "react";
import { api } from "../services/api";

type Product = {
  id: number;
  name: string;
  category: "hoodie" | "jacket" | "leather";
  price: number;
  image: string;
  description: string;
};

type CartItem = Product & {
  quantity: number;
};

const categories = [
  { label: "Бүгд", value: "all" },
  { label: "Hoodie", value: "hoodie" },
  { label: "Jacket", value: "jacket" },
  { label: "Савхи", value: "leather" },
];

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [message, setMessage] = useState("");

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

  const addToCart = (product: Product) => {
    const savedCart = localStorage.getItem("sadcream_cart");
    const cart: CartItem[] = savedCart ? JSON.parse(savedCart) : [];

    const existingItem = cart.find((item) => item.id === product.id);

    let updatedCart: CartItem[];

    if (existingItem) {
      updatedCart = cart.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedCart = [...cart, { ...product, quantity: 1 }];
    }

    localStorage.setItem("sadcream_cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));

    setMessage(`${product.name} сагсанд нэмэгдлээ`);

    setTimeout(() => {
      setMessage("");
    }, 2000);
  };

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((product) => product.category === activeCategory);

  return (
    <main className="page shop-page">
      <div className="shop-header">
        <span className="badge">SADCREAM SHOP</span>
        <h1>Дэлгүүр</h1>
        <p className="page-desc">
          Hoodie, jacket болон савхин бүтээгдэхүүнүүдээс сонгоорой.
        </p>
      </div>

      {message && <div className="cart-message">{message}</div>}

      <div className="category-tabs">
        {categories.map((category) => (
          <button
            key={category.value}
            className={activeCategory === category.value ? "active" : ""}
            onClick={() => setActiveCategory(category.value)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="product-grid">
        {filteredProducts.map((product) => (
          <div className="product-card" key={product.id}>
            <div className={`product-image ${product.category}`}>
              {product.category === "hoodie" && "HOODIE"}
              {product.category === "jacket" && "JACKET"}
              {product.category === "leather" && "LEATHER"}
            </div>

            <span className="product-category">
              {product.category === "hoodie" && "Hoodie"}
              {product.category === "jacket" && "Jacket"}
              {product.category === "leather" && "Савхи"}
            </span>

            <h3>{product.name}</h3>
            <p>{product.description}</p>

            <div className="product-bottom">
              <strong>{product.price.toLocaleString()}₮</strong>
              <button onClick={() => addToCart(product)}>Сагсанд нэмэх</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default Products;