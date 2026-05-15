import mongoose from "mongoose";

const verificationDocSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    title: { type: String, trim: true, required: true },
    bio: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    skills: [{ type: String, trim: true }],
    hourlyRate: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
    },
    availability: { type: String, trim: true, default: "Available" },
    verificationDocs: [verificationDocSchema],
    verificationStatus: {
      type: String,
      enum: ["unverified", "pending", "verified", "rejected"],
      default: "unverified",
    },
    portfolio: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
  }
);

const Profile = mongoose.model("Profile", profileSchema);

export default Profile;
