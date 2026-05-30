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
    name: "Moisture Cream",
    price: 39900,
    image: "cream-1",
    description: "Арьсыг чийгшүүлж зөөлөн болгох тос",
  },
  {
    id: 2,
    name: "Bright Skin Cream",
    price: 45900,
    image: "cream-2",
    description: "Арьсны өнгийг сэргээж гэрэлтсэн харагдуулна",
  },
  {
    id: 3,
    name: "Night Repair Cream",
    price: 49900,
    image: "cream-3",
    description: "Шөнийн арчилгаанд зориулсан нөхөн сэргээх тос",
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