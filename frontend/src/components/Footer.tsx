import { Camera, Clock, MapPin, Truck } from "lucide-react";

function Footer() {
  return (
    <footer className="footer">
      <div>
        <span className="footer-brand">SADCREAM</span>
        <p>Made in Mongolia since 2022. Dark streetwear, limited drops, youth culture.</p>
      </div>

      <a
        href="https://www.google.com/maps/search/?api=1&query=Хүүхдийн+100+Наран+моллын+урд+45-р+байр"
        target="_blank"
        rel="noreferrer"
      >
        <MapPin size={18} />
        Хүүхдийн 100, Наран моллын урд, 45-р байр
      </a>

      <p>
        <Clock size={18} />
        12:00 - 20:00
      </p>

      <p>
        <Truck size={18} />
        А бүс хүргэлт 10k, орон нутгийн унаанд тавьж өгнө
      </p>

      <a href="https://www.instagram.com/sadcream" target="_blank" rel="noreferrer">
        <Camera size={18} />
        Instagram
      </a>
    </footer>
  );
}

export default Footer;
