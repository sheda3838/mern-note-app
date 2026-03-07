import React from "react";
import NoteCard from "./NoteCard";

function NoteList({ notes }) {
  if (!notes || notes.length === 0) {
    return <p>No notes found.</p>;
  }

  return (
    <div>
      NoteList
      {notes.map((note) => (
        <NoteCard key={note._id} note={note} />
      ))}
    </div>
  );
}

export default NoteList;
