import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

function NotePage() {
  const { api } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const handleSave = async () => {
    try {
      const payload = { title, content, collaborators: [] };
      await api.post("/note/", payload);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create note");
    }
  };

  return (
    <div className="p-4">
      <h1>{id === "new" ? "Add New Note" : "Edit Note"}</h1>
      {error && <p className="text-red-500">{error}</p>}

      <input
        type="text"
        placeholder="Note title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 w-full mb-4 rounded"
      />

      <ReactQuill
        value={content}
        onChange={setContent}
        theme="snow"
        className="mb-4"
      />

      <button
        onClick={handleSave}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Save Note
      </button>
    </div>
  );
}

export default NotePage;