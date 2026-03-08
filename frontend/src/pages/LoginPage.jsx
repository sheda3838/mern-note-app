import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const { login, api } = useAuth(); //get login function and axios instance
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data.data); // update context
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div>
      <h1>LoginPage</h1>
      <form onSubmit={handleSubmit}>
        {error && <p>{error}</p>}
        <input
          type="email"
          placeholder="Enter your email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default LoginPage;
