import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaBars } from "react-icons/fa"; // 👈 add react-icons for hamburger
import styles from "./ReceptionistStyles.module.css";
import useAuthStore from "../AuthStore/Authstore";
import RegisterPatient from "./RegisterPatient";
import SearchPatients from "./SearchPatients";
import OngoingVisits from "./OngoingVisits";
import AddPayment from "./AddPayment";

export default function Receptionist() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const [patients, setPatients] = useState([]);
  const [visits, setVisits] = useState([]);
  const [activeView, setActiveView] = useState("visits");
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [paymentTarget, setPaymentTarget] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // 👈 toggle for mobile menu

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const userRole = useAuthStore((state) => state.userRole);

  useEffect(() => {
    if (!isLoggedIn || userRole !== "receptionist") {
      navigate("/");
    }
  }, [isLoggedIn, userRole, navigate]);

  const fetchPatients = useCallback(async () => {
    try {
      const res = await fetch("https://tripletsmediclinic.onrender.com/patients");
      if (!res.ok) throw new Error("Failed to fetch patients");
      const data = await res.json();
      setPatients(data);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  }, []);

  const fetchVisits = useCallback(async () => {
    try {
      const res = await fetch("https://tripletsmediclinic.onrender.com/visits");
      if (!res.ok) throw new Error("Failed to fetch visits");
      const data = await res.json();
      setVisits(data);
    } catch (error) {
      console.error("Error fetching visits:", error);
    }
  }, []);

  const startVisit = async (patientId) => {
    try {
      const res = await fetch("https://tripletsmediclinic.onrender.com/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient_id: patientId }),
      });
      if (!res.ok) throw new Error("Failed to start visit");
      const data = await res.json();
      setSelectedVisit(data.visit);
      await fetchVisits();
      setPaymentTarget({ type: "consultation" });
      setActiveView("addPayment");
    } catch (err) {
      console.error("Start visit error:", err);
    }
  };

  const handlePay = (type, itemId, visit) => {
    setSelectedVisit(visit);
    setPaymentTarget({ type, id: itemId });
    setActiveView("addPayment");
  };

  useEffect(() => {
    fetchPatients();
    fetchVisits();
  }, [fetchPatients, fetchVisits]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchPatients();
      fetchVisits();
    }, 5000);
    return () => clearInterval(intervalId);
  }, [fetchPatients, fetchVisits]);

  const renderView = () => {
    switch (activeView) {
      case "register":
        return (
          <RegisterPatient
            fetchPatients={fetchPatients}
            setActiveView={setActiveView}
          />
        );
      case "addPayment":
        return (
          <AddPayment
            visit={selectedVisit}
            setActiveView={setActiveView}
            paymentTarget={paymentTarget}
          />
        );
      case "search":
        return (
          <SearchPatients
            fetchPatients={fetchPatients}
            patients={patients}
            visits={visits}
            setSelectedVisit={setSelectedVisit}
            setActiveView={setActiveView}
            startVisit={startVisit}
          />
        );
      case "visits":
      default:
        return (
          <OngoingVisits
            visits={visits}
            fetchVisits={fetchVisits}
            handlePay={handlePay}
          />
        );
    }
  };

  return (
    <div className={styles.dashboardWrapper}>
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>Reception</h2>

        {/* Hamburger icon for mobile */}
        <button
          className={styles.hamburgerBtn}
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          <FaBars />
        </button>

        {/* Nav menu - show/hide on mobile */}
        <nav
          className={`${styles.navMenu} ${isMenuOpen ? styles.showMenu : ""}`}
        >
          <button
            className={`${styles.navBtn} ${
              activeView === "visits" ? styles.active : ""
            }`}
            onClick={() => {
              setActiveView("visits");
              setIsMenuOpen(false);
            }}
          >
            Ongoing Visits
          </button>
          <button
            className={`${styles.navBtn} ${
              activeView === "search" ? styles.active : ""
            }`}
            onClick={() => {
              setActiveView("search");
              setIsMenuOpen(false);
            }}
          >
            Search
          </button>
          <button
            className={`${styles.navBtn} ${
              activeView === "register" ? styles.active : ""
            }`}
            onClick={() => {
              setActiveView("register");
              setIsMenuOpen(false);
            }}
          >
            Register
          </button>

          {/* Logout — visible only on mobile */}
          <button
            className={`${styles.logoutBtn} ${styles.mobileLogout}`}
            onClick={() => {
              logout(navigate);
              setIsMenuOpen(false);
            }}
          >
            Logout
          </button>
        </nav>

        {/* Logout — visible only on desktop */}
        <button
          className={`${styles.logoutBtn} ${styles.desktopLogout}`}
          onClick={() => logout(navigate)}
        >
          Logout
        </button>
      </aside>

      <main className={styles.mainContent}>{renderView()}</main>
    </div>
  );
}
