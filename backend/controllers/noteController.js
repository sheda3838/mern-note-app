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

    return resp.status(201).json({ success: true, message: "Note created successfully", data: { note } });
  } catch (error) {
    console.log(error);
    resp.status(500).json({ success: false, message: "Server error" });
  }
};

//get all notes for th user
export const getNotes = async (req, resp) => {
  const userId = req.user.id;
  try {
    //notes owned by user OR where user is a collaborator
    const notes = await Note.find({
      $or: [{ owner: userId }, { collaborators: userId }],
    })
      .populate("owner", "name")
      .sort({ updatedAt: -1 }); // newest first

    if (notes.length === 0)
      return resp.status(200).json({ success: true, message: "No notes found", data: { notes: [] } });

    return resp.status(200).json({ success: true, message: "Notes fetched successfully", data: { notes } });
  } catch (error) {
    console.log(error);
    resp.status(500).json({ success: false, message: "Server error" });
  }
};

//get note by id
export const getNoteById = async (req, resp) => {
  const userId = req.user.id;
  const noteId = req.params.id;

  try {
    //checks user from JWT
    if (!userId || !noteId)
      return resp.status(400).json({ success: false, message: "Incomplete credentials" });

    //fetch note from db
    const note = await Note.findById(noteId)
      .populate("owner", "name email")
      .populate("collaborators", "name email");
    if (!note) return resp.status(404).json({ success: false, message: "Note not found" });

    //check permissions (user should be at least an owner or a collobarator)
    if (
      note.owner._id.toString() !== userId &&
      !note.collaborators.some((collab) => collab._id.toString() === userId)
    ) {
      return resp.status(403).json({ success: false, message: "Not authorized" });
    }

    resp.status(200).json({ success: true, message: "Note fetched successfully", data: { note } });
  } catch (error) {
    console.log(error);
    resp.status(500).json({ success: false, message: "Server error" });
  }
};

//update note
export const updateNote = async (req, resp) => {
  const userId = req.user.id;
  const noteId = req.params.id;
  const { title, content, collaborators } = req.body;

  try {
    const note = await Note.findById(noteId);
    if (!note) return resp.status(400).json({ success: false, message: "Note not found" });

    if (
      note.owner.toString() !== userId &&
      !note.collaborators.some((id) => id.toString() === userId)
    ) {
      return resp.status(403).json({ success: false, message: "Not authorized" });
    }

    if (title) note.title = title;
    if (content) note.content = content;
    if (collaborators !== undefined) note.collaborators = collaborators;

    await note.save();

    resp.status(200).json({ success: true, message: "Note updated successfully", data: { note } });
  } catch (error) {
    console.log(error);
    resp.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteNote = async (req, resp) => {
  const userId = req.user.id;
  const noteId = req.params.id;

  try {
    //find the note
    const note = await Note.findById(noteId);

    if (!note) {
      return resp.status(404).json({ success: false, message: "Note not found" });
    }

    //check if the logged-in user is the owner
    if (note.owner.toString() !== userId) {
      return resp
        .status(403)
        .json({ success: false, message: "Only the owner can delete this note" });
    }

    //delete the note
    await note.deleteOne();

    resp.status(200).json({ success: true, message: "Note deleted successfully", data: null });
  } catch (error) {
    console.log(error);
    resp.status(500).json({ success: false, message: "Server error" });
  }
};

//search notes using full text search
export const searchNotes = async (req, resp) => {
  const userId = req.user.id;
  const query = req.query.q;

  try {
    if (!query) {
      return resp.status(400).json({ success: false, message: "Search query is required" });
    }

    const notes = await Note.find({
      $and: [
        { $text: { $search: query } },
        { $or: [{ owner: userId }, { collaborators: userId }] },
      ],
    })
      .populate("owner", "name")
      .sort({ updatedAt: -1 });

    resp.status(200).json({ success: true, message: "Notes fetched successfully", data: { notes } });
  } catch (error) {
    console.log(error);
    resp.status(500).json({ success: false, message: "Server error" });
  }
};

// add collobarators for a note
export const addCollaborator = async (req, resp) => {
  const userId = req.user.id;
  const noteId = req.params.id;
  const { collaboratorIds } = req.body; // array

  try {
    const note = await Note.findById(noteId);
    if (!note) return resp.status(404).json({ success: false, message: "Note not found" });

    if (note.owner.toString() !== userId)
      return resp.status(403).json({ success: false, message: "Only the owner can add collaborators" });

    const added = [];
    for (let collabId of collaboratorIds) {
      if (
        collabId !== userId &&
        !note.collaborators.includes(collabId)
      ) {
        note.collaborators.push(collabId);
        added.push(collabId);
      }
    }

    await note.save();
    resp.status(200).json({ success: true, message: "Collaborators added", data: { added, note } });
  } catch (error) {
    console.log(error);
    resp.status(500).json({ success: false, message: "Server error" });
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
      return resp.status(404).json({ success: false, message: "Note not found" });
    }

    // Only owner can remove ANY collaborator, or a collaborator can remove THEMSELVES
    if (
      note.owner.toString() !== userId &&
      userId !== collaboratorId
    ) {
      return resp
        .status(403)
        .json({ success: false, message: "Not authorized to remove this collaborator" });
    }

    // Also ensuring they can't remove someone else if they aren't owner
    if (note.owner.toString() !== userId && userId !== collaboratorId) {
        return resp.status(403).json({ success: false, message: "You can only remove yourself."});
    }


    note.collaborators = note.collaborators.filter(
      (id) => id.toString() !== collaboratorId,
    );

    await note.save();

    resp.status(200).json({ success: true, message: "Collaborator removed", data: { note } });
  } catch (error) {
    console.log(error);
    resp.status(500).json({ success: false, message: "Server error" });
  }
};
