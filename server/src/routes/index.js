import express from "express";
import authRoutes from "./authRoutes.js";
import profileRoutes from "./profileRoutes.js";
import listingRoutes from "./listingRoutes.js";
import bookingRoutes from "./bookingRoutes.js";
import escrowRoutes from "./escrowRoutes.js";
import adminRoutes from "./adminRoutes.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({ message: "API healthy" });
});

router.get("/public-stats", async (req, res, next) => {
  try {
    const [freelancersCount, clientsCount, completedProjectsCount] = await Promise.all([
      User.countDocuments({ role: "freelancer" }),
      User.countDocuments({ role: "client" }),
      Booking.countDocuments({ status: "completed" }),
    ]);

    const cancelledProjectsCount = await Booking.countDocuments({ status: "cancelled" });
    const totalFinished = completedProjectsCount + cancelledProjectsCount;
    const satisfactionRate = totalFinished > 0 
      ? Math.round((completedProjectsCount / totalFinished) * 100) 
      : 98;

    res.status(200).json({
      freelancers: freelancersCount,
      clients: clientsCount,
      completedProjects: completedProjectsCount,
      satisfactionRate: satisfactionRate,
    });
  } catch (error) {
    next(error);
  }
});

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/listings", listingRoutes);
router.use("/bookings", bookingRoutes);
router.use("/escrow", escrowRoutes);
router.use("/admin", adminRoutes);

export default router;
