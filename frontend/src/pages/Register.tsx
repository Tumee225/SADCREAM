function Register() {
  return (
    <main className="auth-page">
      <form className="auth-card">
        <h1>Register</h1>
        <p>Шинэ хэрэглэгчээр бүртгүүлэх</p>

        <input type="text" placeholder="Full name" />
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />

        <button type="button">Бүртгүүлэх</button>
      </form>
    </main>
  );
}

export default Register;