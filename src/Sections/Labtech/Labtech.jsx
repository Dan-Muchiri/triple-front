import React, { useState, useEffect, useCallback } from "react";
import styles from "./LabtechStyles.module.css";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import useAuthStore from "../AuthStore/Authstore";
import { FaBars } from "react-icons/fa";
import PatientInfo from "../Doctor/PatientInfo";
import LabPastVisits from "./PastLabVisits";

function LabTech() {
  const [visits, setVisits] = useState([]);
  const [pastLabVisits, setPastLabVisits] = useState([]);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [testRequests, setTestRequests] = useState([]);
  const [selectedTestRequest, setSelectedTestRequest] = useState(null);
  const [activeView, setActiveView] = useState("waitingLab");
  const [serverError, setServerError] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const userRole = useAuthStore((state) => state.userRole);
  const userId = useAuthStore((state) => state.userId);

  useEffect(() => {
    if (!isLoggedIn || userRole !== "lab_tech") {
      navigate("/");
    }
  }, [isLoggedIn, userRole, navigate]);

  const fetchVisits = useCallback(async () => {
    try {
      const res = await fetch("https://server.tripletsmediclinic.co.ke/visits");
      const data = await res.json();

      // Waiting lab patients
      setVisits(data.filter((v) => v.stage === "waiting_lab"));

      // ✅ Past lab visits (has lab test requests and not waiting_lab anymore)
      const pastLabs = data.filter((v) => {
        const allTests = [
          ...(v.test_requests || []),
          ...(v.direct_test_requests || []),
        ];
        return allTests.some((t) => t.category === "lab");
      });
      setPastLabVisits(pastLabs);
    } catch (err) {
      console.error("Failed to fetch visits:", err);
    }
  }, []);

  useEffect(() => {
    fetchVisits();
    const intervalId = setInterval(fetchVisits, 5000);
    return () => clearInterval(intervalId);
  }, [fetchVisits]);

  const fetchTestRequests = async (visitId) => {
    try {
      const res = await fetch(`https://server.tripletsmediclinic.co.ke/visits/${visitId}`);
      const data = await res.json();

      if (data) {
        // merge normal and direct test requests
        const allTests = [
          ...(data.test_requests || []),
          ...(data.direct_test_requests || []),
        ];

        // only keep lab category tests
        const labTests = allTests.filter((t) => t.category === "lab");

        setTestRequests(labTests);
      } else {
        setTestRequests([]);
      }
    } catch (err) {
      console.error("Failed to fetch test requests:", err);
    }
  };

  const handleCompleteVisit = async () => {
    try {
      setIsSubmitting(true);
      // 1. Fetch the full visit with all its test requests + consultation info
      const res = await fetch(
        `https://server.tripletsmediclinic.co.ke/visits/${selectedVisit.id}`
      );
      const visitData = await res.json();

      let nextStage = "reception"; // default fallback

      // Merge test_requests + direct_test_requests
      const allTests = [
        ...(visitData.test_requests || []),
        ...(visitData.direct_test_requests || []),
      ];

      // 2. Check if there are pending imaging test requests
      const pendingImaging = allTests.some(
        (t) => t.category === "imaging" && t.status === "pending"
      );

      if (pendingImaging) {
        nextStage = "waiting_imaging";
      } else if (!visitData.consultation) {
        // 3. No consultation yet
        nextStage = "reception";
      } else {
        // 4. Consultation exists
        nextStage = "waiting_consultation";
      }

      // 5. Update visit stage
      const updateRes = await fetch(
        `https://server.tripletsmediclinic.co.ke/visits/${selectedVisit.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stage: nextStage }),
        }
      );

      if (!updateRes.ok) {
        throw new Error("Failed to update visit stage");
      }

      alert(`Visit updated to ${nextStage.replace("_", " ")}.`);
      setActiveView("waitingLab");
    } catch (error) {
      console.error("Error updating visit:", error);
      alert("Failed to update visit stage.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewTests = (visit) => {
    setSelectedVisit(visit);
    fetchTestRequests(visit.id);
    setActiveView("testRequests");
  };

  const handleEditTest = (test) => {
    setSelectedTestRequest(test);
    setActiveView("editTestRequest");
    formik.setValues({
      test_type: test.test_type || "",
      results: test.results || "",
      notes: test.notes || "",
      status: test.status || "",
    });
  };

  const formik = useFormik({
    initialValues: {
      test_type: "",
      results: "",
      notes: "",
      status: "",
    },
    validationSchema: Yup.object({
      test_type: Yup.string().required("Required"),
      results: Yup.string(),
      notes: Yup.string(),
      status: Yup.string().required("Required"),
    }),
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        const res = await fetch(
          `https://server.tripletsmediclinic.co.ke/test_requests/${selectedTestRequest.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...values,
              technician_id: userId, // same style as nurse_id example
            }),
          }
        );
        if (!res.ok) {
          const errData = await res.json();
          setServerError(errData.error || "Failed to update test request");
          return;
        }
        await fetchTestRequests(selectedVisit.id);
        setActiveView("testRequests");
        setSelectedTestRequest(null);
      } catch (err) {
        console.error("Error updating test request:", err);
        setServerError(err.message);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const renderView = () => {
    switch (activeView) {
      case "pastLabVisits":
        return (
          <LabPastVisits
            pastLabVisits={pastLabVisits}
            onViewPatientInfo={(visit) => {
              setSelectedVisit(visit);
              setActiveView("patientInfo");
            }}
          />
        );

      case "patientInfo":
        return (
          <PatientInfo
            visitData={selectedVisit}
            onBack={() => setActiveView("waitingLab")}
          />
        );
      case "testRequests":
        return (
          <div className={styles.sectionBox}>
            <h2 className={styles.sectionTitle}>
              Test Requests for {selectedVisit?.patient.first_name}{" "}
              {selectedVisit?.patient.last_name}
            </h2>
            {testRequests.length === 0 ? (
              <p>No test requests for this visit.</p>
            ) : (
              <ul className={styles.testList}>
                {testRequests.map((test) => (
                  <li key={test.id} className={styles.testCard}>
                    <div>
                      <strong>Test Type:</strong> {test.test_type}
                    </div>
                    <div>
                      <strong>Category:</strong> {test.category}
                    </div>
                    <div>
                      <strong>Status:</strong>{" "}
                      <span
                        style={{
                          color:
                            test.status.toLowerCase() === "pending"
                              ? "red"
                              : "inherit",
                        }}
                      >
                        {test.status}
                      </span>
                    </div>

                    <div>
                      <strong>Notes:</strong> {test.notes}
                    </div>
                    <div>
                      <strong>Results:</strong>{" "}
                      <span
                        style={{
                          color: !test.results ? "red" : "inherit",
                        }}
                      >
                        {test.results || "Not entered yet"}
                      </span>
                    </div>
                    <div>
                      <strong>Created At:</strong>{" "}
                      {new Date(test.created_at).toLocaleString()}
                    </div>
                    {test.payment && (
                      <div>
                        <strong>Payment:</strong> {test.payment.amount} Ksh
                      </div>
                    )}
                    <button
                      className={styles.btn}
                      onClick={() => handleEditTest(test)}
                    >
                      Edit
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className={styles.buttonGroup}>
              <button
                className={`${styles.btn} ${styles.completeBtn}`}
                onClick={handleCompleteVisit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Completing..." : "Complete"}
              </button>
              <button
                className={`${styles.btn} ${styles.cancelBtn}`}
                onClick={() => setActiveView("waitingLab")}
              >
                Back
              </button>
            </div>
          </div>
        );

      case "editTestRequest":
        return (
          <form onSubmit={formik.handleSubmit} className={styles.sectionBox}>
            <h2 className={styles.sectionTitle}>Edit Test Request</h2>
            <div className={styles.formGroup}>
              <label>Test Type</label>
              <input
                type="text"
                name="test_type"
                value={formik.values.test_type}
                onChange={formik.handleChange}
                className={styles.input}
              />
              {formik.errors.test_type && (
                <div className={styles.error}>{formik.errors.test_type}</div>
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
                <option value="completed">Completed</option>
              </select>
              {formik.errors.status && (
                <div className={styles.error}>{formik.errors.status}</div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Results</label>
              <textarea
                name="results"
                value={formik.values.results}
                onChange={formik.handleChange}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Notes</label>
              <textarea
                name="notes"
                value={formik.values.notes}
                onChange={formik.handleChange}
                className={styles.input}
              />
            </div>

            {serverError && <div className={styles.error}>{serverError}</div>}

            <div className={styles.buttonGroup}>
              <button
                type="submit"
                className={styles.btn}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.cancelBtn}`}
                onClick={() => setActiveView("testRequests")}
              >
                Cancel
              </button>
            </div>
          </form>
        );

      case "waitingLab":
      default:
        return (
          <div className={styles.sectionBox}>
            <h2 className={styles.sectionTitle}>Waiting Lab</h2>
            <ul className={styles.patientList}>
              {visits.length === 0 ? (
                <li className={styles.emptyMsg}>
                  No patients waiting for lab.
                </li>
              ) : (
                visits.map((visit) => (
                  <li key={visit.id} className={styles.patientCard}>
                    <div>
                      {visit.patient.first_name} {visit.patient.last_name} (
                      {visit.patient.age} yrs) (OP No: {visit.patient.id})
                    </div>
                    <div>
                      Created: {new Date(visit.created_at).toLocaleString()}
                    </div>
                    <div className={styles.buttonGroup}>
                      <button
                        className={styles.btn}
                        onClick={() => handleViewTests(visit)}
                      >
                        View Test Requests
                      </button>
                      <button
                        className={styles.btn}
                        onClick={() => {
                          setSelectedVisit(visit);
                          setActiveView("patientInfo"); // ✅ add this view like in Doctor.jsx
                        }}
                      >
                        Patient Info
                      </button>
                    </div>
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
        <h2 className={styles.sidebarTitle}>Lab Tech</h2>
        <nav
          className={`${styles.navMenu} ${isMenuOpen ? styles.showMenu : ""}`}
        >
          <button
            className={`${styles.navBtn} ${
              activeView === "waitingLab" ? styles.active : ""
            }`}
            onClick={() => {
              setActiveView("waitingLab");
              setSelectedVisit(null);
              setServerError("");
              setIsMenuOpen(false); // close menu after click
            }}
          >
            Waiting Lab
          </button>
          <button
            className={`${styles.navBtn} ${
              activeView === "pastLabVisits" ? styles.active : ""
            }`}
            onClick={() => {
              setActiveView("pastLabVisits");
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

export default LabTech;
