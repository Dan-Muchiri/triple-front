import React, { useState, useEffect, useCallback } from "react";
import styles from "./NurseStyles.module.css";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import useAuthStore from "../AuthStore/Authstore";
import { FaBars } from "react-icons/fa";

function Nurse() {
  const [visits, setVisits] = useState([]);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [activeView, setActiveView] = useState("waitingTriage");
  const [serverError, setServerError] = useState("");

  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const userRole = useAuthStore((state) => state.userRole);
  const userId = useAuthStore((state) => state.userId);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || userRole !== "nurse") {
      navigate("/");
    }
  }, [isLoggedIn, userRole, navigate]);

  const fetchVisits = useCallback(async () => {
    try {
      const res = await fetch("https://server.tripletsmediclinic.co.ke/visits");
      const data = await res.json();
      setVisits(data.filter((v) => v.stage === "waiting_triage"));
    } catch (err) {
      console.error("Failed to fetch visits:", err);
    }
  }, []);

  useEffect(() => {
    fetchVisits(); // initial fetch

    const intervalId = setInterval(() => {
      fetchVisits();
    }, 5000); // fetch every 5 seconds

    return () => clearInterval(intervalId); // cleanup
  }, [fetchVisits]);

  useEffect(() => {
    if (serverError) {
      const timeout = setTimeout(() => setServerError(""), 5000);
      return () => clearTimeout(timeout);
    }
  }, [serverError]);

  const handleTriageSelect = (visit) => {
    setSelectedVisit(visit);
    setActiveView("triageForm");
    setServerError("");
    formik.resetForm();
  };

  const formik = useFormik({
    initialValues: {
      temperature: "",
      weight: "",
      height: "",
      blood_pressure: "",
      pulse_rate: "",
      respiration_rate: "",
      spo2: "",
      notes: "",
    },
    validationSchema: Yup.object({
      temperature: Yup.number().required("Required"),
      weight: Yup.number().required("Required"),
      height: Yup.number().required("Required"),
      blood_pressure: Yup.string().required("Required"),
      pulse_rate: Yup.number().nullable(),
      respiration_rate: Yup.number().nullable(),
      spo2: Yup.number().nullable(),
      notes: Yup.string(),
    }),

    onSubmit: async (values, { resetForm }) => {
      try {
        const triageRes = await fetch("https://server.tripletsmediclinic.co.ke/triage_records", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...values,
            patient_id: selectedVisit.patient_id,
            visit_id: selectedVisit.id,
            nurse_id: userId,
          }),
        });

        if (!triageRes.ok) {
          const errorData = await triageRes.json();
          setServerError(errorData.error || "Failed to save triage");
          return;
        }

        const triage = await triageRes.json();

        await fetch(`https://server.tripletsmediclinic.co.ke/visits/${selectedVisit.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stage: "waiting_consultation",
            triage_id: triage.id,
          }),
        });

        resetForm();
        setSelectedVisit(null);
        setActiveView("waitingTriage");
        fetchVisits();
      } catch (err) {
        console.error("Error saving triage:", err);
        setServerError(err.message || "Unexpected error occurred");
      }
    },
  });

  const renderView = () => {
    switch (activeView) {
      case "triageForm":
        return (
          <form onSubmit={formik.handleSubmit} className={styles.sectionBox}>
            <h2 className={styles.sectionTitle}>Triage Form</h2>
            {selectedVisit ? (
              <>
                {[
                  { name: "temperature", type: "number", unit: "°C" },
                  { name: "weight", type: "number", unit: "kg" },
                  { name: "height", type: "number", unit: "cm" },
                  { name: "blood_pressure", type: "text", unit: "e.g. 120/80" },
                  { name: "pulse_rate", type: "number", unit: "bpm" },
                  {
                    name: "respiration_rate",
                    type: "number",
                    unit: "breaths/min",
                  },
                  { name: "spo2", type: "number", unit: "%" },
                  { name: "notes", type: "text", unit: "" },
                ].map(({ name, type, unit }) => (
                  <div key={name} className={styles.formGroup}>
                    <label>{`${name.replace("_", " ")} ${
                      unit ? `(${unit})` : ""
                    }`}</label>
                    <input
                      type={type}
                      name={name}
                      value={formik.values[name]}
                      onChange={formik.handleChange}
                      className={styles.input}
                    />
                    {formik.errors[name] && formik.touched[name] && (
                      <div className={styles.error}>{formik.errors[name]}</div>
                    )}
                  </div>
                ))}

                <div className={styles.buttonGroup}>
                  <button type="submit" className={styles.btn}>
                    Submit Triage
                  </button>
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.cancelBtn}`}
                    onClick={() => {
                      formik.resetForm();
                      setServerError("");
                      setSelectedVisit(null);
                      setActiveView("waitingTriage");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <p>Select a patient to begin triage.</p>
            )}
            {serverError && (
              <div className={styles.error} style={{ marginBottom: "1rem" }}>
                {serverError}
              </div>
            )}
          </form>
        );

      case "waitingTriage":
      default:
        return (
          <div className={styles.sectionBox}>
            <h2 className={styles.sectionTitle}>Waiting Triage</h2>
            <ul className={styles.patientList}>
              {visits.length === 0 ? (
                <li className={styles.emptyMsg}>
                  No patients waiting for triage.
                </li>
              ) : (
                visits.map((visit) => (
                  <li key={visit.id} className={styles.patientCard}>
                    <div>
                      {visit.patient.first_name} {visit.patient.last_name} (
                      {visit.patient.age} yrs)
                    </div>
                    <div>
                      Created: {new Date(visit.created_at).toLocaleString()}
                    </div>
                    <button
                      className={styles.btn}
                      onClick={() => handleTriageSelect(visit)}
                    >
                      Start Triage
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        );
    }
  };

  return (
    <div className={styles.dashboardWrapper}>
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>Nurse</h2>
        <nav
          className={`${styles.navMenu} ${isMenuOpen ? styles.showMenu : ""}`}
        >
          <button
            className={`${styles.navBtn} ${
              activeView === "waitingTriage" ? styles.active : ""
            }`}
            onClick={() => {
              setActiveView("waitingTriage");
              setSelectedVisit(null);
              setServerError("");
              setIsMenuOpen(false); // close menu after click
            }}
          >
            Waiting Triage
          </button>
          {/* Add more nav buttons if needed */}

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

export default Nurse;
