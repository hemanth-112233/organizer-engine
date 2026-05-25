import { useEffect, useState } from "react";
import API from "./api";

function App() {
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState({});
  const [duplicates, setDuplicates] = useState([]);

  const fetchFiles = async () => {
    const res = await API.get("/files");
    setFiles(res.data);
  };

  const fetchStats = async () => {
    const res = await API.get("/stats");
    setStats(res.data);
  };

  const fetchDuplicates = async () => {
    const res = await API.get("/duplicates");
    setDuplicates(res.data);
  };

  const scanFiles = async () => {
    await API.post("/scan");
    fetchFiles();
    fetchStats();
  };

  useEffect(() => {
    fetchFiles();
    fetchStats();
    fetchDuplicates();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Organizer Engine Dashboard</h1>

      <button onClick={scanFiles}>Scan Files</button>

      <h2>Stats</h2>
      <pre>{JSON.stringify(stats, null, 2)}</pre>

      <h2>Files</h2>
      <ul>
        {files.map((f, i) => (
          <li key={i}>
            {f.name} — {f.category} — {f.size} bytes
          </li>
        ))}
      </ul>

      <h2>Duplicates</h2>
      <pre>{JSON.stringify(duplicates, null, 2)}</pre>
    </div>
  );
}

export default App;