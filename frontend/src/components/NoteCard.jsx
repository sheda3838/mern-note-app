import React from "react";
import { useNavigate } from "react-router-dom";

function NoteCard({ note, onDelete, onLeave, currentUserId }) {
  const navigate = useNavigate();
  const isOwner = note.owner._id === currentUserId;

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
    <div className="flex flex-col justify-between m-2 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 w-80 min-h-[220px] transition-all hover:shadow-md">
      <div>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-2 line-clamp-1">
          {note.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
          {snippet}
        </p>
      </div>
      
      <div className="mt-auto">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
            {note.collaborators?.length || 0}
          </span>
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            {new Date(note.updatedAt).toLocaleDateString()}
          </span>
        </div>

        {!isOwner && (
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 bg-gray-100 dark:bg-gray-700 p-2 rounded-md">
            Owner: <span className="font-bold">{note.owner?.name}</span>
          </p>
        )}

        <div className="flex items-center gap-2">
          <button
            className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 dark:text-blue-300 font-semibold py-1.5 px-3 rounded-lg transition-colors text-sm"
            onClick={() => navigate(`/note/${note._id}`)}
          >
            Edit
          </button>
          
          {isOwner ? (
            <button
              className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/40 dark:hover:bg-red-900/60 dark:text-red-300 font-semibold py-1.5 px-3 rounded-lg transition-colors text-sm"
              onClick={() => onDelete(note._id)}
            >
              Delete
            </button>
          ) : (
            <button
              className="flex-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 dark:bg-yellow-900/40 dark:hover:bg-yellow-900/60 dark:text-yellow-300 font-semibold py-1.5 px-3 rounded-lg transition-colors text-sm"
              onClick={() => onLeave && onLeave(note._id)}
            >
              Leave
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default NoteCard;
