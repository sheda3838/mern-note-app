import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import NoteList from "../components/NoteList";
import { useNavigate } from "react-router-dom";

function DashboardPage() {
  const { api, user } = useAuth();

  const [myNotes, setMyNotes] = useState([]);
  const [sharedNotes, setSharedNotes] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const { data } = await api.get("/note/"); // fetch all notes
        const notes = data.notes || [];

        // split My Notes and Shared Notes
        const my = notes.filter((note) => note.owner.toString() === user._id);
        const shared = notes.filter(
          (note) =>
            note.owner.toString() !== user._id &&
            note.collaborators.includes(user._id),
        );

        setMyNotes(my);
        setSharedNotes(shared);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch notes");
      }
    };

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

  return (
    <div>
      <h1>Dashboard</h1>
      {error && <p>{error}</p>}

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        onClick={() => navigate("/note/new")}
      >
        + Add Note
      </button>

      <section>
        <h2>My Notes</h2>
        {myNotes.length !== 0 ? (
          <NoteList notes={myNotes} onDelete={handleDelete} currentUserId={user._id}  />
        ) : (
          <p>My notes are empty</p>
        )}
      </section>

      <section>
        <h2>Shared Notes</h2>
        {sharedNotes.length !== 0 ? (
          <NoteList notes={sharedNotes} onDelete={handleDelete} currentUserId={user._id}  />
        ) : (
          <p>Shared notes are empty</p>
        )}
      </section>
    </div>
  );
}

export default DashboardPage;
