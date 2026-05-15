import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceListing",
      required: true,
    },
    description: { type: String, trim: true },
    startDate: { type: Date },
    endDate: { type: Date },
    budget: { type: Number },
    status: {
      type: String,
      enum: ["requested", "quote_submitted", "quote_accepted", "quote_rejected", "cancelled", "completed"],
      default: "requested",
    },
    acceptedQuote: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quote",
    },
    quotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quote",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
