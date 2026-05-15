import { useState } from "react";
import { logout } from "./api";

function AdminDashboard({ user, onLogout }) {
  const [message, setMessage] = useState("");

  const handleLogout = async () => {
    try {
      await logout();
      onLogout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const adminSections = [
    {
      title: "User Management",
      description: "Manage users, roles, and permissions across the platform.",
      icon: "fas fa-users-cog",
      color: "var(--brand)",
    },
    {
      title: "Project Oversight",
      description: "Monitor all projects, resolve disputes, and ensure quality.",
      icon: "fas fa-project-diagram",
      color: "var(--purple)",
    },
    {
      title: "Analytics & Reports",
      description: "View platform statistics, revenue, and user engagement reports.",
      icon: "fas fa-chart-bar",
      color: "var(--accent)",
    },
    {
      title: "System Settings",
      description: "Configure platform settings, categories, and feature flags.",
      icon: "fas fa-cog",
      color: "var(--ink-soft)",
    },
    {
      title: "Disputes & Support",
      description: "Review and resolve disputes between clients and freelancers.",
      icon: "fas fa-gavel",
      color: "var(--danger)",
    },
    {
      title: "Payments",
      description: "Monitor transactions, payouts, and payment disputes.",
      icon: "fas fa-dollar-sign",
      color: "var(--success)",
    },
  ];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-welcome">
          <h1>Welcome, {user.name}!</h1>
          <p className="dashboard-role"><i className="fas fa-shield-alt"></i> Admin Dashboard</p>
          <p className="dashboard-note">Manage the entire platform from here.</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </header>

      {message && (
        <p className="status status-success">
          <i className="fas fa-check-circle"></i> {message}
        </p>
      )}

      <div className="section-header">
        <h2>Platform Overview</h2>
        <div className="line"></div>
      </div>

      <div className="dashboard-grid admin-grid">
        <div className="admin-card">
          <div className="admin-icon" style={{ background: "var(--brand-light)" }}>
            <i className="fas fa-users" style={{ color: "var(--brand-deep)" }}></i>
          </div>
          <h3>Total Users</h3>
          <p style={{ fontSize: "1.8rem", fontWeight: "700", color: "var(--ink)" }}>2,847</p>
          <p style={{ color: "var(--ink-lighter)", fontSize: "0.85rem" }}>
            <span style={{ color: "var(--success)" }}>↑ 12%</span> this month
          </p>
        </div>

        <div className="admin-card">
          <div className="admin-icon" style={{ background: "var(--purple-light)" }}>
            <i className="fas fa-bolt" style={{ color: "var(--purple)" }}></i>
          </div>
          <h3>Active Listings</h3>
          <p style={{ fontSize: "1.8rem", fontWeight: "700", color: "var(--ink)" }}>634</p>
          <p style={{ color: "var(--ink-lighter)", fontSize: "0.85rem" }}>
            <span style={{ color: "var(--success)" }}>↑ 8%</span> this week
          </p>
        </div>

        <div className="admin-card">
          <div className="admin-icon" style={{ background: "var(--accent-light)" }}>
            <i className="fas fa-briefcase" style={{ color: "#92400e" }}></i>
          </div>
          <h3>Active Bookings</h3>
          <p style={{ fontSize: "1.8rem", fontWeight: "700", color: "var(--ink)" }}>1,209</p>
          <p style={{ color: "var(--ink-lighter)", fontSize: "0.85rem" }}>
            <span style={{ color: "var(--success)" }}>↑ 5%</span> this month
          </p>
        </div>

        <div className="admin-card">
          <div className="admin-icon" style={{ background: "var(--blue-light)" }}>
            <i className="fas fa-dollar-sign" style={{ color: "var(--blue)" }}></i>
          </div>
          <h3>Revenue (MTD)</h3>
          <p style={{ fontSize: "1.8rem", fontWeight: "700", color: "var(--ink)" }}>$48,520</p>
          <p style={{ color: "var(--ink-lighter)", fontSize: "0.85rem" }}>
            <span style={{ color: "var(--success)" }}>↑ 15%</span> vs last month
          </p>
        </div>
      </div>

      <div className="divider"></div>
      <div className="section-header">
        <h2>Admin Tools</h2>
        <div className="line"></div>
      </div>

      <div className="dashboard-grid admin-grid">
        {adminSections.map((section, i) => (
          <div className="admin-card" key={i}>
            <div className="admin-icon" style={{ background: `${section.color}15` }}>
              <i className={section.icon} style={{ color: section.color }}></i>
            </div>
            <h3>{section.title}</h3>
            <p>{section.description}</p>
            <button className="btn btn-outline btn-sm" style={{ width: "100%" }}>
              <i className="fas fa-arrow-right"></i> Open
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;