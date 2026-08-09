import express from "express";
import {
  getEscrowByBooking,
  fundEscrow,
  releaseEscrow,
  refundEscrow,
} from "../controllers/escrowController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/booking/:bookingId", getEscrowByBooking);
router.post("/booking/:bookingId/fund", fundEscrow);
router.post("/booking/:bookingId/release", releaseEscrow);
router.post("/booking/:bookingId/refund", refundEscrow);

export default router;
