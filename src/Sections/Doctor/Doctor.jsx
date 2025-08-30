import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../AuthStore/Authstore";
import styles from "./DoctorStyles.module.css";
import ConsultationForm from "./ConsultationForm";
import PatientInfo from "./PatientInfo"; // ✅ Import new component
import ConsultedPatients from "./Patients";
import { FaBars } from "react-icons/fa";

function Doctor() {
  const [visits, setVisits] = useState([]);
  const [consultedVisits, setConsultedVisits] = useState([]);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [activeView, setActiveView] = useState("waitingConsultation");
  const [consultationId, setConsultationId] = useState(null);
  const [serverError, setServerError] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const userRole = useAuthStore((state) => state.userRole);
  const userId = useAuthStore((state) => state.userId);

  useEffect(() => {
    if (!isLoggedIn || userRole !== "doctor") {
      navigate("/");
    }
  }, [isLoggedIn, userRole, navigate]);

  const fetchVisits = useCallback(async () => {
    try {
      const res = await fetch("https://server.tripletsmediclinic.co.ke/visits");
      const data = await res.json();
      const assigned = data.filter((v) => v.stage === "waiting_consultation");

      const consulted = data.filter((v) => v.consultation);
      setVisits(assigned);
      setConsultedVisits(consulted);
    } catch (err) {
      console.error("Failed to fetch visits:", err);
    }
  }, [userId]);

  useEffect(() => {
    fetchVisits();
    const intervalId = setInterval(fetchVisits, 5000);
    return () => clearInterval(intervalId);
  }, [fetchVisits]);

  const handleViewPatientInfo = (visit) => {
    setSelectedVisit(visit);
    setActiveView("patientInfo");
  };

  const handleStartOrEditConsultation = async (visit) => {
    try {
      if (visit.consultation) {
        setConsultationId(visit.consultation.id);
        setSelectedVisit(visit);
        setActiveView("consultation");
        setServerError("");
      } else {
        const res = await fetch("https://server.tripletsmediclinic.co.ke/consultations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            visit_id: visit.id,
            patient_id: visit.patient_id,
            doctor_id: userId,
          }),
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || "Failed to start consultation");

        setConsultationId(data.id);
        setSelectedVisit(visit);
        setActiveView("consultation");
        setServerError("");
      }
    } catch (err) {
      console.error(err);
      setServerError(err.message);
    }
  };

  const renderView = () => {
    switch (activeView) {
      case "consultedPatients":
        return (
          <ConsultedPatients
            consultedVisits={consultedVisits}
            onViewPatientInfo={handleViewPatientInfo}
          />
        );

      case "patientInfo":
        return (
          <PatientInfo
            visitData={selectedVisit}
            onBack={() => setActiveView("waitingConsultation")}
          />
        );
      case "consultation":
        return (
          <ConsultationForm
            doctorId={userId}
            visit={selectedVisit}
            consultationId={consultationId}
            setConsultationId={setConsultationId}
            setActiveView={setActiveView}
          />
        );
      case "waitingConsultation":
      default:
        return (
          <div className={styles.sectionBox}>
            <h2 className={styles.sectionTitle}>Waiting Consultation</h2>
            <div className={styles.visitsList}>
              {visits.length === 0 ? (
                <div className={styles.emptyMsg}>
                  No patients waiting for consultation.
                </div>
              ) : (
                visits.map((visit) => (
                  <div key={visit.id} className={styles.patientCard}>
                    <div className={styles.patientCardHeader}>
                      <strong>
                        {visit.patient?.first_name} {visit.patient?.last_name} (
                        {visit.patient?.age} yrs)
                      </strong>{" "}
                      - OP No: {visit.patient?.id}
                    </div>

                    <div className={styles.patientCardBody}>
                      <p>
                        Created: {new Date(visit.created_at).toLocaleString()}
                      </p>
                      {/* ✅ Stage Selection (like in Receptionist) */}
                      <div className={styles.stageControl}>
                        <label>Stage:</label>
                        <select
                          value={visit.stage}
                          onChange={async (e) => {
                            const newStage = e.target.value;
                            try {
                              const res = await fetch(
                                `https://server.tripletsmediclinic.co.ke/visits/${visit.id}`,
                                {
                                  method: "PATCH",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({ stage: newStage }),
                                }
                              );
                              if (!res.ok)
                                throw new Error("Failed to update stage");
                              await fetchVisits(); // refresh after update
                            } catch (err) {
                              console.error("Stage update failed:", err);
                            }
                          }}
                        >
                          <option value="waiting_consultation">
                            Waiting Consultation
                          </option>
                          <option value="reception">Reception</option>
                          <option value="waiting_pharmacy">Pharmacy</option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.buttonGroup}>
                      <button
                        className={styles.btn}
                        onClick={() => handleViewPatientInfo(visit)}
                      >
                        Patient Info
                      </button>
                      <button
                        className={styles.btn}
                        onClick={() => handleStartOrEditConsultation(visit)}
                      >
                        {visit.consultation
                          ? "Edit Consultation"
                          : "Start Consultation"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className={styles.dashboardWrapper}>
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>Doctor</h2>
        <nav
          className={`${styles.navMenu} ${isMenuOpen ? styles.showMenu : ""}`}
        >
          <button
            className={`${styles.navBtn} ${
              activeView === "waitingConsultation" ? styles.active : ""
            }`}
            onClick={() => {
              setActiveView("waitingConsultation");
              setSelectedVisit(null);
              setServerError("");
              setIsMenuOpen(false);
            }}
          >
            Waiting Consultation
          </button>
          <button
            className={`${styles.navBtn} ${
              activeView === "consultedPatients" ? styles.active : ""
            }`}
            onClick={() => {
              setActiveView("consultedPatients");
              setSelectedVisit(null);
              setServerError("");
              setIsMenuOpen(false);
            }}
          >
            Past Visits
          </button>
          {/* Mobile Logout */}
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
        <button
          className={`${styles.logoutBtn} ${styles.desktopLogout}`}
          onClick={() => logout(navigate)}
        >
          Logout
        </button>

        {/* Hamburger icon for mobile */}
        <button
          className={styles.hamburgerBtn}
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          <FaBars />
        </button>
      </aside>

      <main className={styles.mainContent}>{renderView()}</main>
    </div>
  );
}

export default Doctor;
