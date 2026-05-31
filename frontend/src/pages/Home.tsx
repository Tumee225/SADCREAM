import { Link } from "react-router-dom";
import heroImage from "../assets/hero.png";

function Home() {
  return (
    <main className="street-home">
      <section className="street-hero">
        <div className="street-left">
          <p className="made-text">MADE IN ULAANBAATAR • SINCE 2022</p>

          <h1>
            <span>SADCREAM</span>
            <strong>MONGOLIAN</strong>
            <em>STREETWEAR</em>
          </h1>

          <p className="hero-desc">
            SADCREAM • Made in Mongolia 🇲🇳
            <br />
            Манай “Dark Heart” бүтэн zip-up hoodie нь хамгийн их эрэлттэй
            загваруудын нэг. Oversize fit, чанартай материал, streetwear хэв маяг.
          </p>

          <div className="street-actions">
            <Link to="/products" className="shop-gradient-btn">
              ДЭЛГҮҮР ҮЗЭХ
            </Link>

            <a
              href="https://www.instagram.com/sadcream"
              target="_blank"
              className="instagram-btn"
            >
              INSTAGRAM
            </a>
          </div>
        </div>

        <div className="street-right">
          <span className="collection-badge">NEW COLLECTION</span>
          <img src={heroImage} alt="SADCREAM hoodie" />
        </div>
      </section>
    </main>
  );
}

export default Home;