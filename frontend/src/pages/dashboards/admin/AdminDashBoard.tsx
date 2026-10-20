import { useState } from "react"; // 💡 1. MUST IMPORT useState
import { useNavigate } from "react-router-dom";
import styles from "./AdminDashBoard.module.css";
import { AddAccommodationModal } from "../../../components/modals/add accomodation modal/AddAccommodationModal"; // 💡 

const AdminDashboard = () => {
  const navigate = useNavigate();
  

  const [isModalOpen, setIsModalOpen] = useState(false);

  const managementItems = [
    {
      title: "Accommodations",
      description: "Add, edit, and manage lodge listings.",
      action: "Manage stays",
      route: "/admin/accommodations",
      icon: "⌂",
    },
    {
      title: "Rooms",
      description: "Manage room types, prices, and availability.",
      action: "Manage rooms",
      route: "/admin/rooms",
      icon: "▦",
    },
    {
      title: "Bookings",
      description: "Review reservations and booking statuses.",
      action: "View bookings",
      route: "/admin/bookings",
      icon: "▣",
    },
    {
      title: "Users",
      description: "View customer accounts and details.",
      action: "View customers",
      route: "/admin/users",
      icon: "♙",
    },
  ];

  return (
    <div className={styles.adminLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>WildHaven</div>
        <span className={styles.adminLabel}>ADMINISTRATION</span>

        <nav className={styles.nav}>
          <a href="#overview" className={styles.active}>
            <span>⌂</span> Overview
          </a>
          <a href="#management">
            <span>▦</span> Management
          </a>
          <a href="/admin/bookings">
            <span>▣</span> Reservations
          </a>
          <a href="/admin/users">
            <span>♙</span> Customers
          </a>
        </nav>

        <button
          className={styles.backButton}
          onClick={() => navigate("/")}
        >
          ← View website
        </button>
      </aside>

      <main className={styles.main} id="overview">
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>BUSINESS OVERVIEW</span>
            <h1>Admin dashboard</h1>
            <p>Manage your accommodations and reservations.</p>
          </div>

          <span className={styles.adminBadge}>Administrator</span>
        </header>

        <section className={styles.notice}>
          <div>
            <strong>Welcome to your management workspace</strong>
            <p>Monitor your hotel operations and manage your accommodation listings from one place.</p>
          </div>
          <span className={styles.noticeIcon}>✦</span>
        </section>

        <section className={styles.metrics}>
          {/* ... keeping metrics metrics standard ... */}
          <article className={styles.metricCard}>
            <span>Active accommodations</span>
            <strong>—</strong>
            <small>Connect accommodations API</small>
          </article>
          {/* ... rest of your standard metric cards ... */}
        </section>

        <section className={styles.management} id="management">
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>OPERATIONS</span>
              <h2>Management centre</h2>
            </div>

          </div>

          <div className={styles.managementGrid}>
            {managementItems.map((item) => (
              <article className={styles.managementCard} key={item.title}>
                <span className={styles.cardIcon}>{item.icon}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>

                <button
                  onClick={() => navigate(item.route)}
                  className={styles.cardButton}
                >
                  {item.action} →
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* 💡 5. PLACE THE MODAL RIGHT HERE AT THE BOTTOM OF THE LAYOUT */}
      <AddAccommodationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default AdminDashboard;
