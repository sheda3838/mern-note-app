import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import RichTextEditor from "../components/RichTextEditor";
import CollaboratorSelect from "../components/CollaboratorSelect";

function NotePage() {
  const { api, user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = id !== "new";
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [collaborators, setCollaborators] = useState([]);
  const [noteOwner, setNoteOwner] = useState(null);
  const [originalNote, setOriginalNote] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEditMode) {
      const fetchNote = async () => {
        try {
          const { data } = await api.get(`/note/${id}`);
          const fetchedNote = data.data.note;
          setTitle(fetchedNote.title);
          setContent(fetchedNote.content);
          
          const collabIds = fetchedNote.collaborators || [];
          setCollaborators(collabIds);
          setNoteOwner(fetchedNote.owner._id);
          
          setOriginalNote({
            title: fetchedNote.title,
            content: fetchedNote.content,
            collaborators: collabIds.map(c => c._id),
          });
        } catch (err) {
          setError(err.response?.data?.message || "Failed to fetch note");
        }
      };
      fetchNote();
    }
  }, [id, isEditMode, api]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const plainTextContent = content.replace(/<[^>]*>?/gm, "").trim();

    if (!title.trim() || !plainTextContent) {
      setError("Title or content cannot be empty.");
      return;
    }

    const collabIds = collaborators.map((c) => c._id);

    // Optimization: Check if nothing changed
    if (isEditMode && originalNote) {
      const isTitleSame = title === originalNote.title;
      const isContentSame = content === originalNote.content;
      const isCollabsSame =
        collabIds.length === originalNote.collaborators.length &&
        collabIds.every((id) => originalNote.collaborators.includes(id));

      if (isTitleSame && isContentSame && isCollabsSame) {
        // Nothing changed, return to dashboard immediately
        navigate("/dashboard");
        return;
      }
    }

    const payload = {
      title,
      content,
      collaborators: collabIds,
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

  const isOwner = !isEditMode || noteOwner === user?._id;

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

      {isOwner && (
        <CollaboratorSelect 
          api={api} 
          collaborators={collaborators} 
          setCollaborators={setCollaborators} 
        />
      )}

      {!isOwner && collaborators.length > 0 && (
        <div className="mb-4">
          <label className="block mb-2 font-medium">Collaborators</label>
          <div className="flex flex-wrap gap-2">
            {collaborators.map((c) => (
              <span key={c._id} className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                {c.name}
              </span>
            ))}
          </div>
        </div>
      )}

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
