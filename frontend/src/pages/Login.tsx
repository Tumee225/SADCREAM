function Login() {
  return (
    <main className="auth-page">
      <form className="auth-card">
        <h1>Login</h1>
        <p>SADCREAM account руугаа нэвтрэх</p>

        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />

        <button type="button">Нэвтрэх</button>
      </form>
    </main>
  );
}

export default Login;