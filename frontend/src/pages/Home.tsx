import { motion } from "framer-motion";
import { ShoppingBag, Sparkles, ShieldCheck } from "lucide-react";

function Home() {
  return (
    <main className="home">
      <section className="hero">
        <motion.div
          className="hero-text"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="badge">Premium skincare brand</span>

          <h1>Healthy skin starts with SADCREAM</h1>

          <p>
            Арьс арчилгааны бүтээгдэхүүнийг илүү хялбар, найдвартай,
            ойлгомжтой байдлаар хэрэглэгчдэд хүргэх website.
          </p>

          <div className="hero-actions">
            <a href="/products" className="primary-btn">
              Бүтээгдэхүүн үзэх
            </a>
            <a href="/register" className="secondary-btn">
              Бүртгүүлэх
            </a>
          </div>
        </motion.div>

        <motion.div
          className="hero-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="cream-box">
            <Sparkles size={54} />
            <h2>SADCREAM</h2>
            <p>Clean • Soft • Premium</p>
          </div>
        </motion.div>
      </section>

      <section className="features">
        <div className="feature-card">
          <ShoppingBag />
          <h3>Online shop</h3>
          <p>Бүтээгдэхүүнээ online-аар үзэж захиалах боломж.</p>
        </div>

        <div className="feature-card">
          <ShieldCheck />
          <h3>Trusted product</h3>
          <p>Найдвартай мэдээлэл, бүтээгдэхүүний дэлгэрэнгүй тайлбар.</p>
        </div>

        <div className="feature-card">
          <Sparkles />
          <h3>Modern design</h3>
          <p>Орчин үеийн, цэвэрхэн, responsive website дизайн.</p>
        </div>
      </section>
    </main>
  );
}

export default Home;