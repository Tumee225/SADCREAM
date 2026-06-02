import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";

function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async () => {
    try {
      const res = await api.post("/auth/register", {
        fullName,
        email,
        password,
      });

      localStorage.setItem("sadcream_token", res.data.token);
      localStorage.setItem("sadcream_user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Бүртгэл амжилтгүй боллоо");
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-card">
        <span className="badge">Join the drop</span>
        <h1>Register</h1>
        <p>Sadcream community-д бүртгүүлээд limited release-үүдээ хадгалаарай.</p>

        {message && <div className="error-message">{message}</div>}

        <input
          type="text"
          placeholder="Full name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <button type="button" onClick={handleRegister}>
          Бүртгүүлэх
        </button>

        <p className="auth-link">
          Account байгаа юу? <Link to="/login">Нэвтрэх</Link>
        </p>
      </form>
    </main>
  );
}

export default Register;
