const products = [
  {
    id: 1,
    name: "Moisture Cream",
    price: "39,900₮",
    desc: "Арьсыг чийгшүүлж зөөлөн болгоно.",
  },
  {
    id: 2,
    name: "Bright Skin Cream",
    price: "45,900₮",
    desc: "Арьсны өнгийг сэргээж гэрэлтсэн харагдуулна.",
  },
  {
    id: 3,
    name: "Night Repair Cream",
    price: "49,900₮",
    desc: "Шөнийн арчилгаанд зориулсан нөхөн сэргээх тос.",
  },
];

function Products() {
  return (
    <main className="page">
      <h1>Products</h1>
      <p className="page-desc">SADCREAM бүтээгдэхүүний жагсаалт</p>

      <div className="product-grid">
        {products.map((product) => (
          <div className="product-card" key={product.id}>
            <div className="product-image">Cream</div>
            <h3>{product.name}</h3>
            <p>{product.desc}</p>
            <strong>{product.price}</strong>
            <button>Сагсанд нэмэх</button>
          </div>
        ))}
      </div>
    </main>
  );
}

export default Products;