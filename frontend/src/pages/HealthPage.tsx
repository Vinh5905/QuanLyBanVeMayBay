import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function HealthPage() {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    api.get("/health")
      .then(() => setStatus("ok"))
      .catch(() => setStatus("error"));
  }, []);

  return <div>API Status: {status}</div>;
}