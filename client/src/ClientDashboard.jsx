import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { logout, searchListings, createBooking, getClientBookings, acceptQuote, rejectQuote, completeBooking, fundEscrow, releaseEscrow, getEscrowByBooking, getProviderProfile } from "./api";

function ClientDashboard({ user, activeSection, onLogout }) {
  const [searchValues, setSearchValues] = useState({ category: "", keyword: "", location: "" });
  const [results, setResults] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [bookingForm, setBookingForm] = useState({ description: "", startDate: "", endDate: "", budget: "" });
  const [bookings, setBookings] = useState([]);
  const [showBookings, setShowBookings] = useState(false);
  const [searching, setSearching] = useState(false);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [viewingProfile, setViewingProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const handleViewProfile = async (providerId) => {
    if (!providerId) return;
    setLoadingProfile(true);
    try {
      const data = await getProviderProfile(providerId);
      setViewingProfile(data.profile);
    } catch (err) {
      toast.error(err.message || "Failed to load provider profile");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleClearFilters = async () => {
    setSearchValues({ category: "", keyword: "", location: "" });
    setSearching(true);
    try {
      const data = await searchListings({ category: "", keyword: "", location: "" });
      setResults(data.listings || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSearching(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      onLogout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleBookingFormChange = (event) => {
    const { name, value } = event.target;
    setBookingForm((prev) => ({ ...prev, [name]: value }));
  };

  const selectListingForBooking = (listing) => {
    setSelectedListing(listing);
    setBookingForm({ description: "", startDate: "", endDate: "", budget: "" });
    setShowBookings(false);
  };

  const handleRequestBooking = async (event) => {
    event.preventDefault();
    if (!selectedListing) return;

    setBookingSubmitting(true);

    try {
      await createBooking({
        listingId: selectedListing._id,
        description: bookingForm.description,
        startDate: bookingForm.startDate,
        endDate: bookingForm.endDate,
        budget: Number(bookingForm.budget),
      });
      toast.success("Booking request sent. Providers can now respond with a quote.");
      setSelectedListing(null);
      setBookingForm({ description: "", startDate: "", endDate: "", budget: "" });
    } catch (bookingError) {
      toast.error(bookingError.message);
    } finally {
      setBookingSubmitting(false);
    }
  };

const loadBookings = async () => {
    setLoadingBookings(true);
    try {
      const data = await getClientBookings();
      setBookings(data);
      setShowBookings(true);
    } catch (bookingsError) {
      toast.error(bookingsError.message);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleAcceptQuote = async (bookingId, quoteId) => {
    setLoadingBookings(true);
    try {
      await acceptQuote(bookingId, quoteId);
      const data = await getClientBookings();
      setBookings(data);
      toast.success("Quote accepted. Booking confirmed.");
    } catch (acceptError) {
      toast.error(acceptError.message);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleRejectQuote = async (bookingId, quoteId) => {
    setLoadingBookings(true);
    try {
      await rejectQuote(bookingId, quoteId);
      const data = await getClientBookings();
      setBookings(data);
      toast.success("Quote rejected.");
    } catch (rejectError) {
      toast.error(rejectError.message);
    } finally {
      setLoadingBookings(false);
    }
  };

const handleCompleteBooking = async (bookingId) => {
    setLoadingBookings(true);
    try {
      await completeBooking(bookingId);
      const data = await getClientBookings();
      setBookings(data);
      toast.success("Booking marked as completed. Escrow released to provider.");
    } catch (completeError) {
      toast.error(completeError.message);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleFundEscrow = async (bookingId) => {
    setLoadingBookings(true);
    try {
      await fundEscrow(bookingId);
      const data = await getClientBookings();
      setBookings(data);
      toast.success("Escrow funded. Payment is now held securely.");
    } catch (fundError) {
      toast.error(fundError.message);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleReleaseEscrow = async (bookingId) => {
    setLoadingBookings(true);
    try {
      await releaseEscrow(bookingId);
      const data = await getClientBookings();
      setBookings(data);
      toast.success("Escrow released. Payment sent to the provider.");
    } catch (releaseError) {
      toast.error(releaseError.message);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleGetEscrow = async (bookingId) => {
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

  useEffect(() => {
    if (activeSection === "bookings") {
      loadBookings();
    } else {
      setShowBookings(false);
      setSelectedListing(null);
    }
  }, [activeSection]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSearchValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    setSearching(true);

    try {
      const data = await searchListings(searchValues);
      setResults(data.listings || []);
      if (!data.listings || data.listings.length === 0) {
        toast.info("No services matched your search. Try a different keyword or location.");
      }
    } catch (searchError) {
      toast.error(searchError.message);
    } finally {
      setSearching(false);
    }
  };

  const activeBookingsCount = useMemo(() => {
    return bookings.filter((b) => ["pending", "quote_submitted", "quote_accepted", "confirmed"].includes(b.status)).length;
  }, [bookings]);

  const completedProjectsCount = useMemo(() => {
    return bookings.filter((b) => b.status === "completed").length;
  }, [bookings]);

  const totalSpent = useMemo(() => {
    return bookings
      .filter((b) => ["completed", "confirmed", "quote_accepted"].includes(b.status))
      .reduce((sum, b) => sum + (b.budget || 0), 0);
  }, [bookings]);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-welcome">
          <h1>Welcome back, {user.name}!</h1>
          <p className="dashboard-role"><i className="fas fa-user-circle"></i> Client Dashboard</p>
          <p className="dashboard-note">Search and book services from top-rated freelancers.</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </header>

      {/* Overview Statistics Grid */}
      <div className="dashboard-grid admin-grid" style={{ marginBottom: "2rem" }}>
        <div className="admin-card animate-in">
          <div className="admin-icon" style={{ background: "var(--accent-light)" }}>
            <i className="fas fa-briefcase" style={{ color: "#92400e" }}></i>
          </div>
          <h3>Active Bookings</h3>
          <p style={{ fontSize: "1.8rem", fontWeight: "700", color: "var(--ink)" }}>{activeBookingsCount}</p>
          <p style={{ color: "var(--ink-lighter)", fontSize: "0.85rem" }}>Projects in progress or pending</p>
        </div>
        <div className="admin-card animate-in">
          <div className="admin-icon" style={{ background: "var(--purple-light)" }}>
            <i className="fas fa-check-circle" style={{ color: "var(--purple)" }}></i>
          </div>
          <h3>Completed Projects</h3>
          <p style={{ fontSize: "1.8rem", fontWeight: "700", color: "var(--ink)" }}>{completedProjectsCount}</p>
          <p style={{ color: "var(--ink-lighter)", fontSize: "0.85rem" }}>Fully resolved contracts</p>
        </div>
        <div className="admin-card animate-in">
          <div className="admin-icon" style={{ background: "var(--brand-light)" }}>
            <i className="fas fa-wallet" style={{ color: "var(--brand-deep)" }}></i>
          </div>
          <h3>Total Spent</h3>
          <p style={{ fontSize: "1.8rem", fontWeight: "700", color: "var(--ink)" }}>${totalSpent.toLocaleString()}</p>
          <p style={{ color: "var(--ink-lighter)", fontSize: "0.85rem" }}>From active & completed contracts</p>
        </div>
      </div>

      <section className="search-panel card">
        <div className="card-header">
          <div className="icon-wrap brand"><i className="fas fa-search"></i></div>
          <h2>Find Services</h2>
        </div>
        <form className="search-form" onSubmit={handleSearch}>
          <label>
            Category
            <select
              name="category"
              value={searchValues.category}
              onChange={handleChange}
            >
              <option value="">All Categories</option>
              <option value="Design">Design</option>
              <option value="Development">Development</option>
              <option value="Writing">Writing</option>
              <option value="Marketing">Marketing</option>
              <option value="Consulting">Consulting</option>
              <option value="Support">Support</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Electrician">Electrician</option>
            </select>
          </label>
          <div className="grid-two">
            <label>
              Keyword
              <input
                name="keyword"
                value={searchValues.keyword}
                onChange={handleChange}
                placeholder="Search by skill or service"
              />
            </label>
            <label>
              Location
              <input
                name="location"
                value={searchValues.location}
                onChange={handleChange}
                placeholder="City, region, or remote"
              />
            </label>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
            <button className="btn btn-primary" type="submit" disabled={searching} style={{ flex: 2 }}>
              {searching ? <><i className="fas fa-spinner fa-spin"></i> Searching…</> : <><i className="fas fa-search"></i> Search Services</>}
            </button>
            <button className="btn btn-outline" type="button" onClick={handleClearFilters} disabled={searching} style={{ flex: 1 }}>
              <i className="fas fa-undo"></i> Clear
            </button>
          </div>
        </form>
      </section>

      <section className="booking-panel">
        <div className="section-header">
          <h2><i className="fas fa-calendar-alt" style={{ color: "var(--brand-deep)" }}></i> My Bookings</h2>
          <div className="line"></div>
          <button className="btn btn-sm btn-outline" onClick={loadBookings} disabled={loadingBookings}>
            {loadingBookings ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-sync-alt"></i>}
            <span>{loadingBookings ? "Refreshing…" : "Refresh"}</span>
          </button>
        </div>

        {!showBookings ? (
          <div className="empty-state card">
            <i className="fas fa-calendar-plus"></i>
            <p>View your active bookings or search for services to get started.</p>
            <button className="btn btn-primary btn-sm" onClick={loadBookings} style={{ marginTop: "1rem" }}>
              <i className="fas fa-eye"></i> View Bookings
            </button>
          </div>
        ) : loadingBookings ? (
          <div className="dashboard-grid booking-grid">
            {[...Array(2)].map((_, i) => (
              <div className="dashboard-card skeleton-card" key={i}>
                <div className="skeleton skeleton-text skeleton-title" style={{ width: "70%" }}></div>
                <div className="skeleton skeleton-text" style={{ width: "50%" }}></div>
                <div className="skeleton skeleton-text" style={{ width: "90%" }}></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="dashboard-grid booking-grid">
            {bookings.length ? (
              bookings.map((booking) => (
                <div className="dashboard-card animate-in" key={booking._id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <h3><i className="fas fa-briefcase" style={{ color: "var(--brand)" }}></i> {booking.listing?.title || "Service request"}</h3>
                    <span className={`badge badge-${booking.status === "confirmed" ? "success" : booking.status === "cancelled" ? "danger" : "warning"}`}>
                      {booking.status}
                    </span>
                  </div>
                  <p className="listing-meta">
                    <i className="fas fa-user"></i> {booking.provider?.name || "Provider"}
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
                            <span><strong>{quote.amount}</strong> — <span className={`badge badge-${quote.status === "accepted" ? "success" : quote.status === "rejected" ? "danger" : "warning"}`}>{quote.status}</span></span>
{booking.status === "quote_submitted" && quote.status === "pending" && (
                              <span style={{ display: "inline-flex", gap: "0.35rem", marginLeft: "0.5rem" }}>
                                <button className="btn btn-accent btn-sm" type="button" onClick={() => handleAcceptQuote(booking._id, quote._id)}>
                                  <i className="fas fa-check"></i> Accept
                                </button>
                                <button className="btn btn-outline btn-sm" type="button" onClick={() => handleRejectQuote(booking._id, quote._id)}>
                                  <i className="fas fa-times"></i> Reject
                                </button>
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="listing-meta"><i className="fas fa-info-circle"></i> No quotes yet.</p>
                  )}
{booking.status === "quote_accepted" && (
                    <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem", flexWrap: "wrap" }}>
                      <button className="btn btn-primary btn-sm" type="button" onClick={() => handleCompleteBooking(booking._id)}>
                        <i className="fas fa-check-circle"></i> Mark Completed
                      </button>
                      <button className="btn btn-accent btn-sm" type="button" onClick={() => handleFundEscrow(booking._id)}>
                        <i className="fas fa-shield-alt"></i> Fund Escrow
                      </button>
                      <button className="btn btn-outline btn-sm" type="button" onClick={() => handleReleaseEscrow(booking._id)}>
                        <i className="fas fa-hand-holding-usd"></i> Release Payment
                      </button>
                      <button className="btn btn-outline btn-sm" type="button" onClick={() => handleGetEscrow(booking._id)}>
                        <i className="fas fa-eye"></i> Check Escrow
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="empty-state card" style={{ gridColumn: "1 / -1" }}>
                <i className="fas fa-inbox"></i>
                <p>No bookings found yet. Request a service from search results.</p>
              </div>
            )}
          </div>
        )}
      </section>

      <div className="dashboard-grid service-results">
        {searching ? (
          [...Array(3)].map((_, i) => (
            <div className="dashboard-card skeleton-card" key={i}>
              <div className="skeleton skeleton-text skeleton-title"></div>
              <div className="skeleton skeleton-text" style={{ width: "80%" }}></div>
              <div className="skeleton skeleton-text" style={{ width: "50%" }}></div>
              <div className="skeleton" style={{ height: "40px", borderRadius: "var(--radius-md)", marginTop: "0.75rem" }}></div>
            </div>
          ))
        ) : (
          results.map((listing) => (
            <div className="dashboard-card animate-in" key={listing._id} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: "600" }}><i className="fas fa-star" style={{ color: "var(--accent)" }}></i> {listing.title}</h3>
                  <span className="badge badge-brand">{listing.availability}</span>
                </div>
                <p className="listing-meta" style={{ marginTop: "0.5rem" }}>
                  <i className="fas fa-folder"></i> {listing.category}
                  &nbsp;•&nbsp;
                  <i className="fas fa-map-marker-alt"></i> {listing.location}
                </p>
                <p style={{ margin: "0.75rem 0" }}>{listing.description}</p>
                <p className="listing-price" style={{ margin: "0.5rem 0" }}><i className="fas fa-tag"></i> {listing.priceRange.min} - ${listing.priceRange.max}</p>
                <p className="listing-meta" style={{ fontSize: "0.85rem", color: "var(--brand-deep)" }}>
                  <i className="fas fa-user-circle"></i> Provider:{" "}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleViewProfile(listing.provider?._id);
                    }}
                    style={{ textDecoration: "underline", fontWeight: "600", color: "var(--brand-deep)" }}
                  >
                    {listing.provider?.name || "Unknown"}
                  </a>
                </p>
                <div className="listing-tags" style={{ marginTop: "0.8rem" }}>
                  {(listing.tags || []).map((tag, i) => (
                    <span key={i} className="tag-pill brand-tag">{tag}</span>
                  ))}
                </div>
              </div>
              <button className="btn btn-primary" style={{ width: "100%", marginTop: "1.5rem" }} type="button" onClick={() => selectListingForBooking(listing)}>
                <i className="fas fa-paper-plane"></i> Request Booking
              </button>
            </div>
          ))
        )}
      </div>

      {selectedListing ? (
        <section className="quote-form-panel">
          <h2><i className="fas fa-paper-plane" style={{ color: "var(--brand)" }}></i> Request a booking for "{selectedListing.title}"</h2>
          <form className="profile-form" onSubmit={handleRequestBooking}>
            <label>
              Message to provider
              <textarea
                name="description"
                value={bookingForm.description}
                onChange={handleBookingFormChange}
                required
                placeholder="Describe the work, timeline, or outcome you need"
              />
            </label>
            <div className="grid-two">
              <label>
                Start date
                <input
                  type="date"
                  name="startDate"
                  value={bookingForm.startDate}
                  onChange={handleBookingFormChange}
                />
              </label>
              <label>
                End date
                <input
                  type="date"
                  name="endDate"
                  value={bookingForm.endDate}
                  onChange={handleBookingFormChange}
                />
              </label>
            </div>
            <label>
              Budget
              <input
                type="number"
                min={0}
                name="budget"
                value={bookingForm.budget}
                onChange={handleBookingFormChange}
                placeholder="Enter your budget"
              />
            </label>
            <div className="form-actions">
              <button className="btn btn-primary btn-lg" type="submit" disabled={bookingSubmitting}>
                {bookingSubmitting ? <><i className="fas fa-spinner fa-spin"></i> Sending…</> : <><i className="fas fa-paper-plane"></i> Send Booking Request</>}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setSelectedListing(null)}>
                <i className="fas fa-times"></i> Cancel
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {/* Provider Profile Quick-View Modal */}
      {viewingProfile && (
        <div
          className="modal-overlay animate-in"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setViewingProfile(null)}
        >
          <div
            className="modal-content card animate-in"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "500px",
              width: "90%",
              padding: "2.25rem",
              maxHeight: "85vh",
              overflowY: "auto",
              position: "relative",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
              <div>
                <h2 style={{ fontSize: "1.40rem", fontWeight: "600", color: "var(--text)", margin: 0 }}>
                  {viewingProfile.user?.name || "Provider Details"}
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.2rem" }}>
                  {viewingProfile.user?.email}
                </p>
              </div>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => setViewingProfile(null)}
                style={{ border: "none", padding: "0.5rem", borderRadius: "50%" }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <span className={`badge ${viewingProfile.verificationStatus === "verified" ? "badge-success" : viewingProfile.verificationStatus === "pending" ? "badge-purple" : viewingProfile.verificationStatus === "rejected" ? "badge-brand" : "badge-warning"}`}>
                  <i className={viewingProfile.verificationStatus === "verified" ? "fas fa-check-circle" : "fas fa-info-circle"}></i>
                  {" "}{viewingProfile.verificationStatus || "unverified"}
                </span>
                <span className="badge badge-brand">
                  Hourly: ${viewingProfile.hourlyRate?.min} - ${viewingProfile.hourlyRate?.max}
                </span>
              </div>

              <div>
                <h4 style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--text)", marginBottom: "0.3rem" }}>Professional Title</h4>
                <p style={{ fontSize: "1.05rem", fontWeight: "500", color: "var(--brand-deep)" }}>{viewingProfile.title || "Freelancer"}</p>
              </div>

              <div>
                <h4 style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--text)", marginBottom: "0.3rem" }}>Biography</h4>
                <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: "1.5" }}>{viewingProfile.bio || "No biography provided."}</p>
              </div>

              <div>
                <h4 style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--text)", marginBottom: "0.5rem" }}>Core Skills</h4>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {viewingProfile.skills?.length ? (
                    viewingProfile.skills.map((skill, idx) => (
                      <span key={idx} className="tag-pill brand-tag">{skill}</span>
                    ))
                  ) : (
                    <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontStyle: "italic" }}>No skills listed.</span>
                  )}
                </div>
              </div>

              {viewingProfile.portfolio?.length ? (
                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--text)", marginBottom: "0.5rem" }}>Portfolio & Reference Links</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {viewingProfile.portfolio.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: "0.9rem", color: "var(--brand)", textDecoration: "underline", wordBreak: "break-all" }}
                      >
                        <i className="fas fa-external-link-alt" style={{ fontSize: "0.8rem", marginRight: "0.3rem" }}></i> {url}
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientDashboard;