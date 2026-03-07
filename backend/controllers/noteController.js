import Note from "../models/Note.js";

export const createNote = async (req, resp) => {
  const { title, content, collaborators } = req.body;
  const owner = req.user.id;

  //checks user from JWT
  if (!owner) return resp.status(400).json({ message: "Owner not found" });

  try {
    //create a new note in db
    const note = await Note.create({
      title,
      content,
      collaborators: collaborators || [],
      owner,
    });

    return resp.status(201).json(note.toObject());
  } catch (error) {
    console.log(error);
    resp.status(500).json({ message: "Server error" });
  }
};
