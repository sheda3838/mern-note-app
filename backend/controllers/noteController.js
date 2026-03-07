import Note from "../models/Note.js";

//create a new note
export const createNote = async (req, resp) => {
  const { title, content, collaborators } = req.body;
  const owner = req.user.id;
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

//get all notes for th user
export const getNotes = async (req, resp) => {
  const userId = req.user.id;
  try {
    //notes owned by user OR where user is a collaborator
    const notes = await Note.find({
      $or: [{ owner: userId }, { collaborators: userId }],
    }).sort({ updatedAt: -1 }); // newest first

    if (notes.length === 0)
      return resp.status(200).json({ message: "No notes found" });

    return resp.status(200).json({ notes });
  } catch (error) {
    console.log(error);
    resp.status(500).json({ message: "Server error" });
  }
};

//get note by id
export const getNoteById = async (req, resp) => {
  const userId = req.user.id;
  const noteId = req.params.id;

  try {
    //checks user from JWT
    if (!userId || !noteId)
      return resp.status(400).json({ message: "Incomplete credentials" });

    //fetch note from db
    const note = await Note.findById(noteId);
    if (!note) return resp.status(404).json({ message: "Note not found" });

    //check permissions (user should be at least an owner or a collobarator)
    if (
      note.owner.toString() !== userId &&
      !note.collaborators.includes(userId)
    ) {
      return resp.status(403).json({ message: "Not authorized" });
    }

    resp.status(200).json({ note });
  } catch (error) {
    console.log(error);
    resp.status(500).json({ message: "Server error" });
  }
};

//update note
export const updateNote = async (req, resp) => {
  const userId = req.user.id;
  const noteId = req.params.id;
  const { title, content } = req.body;

  try {
    const note = await Note.findById(noteId);
    if (!note) return resp.status(400).json({ message: "Note not found" });

    if (
      note.owner.toString() !== userId &&
      !note.collaborators.includes(userId)
    ) {
      return resp.status(403).json({ message: "Not authorized" });
    }

    if (title) note.title = title;
    if (content) note.content = content;

    await note.save();

    resp.status(200).json({ note });
  } catch (error) {
    console.log(error);
    resp.status(500).json({ message: "Server error" });
  }
};

export const deleteNote = async (req, resp) => {
  const userId = req.user.id;
  const noteId = req.params.id;

  try {
    //find the note
    const note = await Note.findById(noteId);

    if (!note) {
      return resp.status(404).json({ message: "Note not found" });
    }

    //check if the logged-in user is the owner
    if (note.owner.toString() !== userId) {
      return resp
        .status(403)
        .json({ message: "Only the owner can delete this note" });
    }

    //delete the note
    await note.deleteOne();

    resp.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    console.log(error);
    resp.status(500).json({ message: "Server error" });
  }
};

//search notes using full text search
export const searchNotes = async (req, resp) => {
  const userId = req.user.id;
  const query = req.query.q;

  try {
    if (!query) {
      return resp.status(400).json({ message: "Search query is required" });
    }

    const notes = await Note.find({
      $and: [
        { $text: {$search: query}},
        { $or: [{owner: userId}, {collaborators: userId}] },
      ],
    }).sort({updatedAt: -1});

    resp.status(200).json({notes});
  } catch (error) {
    console.log(error);
    resp.status(500).json({message: "Server error"});
  }
};


//add collobarator for an exisitng note
export const addCollaborator = async (req, resp) => {
  const userId = req.user.id;
  const noteId = req.params.id;
  const { collaboratorId } = req.body;

  try {
    const note = await Note.findById(noteId);

    if (!note) {
      return resp.status(404).json({message: "Note not found"});
    }

    //only owner can add collaborators
    if (note.owner.toString() !== userId) {
      return resp.status(403).json({message: "Only the owner can add collaborators"});
    }

    //avoid duplicates
    if (note.collaborators.includes(collaboratorId)) {
      return resp.status(400).json({message: "User already a collaborator"});
    }

    note.collaborators.push(collaboratorId);

    await note.save();

    resp.status(200).json({message: "Collaborator added", note});

  } catch (error) {
    console.log(error);
    resp.status(500).json({message: "Server error"});
  }
};

//remove collobarator
export const removeCollaborator = async (req, resp) => {
  const userId = req.user.id;
  const noteId = req.params.id;
  const { collaboratorId } = req.body;

  try {
    const note = await Note.findById(noteId);

    if (!note) {
      return resp.status(404).json({message: "Note not found"});
    }

    //only owner can remove collaborators
    if (note.owner.toString() !== userId) {
      return resp.status(403).json({message: "Only the owner can remove collaborators"});
    }

    note.collaborators = note.collaborators.filter(
      (id) => id.toString() !== collaboratorId
    );

    await note.save();

    resp.status(200).json({message: "Collaborator removed", note});

  } catch (error) {
    console.log(error);
    resp.status(500).json({message: "Server error"});
  }
};