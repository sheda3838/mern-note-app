import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

function RegisterPage() {
  const { api, login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await api.post("/auth/register", {
        name,
        email,
        password,
      });
      if (!data) return console.log("An error occured please try again later");
      login(data.data); //login immediately
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div>
      <h1>Register Page</h1>
      <form onSubmit={handleSubmit}>
        {error && <p>{error}</p>}

        <input
          type="text"
          value={name}
          placeholder="Enter your name"
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          value={email}
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          value={password}
          placeholder="Enter your password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default RegisterPage;
