import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  getAdminSummary,
  getAdminUsers,
  deleteAdminUser,
  getAdminListings,
  toggleAdminListingActive,
  getAdminBookings,
  getAdminEscrows,
  getPendingVerifications,
  verifyProfile,
} from "./api";

const initialSummary = {
  stats: {
    totalUsers: 0,
    newUsersThisMonth: 0,
    activeListings: 0,
    newListingsThisWeek: 0,
    activeBookings: 0,
    newBookingsThisMonth: 0,
    revenueMtd: 0,
  },
  recentUsers: [],
  recentBookings: [],
};

const sidebarSectionToTool = {
  overview: "overview",
  listings: "projects",
  bookings: "payments",
  verifications: "verifications",
  support: "support",
};

function AdminDashboard({ user, activeSection = "overview" }) {
  const [activeTool, setActiveTool] = useState(sidebarSectionToTool[activeSection] || "overview");
  const [summary, setSummary] = useState(initialSummary);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  // Tab data states
  const [usersList, setUsersList] = useState([]);
  const [listingsList, setListingsList] = useState([]);
  const [escrowsList, setEscrowsList] = useState([]);
  const [verificationsList, setVerificationsList] = useState([]);
  const [bookingsList, setBookingsList] = useState([]);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const data = await getAdminSummary();
      setSummary({
        stats: { ...initialSummary.stats, ...(data.stats || {}) },
        recentUsers: data.recentUsers || [],
        recentBookings: data.recentBookings || [],
      });
    } catch (summaryError) {
      toast.error(summaryError.message);
    } finally {
      setLoading(false);
    }
  };

  const loadToolData = async () => {
    setDataLoading(true);
    try {
      if (activeTool === "users") {
        const data = await getAdminUsers();
        setUsersList(data.users || []);
      } else if (activeTool === "projects") {
        const data = await getAdminListings();
        setListingsList(data.listings || []);
      } else if (activeTool === "payments") {
        const data = await getAdminEscrows();
        setEscrowsList(data.escrows || []);
      } else if (activeTool === "verifications") {
        const data = await getPendingVerifications();
        setVerificationsList(data.profiles || []);
      } else if (activeTool === "support") {
        const data = await getAdminBookings();
        setBookingsList(data.bookings || []);
      }
    } catch (error) {
      toast.error(error.message || "Failed to load management data");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  useEffect(() => {
    setActiveTool(sidebarSectionToTool[activeSection] || "overview");
  }, [activeSection]);

  useEffect(() => {
    if (activeTool !== "overview") {
      loadToolData();
    }
  }, [activeTool]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to permanently delete/ban this user and all their listings/bookings?")) {
      return;
    }

    try {
      const result = await deleteAdminUser(userId);
      toast.success(result.message || "User banned successfully.");
      loadToolData();
      loadSummary();
    } catch (err) {
      toast.error(err.message || "Failed to delete user.");
    }
  };

  const handleToggleListing = async (listingId) => {
    try {
      const result = await toggleAdminListingActive(listingId);
      toast.success(result.message || "Listing status toggled.");
      loadToolData();
      loadSummary();
    } catch (err) {
      toast.error(err.message || "Failed to toggle listing active status.");
    }
  };

  const handleVerify = async (profileId, status) => {
    try {
      const result = await verifyProfile(profileId, status);
      toast.success(result.message || `Profile has been marked as ${status}.`);
      loadToolData();
    } catch (err) {
      toast.error(err.message || "Failed to update profile verification status.");
    }
  };

  const statCards = useMemo(
    () => [
      {
        title: "Total Users",
        value: summary.stats.totalUsers.toLocaleString(),
        detail: `${summary.stats.newUsersThisMonth.toLocaleString()} new this month`,
        icon: "fas fa-users",
        background: "var(--brand-light)",
        color: "var(--brand-deep)",
      },
      {
        title: "Active Listings",
        value: summary.stats.activeListings.toLocaleString(),
        detail: `${summary.stats.newListingsThisWeek.toLocaleString()} new this week`,
        icon: "fas fa-bolt",
        background: "var(--purple-light)",
        color: "var(--purple)",
      },
      {
        title: "Active Bookings",
        value: summary.stats.activeBookings.toLocaleString(),
        detail: `${summary.stats.newBookingsThisMonth.toLocaleString()} opened this month`,
        icon: "fas fa-briefcase",
        background: "var(--accent-light)",
        color: "#92400e",
      },
      {
        title: "Revenue (MTD)",
        value: `$${summary.stats.revenueMtd.toLocaleString()}`,
        detail: "Accepted quotes this month",
        icon: "fas fa-dollar-sign",
        background: "var(--blue-light)",
        color: "var(--blue)",
      },
    ],
    [summary.stats]
  );

  const adminSections = [
    {
      id: "users",
      title: "User Management",
      description: "Review registered clients/freelancers and ban user accounts.",
      icon: "fas fa-users-cog",
      color: "var(--brand)",
    },
    {
      id: "projects",
      title: "Project Oversight",
      description: "Monitor and toggle active service listings quality.",
      icon: "fas fa-project-diagram",
      color: "var(--purple)",
    },
    {
      id: "verifications",
      title: "Freelancer Verification",
      description: "Approve or reject freelancer credentials and documents.",
      icon: "fas fa-shield-alt",
      color: "var(--brand-deep)",
    },
    {
      id: "payments",
      title: "Payments & Escrow",
      description: "Track escrow accounts, released balances, and transactions.",
      icon: "fas fa-dollar-sign",
      color: "var(--success)",
    },
    {
      id: "support",
      title: "Disputes & Support",
      description: "Review marketplace support work and booking contracts.",
      icon: "fas fa-headset",
      color: "var(--danger)",
    },
  ];

  const activeSectionDetails = adminSections.find((section) => section.id === activeTool);

  return (
    <div className="dashboard animate-in">
      <header className="dashboard-header animate-in">
        <div className="dashboard-welcome">
          <h1>Welcome, {user.name}!</h1>
          <p className="dashboard-role"><i className="fas fa-shield-alt"></i> Admin Dashboard</p>
          <p className="dashboard-note">Manage the entire platform from here.</p>
        </div>
      </header>

      <div className="dashboard-tabs animate-in">
        <button className={`tab ${activeTool === "overview" ? "active" : ""}`} onClick={() => setActiveTool("overview")}>
          <i className="fas fa-th-large"></i> Overview
        </button>
        {adminSections.map((section) => (
          <button
            className={`tab ${activeTool === section.id ? "active" : ""}`}
            key={section.id}
            onClick={() => setActiveTool(section.id)}
          >
            <i className={section.icon}></i> {section.title.split(" ")[0]}
          </button>
        ))}
      </div>

      {activeTool === "overview" ? (
        <>
          <div className="section-header animate-in">
            <h2>Platform Overview</h2>
            <div className="line"></div>
            <button className="btn btn-sm btn-outline" onClick={loadSummary} disabled={loading}>
              {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-sync-alt"></i>}
              <span>{loading ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>

          <div className="dashboard-grid admin-grid animate-in">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div className="admin-card skeleton-card" key={i}>
                  <div className="skeleton skeleton-circle" style={{ width: "48px", height: "48px" }}></div>
                  <div className="skeleton skeleton-text" style={{ width: "60%", height: "1.2rem", marginTop: "1rem" }}></div>
                  <div className="skeleton skeleton-text" style={{ width: "40%", height: "1.8rem" }}></div>
                  <div className="skeleton skeleton-text skeleton-short"></div>
                </div>
              ))
            ) : (
              statCards.map((stat) => (
                <div className="admin-card animate-in" key={stat.title}>
                  <div className="admin-icon" style={{ background: stat.background }}>
                    <i className={stat.icon} style={{ color: stat.color }}></i>
                  </div>
                  <h3>{stat.title}</h3>
                  <p style={{ fontSize: "1.8rem", fontWeight: "700", color: "var(--ink)" }}>{stat.value}</p>
                  <p style={{ color: "var(--ink-lighter)", fontSize: "0.85rem" }}>{stat.detail}</p>
                </div>
              ))
            )}
          </div>

          <div className="divider animate-in"></div>
          <div className="section-header animate-in">
            <h2>Admin Quick Links</h2>
            <div className="line"></div>
          </div>

          <div className="dashboard-grid admin-grid animate-in">
            {adminSections.map((section) => (
              <div className="admin-card animate-in" key={section.id}>
                <div className="admin-icon" style={{ background: `${section.color}15` }}>
                  <i className={section.icon} style={{ color: section.color }}></i>
                </div>
                <h3>{section.title}</h3>
                <p>{section.description}</p>
                <button className="btn btn-outline btn-sm" style={{ width: "100%" }} onClick={() => setActiveTool(section.id)}>
                  <i className="fas fa-arrow-right"></i> Open
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <section className="search-panel card animate-in">
          <div className="card-header animate-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div className="icon-wrap brand"><i className={activeSectionDetails?.icon || "fas fa-tools"}></i></div>
              <h2>{activeSectionDetails?.title || "Admin Tool"}</h2>
            </div>
            <button className="btn btn-sm btn-outline" onClick={loadToolData} disabled={dataLoading}>
              {dataLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-sync-alt"></i>}
              <span>{dataLoading ? "Loading…" : "Sync"}</span>
            </button>
          </div>
          <p className="dashboard-note animate-in">{activeSectionDetails?.description}</p>

          {dataLoading ? (
            <div className="dashboard-grid booking-grid animate-in" style={{ marginTop: "1.5rem" }}>
              {[...Array(3)].map((_, i) => (
                <div className="dashboard-card skeleton-card" key={i}>
                  <div className="skeleton skeleton-text skeleton-title" style={{ width: "65%" }}></div>
                  <div className="skeleton skeleton-text" style={{ width: "85%" }}></div>
                  <div className="skeleton" style={{ width: "80px", height: "22px", borderRadius: "var(--radius-full)" }}></div>
                </div>
              ))}
            </div>
          ) : activeTool === "users" ? (
            <div className="dashboard-grid booking-grid animate-in" style={{ marginTop: "1.5rem" }}>
              {usersList.length ? (
                usersList.map((usr) => (
                  <div className="dashboard-card animate-in" key={usr._id} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <i className="fas fa-user" style={{ color: "var(--brand)" }}></i> {usr.name}
                      </h3>
                      <p className="listing-meta" style={{ marginBottom: "0.5rem" }}>{usr.email}</p>
                      <span className={`badge ${usr.role === "admin" ? "badge-brand" : usr.role === "freelancer" ? "badge-purple" : "badge-success"}`}>
                        {usr.role}
                      </span>
                      <p className="listing-meta" style={{ fontSize: "0.8rem", marginTop: "0.8rem" }}>
                        Joined: {new Date(usr.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {usr._id !== user._id ? (
                      <button className="btn btn-sm btn-danger" style={{ marginTop: "1.5rem", width: "100%" }} onClick={() => handleDeleteUser(usr._id)}>
                        <i className="fas fa-user-slash"></i> Ban Account
                      </button>
                    ) : (
                      <p className="listing-meta text-center" style={{ marginTop: "1.5rem", fontStyle: "italic", fontSize: "0.85rem" }}>Current Logged In Admin</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="empty-state card" style={{ gridColumn: "1 / -1" }}>
                  <i className="fas fa-users"></i>
                  <p>No registered users found.</p>
                </div>
              )}
            </div>
          ) : activeTool === "projects" ? (
            <div className="dashboard-grid booking-grid animate-in" style={{ marginTop: "1.5rem" }}>
              {listingsList.length ? (
                listingsList.map((lst) => (
                  <div className="dashboard-card animate-in" key={lst._id} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <h3 style={{ fontSize: "1.15rem", fontWeight: "600", color: "var(--text)" }}>{lst.title}</h3>
                      <span className="badge badge-brand" style={{ marginBottom: "0.8rem" }}>{lst.category}</span>
                      <p className="listing-meta" style={{ fontSize: "0.85rem" }}>
                        <i className="fas fa-user-circle"></i> Provider: {lst.provider?.name || "Unknown"} ({lst.provider?.email || "No Email"})
                      </p>
                      <p className="listing-price" style={{ margin: "0.8rem 0" }}>
                        Price: ${lst.priceRange?.min} - ${lst.priceRange?.max}
                      </p>
                      <p className="listing-meta" style={{ fontSize: "0.95rem", color: "var(--text-muted)" }}>
                        {lst.description?.length > 100 ? `${lst.description.slice(0, 100)}...` : lst.description}
                      </p>
                    </div>
                    <button
                      className={`btn btn-sm ${lst.isActive ? "btn-danger" : "btn-primary"}`}
                      style={{ marginTop: "1.5rem", width: "100%" }}
                      onClick={() => handleToggleListing(lst._id)}
                    >
                      <i className={lst.isActive ? "fas fa-ban" : "fas fa-check"}></i>
                      <span> {lst.isActive ? "Deactivate Listing" : "Activate Listing"}</span>
                    </button>
                  </div>
                ))
              ) : (
                <div className="empty-state card" style={{ gridColumn: "1 / -1" }}>
                  <i className="fas fa-project-diagram"></i>
                  <p>No listings found in the system.</p>
                </div>
              )}
            </div>
          ) : activeTool === "verifications" ? (
            <div className="dashboard-grid booking-grid animate-in" style={{ marginTop: "1.5rem" }}>
              {verificationsList.length ? (
                verificationsList.map((prof) => (
                  <div className="dashboard-card animate-in" key={prof._id} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <h3 style={{ fontSize: "1.15rem", fontWeight: "600" }}>{prof.title || "Freelancer Profile"}</h3>
                      <p className="listing-meta" style={{ fontSize: "0.85rem" }}>
                        <i className="fas fa-user"></i> Name: {prof.user?.name || "Freelancer"} ({prof.user?.email || "No Email"})
                      </p>
                      <p className="listing-meta" style={{ marginTop: "0.5rem" }}>
                        Hourly Rate: ${prof.hourlyRate?.min} - ${prof.hourlyRate?.max}
                      </p>
                      <p className="listing-meta" style={{ fontWeight: "500", marginTop: "0.5rem" }}>
                        Skills: {(prof.skills || []).join(", ") || "None"}
                      </p>

                      <div style={{ marginTop: "1rem" }}>
                        <h4 style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "0.5rem" }}>Verification Documents:</h4>
                        {prof.verificationDocs?.length ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {prof.verificationDocs.map((doc, idx) => (
                              <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(15, 23, 42, 0.03)", padding: "0.4rem 0.8rem", borderRadius: "var(--radius-sm)" }}>
                                <span style={{ fontSize: "0.85rem", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: "160px" }}>{doc.name}</span>
                                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline" style={{ padding: "0.15rem 0.5rem", fontSize: "0.75rem" }}>
                                  <i className="fas fa-external-link-alt"></i> View File
                                </a>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={{ fontStyle: "italic", fontSize: "0.85rem", color: "var(--text-muted)" }}>No documents uploaded.</p>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem" }}>
                      <button className="btn btn-sm btn-primary" style={{ flex: 1 }} onClick={() => handleVerify(prof._id, "verified")}>
                        <i className="fas fa-check"></i> Verify
                      </button>
                      <button className="btn btn-sm btn-danger" style={{ flex: 1 }} onClick={() => handleVerify(prof._id, "rejected")}>
                        <i className="fas fa-times"></i> Reject
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state card" style={{ gridColumn: "1 / -1" }}>
                  <i className="fas fa-shield-alt"></i>
                  <p>All freelancer verifications are up to date.</p>
                </div>
              )}
            </div>
          ) : activeTool === "payments" ? (
            <div className="dashboard-grid booking-grid animate-in" style={{ marginTop: "1.5rem" }}>
              {escrowsList.length ? (
                escrowsList.map((esc) => (
                  <div className="dashboard-card animate-in" key={esc._id}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: "600" }}>
                      <i className="fas fa-file-invoice-dollar" style={{ color: "var(--success)", marginRight: "0.5rem" }}></i>
                      {esc.booking?.listing?.title || "Project Escrow"}
                    </h3>
                    <p className="listing-price" style={{ margin: "0.5rem 0" }}>Amount: ${esc.amount}</p>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      <p><i className="fas fa-user-tie"></i> Client: {esc.client?.name || "Unknown"}</p>
                      <p><i className="fas fa-laptop-code"></i> Provider: {esc.provider?.name || "Unknown"}</p>
                    </div>
                    <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className={`badge ${esc.status === "released" ? "badge-success" : esc.status === "funded" ? "badge-purple" : "badge-brand"}`}>
                        {esc.status}
                      </span>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        Updated: {new Date(esc.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state card" style={{ gridColumn: "1 / -1" }}>
                  <i className="fas fa-hand-holding-usd"></i>
                  <p>No escrow transaction records found.</p>
                </div>
              )}
            </div>
          ) : activeTool === "support" ? (
            <div className="dashboard-grid booking-grid animate-in" style={{ marginTop: "1.5rem" }}>
              {bookingsList.length ? (
                bookingsList.map((bkg) => (
                  <div className="dashboard-card animate-in" key={bkg._id}>
                    <h3><i className="fas fa-file-signature" style={{ color: "var(--brand)", marginRight: "0.5rem" }}></i> {bkg.listing?.title || "Booking Request"}</h3>
                    <p className="listing-meta">
                      Contract: {bkg.client?.name || "Client"} & {bkg.provider?.name || "Provider"}
                    </p>
                    <p className="listing-price" style={{ margin: "0.5rem 0" }}>Budget: ${bkg.budget}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
                      <span className={`badge ${bkg.status === "completed" ? "badge-success" : bkg.status === "cancelled" ? "badge-brand" : "badge-purple"}`}>
                        {bkg.status}
                      </span>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        Created: {new Date(bkg.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state card" style={{ gridColumn: "1 / -1" }}>
                  <i className="fas fa-headset"></i>
                  <p>No platform bookings or support records found.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state card animate-in">
              <i className="fas fa-tools"></i>
              <p>This admin area is ready for the next management workflow.</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default AdminDashboard;
