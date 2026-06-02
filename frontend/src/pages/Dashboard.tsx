import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const userText = localStorage.getItem("sadcream_user");
  const user = userText ? JSON.parse(userText) : null;

  const handleLogout = () => {
    localStorage.removeItem("sadcream_token");
    localStorage.removeItem("sadcream_user");
    navigate("/login");
  };

  return (
    <main className="page dashboard-page">
      <div className="shop-header">
        <span className="badge">Sadcream profile</span>
        <h1>Dashboard</h1>
        <p className="page-desc">Захиалга, profile, drop notification хэсэг.</p>
      </div>

      <div className="dashboard-card">
        <h3>Welcome to SADCREAM</h3>

        {user ? (
          <>
            <p>
              Сайн байна уу, <strong>{user.fullName}</strong>
            </p>
            <p>Email: {user.email}</p>
            <p>Never Die drop notification: active</p>

            <button className="logout-btn" onClick={handleLogout}>
              Гарах
            </button>
          </>
        ) : (
          <>
            <p>Та нэвтрээгүй байна.</p>
            <button className="logout-btn" onClick={() => navigate("/login")}>
              Login хийх
            </button>
          </>
        )}
      </div>
    </main>
  );
}

export default Dashboard;
