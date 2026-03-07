import express from "express";
import {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  searchNotes,
  addCollaborator,
  removeCollaborator,
} from "../controllers/noteController.js";

const router = express.Router();

router.post("/", createNote);
router.get("/", getNotes);
router.patch("/:id", updateNote);
router.delete("/:id", deleteNote);
router.get("/search", searchNotes);
router.post("/:id/collaborators", addCollaborator);
router.delete("/:id/collaborators", removeCollaborator);
router.get("/:id", getNoteById);

export default router;
