import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  createListing,
  getMyListings,
  getProfile,
  getProviderBookings,
  createQuote,
  completeBooking,
  getEscrowByBooking,
  logout,
  saveProfile,
  updateListing,
  uploadDocument,
} from "./api";

const initialListingForm = {
  title: "",
  category: "",
  description: "",
  priceRange: { min: 0, max: 0 },
  availability: "Available",
  location: "Remote",
  tags: "",
  isActive: true,
};

function FreelancerDashboard({ user, activeSection, onLogout }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({
    title: "",
    bio: "",
    location: "",
    availability: "Available",
    skills: "",
    hourlyRate: { min: 0, max: 0 },
    portfolio: "",
  });
  const [listings, setListings] = useState([]);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [quoteForm, setQuoteForm] = useState({ amount: "", message: "" });
  const [listingForm, setListingForm] = useState(initialListingForm);
  const [editingListingId, setEditingListingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [profileData, listingsData, bookingsData] = await Promise.all([
          getProfile().catch(() => null),
          getMyListings().catch(() => ({ listings: [] })),
          getProviderBookings().catch(() => []),
        ]);
        const pData = profileData?.profile || null;
        setProfile(pData);
        if (pData) {
          setProfileForm({
            title: pData.title || "",
            bio: pData.bio || "",
            location: pData.location || "",
            availability: pData.availability || "Available",
            skills: (pData.skills || []).join(", "),
            hourlyRate: pData.hourlyRate || { min: 0, max: 0 },
            portfolio: (pData.portfolio || []).join(", "),
          });
        }
        setListings(listingsData.listings || []);
        setBookingRequests(bookingsData || []);
      } catch (fetchError) {
        toast.error(fetchError.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (activeSection === "listings") {
      setActiveTab("listings");
    } else if (activeSection === "bookings") {
      setActiveTab("bookings");
    } else {
      setActiveTab("profile");
    }
  }, [activeSection]);

  const profileSave = async (event) => {
    event.preventDefault();

    try {
      const payload = {
        title: profileForm.title,
        bio: profileForm.bio,
        location: profileForm.location,
        availability: profileForm.availability,
        skills: profileForm.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
        hourlyRate: {
          min: Number(profileForm.hourlyRate.min),
          max: Number(profileForm.hourlyRate.max),
        },
        portfolio: profileForm.portfolio.split(",").map((item) => item.trim()).filter(Boolean),
      };

      const result = await saveProfile(payload);
      setProfile(result.profile);
      toast.success("Profile saved successfully.");
    } catch (saveError) {
      toast.error(saveError.message);
    }
  };

  const handleDocumentUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadingDocument(true);

    try {
      const result = await uploadDocument(file);
      setProfile(result.profile);
      toast.success("Document uploaded successfully.");
    } catch (uploadError) {
      toast.error(uploadError.message);
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    if (name === "min" || name === "max") {
      setProfileForm((prev) => ({
        ...prev,
        hourlyRate: { ...prev.hourlyRate, [name]: value },
      }));
      return;
    }

    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleListingChange = (event) => {
    const { name, value, checked } = event.target;
    if (name === "min" || name === "max") {
      setListingForm((prev) => ({
        ...prev,
        priceRange: { ...prev.priceRange, [name]: Number(value) },
      }));
      return;
    }

    if (name === "isActive") {
      setListingForm((prev) => ({ ...prev, isActive: checked }));
      return;
    }

    setListingForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditListing = (listing) => {
    setEditingListingId(listing._id);
    setListingForm({
      title: listing.title,
      category: listing.category,
      description: listing.description,
      priceRange: { min: listing.priceRange.min, max: listing.priceRange.max },
      availability: listing.availability,
      location: listing.location,
      tags: (listing.tags || []).join(", "),
      isActive: listing.isActive,
    });
    setActiveTab("listings");
  };

  const handleListingSubmit = async (event) => {
    event.preventDefault();

    try {
      const payload = {
        title: listingForm.title,
        category: listingForm.category,
        description: listingForm.description,
        priceRange: {
          min: Number(listingForm.priceRange.min),
          max: Number(listingForm.priceRange.max),
        },
        availability: listingForm.availability,
        location: listingForm.location,
        tags: listingForm.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        isActive: listingForm.isActive,
      };

      let result;
      if (editingListingId) {
        result = await updateListing(editingListingId, payload);
        setListings((prev) => prev.map((item) => (item._id === editingListingId ? result.listing : item)));
        toast.success("Listing updated successfully.");
      } else {
        result = await createListing(payload);
        setListings((prev) => [result.listing, ...prev]);
        toast.success("Listing created successfully.");
      }

      setListingForm(initialListingForm);
      setEditingListingId(null);
    } catch (listingError) {
      toast.error(listingError.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingListingId(null);
    setListingForm(initialListingForm);
  };

  const handleToggleListingActive = async (listing) => {
    try {
      const updated = await updateListing(listing._id, {
        isActive: !listing.isActive,
      });
      setListings((prev) =>
        prev.map((item) => (item._id === listing._id ? updated.listing : item))
      );
      toast.success(
        `Listing "${listing.title}" is now ${
          !listing.isActive ? "active and visible" : "paused and hidden"
        }.`
      );
    } catch (err) {
      toast.error(err.message || "Failed to update listing status.");
    }
  };

  const selectBooking = (booking) => {
    setSelectedBooking(booking);
    setQuoteForm({ amount: "", message: "" });
  };

  const loadBookings = async () => {
    setBookingLoading(true);
    try {
      const bookingData = await getProviderBookings();
      setBookingRequests(bookingData || []);
    } catch (bookingError) {
      toast.error(bookingError.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleQuoteChange = (event) => {
    const { name, value } = event.target;
    setQuoteForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitQuote = async (event) => {
    event.preventDefault();
    if (!selectedBooking) return;

    setQuoteSubmitting(true);

    try {
      await createQuote(selectedBooking._id, {
        amount: Number(quoteForm.amount),
        message: quoteForm.message,
      });
      toast.success("Quote submitted successfully.");
      const bookingData = await getProviderBookings();
      setBookingRequests(bookingData || []);
      setSelectedBooking(null);
      setQuoteForm({ amount: "", message: "" });
    } catch (quoteError) {
      toast.error(quoteError.message);
    } finally {
      setQuoteSubmitting(false);
    }
  };

  const approveComplete = async (bookingId) => {
    setBookingLoading(true);

    try {
      await completeBooking(bookingId);
      const bookingData = await getProviderBookings();
      setBookingRequests(bookingData || []);
      toast.success("Booking marked as completed. Escrow released to you.");
      setSelectedBooking(null);
    } catch (completeError) {
      toast.error(completeError.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      onLogout();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckEscrow = async (bookingId) => {
    try {
      const data = await getEscrowByBooking(bookingId);
      if (data.escrow) {
        toast.info(`Escrow: $${data.escrow.amount} (${data.escrow.status})`);
      } else {
        toast.info("No escrow found for this booking yet.");
      }
    } catch (escrowError) {
      toast.error(escrowError.message);
    }
  };

  const roleSummary = useMemo(() => {
    return profile ? "Your provider profile is ready." : "Create your provider profile first.";
  }, [profile]);

  const activeBookingsCount = useMemo(() => {
    return bookingRequests.filter((b) => ["confirmed", "quote_accepted"].includes(b.status)).length;
  }, [bookingRequests]);

  const servicesCount = useMemo(() => {
    return listings.length;
  }, [listings]);

  const totalEarnings = useMemo(() => {
    return bookingRequests
      .filter((b) => b.status === "completed")
      .reduce((sum, b) => sum + (b.budget || 0), 0);
  }, [bookingRequests]);

  const verificationStatus = profile?.verificationStatus || "unverified";

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-welcome">
          <h1>Welcome back, {user.name}!</h1>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap", margin: "0.3rem 0 0.5rem 0" }}>
            <p className="dashboard-role" style={{ margin: 0 }}><i className="fas fa-code"></i> Freelancer Dashboard</p>
            {verificationStatus === "verified" ? (
              <span className="badge badge-success"><i className="fas fa-check-circle"></i> Verified Provider</span>
            ) : verificationStatus === "pending" ? (
              <span className="badge badge-purple"><i className="fas fa-clock"></i> Verification Pending</span>
            ) : verificationStatus === "rejected" ? (
              <span className="badge badge-brand"><i className="fas fa-times-circle"></i> Verification Rejected</span>
            ) : (
              <span className="badge badge-warning"><i className="fas fa-exclamation-circle"></i> Profile Unverified</span>
            )}
          </div>
          <p className="dashboard-note">{roleSummary}</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </header>

      {/* Overview Statistics Grid */}
      <div className="dashboard-grid admin-grid" style={{ marginBottom: "2rem" }}>
        <div className="admin-card">
          <div className="admin-icon" style={{ background: "var(--accent-light)" }}>
            <i className="fas fa-briefcase" style={{ color: "#92400e" }}></i>
          </div>
          <h3>Active Bookings</h3>
          <p style={{ fontSize: "1.8rem", fontWeight: "700", color: "var(--ink)" }}>{activeBookingsCount}</p>
          <p style={{ color: "var(--ink-lighter)", fontSize: "0.85rem" }}>Currently active projects</p>
        </div>
        <div className="admin-card">
          <div className="admin-icon" style={{ background: "var(--purple-light)" }}>
            <i className="fas fa-bolt" style={{ color: "var(--purple)" }}></i>
          </div>
          <h3>Services Offered</h3>
          <p style={{ fontSize: "1.8rem", fontWeight: "700", color: "var(--ink)" }}>{servicesCount}</p>
          <p style={{ color: "var(--ink-lighter)", fontSize: "0.85rem" }}>Published service listings</p>
        </div>
        <div className="admin-card">
          <div className="admin-icon" style={{ background: "var(--brand-light)" }}>
            <i className="fas fa-dollar-sign" style={{ color: "var(--brand-deep)" }}></i>
          </div>
          <h3>Total Earnings</h3>
          <p style={{ fontSize: "1.8rem", fontWeight: "700", color: "var(--ink)" }}>${totalEarnings.toLocaleString()}</p>
          <p style={{ color: "var(--ink-lighter)", fontSize: "0.85rem" }}>From completed contracts</p>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          <i className="fas fa-user-edit"></i> Profile
        </button>
        <button
          className={`tab ${activeTab === "listings" ? "active" : ""}`}
          onClick={() => setActiveTab("listings")}
        >
          <i className="fas fa-list-alt"></i> Listings
        </button>
        <button
          className={`tab ${activeTab === "bookings" ? "active" : ""}`}
          onClick={() => setActiveTab("bookings")}
        >
          <i className="fas fa-calendar-alt"></i> Bookings
        </button>
      </div>



      {loading ? (
        activeTab === "profile" ? (
          <div className="profile-form card skeleton-card" style={{ gap: "1.5rem" }}>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <div className="skeleton skeleton-circle"></div>
              <div className="skeleton skeleton-text skeleton-title" style={{ margin: 0 }}></div>
            </div>
            <div>
              <div className="skeleton skeleton-text" style={{ width: "30%", height: "0.8rem", marginBottom: "0.5rem" }}></div>
              <div className="skeleton" style={{ height: "42px", borderRadius: "var(--radius-sm)" }}></div>
            </div>
            <div>
              <div className="skeleton skeleton-text" style={{ width: "20%", height: "0.8rem", marginBottom: "0.5rem" }}></div>
              <div className="skeleton" style={{ height: "100px", borderRadius: "var(--radius-sm)" }}></div>
            </div>
          </div>
        ) : activeTab === "listings" ? (
          <div className="dashboard-grid listings-grid" style={{ marginTop: "2rem" }}>
            {[...Array(2)].map((_, i) => (
              <div className="dashboard-card skeleton-card" key={i}>
                <div className="skeleton skeleton-text skeleton-title"></div>
                <div className="skeleton skeleton-text" style={{ width: "80%" }}></div>
                <div className="skeleton skeleton-text" style={{ width: "40%" }}></div>
                <div className="skeleton" style={{ height: "38px", marginTop: "1rem" }}></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="dashboard-grid booking-grid" style={{ marginTop: "2rem" }}>
            {[...Array(2)].map((_, i) => (
              <div className="dashboard-card skeleton-card" key={i}>
                <div className="skeleton skeleton-text skeleton-title" style={{ width: "70%" }}></div>
                <div className="skeleton skeleton-text" style={{ width: "50%" }}></div>
                <div className="skeleton skeleton-text" style={{ width: "90%" }}></div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === "profile" ? (
        <form className="profile-form card" onSubmit={profileSave}>
          <div className="card-header">
            <div className="icon-wrap purple"><i className="fas fa-user-cog"></i></div>
            <h2>Provider Profile</h2>
          </div>

          <label>
            Professional Title
            <input
              name="title"
              value={profileForm.title}
              onChange={handleProfileChange}
              required
              placeholder="e.g. Web Developer"
            />
          </label>
          <label>
            Bio
            <textarea
              name="bio"
              value={profileForm.bio}
              onChange={handleProfileChange}
              placeholder="Share your experience, skills, and services"
            />
          </label>
          <label>
            Location
            <input
              name="location"
              value={profileForm.location}
              onChange={handleProfileChange}
              placeholder="City, state or remote"
            />
          </label>
          <div className="grid-two">
            <label>
              Hourly Rate Min ($)
              <input
                type="number"
                min={0}
                name="min"
                value={profileForm.hourlyRate.min}
                onChange={handleProfileChange}
              />
            </label>
            <label>
              Hourly Rate Max ($)
              <input
                type="number"
                min={0}
                name="max"
                value={profileForm.hourlyRate.max}
                onChange={handleProfileChange}
              />
            </label>
          </div>
          <label>
            Availability
            <input
              name="availability"
              value={profileForm.availability}
              onChange={handleProfileChange}
              placeholder="Available / Busy / By appointment"
            />
          </label>
          <label>
            Skills (comma separated)
            <input
              name="skills"
              value={profileForm.skills}
              onChange={handleProfileChange}
              placeholder="e.g. React, UX design, consulting"
            />
          </label>
          <label>
            Portfolio links (comma separated)
            <input
              name="portfolio"
              value={profileForm.portfolio}
              onChange={handleProfileChange}
              placeholder="Link1, Link2, Link3"
            />
          </label>

          <div className="card document-upload-section">
            <div className="card-header">
              <div className="icon-wrap blue"><i className="fas fa-file-upload"></i></div>
              <h3>Verification Documents</h3>
            </div>
            <p className="text-sm text-muted">
              Upload documents to verify your identity and qualifications. Accepted formats: PDF, DOC, DOCX, JPG, PNG, TXT (max 5MB).
            </p>
            
            <label className="file-upload-label">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                onChange={handleDocumentUpload}
                disabled={uploadingDocument}
                style={{ display: "none" }}
              />
              <div className="file-upload-area">
                <i className="fas fa-cloud-upload-alt"></i>
                <span>{uploadingDocument ? "Uploading..." : "Choose file or drag here"}</span>
              </div>
            </label>

            {profile?.verificationDocs && profile.verificationDocs.length > 0 && (
              <div className="uploaded-documents">
                <h4>Uploaded Documents</h4>
                {profile.verificationDocs.map((doc, index) => (
                  <div key={index} className="document-item">
                    <i className="fas fa-file"></i>
                    <span>{doc.name}</span>
                    <span className={`status status-${doc.status}`}>
                      {doc.status}
                    </span>
                    <a href={`http://localhost:5000${doc.url}`} target="_blank" rel="noopener noreferrer">
                      <i className="fas fa-eye"></i> View
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="btn btn-primary btn-lg" type="submit" style={{ width: "100%" }}>
            <i className="fas fa-save"></i> Save Profile
          </button>
        </form>
      ) : activeTab === "listings" ? (
        <div>
          <form className="profile-form card" onSubmit={handleListingSubmit}>
            <div className="card-header">
              <div className="icon-wrap brand"><i className="fas fa-plus-circle"></i></div>
              <h2>{editingListingId ? "Edit Listing" : "Create New Listing"}</h2>
            </div>

            <label>
              Title
              <input
                name="title"
                value={listingForm.title}
                onChange={handleListingChange}
                required
                placeholder="Service title"
              />
            </label>
            <div className="grid-two">
              <label>
                Category
                <input
                  name="category"
                  value={listingForm.category}
                  onChange={handleListingChange}
                  required
                  placeholder="e.g. Design"
                />
              </label>
              <label>
                Location
                <input
                  name="location"
                  value={listingForm.location}
                  onChange={handleListingChange}
                  placeholder="Remote, City"
                />
              </label>
            </div>
            <label>
              Description
              <textarea
                name="description"
                value={listingForm.description}
                onChange={handleListingChange}
                required
                placeholder="Describe your service"
              />
            </label>
            <div className="grid-two">
              <label>
                Price Min ($)
                <input
                  type="number"
                  name="min"
                  value={listingForm.priceRange.min}
                  onChange={handleListingChange}
                  required
                  min={0}
                />
              </label>
              <label>
                Price Max ($)
                <input
                  type="number"
                  name="max"
                  value={listingForm.priceRange.max}
                  onChange={handleListingChange}
                  required
                  min={0}
                />
              </label>
            </div>
            <label>
              Availability
              <input
                name="availability"
                value={listingForm.availability}
                onChange={handleListingChange}
              />
            </label>
            <label>
              Tags (comma separated)
              <input
                name="tags"
                value={listingForm.tags}
                onChange={handleListingChange}
                placeholder="e.g. JavaScript, React"
              />
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isActive"
                checked={listingForm.isActive}
                onChange={handleListingChange}
              />
              Active listing
            </label>
            <div className="form-actions">
              <button className="btn btn-primary btn-lg" type="submit">
                {editingListingId ? <><i className="fas fa-pen"></i> Update Listing</> : <><i className="fas fa-plus"></i> Publish Listing</>}
              </button>
              {editingListingId ? (
                <button type="button" className="btn btn-outline" onClick={handleCancelEdit}>
                  <i className="fas fa-times"></i> Cancel
                </button>
              ) : null}
            </div>
          </form>

          <div className="dashboard-grid listing-grid">
            {listings.length ? (
              listings.map((listing) => (
                <div className="dashboard-card animate-in" key={listing._id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ margin: 0 }}><i className="fas fa-bolt" style={{ color: "var(--accent)" }}></i> {listing.title}</h3>
                    <span className={`badge ${listing.isActive ? "badge-success" : "badge-brand"}`}>
                      {listing.isActive ? "Active" : "Paused"}
                    </span>
                  </div>
                  <p className="listing-meta">
                    <i className="fas fa-folder"></i> {listing.category}
                    &nbsp;•&nbsp;
                    <i className="fas fa-map-marker-alt"></i> {listing.location}
                    &nbsp;•&nbsp;
                    <i className="fas fa-clock"></i> {listing.availability}
                  </p>
                  <p>{listing.description}</p>
                  <p className="listing-price">${listing.priceRange.min} - ${listing.priceRange.max}</p>
                  <div className="listing-tags">
                    {(listing.tags || []).map((tag, i) => (
                      <span key={i} className="tag-pill brand-tag">{tag}</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.5rem" }}>
                    <button className="btn btn-outline btn-sm" onClick={() => handleEditListing(listing)}>
                      <i className="fas fa-pen"></i> Edit
                    </button>
                    <button
                      className={`btn btn-sm ${listing.isActive ? "btn-danger" : "btn-primary"}`}
                      onClick={() => handleToggleListingActive(listing)}
                    >
                      <i className={listing.isActive ? "fas fa-pause" : "fas fa-play"}></i>
                      <span> {listing.isActive ? "Pause" : "Resume"}</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state card" style={{ gridColumn: "1 / -1" }}>
                <i className="fas fa-lightbulb"></i>
                <p>No listings found. Create your first service listing to get started.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="booking-actions">
            <button
              className="btn btn-outline btn-sm"
              type="button"
              onClick={loadBookings}
              disabled={bookingLoading}
            >
              {bookingLoading ? <><i className="fas fa-spinner fa-spin"></i> Refreshing…</> : <><i className="fas fa-sync-alt"></i> Refresh</>}
            </button>
          </div>

          <div className="dashboard-grid booking-grid">
            {bookingRequests.length ? (
              bookingRequests.map((booking) => (
                <div className="dashboard-card animate-in" key={booking._id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <h3><i className="fas fa-briefcase" style={{ color: "var(--brand)" }}></i> {booking.listing?.title || "Booking request"}</h3>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <span className={`badge badge-${booking.status === "completed" || booking.status === "confirmed" ? "success" : booking.status === "cancelled" ? "danger" : booking.status === "quote_accepted" ? "info" : "warning"}`}>
                        {booking.status}
                      </span>
                      {booking.escrow && (
                        <span className={`badge badge-${booking.escrow.status === "released" ? "success" : "purple"}`}>
                          <i className={`fas ${booking.escrow.status === "released" ? "fa-check-double" : "fa-shield-alt"}`}></i> Escrow: {booking.escrow.status}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="listing-meta">
                    <i className="fas fa-user"></i> {booking.client?.name || "Client"}
                  </p>
                  <p>{booking.description}</p>
                  <p className="listing-meta">
                    <i className="fas fa-calendar"></i> {booking.startDate ? new Date(booking.startDate).toLocaleDateString() : "Any"} — {booking.endDate ? new Date(booking.endDate).toLocaleDateString() : "Any"}
                  </p>
                  <p className="listing-price"><i className="fas fa-tag"></i> Budget: {booking.budget || "Not specified"}</p>
                  {booking.quotes && booking.quotes.length ? (
                    <div className="quote-summary">
                      <strong style={{ fontSize: "0.88rem", color: "var(--ink-soft)" }}>Quotes received:</strong>
                      <ul>
                        {booking.quotes.map((quote) => (
                          <li key={quote._id}>
                            <i className="fas fa-comment-dollar" style={{ color: "var(--accent)" }}></i>
                            <span><strong>${quote.amount}</strong> — <span className={`badge badge-${quote.status === "accepted" ? "success" : quote.status === "rejected" ? "danger" : "warning"}`}>{quote.status}</span></span>
                          </li>
))}
                      </ul>
                    </div>
                  ) : (
                    <p className="listing-meta"><i className="fas fa-info-circle"></i> No quotes submitted yet.</p>
                  )}
{booking.status === "quote_accepted" && (
                    <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem", flexWrap: "wrap" }}>
                      <button className="btn btn-primary btn-sm" type="button" onClick={() => approveComplete(booking._id)}>
                        <i className="fas fa-check-circle"></i> Mark Completed
                      </button>
<button className="btn btn-outline btn-sm" type="button" onClick={() => handleCheckEscrow(booking._id)}>
                        <i className="fas fa-shield-alt"></i> Check Escrow
                      </button>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                    <button className="btn btn-primary btn-sm" type="button" onClick={() => selectBooking(booking)}>
                      {selectedBooking && selectedBooking._id === booking._id ? <><i className="fas fa-pen"></i> Editing quote</> : <><i className="fas fa-comment-dollar"></i> Submit quote</>}
                    </button>
                    {selectedBooking && selectedBooking._id === booking._id && quoteForm.amount && (
                      <button className="btn btn-danger btn-sm" type="button" onClick={() => setSelectedBooking(null)}>
                        <i className="fas fa-times"></i> Close
                      </button>
                    )}
                  </div>
                  {selectedBooking && selectedBooking._id === booking._id && (
                    <form className="quote-form-panel" onSubmit={submitQuote} style={{ marginTop: "1rem", padding: "1.25rem" }}>
                      <h3 style={{ marginBottom: "1rem", fontSize: "1rem" }}><i className="fas fa-reply" style={{ color: "var(--brand)" }}></i> Submit Quote</h3>
                      <div className="grid-two">
                        <label>
                          Amount ($)
                          <input
                            type="number"
                            min={0}
                            name="amount"
                            value={quoteForm.amount}
                            onChange={handleQuoteChange}
                            required
                          />
                        </label>
                      </div>
                      <label>
                        Message to client
                        <textarea
                          name="message"
                          value={quoteForm.message}
                          onChange={handleQuoteChange}
                          placeholder="Describe your approach, timeline, or ask questions"
                        />
                      </label>
                      <div className="form-actions">
                        <button className="btn btn-primary btn-sm" type="submit" disabled={quoteSubmitting}>
                          {quoteSubmitting ? <><i className="fas fa-spinner fa-spin"></i> Submitting…</> : <><i className="fas fa-paper-plane"></i> Submit Quote</>}
                        </button>
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => setSelectedBooking(null)}>
                          <i className="fas fa-times"></i> Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ))
            ) : (
              <div className="empty-state card" style={{ gridColumn: "1 / -1" }}>
                <i className="fas fa-inbox"></i>
                <p>No booking requests found yet. Wait for clients to request your services.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FreelancerDashboard;