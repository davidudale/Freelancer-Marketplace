import Booking from "../models/Booking.js";
import Quote from "../models/Quote.js";
import ServiceListing from "../models/ServiceListing.js";
import User from "../models/User.js";
import Profile from "../models/Profile.js";
import Escrow from "../models/Escrow.js";

const getAdminSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);

    const [
      totalUsers,
      newUsersThisMonth,
      activeListings,
      newListingsThisWeek,
      activeBookings,
      newBookingsThisMonth,
      acceptedQuotesThisMonth,
      recentUsers,
      recentBookings,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: monthStart } }),
      ServiceListing.countDocuments({ isActive: true }),
      ServiceListing.countDocuments({ createdAt: { $gte: weekStart } }),
      Booking.countDocuments({ status: { $nin: ["cancelled", "completed"] } }),
      Booking.countDocuments({ createdAt: { $gte: monthStart } }),
      Quote.find({ status: "accepted", createdAt: { $gte: monthStart } }).select("amount"),
      User.find().select("name email role createdAt").sort({ createdAt: -1 }).limit(5),
      Booking.find()
        .populate("client", "name")
        .populate("provider", "name")
        .populate("listing", "title")
        .select("client provider listing status budget createdAt")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const revenueMtd = acceptedQuotesThisMonth.reduce((total, quote) => total + (quote.amount || 0), 0);

    return res.status(200).json({
      stats: {
        totalUsers,
        newUsersThisMonth,
        activeListings,
        newListingsThisWeek,
        activeBookings,
        newBookingsThisMonth,
        revenueMtd,
      },
      recentUsers,
      recentBookings,
    });
  } catch (error) {
    next(error);
  }
};

const getAdminUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("name email role createdAt").sort({ createdAt: -1 });
    return res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await Promise.all([
      User.findByIdAndDelete(userId),
      Profile.findOneAndDelete({ user: userId }),
      ServiceListing.deleteMany({ provider: userId }),
      Booking.deleteMany({ $or: [{ client: userId }, { provider: userId }] }),
    ]);

    return res.status(200).json({ message: "User and all associated data deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const getAdminListings = async (req, res, next) => {
  try {
    const listings = await ServiceListing.find()
      .populate("provider", "name email")
      .sort({ createdAt: -1 });
    return res.status(200).json({ listings });
  } catch (error) {
    next(error);
  }
};

const toggleListingActive = async (req, res, next) => {
  try {
    const { listingId } = req.params;
    const listing = await ServiceListing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    listing.isActive = !listing.isActive;
    await listing.save();

    return res.status(200).json({ message: `Listing has been ${listing.isActive ? 'activated' : 'deactivated'}`, listing });
  } catch (error) {
    next(error);
  }
};

const getAdminBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate("client", "name email")
      .populate("provider", "name email")
      .populate("listing", "title")
      .sort({ createdAt: -1 });
    return res.status(200).json({ bookings });
  } catch (error) {
    next(error);
  }
};

const getAdminEscrows = async (req, res, next) => {
  try {
    const escrows = await Escrow.find()
      .populate("client", "name email")
      .populate("provider", "name email")
      .populate({
        path: "booking",
        populate: { path: "listing", select: "title" }
      })
      .sort({ createdAt: -1 });
    return res.status(200).json({ escrows });
  } catch (error) {
    next(error);
  }
};

const getPendingVerifications = async (req, res, next) => {
  try {
    const pendingProfiles = await Profile.find({
      $or: [
        { verificationStatus: "pending" },
        { "verificationDocs.status": "pending" }
      ]
    }).populate("user", "name email");

    return res.status(200).json({ profiles: pendingProfiles });
  } catch (error) {
    next(error);
  }
};

const verifyProfile = async (req, res, next) => {
  try {
    const { profileId } = req.params;
    const { status } = req.body; // "verified" or "rejected"

    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status parameter" });
    }

    const profile = await Profile.findById(profileId);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    profile.verificationStatus = status;
    profile.verificationDocs = profile.verificationDocs.map((doc) => {
      if (doc.status === "pending") {
        doc.status = status === "verified" ? "approved" : "rejected";
      }
      return doc;
    });

    await profile.save();

    return res.status(200).json({ message: `Profile has been successfully ${status === 'verified' ? 'verified' : 'rejected'}.`, profile });
  } catch (error) {
    next(error);
  }
};

export {
  getAdminSummary,
  getAdminUsers,
  deleteUser,
  getAdminListings,
  toggleListingActive,
  getAdminBookings,
  getAdminEscrows,
  getPendingVerifications,
  verifyProfile,
};
