import React, { useState, useEffect, useCallback } from "react";
import styles from "../Labtech/LabtechStyles.module.css"; // you can reuse the same styles
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import useAuthStore from "../AuthStore/Authstore";
import { FaBars } from "react-icons/fa";
import Medicines from "./Medicines";

function Pharmacist() {
  const [visits, setVisits] = useState([]);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [activeView, setActiveView] = useState("waitingPharmacy");
  const [serverError, setServerError] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const userRole = useAuthStore((state) => state.userRole);
  const userId = useAuthStore((state) => state.userId);

  useEffect(() => {
    if (!isLoggedIn || userRole !== "pharmacist") {
      navigate("/");
    }
  }, [isLoggedIn, userRole, navigate]);

  const fetchVisits = useCallback(async () => {
    try {
      const res = await fetch("https://tripletsmediclinic.onrender.com/visits");
      const data = await res.json();
      setVisits(data.filter((v) => v.stage === "waiting_pharmacy"));
    } catch (err) {
      console.error("Failed to fetch visits:", err);
    }
  }, []);

  useEffect(() => {
    fetchVisits();
    const intervalId = setInterval(fetchVisits, 5000);
    return () => clearInterval(intervalId);
  }, [fetchVisits]);

  const fetchPrescriptions = async (visitId) => {
    try {
      const res = await fetch(`https://tripletsmediclinic.onrender.com/visits/${visitId}`);
      const data = await res.json();

      if (data && data.prescriptions) {
        setPrescriptions(data.prescriptions);
      } else {
        setPrescriptions([]);
      }
    } catch (err) {
      console.error("Failed to fetch prescriptions:", err);
    }
  };

  const handleViewPrescriptions = (visit) => {
    setSelectedVisit(visit);
    fetchPrescriptions(visit.id);
    setActiveView("prescriptions");
  };

  const handleEditPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setActiveView("editPrescription");
    formik.setValues({
      medication_name: prescription.medication_name || "",
      dosage: prescription.dosage || "",
      instructions: prescription.instructions || "",
      status: prescription.status || "",
      dispensed_units: prescription.dispensed_units || 0, // ✅ prefill
    });
  };

  const formik = useFormik({
    initialValues: {
      medication_name: "",
      dosage: "",
      instructions: "",
      status: "",
      dispensed_units: 0, // ✅ new field
    },
    validationSchema: Yup.object({
      medication_name: Yup.string().required("Required"),
      dosage: Yup.string().required("Required"),
      instructions: Yup.string(),
      status: Yup.string().required("Required"),
      dispensed_units: Yup.number()
        .min(0, "Cannot be negative")
        .required("Required"), // ✅ validate
    }),
    onSubmit: async (values) => {
      try {
        const res = await fetch(
          `https://tripletsmediclinic.onrender.com/prescriptions/${selectedPrescription.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...values,
              pharmacist_id: userId,
            }),
          }
        );
        if (!res.ok) {
          const errData = await res.json();
          setServerError(errData.error || "Failed to update prescription");
          return;
        }
        await fetchPrescriptions(selectedVisit.id);
        setActiveView("prescriptions");
        setSelectedPrescription(null);
      } catch (err) {
        console.error("Error updating prescription:", err);
        setServerError(err.message);
      }
    },
  });

  const renderView = () => {
    switch (activeView) {
      case "medicines":
        return <Medicines />;

      case "prescriptions":
        return (
          <div className={styles.sectionBox}>
            <h2 className={styles.sectionTitle}>
              Prescriptions for {selectedVisit?.patient.first_name}{" "}
              {selectedVisit?.patient.last_name}
            </h2>
            {prescriptions.length === 0 ? (
              <p>No prescriptions for this visit.</p>
            ) : (
              <ul className={styles.testList}>
                {prescriptions.map((p) => (
                  <li key={p.id} className={styles.testCard}>
                    <div>
                      <strong>Medication:</strong> {p.medication_name}
                    </div>
                    <div>
                      <strong>Dosage:</strong> {p.dosage}
                    </div>
                    <div>
                      <strong>Dispensed Units:</strong> {p.dispensed_units || 0}
                    </div>
                    <div>
                      <strong>Price:</strong> {p.price ? p.price.toFixed(2) : 0}{" "}
                      Ksh
                    </div>
                    <div>
                      <strong>Status:</strong>{" "}
                      <span
                        style={{
                          color:
                            p.status.toLowerCase() === "pending"
                              ? "red"
                              : "inherit",
                        }}
                      >
                        {p.status}
                      </span>
                    </div>
                    <div>
                      <strong>Instructions:</strong> {p.instructions}
                    </div>
                    <div>
                      <strong>Created At:</strong>{" "}
                      {new Date(p.created_at).toLocaleString()}
                    </div>
                    {p.payment && (
                      <div>
                        <strong>Payment:</strong> {p.payment.amount} Ksh
                      </div>
                    )}
                    <button
                      className={styles.btn}
                      onClick={() => handleEditPrescription(p)}
                    >
                      Edit
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className={styles.buttonGroup}>
              <button
                className={`${styles.btn} ${styles.cancelBtn}`}
                onClick={() => setActiveView("waitingPharmacy")}
              >
                Back
              </button>
            </div>
          </div>
        );

      case "editPrescription":
        return (
          <form onSubmit={formik.handleSubmit} className={styles.sectionBox}>
            <h2 className={styles.sectionTitle}>Edit Prescription</h2>
            <div className={styles.formGroup}>
              <label>Medication Name</label>
              <input
                type="text"
                name="medication_name"
                value={formik.values.medication_name}
                onChange={formik.handleChange}
                className={styles.input}
              />
              {formik.errors.medication_name && (
                <div className={styles.error}>
                  {formik.errors.medication_name}
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Dosage</label>
              <input
                type="text"
                name="dosage"
                value={formik.values.dosage}
                onChange={formik.handleChange}
                className={styles.input}
              />
              {formik.errors.dosage && (
                <div className={styles.error}>{formik.errors.dosage}</div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Status</label>
              <select
                name="status"
                value={formik.values.status}
                onChange={formik.handleChange}
                className={styles.input}
              >
                <option value="">Select status</option>
                <option value="pending">Pending</option>
                <option value="dispensed">Dispensed</option>
              </select>
              {formik.errors.status && (
                <div className={styles.error}>{formik.errors.status}</div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Instructions</label>
              <textarea
                name="instructions"
                value={formik.values.instructions}
                onChange={formik.handleChange}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Dispensed Units</label>
              <input
                type="number"
                name="dispensed_units"
                value={formik.values.dispensed_units}
                onChange={formik.handleChange}
                className={styles.input}
              />
              {formik.errors.dispensed_units && (
                <div className={styles.error}>
                  {formik.errors.dispensed_units}
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Price (Ksh)</label>
              <input
                type="number"
                value={
                  formik.values.dispensed_units *
                  (selectedPrescription?.selling_price || 0)
                }
                disabled
                className={styles.input}
              />
            </div>

            {serverError && <div className={styles.error}>{serverError}</div>}

            <div className={styles.buttonGroup}>
              <button type="submit" className={styles.btn}>
                Save
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.cancelBtn}`}
                onClick={() => setActiveView("prescriptions")}
              >
                Cancel
              </button>
            </div>
          </form>
        );

      case "waitingPharmacy":
      default:
        return (
          <div className={styles.sectionBox}>
            <h2 className={styles.sectionTitle}>Waiting Pharmacy</h2>
            <ul className={styles.patientList}>
              {visits.length === 0 ? (
                <li className={styles.emptyMsg}>
                  No patients waiting for pharmacy.
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

                    {/* ✅ Stage Selection */}
                    <div className={styles.stageControl}>
                      <label>Stage:</label>
                      <select
                        value={visit.stage}
                        onChange={async (e) => {
                          const newStage = e.target.value;
                          try {
                            const res = await fetch(
                              `https://tripletsmediclinic.onrender.com/visits/${visit.id}`,
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
                            await fetchVisits(); // refresh list
                          } catch (err) {
                            console.error("Stage update failed:", err);
                          }
                        }}
                      >
                        <option value="waiting_pharmacy">
                          Waiting Pharmacy
                        </option>
                        <option value="reception">Reception</option>
                        <option value="complete">Complete</option>
                      </select>
                    </div>

                    <button
                      className={styles.btn}
                      onClick={() => handleViewPrescriptions(visit)}
                    >
                      View Prescriptions
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
        <h2 className={styles.sidebarTitle}>Pharmacist</h2>
        <nav
          className={`${styles.navMenu} ${isMenuOpen ? styles.showMenu : ""}`}
        >
          <button
            className={`${styles.navBtn} ${
              activeView === "waitingPharmacy" ? styles.active : ""
            }`}
            onClick={() => {
              setActiveView("waitingPharmacy");
              setSelectedVisit(null);
              setServerError("");
              setIsMenuOpen(false);
            }}
          >
            Waiting Pharmacy
          </button>
          <button
            className={`${styles.navBtn} ${
              activeView === "medicines" ? styles.active : ""
            }`}
            onClick={() => {
              setActiveView("medicines");
              setSelectedVisit(null);
            }}
          >
            Medicines
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

export default Pharmacist;
