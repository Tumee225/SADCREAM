import { Link } from "react-router-dom";
import { ArrowRight, Flame, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import heroImage from "../assets/hero.png";

const drops = [
  { name: "Never Die Spiked Hoodie", stock: "5 left", tone: "green" },
  { name: "Black Leather Flare Pants", stock: "3 left", tone: "violet" },
  { name: "Mongol Chain Leather Jacket", stock: "Sold out", tone: "silver" },
];

const reels = [
  "Dark alley fit check",
  "Never Die walk",
  "Horror knit transition",
  "Made in Mongolia edit",
];

function Home() {
  return (
    <main className="home-page">
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">Made in Mongolia since 2022</p>
          <h1>
            Never Die
            <span>Streetwear</span>
          </h1>
          <p className="hero-desc">
            Sadcream бол Y2K, cyberpunk, rock horror, dark streetwear өнгө аястай
            limited drop brand. Хэзээ ч зогсохгүй, унтрахгүй гэсэн attitude-ийг
            hoodie, leather, rhinestone, chain detail бүрт шингээдэг.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="primary-btn">
              Shop drop <ArrowRight size={18} />
            </Link>
            <a href="#community" className="secondary-btn">
              Reel challenge
            </a>
          </div>
        </div>

        <div className="hero-visual">
          <div className="scanline" />
          <img src={heroImage} alt="Sadcream dark layered product artwork" />
          <div className="drop-stamp">
            <span>Limited 40</span>
            <strong>Never Die</strong>
          </div>
        </div>
      </section>

      <section className="signal-strip" aria-label="Sadcream qualities">
        <div>
          <Flame size={20} />
          Limited drops
        </div>
        <div>
          <ShieldCheck size={20} />
          Unisex fit
        </div>
        <div>
          <Sparkles size={20} />
          Rhinestone and embroidery
        </div>
        <div>
          <Trophy size={20} />
          Youth culture
        </div>
      </section>

      <section className="content-band">
        <div className="section-heading">
          <p className="eyebrow">Stock counter</p>
          <h2>Limited Drops</h2>
        </div>
        <div className="drop-grid">
          {drops.map((drop) => (
            <article className={`drop-card ${drop.tone}`} key={drop.name}>
              <span>{drop.stock}</span>
              <h3>{drop.name}</h3>
              <Link to="/products">View item</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="manifesto-band" id="manifesto">
        <div>
          <p className="eyebrow">Our Manifesto</p>
          <h2>Dark aesthetic, Mongolian pulse.</h2>
        </div>
        <p>
          Sadcream-ийн хувцас бүр хотын шөнө, рок тайз, cyber feed, гудамжны
          соёлыг нэгтгэнэ. Бид хүйсээр биш fit болон energy-ээр ангилдаг:
          oversized hoodie, varsity, leather, tee, pants.
        </p>
      </section>

      <section className="content-band community-band" id="community">
        <div className="section-heading">
          <p className="eyebrow">Sadcream Reel Challenge 2026</p>
          <h2>Манай залуус</h2>
        </div>
        <div className="reel-grid">
          {reels.map((reel, index) => (
            <article className="reel-card" key={reel}>
              <span>0{index + 1}</span>
              <h3>{reel}</h3>
              <p>@sadcream community reel</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Home;
