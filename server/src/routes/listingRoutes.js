import express from "express";
import {
  createListing,
  updateListing,
  getMyListings,
  getListingById,
  getListings,
} from "../controllers/listingController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, requireRole("freelancer"), createListing);
router.put("/:id", protect, requireRole("freelancer"), updateListing);
router.get("/mine", protect, requireRole("freelancer"), getMyListings);
router.get("/", getListings);
router.get("/:id", getListingById);

export default router;
