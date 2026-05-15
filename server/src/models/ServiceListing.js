import mongoose from "mongoose";

const priceRangeSchema = new mongoose.Schema(
  {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
  },
  { _id: false }
);

const serviceListingSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    priceRange: { type: priceRangeSchema, required: true },
    availability: { type: String, trim: true, default: "Available" },
    location: { type: String, trim: true, default: "Remote" },
    tags: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const ServiceListing = mongoose.model("ServiceListing", serviceListingSchema);

export default ServiceListing;
