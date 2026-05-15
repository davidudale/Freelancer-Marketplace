import express from "express";
import { getMyProfile, createOrUpdateProfile, getProviderProfile, uploadVerificationDocument } from "../controllers/profileController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/me", protect, getMyProfile);
router.post("/", protect, requireRole("freelancer"), createOrUpdateProfile);
router.post("/upload-document", protect, requireRole("freelancer"), upload.single("document"), uploadVerificationDocument);
router.get("/provider/:providerId", getProviderProfile);

export default router;
