import React from "react";

function NoteCard({ note }) {
  //snippet of content by truncating
  const snippet =
    note.content.length > 50 ? note.content.slice(0, 50) + "..." : note.content;

  return (
    <div className="m-2 p-2 bg-green-100 w-80">
      <h1>{note.title}</h1>
      <p>{snippet}</p>
      <span>Collaborators: {note.collaborators?.length || 0}</span>
      <p>Last Update: {note.updatedAt}</p>
    </div>
  );
}

export default NoteCard;
