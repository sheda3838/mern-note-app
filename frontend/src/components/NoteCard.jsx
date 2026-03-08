import React from "react";
import { useNavigate } from "react-router-dom";

function NoteCard({ note, onDelete, currentUserId }) {
  const navigate = useNavigate();
  const isOwner = note.owner.toString() === currentUserId;

  // helper to strip HTML
  const stripHtml = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  // snippet from stripped content
  const textContent = stripHtml(note.content);
  const snippet =
    textContent.length > 50 ? textContent.slice(0, 50) + "..." : textContent;

  return (
    <div className="m-2 p-2 bg-green-100 w-80">
      <h1>{note.title}</h1>
      <p>{snippet}</p>
      <span>Collaborators: {note.collaborators?.length || 0}</span>
      <p>Last Update: {new Date(note.updatedAt).toLocaleString()}</p>
      <div>
        <span>
          <button
            className="bg-blue-500 text-white px-2 py-1 rounded"
            onClick={() => navigate(`/note/${note._id}`)}
          >
            Edit
          </button>
        </span>
        <span>
          {isOwner && (
            <button
              className="bg-red-500 text-white px-2 py-1 rounded"
              onClick={() => onDelete(note._id)}
            >
              Delete
            </button>
          )}
        </span>
      </div>
    </div>
  );
}

export default NoteCard;
