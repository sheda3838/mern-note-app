import React from "react";
import NoteCard from "./NoteCard";

function NoteList({ notes, onDelete, currentUserId }) {
  if (!notes || notes.length === 0) {
    return <p>No notes found.</p>;
  }

  return (
    <div>
      {notes.map((note) => (
        <NoteCard
          key={note._id}
          note={note}
          onDelete={onDelete}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}

export default NoteList;
