import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate, useParams } from "react-router-dom";
import RichTextEditor from "../components/RichTextEditor";
import CollaboratorSelect from "../components/CollaboratorSelect";

function NotePage() {
  const { api, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
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

    //check if nothing changed
    if (isEditMode && originalNote) {
      const isTitleSame = title === originalNote.title;
      const isContentSame = content === originalNote.content;
      const isCollabsSame =
        collabIds.length === originalNote.collaborators.length &&
        collabIds.every((id) => originalNote.collaborators.includes(id));

      if (isTitleSame && isContentSame && isCollabsSame) {
        // if nothing changed return to dashboard
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      {/* sticky header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm sticky top-0 z-20 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              title="Back to Dashboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
            </button>
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {id === "new" ? "Create Note" : "Edit Note"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Toggle Dark Mode"
            >
              {theme === "dark" ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                </svg>
              )}
            </button>
            <button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-5 rounded-full transition-colors shadow-sm ring-1 ring-inset ring-blue-700/10 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              Save
            </button>
          </div>
        </div>
      </header>

      {/* main reading container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {error && (
          <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 rounded-2xl p-6 sm:p-10 transition-colors">
          {/* headless title input */}
          <input
            type="text"
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white bg-transparent border-none outline-none focus:ring-0 placeholder-gray-400 dark:placeholder-gray-500 mb-8 p-0"
          />

          <RichTextEditor value={content} onChange={setContent} placeholder="Write your thoughts here..." />

          {/* collaborator section */}
          <div className="mt-8 border-t border-gray-100 dark:border-gray-700 pt-8">
            {isOwner ? (
              <CollaboratorSelect 
                api={api} 
                collaborators={collaborators} 
                setCollaborators={setCollaborators} 
              />
            ) : (
              collaborators.length > 0 && (
                <div className="mb-4">
                  <label className="block mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Collaborators
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {collaborators.map((c) => (
                      <span key={c._id} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600">
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default NotePage;
