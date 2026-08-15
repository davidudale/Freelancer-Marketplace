import { useEffect, useMemo, useState } from "react";
import { getAdminSummary } from "./api";

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
  support: "support",
};

function AdminDashboard({ user, activeSection = "overview" }) {
  const [activeTool, setActiveTool] = useState(sidebarSectionToTool[activeSection] || "overview");
  const [summary, setSummary] = useState(initialSummary);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadSummary = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminSummary();
      setSummary({
        stats: { ...initialSummary.stats, ...(data.stats || {}) },
        recentUsers: data.recentUsers || [],
        recentBookings: data.recentBookings || [],
      });
      setMessage("Admin data refreshed.");
    } catch (summaryError) {
      setError(summaryError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  useEffect(() => {
    setActiveTool(sidebarSectionToTool[activeSection] || "overview");
  }, [activeSection]);

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
      description: "Review new users, roles, and account activity.",
      icon: "fas fa-users-cog",
      color: "var(--brand)",
    },
    {
      id: "projects",
      title: "Project Oversight",
      description: "Monitor listings, booking flow, and marketplace quality.",
      icon: "fas fa-project-diagram",
      color: "var(--purple)",
    },
    {
      id: "reports",
      title: "Analytics & Reports",
      description: "Inspect platform counts, revenue, and engagement signals.",
      icon: "fas fa-chart-bar",
      color: "var(--accent)",
    },
    {
      id: "settings",
      title: "System Settings",
      description: "Prepare categories, policies, and feature configuration.",
      icon: "fas fa-cog",
      color: "var(--ink-soft)",
    },
    {
      id: "support",
      title: "Disputes & Support",
      description: "Review marketplace support work and disputed bookings.",
      icon: "fas fa-gavel",
      color: "var(--danger)",
    },
    {
      id: "payments",
      title: "Payments",
      description: "Track accepted quotes, payouts, and payment exceptions.",
      icon: "fas fa-dollar-sign",
      color: "var(--success)",
    },
  ];

  const activeSectionDetails = adminSections.find((section) => section.id === activeTool);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-welcome">
          <h1>Welcome, {user.name}!</h1>
          <p className="dashboard-role"><i className="fas fa-shield-alt"></i> Admin Dashboard</p>
          <p className="dashboard-note">Manage the entire platform from here.</p>
        </div>
      </header>

      {message && !loading ? <p className="status status-success"><i className="fas fa-check-circle"></i> {message}</p> : null}
      {error ? <p className="status status-error"><i className="fas fa-exclamation-circle"></i> {error}</p> : null}

      <div className="dashboard-tabs">
        <button className={`tab ${activeTool === "overview" ? "active" : ""}`} onClick={() => setActiveTool("overview")}>
          <i className="fas fa-th-large"></i> Overview
        </button>
        {adminSections.map((section) => (
          <button
            className={`tab ${activeTool === section.id ? "active" : ""}`}
            key={section.id}
            onClick={() => setActiveTool(section.id)}
          >
            <i className={section.icon}></i> {section.title}
          </button>
        ))}
      </div>

      {activeTool === "overview" ? (
        <>
          <div className="section-header">
            <h2>Platform Overview</h2>
            <div className="line"></div>
            <button className="btn btn-sm btn-outline" onClick={loadSummary} disabled={loading}>
              {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-sync-alt"></i>}
              <span>{loading ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>

          <div className="dashboard-grid admin-grid">
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
                <div className="admin-card" key={stat.title}>
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

          <div className="divider"></div>
          <div className="section-header">
            <h2>Admin Tools</h2>
            <div className="line"></div>
          </div>

          <div className="dashboard-grid admin-grid">
            {adminSections.map((section) => (
              <div className="admin-card" key={section.id}>
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
        <section className="search-panel card">
          <div className="card-header">
            <div className="icon-wrap brand"><i className={activeSectionDetails?.icon || "fas fa-tools"}></i></div>
            <h2>{activeSectionDetails?.title || "Admin Tool"}</h2>
          </div>
          <p className="dashboard-note">{activeSectionDetails?.description}</p>

          {loading ? (
            <div className="dashboard-grid booking-grid">
              {[...Array(3)].map((_, i) => (
                <div className="dashboard-card skeleton-card" key={i}>
                  <div className="skeleton skeleton-text skeleton-title" style={{ width: "65%" }}></div>
                  <div className="skeleton skeleton-text" style={{ width: "85%" }}></div>
                  <div className="skeleton" style={{ width: "80px", height: "22px", borderRadius: "var(--radius-full)" }}></div>
                </div>
              ))}
            </div>
          ) : activeTool === "users" ? (
            <div className="dashboard-grid booking-grid">
              {summary.recentUsers.length ? (
                summary.recentUsers.map((recentUser) => (
                  <div className="dashboard-card animate-in" key={recentUser._id}>
                    <h3><i className="fas fa-user" style={{ color: "var(--brand)" }}></i> {recentUser.name}</h3>
                    <p className="listing-meta">{recentUser.email}</p>
                    <span className="badge badge-brand">{recentUser.role}</span>
                  </div>
                ))
              ) : (
                <div className="empty-state card" style={{ gridColumn: "1 / -1" }}>
                  <i className="fas fa-users"></i>
                  <p>No users found yet.</p>
                </div>
              )}
            </div>
          ) : activeTool === "projects" || activeTool === "support" || activeTool === "payments" ? (
            <div className="dashboard-grid booking-grid">
              {summary.recentBookings.length ? (
                summary.recentBookings.map((booking) => (
                  <div className="dashboard-card animate-in" key={booking._id}>
                    <h3><i className="fas fa-briefcase" style={{ color: "var(--brand)" }}></i> {booking.listing?.title || "Booking"}</h3>
                    <p className="listing-meta">
                      <i className="fas fa-user"></i> {booking.client?.name || "Client"} to {booking.provider?.name || "Provider"}
                    </p>
                    <p className="listing-price"><i className="fas fa-tag"></i> Budget: {booking.budget || "Not specified"}</p>
                    <span className="badge badge-warning">{booking.status}</span>
                  </div>
                ))
              ) : (
                <div className="empty-state card" style={{ gridColumn: "1 / -1" }}>
                  <i className="fas fa-inbox"></i>
                  <p>No bookings found yet.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state card">
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
