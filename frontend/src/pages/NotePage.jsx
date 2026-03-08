import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

function NotePage() {
  const { api } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = id !== "new";
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [collaborators, setCollaborators] = useState([]);
  const [error, setError] = useState("");

  const [availableUsers, setAvailableUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get("/users");
        setAvailableUsers(data.users || []);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };
    fetchUsers();
  }, [api]);

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
    <div className="p-4" onClick={() => setShowDropdown(false)}>
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

      <div className="mb-4 relative" onClick={(e) => e.stopPropagation()}>
        <label className="block mb-2 font-medium">Collaborators</label>
        
        <div className="flex flex-wrap gap-2 mb-2">
          {collaborators.map(c => (
            <span key={c._id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center">
              {c.name}
              <button 
                type="button" 
                onClick={() => setCollaborators(collaborators.filter(collab => collab._id !== c._id))}
                className="ml-2 text-blue-600 hover:text-blue-900 focus:outline-none"
              >
                &times;
              </button>
            </span>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search and add collaborators..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          className="border p-2 w-full rounded"
        />

        {showDropdown && (
          <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 max-h-48 overflow-y-auto shadow-lg">
            {availableUsers
              .filter(u => 
                !collaborators.some(c => c._id === u._id) && 
                u.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map(u => (
                <li 
                  key={u._id} 
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setCollaborators([...collaborators, u]);
                    setSearchTerm("");
                    setShowDropdown(false);
                  }}
                >
                  {u.name} ({u.email})
                </li>
              ))}
            {availableUsers.filter(u => 
                !collaborators.some(c => c._id === u._id) && 
                u.name.toLowerCase().includes(searchTerm.toLowerCase())
              ).length === 0 && (
                <li className="px-4 py-2 text-gray-500">No users found.</li>
              )}
          </ul>
        )}
      </div>

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
