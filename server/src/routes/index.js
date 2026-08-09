import express from "express";
import authRoutes from "./authRoutes.js";
import profileRoutes from "./profileRoutes.js";
import listingRoutes from "./listingRoutes.js";
import bookingRoutes from "./bookingRoutes.js";
import escrowRoutes from "./escrowRoutes.js";
import adminRoutes from "./adminRoutes.js";

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({ message: "API healthy" });
});

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/listings", listingRoutes);
router.use("/bookings", bookingRoutes);
router.use("/escrow", escrowRoutes);
router.use("/admin", adminRoutes);

export default router;
