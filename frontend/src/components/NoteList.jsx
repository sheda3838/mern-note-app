import React from "react";
import NoteCard from "./NoteCard";

function NoteList({ notes, onDelete, onLeave, currentUserId }) {
  if (!notes || notes.length === 0) {
    return <p>No notes found.</p>;
  }

  return (
    <div className="flex flex-wrap gap-6 justify-center md:justify-start">
      {notes.map((note) => (
        <NoteCard
          key={note._id}
          note={note}
          onDelete={onDelete}
          onLeave={onLeave}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}

export default NoteList;
