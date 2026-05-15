import ServiceListing from "../models/ServiceListing.js";

const createListing = async (req, res, next) => {
  try {
    const listing = await ServiceListing.create({
      provider: req.user._id,
      title: req.body.title,
      category: req.body.category,
      description: req.body.description,
      priceRange: {
        min: req.body.priceRange?.min || 0,
        max: req.body.priceRange?.max || 0,
      },
      availability: req.body.availability,
      location: req.body.location,
      tags: req.body.tags || [],
      isActive: req.body.isActive !== false,
    });

    return res.status(201).json({ listing });
  } catch (error) {
    next(error);
  }
};

const updateListing = async (req, res, next) => {
  try {
    const listing = await ServiceListing.findOne({
      _id: req.params.id,
      provider: req.user._id,
    });

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    listing.title = req.body.title ?? listing.title;
    listing.category = req.body.category ?? listing.category;
    listing.description = req.body.description ?? listing.description;
    listing.priceRange = {
      min: req.body.priceRange?.min ?? listing.priceRange.min,
      max: req.body.priceRange?.max ?? listing.priceRange.max,
    };
    listing.availability = req.body.availability ?? listing.availability;
    listing.location = req.body.location ?? listing.location;
    listing.tags = req.body.tags ?? listing.tags;
    listing.isActive = req.body.isActive ?? listing.isActive;

    await listing.save();

    return res.status(200).json({ listing });
  } catch (error) {
    next(error);
  }
};

const getMyListings = async (req, res, next) => {
  try {
    const listings = await ServiceListing.find({ provider: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ listings });
  } catch (error) {
    next(error);
  }
};

const getListingById = async (req, res, next) => {
  try {
    const listing = await ServiceListing.findById(req.params.id).populate("provider", "name email role");

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    return res.status(200).json({ listing });
  } catch (error) {
    next(error);
  }
};

const getListings = async (req, res, next) => {
  try {
    const query = { isActive: true };

    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.location) {
      query.location = { $regex: req.query.location, $options: "i" };
    }

    if (req.query.keyword) {
      query.$or = [
        { title: { $regex: req.query.keyword, $options: "i" } },
        { description: { $regex: req.query.keyword, $options: "i" } },
        { tags: { $regex: req.query.keyword, $options: "i" } },
      ];
    }

    const listings = await ServiceListing.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ listings });
  } catch (error) {
    next(error);
  }
};

export { createListing, updateListing, getMyListings, getListingById, getListings };
