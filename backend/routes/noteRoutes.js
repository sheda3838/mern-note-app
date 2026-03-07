import express from "express";
import { createNote, getNotes, getNoteById, updateNote, deleteNote} from "../controllers/noteController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createNote);
router.get("/", protect, getNotes);
router.get("/:id", protect, getNoteById);
router.patch("/:id", protect, updateNote);
router.delete("/:id", protect, deleteNote);

export default router;