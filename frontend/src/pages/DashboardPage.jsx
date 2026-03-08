import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import NoteList from "../components/NoteList";
import { useNavigate } from "react-router-dom";

function DashboardPage() {
  const { api, user , logout} = useAuth();

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
      if (!searchQuery) return; // optional: ignore empty searches
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

  return (
    <div>
      <h1>Dashboard</h1>
      {error && <p>{error}</p>}
      <button onClick={logout} className="bg-red-300 p-2 m-2">Logout</button>

      <input
        type="text"
        placeholder="Search notes..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="border p-2 w-full mb-4 rounded"
      />
      <button
        className="bg-gray-500 text-white px-3 py-1 rounded ml-2"
        onClick={handleSearch}
      >
        Search
      </button>

      <button onClick={resetSearch}>Clear</button>

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        onClick={() => navigate("/note/new")}
      >
        + Add Note
      </button>

      <section>
        <h2>My Notes</h2>
        {myNotes.length !== 0 ? (
          <NoteList
            notes={myNotes}
            onDelete={handleDelete}
            currentUserId={user._id}
          />
        ) : (
          <p>My notes are empty</p>
        )}
      </section>

      <section>
        <h2>Shared Notes</h2>
        {sharedNotes.length !== 0 ? (
          <NoteList
            notes={sharedNotes}
            onDelete={handleDelete}
            onLeave={handleLeave}
            currentUserId={user._id}
          />
        ) : (
          <p>Shared notes are empty</p>
        )}
      </section>
    </div>
  );
}

export default DashboardPage;
