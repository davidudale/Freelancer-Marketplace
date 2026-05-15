import { useState } from "react";

function LandingPage({ onGetStarted }) {
  const [hoverCard, setHoverCard] = useState(null);

  const features = [
    {
      icon: "fas fa-search",
      title: "Find Top Talent",
      description: "Browse verified freelancers across hundreds of categories. Filter by skill, location, and availability to find the perfect match.",
      color: "var(--brand)",
    },
    {
      icon: "fas fa-handshake",
      title: "Secure Bookings",
      description: "Request bookings with detailed briefs. Providers submit quotes so you can compare pricing and choose the best fit.",
      color: "var(--purple)",
    },
    {
      icon: "fas fa-shield-alt",
      title: "Trusted Payments",
      description: "Built-in escrow and milestone payments ensure both parties are protected throughout every project.",
      color: "var(--accent)",
    },
    {
      icon: "fas fa-comments",
      title: "Real-time Messaging",
      description: "Communicate directly with freelancers, share files, and track progress all in one place.",
      color: "var(--blue)",
    },
    {
      icon: "fas fa-chart-line",
      title: "Transparent Analytics",
      description: "Track project timelines, budgets, and freelancer ratings to make informed decisions for future projects.",
      color: "var(--success)",
    },
    {
      icon: "fas fa-star",
      title: "Rating & Reviews",
      description: "Leave and read verified reviews to build trust and maintain quality standards across the platform.",
      color: "#ec4899",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Create Your Account",
      description: "Sign up as a client or freelancer in seconds. Choose your role and get started immediately.",
    },
    {
      number: "02",
      title: "Post or Find Work",
      description: "Clients post projects and freelancers browse opportunities. Match the right talent to every task.",
    },
    {
      number: "03",
      title: "Collaborate & Deliver",
      description: "Work together through milestones, exchange files, and communicate seamlessly until delivery.",
    },
    {
      number: "04",
      title: "Get Paid Securely",
      description: "Payments are held in escrow and released when both parties confirm satisfactory delivery.",
    },
  ];

  return (
    <div className="landing-page ">
      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-bg">
          <div className="hero-circle hero-circle-1" />
          <div className="hero-circle hero-circle-2" />
          <div className="hero-circle hero-circle-3" />
        </div>
        <div className="landing-hero-content">
          <p className="kicker">
            <i className="fas fa-rocket"></i> Freelancer Marketplace
          </p>
          <h1>
            Your Next Great Project<br />Starts <span className="gradient-text">Here</span>
          </h1>
          <p className="subtitle landing-subtitle">
            Connect with skilled freelancers to get work done — fast, affordably, and with confidence.
            Whether you need a logo, a website, or a full product, find the right talent in minutes.
          </p>
          <div className="landing-hero-actions">
            <button className="btn btn-primary btn-lg" onClick={() => onGetStarted("register")}>
              <i className="fas fa-user-plus"></i> Get Started Free
            </button>
            <button className="btn btn-outline btn-lg" onClick={() => onGetStarted("login")}>
              <i className="fas fa-sign-in-alt"></i> Sign In
            </button>
          </div>
          <p className="landing-trust">
            <i className="fas fa-lock"></i> Free to join &nbsp;•&nbsp; No credit card required &nbsp;•&nbsp; Cancel anytime
          </p>
        </div>
        <div className="landing-hero-visual">
          <div className="hero-dashboard-mock">
            <div className="mock-topbar">
              <span className="mock-dot mock-dot-red" />
              <span className="mock-dot mock-dot-yellow" />
              <span className="mock-dot mock-dot-green" />
              <span className="mock-url">freelancer-marketplace.com</span>
            </div>
            <div className="mock-body">
              <div className="mock-sidebar">
                <div className="mock-logo">⚡ Marketplace</div>
                <div className="mock-nav-item active">Dashboard</div>
                <div className="mock-nav-item">Explore</div>
                <div className="mock-nav-item">My Bookings</div>
                <div className="mock-nav-item">Messages</div>
              </div>
              <div className="mock-content">
                <div className="mock-welcome">
                  <div className="mock-avatar" />
                  <div>
                    <div className="mock-line mock-line-short" />
                    <div className="mock-line mock-line-tiny" />
                  </div>
                </div>
                <div className="mock-cards-row">
                  <div className="mock-card" />
                  <div className="mock-card" />
                  <div className="mock-card" />
                </div>
                <div className="mock-line mock-line-full" />
                <div className="mock-line mock-line-full" style={{ width: "80%" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="landing-section">
        <div className="section-header" style={{ marginBottom: "2.5rem" }}>
          <h2><i className="fas fa-magic" style={{ color: "var(--brand)" }}></i> How It Works</h2>
          <div className="line"></div>
        </div>
        <p className="section-subtitle" style={{ textAlign: "center", maxWidth: "650px", margin: "0 auto 3rem" }}>
          From posting a project to final delivery, the process is simple and transparent.
        </p>
        <div className="steps-grid">
          {steps.map((step, i) => (
            <div className="step-card" key={i}>
              <div className="step-number">{step.number}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              {i < steps.length - 1 && <div className="step-arrow"><i className="fas fa-arrow-right" /></div>}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="landing-section landing-section-alt">
        <div className="section-header" style={{ marginBottom: "1rem" }}>
          <h2><i className="fas fa-sparkles" style={{ color: "var(--accent)" }}></i> Why Choose Us</h2>
          <div className="line"></div>
        </div>
        <p className="section-subtitle" style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 2.5rem" }}>
          Built for speed, trust, and quality at every step.
        </p>
        <div className="features-grid">
          {features.map((feature, i) => (
            <div
              className="feature-card card"
              key={i}
              onMouseEnter={() => setHoverCard(i)}
              onMouseLeave={() => setHoverCard(null)}
              style={{
                transform: hoverCard === i ? "translateY(-6px)" : "translateY(0)",
                boxShadow: hoverCard === i ? "0 12px 35px rgba(0,0,0,0.12)" : "var(--shadow-sm)",
                borderTop: `3px solid ${feature.color}`,
              }}
            >
              <div className="feature-icon" style={{ background: `${feature.color}15`, color: feature.color }}>
                <i className={feature.icon} />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className="landing-section">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">12,000+</div>
            <div className="stat-label">Freelancers</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">5,400+</div>
            <div className="stat-label">Clients</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">8,200+</div>
            <div className="stat-label">Projects Completed</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">98%</div>
            <div className="stat-label">Satisfaction Rate</div>
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="landing-cta">
        <div className="landing-cta-content">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of clients and freelancers already building great things together.</p>
          <div className="landing-hero-actions">
            <button className="btn btn-primary btn-lg" onClick={() => onGetStarted("register")}>
              <i className="fas fa-rocket"></i> Start for Free
            </button>
            <button className="btn btn-outline btn-lg" onClick={() => onGetStarted("login")}>
              <i className="fas fa-sign-in-alt"></i> Sign In
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;