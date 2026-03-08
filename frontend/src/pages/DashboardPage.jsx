import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import NoteList from "../components/NoteList";
import { useNavigate } from "react-router-dom";

function DashboardPage() {
  const { api, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [myNotes, setMyNotes] = useState([]);
  const [sharedNotes, setSharedNotes] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");

  const fetchNotes = async () => {
    try {
      const { data } = await api.get("/note/"); // fetch all notes
      const notes = data.data.notes || [];

      // split My Notes and Shared Notes
      const my = notes.filter((note) => note.owner._id.toString() === user._id);
      const shared = notes.filter(
        (note) =>
          note.owner._id.toString() !== user._id &&
          note.collaborators.includes(user._id),
      );

      setMyNotes(my);
      setSharedNotes(shared);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch notes");
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [api, user]);

  const handleDelete = async (noteId) => {
    try {
      //remove from frontend first
      setMyNotes(myNotes.filter((n) => n._id !== noteId));

      //call backend to delete
      await api.delete(`/note/${noteId}`);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to delete note");
    }
  };

  const handleLeave = async (noteId) => {
    try {
      //remove from frontend first
      setSharedNotes(sharedNotes.filter((n) => n._id !== noteId));

      //call backend to remove oneself as collaborator
      await api.delete(`/note/${noteId}/collaborators`, {
        data: { collaboratorId: user._id },
      });
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to leave note");
      // Optionally fetch notes again if it fails to revert optimistic update
      fetchNotes();
    }
  };

  const handleSearch = async () => {
    try {
      if (!searchQuery) return; //ignore empty searches
      const { data } = await api.get(
        `/note/search?q=${encodeURIComponent(searchQuery)}`,
      );
      const notes = data.data.notes || [];

      // Split into My Notes and Shared Notes like before
      const my = notes.filter((note) => note.owner._id.toString() === user._id);
      const shared = notes.filter(
        (note) =>
          note.owner._id.toString() !== user._id &&
          note.collaborators.includes(user._id),
      );

      setMyNotes(my);
      setSharedNotes(shared);
    } catch (err) {
      setError(err.response?.data?.message || "Search failed");
    }
  };

  const resetSearch = async () => {
    setSearchQuery("");
    fetchNotes(); // fetch all notes again
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
      
      {/* header and navbar */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">NoteApp</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300 hidden sm:block">Hello, {user?.name || "User"}</span>
            
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
              onClick={logout} 
              className="text-sm bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 font-medium py-1.5 px-4 rounded-full transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* error banner */}
        {error && (
          <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/*search and add note */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-10">
          
          <div className="relative w-full max-w-lg group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-full leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all sm:text-sm shadow-sm"
            />
            {searchQuery && (
              <button 
                onClick={resetSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                title="Clear Search"
              >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <button
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-full transition-colors shadow-sm ring-1 ring-inset ring-blue-700/10"
            onClick={() => navigate("/note/new")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Note
          </button>
        </div>

        {/* my notes section */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-gray-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
            </svg>
            <h2 className="text-2xl font-bold font-sans text-gray-800 dark:text-gray-100">My Notes</h2>
          </div>
          
          {myNotes.length !== 0 ? (
            <NoteList
              notes={myNotes}
              onDelete={handleDelete}
              currentUserId={user._id}
            />
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="mx-auto size-12 text-gray-400 mb-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No notes yet</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating your first note.</p>
              <button 
                onClick={() => navigate("/note/new")}
                className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                + Create new note
              </button>
            </div>
          )}
        </section>

        {/* shared notes section */}
        <section>
          <div className="flex items-center gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-gray-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
            </svg>
            <h2 className="text-2xl font-bold font-sans text-gray-800 dark:text-gray-100">Shared Notes</h2>
          </div>
          
          {sharedNotes.length !== 0 ? (
            <NoteList
              notes={sharedNotes}
              onDelete={handleDelete}
              onLeave={handleLeave}
              currentUserId={user._id}
            />
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-800">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="mx-auto size-12 text-gray-400 mb-3">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
               </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No shared notes</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Notes that other users collaborate with you on will appear here.</p>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

export default DashboardPage;
