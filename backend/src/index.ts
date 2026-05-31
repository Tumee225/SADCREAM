import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "sadcream_secret_key";

type User = {
  id: number;
  fullName: string;
  email: string;
  password: string;
};

const users: User[] = [];

const products = [
  {
    id: 1,
    name: "Black Oversize Hoodie",
    category: "hoodie",
    price: 89900,
    image: "hoodie",
    description: "Өдөр тутам өмсөхөд тохиромжтой oversize hoodie",
  },
  {
    id: 2,
    name: "Cream Zip Hoodie",
    category: "hoodie",
    price: 94900,
    image: "hoodie",
    description: "Зөөлөн материалтай, minimal загвартай hoodie",
  },
  {
    id: 3,
    name: "Street Jacket",
    category: "jacket",
    price: 139900,
    image: "jacket",
    description: "Streetwear хэв маягийн нимгэн jacket",
  },
  {
    id: 4,
    name: "Puffer Jacket",
    category: "jacket",
    price: 169900,
    image: "jacket",
    description: "Дулаан, хөнгөн, өвөл өмсөхөд тохиромжтой jacket",
  },
  {
    id: 5,
    name: "Leather Jacket",
    category: "leather",
    price: 219900,
    image: "leather",
    description: "Савхин материалтай premium загварын jacket",
  },
  {
    id: 6,
    name: "Leather Bag",
    category: "leather",
    price: 129900,
    image: "leather",
    description: "Өдөр тутам хэрэглэхэд тохиромжтой савхин цүнх",
  },
];

app.get("/", (req, res) => {
  res.json({ message: "Backend ажиллаж байна" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/products", (req, res) => {
  res.json({
    success: true,
    data: products,
  });
});

app.post("/api/auth/register", async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Бүх талбарыг бөглөнө үү",
    });
  }

  const existingUser = users.find((user) => user.email === email);

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "Энэ email бүртгэлтэй байна",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser: User = {
    id: users.length + 1,
    fullName,
    email,
    password: hashedPassword,
  };

  users.push(newUser);

  const token = jwt.sign(
    {
      id: newUser.id,
      email: newUser.email,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.status(201).json({
    success: true,
    message: "Амжилттай бүртгэгдлээ",
    token,
    user: {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
    },
  });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email болон password оруулна уу",
    });
  }

  const user = users.find((item) => item.email === email);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Email эсвэл password буруу байна",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: "Email эсвэл password буруу байна",
    });
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    success: true,
    message: "Амжилттай нэвтэрлээ",
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
    },
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});