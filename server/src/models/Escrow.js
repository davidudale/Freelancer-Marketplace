import mongoose from "mongoose";

const escrowSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
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
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["funded", "released", "refunded"],
      default: "funded",
    },
    description: { type: String, trim: true, default: "" },
  },
  {
    timestamps: true,
  }
);

const Escrow = mongoose.model("Escrow", escrowSchema);

export default Escrow;
