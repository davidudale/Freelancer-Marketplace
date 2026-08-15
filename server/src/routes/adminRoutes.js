import express from "express";
import {
  getAdminSummary,
  getAdminUsers,
  deleteUser,
  getAdminListings,
  toggleListingActive,
  getAdminBookings,
  getAdminEscrows,
  getPendingVerifications,
  verifyProfile,
} from "../controllers/adminController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, requireRole("admin"));
router.get("/summary", getAdminSummary);
router.get("/users", getAdminUsers);
router.delete("/users/:userId", deleteUser);
router.get("/listings", getAdminListings);
router.put("/listings/:listingId/toggle", toggleListingActive);
router.get("/bookings", getAdminBookings);
router.get("/escrows", getAdminEscrows);
router.get("/verifications", getPendingVerifications);
router.put("/verify/:profileId", verifyProfile);

export default router;
