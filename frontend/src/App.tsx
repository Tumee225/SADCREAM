import { useEffect, useState } from "react";

function App() {
  const [status, setStatus] = useState("loading...");

  useEffect(() => {
    fetch("http://localhost:3000/api/health")
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("backend холбогдсонгүй"));
  }, []);

  return (
    <main style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>SADCREAM Website</h1>
      <p>Backend status: {status}</p>
    </main>
  );
}

export default App;