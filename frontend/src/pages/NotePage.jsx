import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import RichTextEditor from "../components/RichTextEditor";
import CollaboratorSelect from "../components/CollaboratorSelect";

function NotePage() {
  const { api } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = id !== "new";
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [collaborators, setCollaborators] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEditMode) {
      const fetchNote = async () => {
        try {
          const { data } = await api.get(`/note/${id}`);
          setTitle(data.note.title);
          setContent(data.note.content);
          setCollaborators(data.note.collaborators || []);
        } catch (err) {
          setError(err.response?.data?.message || "Failed to fetch note");
        }
      };
      fetchNote();
    }
  }, [id, isEditMode, api]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title,
      content,
      collaborators: collaborators.map((c) => c._id),
    };

    try {
      if (isEditMode) {
        await api.patch(`/note/${id}`, payload);
      } else {
        await api.post("/note/", payload);
      }

      navigate("/dashboard"); // go back after success
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save note");
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

      <RichTextEditor value={content} onChange={setContent} />

      <CollaboratorSelect 
        api={api} 
        collaborators={collaborators} 
        setCollaborators={setCollaborators} 
      />

      <button
        onClick={handleSubmit}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Save Note
      </button>
    </div>
  );
}

export default NotePage;
