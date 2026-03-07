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
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createNote);
router.get("/", protect, getNotes);
router.patch("/:id", protect, updateNote);
router.delete("/:id", protect, deleteNote);
router.get("/search", protect, searchNotes);
router.post("/:id/collaborators", protect, addCollaborator);
router.delete("/:id/collaborators", protect, removeCollaborator);
router.get("/:id", protect, getNoteById);

export default router;
