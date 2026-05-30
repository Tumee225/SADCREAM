import { useEffect, useState } from "react";
import { api } from "../services/api";

type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
};

function Products() {
  const [products, setProducts] = useState<Product[]>([]);

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

  return (
    <main className="page">
      <h1>Products</h1>
      <p className="page-desc">SADCREAM бүтээгдэхүүний жагсаалт</p>

      <div className="product-grid">
        {products.map((product) => (
          <div className="product-card" key={product.id}>
            <div className="product-image">{product.image}</div>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <strong>{product.price.toLocaleString()}₮</strong>
            <button>Сагсанд нэмэх</button>
          </div>
        ))}
      </div>
    </main>
  );
}

export default Products;