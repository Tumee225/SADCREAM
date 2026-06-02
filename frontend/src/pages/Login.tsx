import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", { email, password });

      localStorage.setItem("sadcream_token", res.data.token);
      localStorage.setItem("sadcream_user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Нэвтрэхэд алдаа гарлаа");
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-card">
        <span className="badge">Sadcream account</span>
        <h1>Login</h1>
        <p>Drop захиалга, profile мэдээллээ харахын тулд нэвтэрнэ үү.</p>

        {message && <div className="error-message">{message}</div>}

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

        <button type="button" onClick={handleLogin}>
          Нэвтрэх
        </button>

        <p className="auth-link">
          Account байхгүй юу? <Link to="/register">Бүртгүүлэх</Link>
        </p>
      </form>
    </main>
  );
}

export default Login;
