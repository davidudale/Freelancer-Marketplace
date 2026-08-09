import Booking from "../models/Booking.js";
import ServiceListing from "../models/ServiceListing.js";
import Quote from "../models/Quote.js";
import Escrow from "../models/Escrow.js";

export const createBooking = async (req, res, next) => {
  try {
    const { listingId, description, startDate, endDate, budget } = req.body;
    if (req.user.role !== "client") {
      return res.status(403).json({ message: "Only clients can request bookings" });
    }

    const listing = await ServiceListing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const booking = await Booking.create({
      client: req.user._id,
      provider: listing.provider,
      listing: listing._id,
      description,
      startDate,
      endDate,
      budget,
      status: "requested",
    });

    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
};

export const getClientBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ client: req.user._id })
      .populate("listing")
      .populate("provider", "name email role")
      .populate("quotes");
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

export const getProviderBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ provider: req.user._id })
      .populate("listing")
      .populate("client", "name email role")
      .populate("quotes");
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

export const getBookingDetail = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("listing")
      .populate("client", "name email role")
      .populate("provider", "name email role")
      .populate("quotes");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (
      !booking.client.equals(req.user._id) &&
      !booking.provider.equals(req.user._id)
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(booking);
  } catch (error) {
    next(error);
  }
};

export const createQuote = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (!booking.provider.equals(req.user._id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (booking.status === "cancelled" || booking.status === "quote_accepted") {
      return res.status(400).json({ message: "Cannot submit a quote for this booking" });
    }

    const { amount, message } = req.body;
    const quote = await Quote.create({
      booking: booking._id,
      provider: req.user._id,
      amount,
      message,
    });

    booking.quotes.push(quote._id);
    booking.status = "quote_submitted";
    await booking.save();

    res.status(201).json(quote);
  } catch (error) {
    next(error);
  }
};

export const acceptQuote = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("quotes");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (!booking.client.equals(req.user._id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const quote = await Quote.findById(req.params.quoteId);
    if (!quote || !quote.booking.equals(booking._id)) {
      return res.status(404).json({ message: "Quote not found" });
    }

if (booking.status === "cancelled" || booking.status === "quote_accepted") {
      return res.status(400).json({ message: "Cannot accept this quote" });
    }

    await Quote.updateMany(
      { booking: booking._id },
      { $set: { status: "rejected" } }
    );

    quote.status = "accepted";
    await quote.save();

    booking.status = "quote_accepted";
    booking.acceptedQuote = quote._id;
    await booking.save();

    // Create an escrow record for the accepted quote amount
    const existingEscrow = await Escrow.findOne({ booking: booking._id });
    let escrow = null;
    if (!existingEscrow) {
      escrow = await Escrow.create({
        booking: booking._id,
        client: booking.client,
        provider: booking.provider,
        amount: quote.amount,
        status: "funded",
        description: `Escrow for accepted quote on booking ${booking._id}`,
      });
    } else {
      escrow = existingEscrow;
    }

    res.json({ booking, quote, escrow });
  } catch (error) {
    next(error);
  }
};

export const rejectQuote = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (!booking.client.equals(req.user._id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const quote = await Quote.findById(req.params.quoteId);
    if (!quote || !quote.booking.equals(booking._id)) {
      return res.status(404).json({ message: "Quote not found" });
    }

    if (booking.status === "cancelled" || booking.status === "quote_accepted") {
      return res.status(400).json({ message: "Cannot reject this quote" });
    }

    quote.status = "rejected";
    await quote.save();

    booking.status = "quote_rejected";
    await booking.save();

    res.json({ booking, quote });
  } catch (error) {
    next(error);
  }
};

export const completeBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (
      !booking.client.equals(req.user._id) &&
      !booking.provider.equals(req.user._id)
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

if (booking.status !== "quote_accepted") {
      return res.status(400).json({ message: "Booking must be accepted before completion" });
    }

    booking.status = "completed";
    await booking.save();

    // Release the escrow to the provider when the booking is completed
    const escrow = await Escrow.findOne({ booking: booking._id });
    if (escrow && escrow.status === "funded") {
      escrow.status = "released";
      await escrow.save();
    }

    res.json({ message: "Booking completed", booking, escrow });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (
      !booking.client.equals(req.user._id) &&
      !booking.provider.equals(req.user._id)
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

if (booking.status === "cancelled" || booking.status === "completed") {
      return res.status(400).json({ message: "Booking cannot be cancelled" });
    }

    booking.status = "cancelled";
    await booking.save();

    res.json({ message: "Booking cancelled", booking });
  } catch (error) {
    next(error);
  }
};
