import express from "express";
import {
  createBooking,
  getClientBookings,
  getProviderBookings,
  getBookingDetail,
  createQuote,
  acceptQuote,
  rejectQuote,
  completeBooking,
  cancelBooking,
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.post("/", createBooking);
router.get("/client", getClientBookings);
router.get("/provider", getProviderBookings);
router.get("/:id", getBookingDetail);
router.post("/:id/quotes", createQuote);
router.post("/:id/quotes/:quoteId/accept", acceptQuote);
router.post("/:id/quotes/:quoteId/reject", rejectQuote);
router.post("/:id/complete", completeBooking);
router.post("/:id/cancel", cancelBooking);

export default router;
