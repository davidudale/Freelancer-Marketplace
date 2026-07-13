import Booking from "../models/Booking.js";
import Quote from "../models/Quote.js";
import ServiceListing from "../models/ServiceListing.js";
import User from "../models/User.js";

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

export { getAdminSummary };
