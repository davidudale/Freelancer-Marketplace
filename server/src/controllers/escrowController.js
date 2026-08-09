import Booking from "../models/Booking.js";
import Quote from "../models/Quote.js";
import Escrow from "../models/Escrow.js";

export const getEscrowByBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (
      !booking.client.equals(req.user._id) &&
      !booking.provider.equals(req.user._id) &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const escrow = await Escrow.findOne({ booking: booking._id });
    res.json({ escrow });
  } catch (error) {
    next(error);
  }
};

export const fundEscrow = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (!booking.client.equals(req.user._id)) {
      return res.status(403).json({ message: "Unauthorized: only the client can fund escrow" });
    }

    if (booking.status !== "quote_accepted") {
      return res.status(400).json({ message: "Escrow can only be funded after a quote is accepted" });
    }

    const existing = await Escrow.findOne({ booking: booking._id });
    if (existing) {
      return res.status(400).json({ message: "Escrow already exists for this booking" });
    }

    let amount = Number(req.body.amount);
    if (!amount || amount <= 0) {
      // Fall back to the accepted quote amount
      if (booking.acceptedQuote) {
        const quote = await Quote.findById(booking.acceptedQuote);
        amount = quote ? quote.amount : 0;
      }
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "A valid escrow amount is required" });
    }

    const escrow = await Escrow.create({
      booking: booking._id,
      client: booking.client,
      provider: booking.provider,
      amount,
      status: "funded",
      description: req.body.description || "",
    });

    res.status(201).json({ escrow });
  } catch (error) {
    next(error);
  }
};

export const releaseEscrow = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (!booking.client.equals(req.user._id)) {
      return res.status(403).json({ message: "Unauthorized: only the client can release escrow" });
    }

    const escrow = await Escrow.findOne({ booking: booking._id });
    if (!escrow) {
      return res.status(404).json({ message: "No escrow found for this booking" });
    }

    if (escrow.status !== "funded") {
      return res.status(400).json({ message: `Escrow cannot be released from status: ${escrow.status}` });
    }

    escrow.status = "released";
    await escrow.save();

    res.json({ escrow });
  } catch (error) {
    next(error);
  }
};

export const refundEscrow = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (!booking.client.equals(req.user._id)) {
      return res.status(403).json({ message: "Unauthorized: only the client can refund escrow" });
    }

    const escrow = await Escrow.findOne({ booking: booking._id });
    if (!escrow) {
      return res.status(404).json({ message: "No escrow found for this booking" });
    }

    if (escrow.status !== "funded") {
      return res.status(400).json({ message: `Escrow cannot be refunded from status: ${escrow.status}` });
    }

    escrow.status = "refunded";
    await escrow.save();

    res.json({ escrow });
  } catch (error) {
    next(error);
  }
};
