import { useEffect, useMemo, useState } from "react";
import { login, logout, me, register } from "./api";
import ClientDashboard from "./ClientDashboard";
import FreelancerDashboard from "./FreelancerDashboard";
import AdminDashboard from "./AdminDashboard";
import LandingPage from "./LandingPage";

const initialForm = {
  name: "",
  email: "",
  password: "",
  role: "client",
};

function App() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState("home");
  const [dashboardSection, setDashboardSection] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      try {
        const data = await me();
        setUser(data.user);
        if (data.user) setCurrentPage("dashboard");
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    if (currentPage === "home") return;
    if (!user) return;
    if (currentPage === "explore") {
      setDashboardSection(user.role === "client" ? "overview" : "listings");
    } else if (currentPage === "bookings") {
      setDashboardSection("bookings");
    } else {
      setDashboardSection("overview");
    }
  }, [currentPage, user]);

  const pageTitle = useMemo(() => {
    if (user) return `Welcome back, ${user.name}`;
    return mode === "login" ? "Sign in to your account" : "Create your account";
  }, [mode, user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const clearFeedback = () => {
    setMessage("");
    setError("");
  };

  const resetForm = () => {
    setForm(initialForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    clearFeedback();
    setSubmitting(true);

    try {
      const payload =
        mode === "register"
          ? {
              name: form.name.trim(),
              email: form.email.trim(),
              password: form.password,
              role: form.role,
            }
          : {
              email: form.email.trim(),
              password: form.password,
            };

      const data = mode === "register" ? await register(payload) : await login(payload);
      setUser(data.user);
      setMessage(mode === "register" ? "Registration successful." : "Login successful.");
      resetForm();
      setCurrentPage("dashboard");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    clearFeedback();
    try {
      await logout();
      setUser(null);
      setMode("login");
      setCurrentPage("home");
      setMessage("You have been logged out.");
    } catch (logoutError) {
      setError(logoutError.message);
    }
  };

  const handleDashboardLogout = () => {
    setUser(null);
    setMode("login");
    setDashboardSection("overview");
    setCurrentPage("home");
  };

  const handleSidebarNavigation = (section) => {
    setDashboardSection(section);
  };

  const toggleMode = () => {
    clearFeedback();
    setMode((prev) => (prev === "login" ? "register" : "login"));
  };

  const handleNavClick = (page) => {
    if (page === "home") {
      setCurrentPage("home");
      return;
    }
    if (!user) {
      setCurrentPage("auth");
      return;
    }
    setCurrentPage(page);
  };

  const displayName = user ? user.name : "";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const sidebarItems = user?.role === "admin"
    ? [
        { section: "overview", icon: "fas fa-th-large", label: "Overview" },
        { section: "listings", icon: "fas fa-project-diagram", label: "Projects" },
        { section: "bookings", icon: "fas fa-dollar-sign", label: "Payments" },
        { section: "support", icon: "fas fa-headset", label: "Support" },
      ]
    : [
        { section: "overview", icon: "fas fa-th-large", label: "Overview" },
        { section: "listings", icon: "fas fa-list", label: "My Listings" },
        { section: "bookings", icon: "fas fa-calendar-check", label: "My Bookings" },
        { section: "support", icon: "fas fa-headset", label: "Support" },
      ];

  const showLanding = !user && currentPage === "home";
  const showAuth = !user && currentPage !== "home";
  const showDashboard = !!user;

  return (
    <div className="page">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />

      <header className={`site-nav ${showLanding ? "site-nav-transparent" : ""}`}>
        <a className="nav-brand" href="#" onClick={(e) => { e.preventDefault(); setCurrentPage("home"); }}>
          <div className="icon">
            <i className="fas fa-bolt"></i>
          </div>
          <span>Freelancer</span>
          <strong>Marketplace</strong>
        </a>
        {!showLanding && (
          <nav className="nav-links">
            <button
              type="button"
              className={currentPage === "home" || !user ? "active" : ""}
              onClick={() => handleNavClick("home")}
            >
              <i className="fas fa-home"></i> Home
            </button>
            <button
              type="button"
              className={currentPage === "explore" ? "active" : ""}
              onClick={() => handleNavClick("explore")}
            >
              <i className="fas fa-search"></i> Explore
            </button>
            <button
              type="button"
              className={currentPage === "bookings" ? "active" : ""}
              onClick={() => handleNavClick("bookings")}
            >
              <i className="fas fa-briefcase"></i> Bookings
            </button>
          </nav>
        )}
        <div className="nav-actions">
          {user ? (
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          ) : showLanding ? (
            <button className="btn btn-primary btn-sm" onClick={() => setCurrentPage("auth")}>
              <i className="fas fa-sign-in-alt"></i> Login
            </button>
          ) : null}
        </div>
      </header>

      <div className="app-container">
        <main className={`panel ${showDashboard ? "app-layout" : ""} ${showLanding ? "panel-transparent" : ""}`}>
          {showLanding ? (
            <LandingPage onGetStarted={(action) => { setCurrentPage("auth"); setMode(action); }} />
          ) : null}

          {showAuth ? (
            <section className="main-content">
              <section className="hero card">
                <p className="kicker">
                  <i className="fas fa-rocket"></i> Freelancer Marketplace
                </p>
                <h1>{pageTitle}</h1>
                <p className="subtitle">
                  Discover local experts, close projects faster, and manage trust in one place.
                </p>

                <form className="auth-form" onSubmit={handleSubmit}>
                  {mode === "register" ? (
                    <label>
                      Full Name
                      <input
                        required
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                      />
                    </label>
                  ) : null}

                  <label>
                    Email
                    <input
                      required
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                    />
                  </label>

                  <label>
                    Password
                    <input
                      required
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="At least 6 characters"
                      minLength={6}
                    />
                  </label>

                  {mode === "register" ? (
                    <label>
                      Role
                      <select name="role" value={form.role} onChange={handleChange}>
                        <option value="client">
                          <i className="fas fa-user-tie"></i> Client
                        </option>
                        <option value="freelancer">
                          <i className="fas fa-code"></i> Freelancer
                        </option>
                        <option value="admin">
                          <i className="fas fa-shield-alt"></i> Admin
                        </option>
                      </select>
                    </label>
                  ) : null}

                  <button className="btn btn-primary btn-lg" type="submit" disabled={submitting} style={{ width: "100%" }}>
                    {submitting ? <><i className="fas fa-spinner fa-spin"></i> Please wait...</> : mode === "login" ? <><i className="fas fa-sign-in-alt"></i> Login</> : <><i className="fas fa-user-plus"></i> Create account</>}
                  </button>

                  <button className="btn btn-outline" type="button" onClick={toggleMode} style={{ width: "100%" }}>
                    {mode === "login"
                      ? "Need an account? Register"
                      : "Already registered? Login"}
                  </button>
                </form>

                {loading ? <p className="status status-info"><i className="fas fa-spinner fa-spin"></i> Checking session...</p> : null}
                {message ? <p className="status status-success"><i className="fas fa-check-circle"></i> {message}</p> : null}
                {error ? <p className="status status-error"><i className="fas fa-exclamation-circle"></i> {error}</p> : null}
              </section>
            </section>
          ) : null}

          {showDashboard ? (
            <>
              <aside className="sidebar">
                <div className="sidebar-user card">
                  <div className="avatar">{initials}</div>
                  <h2>{user.name}</h2>
                  <span className="role-tag">{user.role}</span>
                </div>
                <div className="sidebar-menu">
                  {sidebarItems.map((item) => (
                    <button
                      type="button"
                      className={dashboardSection === item.section ? "active" : ""}
                      key={item.section}
                      onClick={() => handleSidebarNavigation(item.section)}
                    >
                      <i className={item.icon}></i> {item.label}
                    </button>
                  ))}
                </div>
              </aside>

              <section className="main-content dashboard-surface">
                  {user.role === "client" ? (
                    <ClientDashboard user={user} activeSection={dashboardSection} onLogout={handleDashboardLogout} />
                  ) : user.role === "freelancer" ? (
                    <FreelancerDashboard user={user} activeSection={dashboardSection} onLogout={handleDashboardLogout} />
                  ) : user.role === "admin" ? (
                    <AdminDashboard user={user} activeSection={dashboardSection} />
                  ) : (
                    <div className="user-card">
                      <h2>Unknown Role</h2>
                      <p>Your account has an unrecognized role. Please contact support.</p>
                      <button className="btn btn-outline" onClick={handleLogout}>
                        Logout
                      </button>
                    </div>
                  )}
              </section>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}

export default App;
