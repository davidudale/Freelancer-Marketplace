import express from "express";
import { getAdminSummary } from "../controllers/adminController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, requireRole("admin"));
router.get("/summary", getAdminSummary);

export default router;
