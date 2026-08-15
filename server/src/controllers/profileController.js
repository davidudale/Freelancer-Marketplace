import Profile from "../models/Profile.js";

const getMyProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id }).populate("user", "name email role");

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.status(200).json({ profile });
  } catch (error) {
    next(error);
  }
};

const createOrUpdateProfile = async (req, res, next) => {
  try {
    const profileData = {
      user: req.user._id,
      title: req.body.title,
      bio: req.body.bio,
      location: req.body.location,
      skills: req.body.skills || [],
      hourlyRate: {
        min: req.body.hourlyRate?.min || 0,
        max: req.body.hourlyRate?.max || 0,
      },
      availability: req.body.availability,
      verificationDocs: req.body.verificationDocs || [],
      portfolio: req.body.portfolio || [],
    };

    const profile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      profileData,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate("user", "name email role");

    return res.status(200).json({ profile });
  } catch (error) {
    next(error);
  }
};

const getProviderProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.params.providerId }).populate(
      "user",
      "name email role"
    );

    if (!profile) {
      return res.status(404).json({ message: "Provider profile not found" });
    }

    return res.status(200).json({ profile });
  } catch (error) {
    next(error);
  }
};

const uploadVerificationDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    let profile = await Profile.findOne({ user: req.user._id });

    // Create document entry
    const documentEntry = {
      name: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      status: "pending",
      uploadedAt: new Date(),
    };

    if (!profile) {
      // Auto-create profile stub so document upload succeeds before first profile save
      profile = new Profile({
        user: req.user._id,
        title: "Freelancer Profile",
        bio: "",
        location: "",
        skills: [],
        portfolio: [],
        verificationDocs: [documentEntry],
        verificationStatus: "pending",
      });
    } else {
      profile.verificationDocs.push(documentEntry);
      profile.verificationStatus = "pending";
    }

    await profile.save();

    // Populate user relation for consistency
    await profile.populate("user", "name email role");

    return res.status(200).json({
      message: "Document uploaded successfully",
      document: documentEntry,
      profile
    });
  } catch (error) {
    next(error);
  }
};

export { getMyProfile, createOrUpdateProfile, getProviderProfile, uploadVerificationDocument };
