import React, { useState, useEffect } from "react";
import styles from "./ReceptionistStyles.module.css";

export default function SearchPatients({
  fetchPatients,
  patients,
  startVisit,
  setSelectedVisit, // ✅ add this
  setActiveView, // ✅ add this
}) {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [serverError, setServerError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    if (serverError) {
      const timeout = setTimeout(() => setServerError(""), 5000);
      return () => clearTimeout(timeout);
    }
  }, [serverError]);

  const filteredPatients = search
    ? patients.filter(
        (p) =>
          (p.national_id && p.national_id.includes(search)) ||
          (p.phone_number && p.phone_number.includes(search)) ||
          (p.email && p.email.toLowerCase().includes(search.toLowerCase())) ||
          (p.first_name &&
            p.first_name.toLowerCase().includes(search.toLowerCase())) ||
          (p.last_name &&
            p.last_name.toLowerCase().includes(search.toLowerCase()))
      )
    : patients
        .slice()
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Pagination calculations
  const totalPages = Math.ceil(filteredPatients.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentPatients = filteredPatients.slice(
    startIndex,
    startIndex + pageSize
  );

  return (
    <div className={`${styles.sectionBox} ${styles.flexOne}`}>
      <h2 className={styles.sectionTitle}>Search Patients</h2>
      <input
        type="text"
        placeholder="Search by name, email, National ID, or phone"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1); // reset pagination when searching
        }}
        className={styles.searchInput}
      />
      <ul className={styles.patientListGrid}>
        {currentPatients.length === 0 ? (
          <li className={styles.emptyMsg}>No patients found.</li>
        ) : (
          [...currentPatients]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .map((patient) => (
              <li key={patient.id} className={styles.patientCardGrid}>
                <div>
                  <strong>
                    {patient.first_name} {patient.last_name}
                  </strong>{" "}
                  ({patient.age} yrs) - OP No: {patient.id}
                </div>
                <div>
                  <em>Date Created:</em>{" "}
                  {patient.created_at
                    ? new Date(patient.created_at).toLocaleDateString()
                    : "N/A"}
                </div>
                <div className={styles.patientCardActions}>
                  <button
                    className={`${styles.btn} ${styles.infoBtn}`}
                    onClick={() => {
                      setSelectedPatient(patient);
                      setServerError("");
                      setShowModal(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => startVisit(patient.id)}
                    className={`${styles.btn} ${styles.visitBtn}`}
                  >
                    Start Visit
                  </button>
                  <button
                    className={`${styles.btn} ${styles.pastVisitsBtn}`}
                    onClick={() => {
                      if (patient.visits && patient.visits.length > 0) {
                        setSelectedVisit({
                          currentVisit: patient.visits[0],
                          patient: patient,
                        });
                        setActiveView("patientInfo");
                      } else {
                        alert("No past visits for this patient.");
                      }
                    }}
                  >
                    Past Visits
                  </button>
                </div>
              </li>
            ))
        )}
      </ul>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className={`${styles.pageBtn} ${
              currentPage === 1 ? styles.disabledBtn : ""
            }`}
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`${styles.pageNumber} ${styles.btn} ${
                currentPage === p ? styles.activePage : ""
              }`}
            >
              {p}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className={`${styles.pageBtn} ${
              currentPage === totalPages ? styles.disabledBtn : ""
            }`}
          >
            Next
          </button>
        </div>
      )}

      {showModal && selectedPatient && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Edit Patient Info</h2>

            <form
              className={styles.editForm}
              onSubmit={async (e) => {
                e.preventDefault();
                setServerError("");

                const updatedPatient = {
                  first_name: e.target.first_name.value,
                  last_name: e.target.last_name.value,
                  gender: e.target.gender.value,
                  dob: e.target.dob.value,
                  national_id: e.target.national_id.value,
                  phone_number: e.target.phone_number.value,
                  email: e.target.email.value,
                  next_of_kin_name: e.target.next_of_kin_name.value, // ✅ NEW
                  next_of_kin_phone: e.target.next_of_kin_phone.value,
                  location: e.target.location.value,
                };

                try {
                  const res = await fetch(
                    `https://server.tripletsmediclinic.co.ke/${selectedPatient.id}`,
                    {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(updatedPatient),
                    }
                  );

                  const data = await res.json();

                  if (!res.ok) {
                    let message = "Error updating patient.";
                    if (typeof data === "string") message = data;
                    else if (data.error) message = data.error;
                    else if (data.message) message = data.message;

                    setServerError(message);
                    return;
                  }

                  setShowModal(false);
                  setSelectedPatient(null);
                  fetchPatients();
                } catch (error) {
                  setServerError(error.message || "Unexpected error occurred");
                }
              }}
            >
              <div className={styles.formGrid}>
                {[
                  "first_name",
                  "last_name",
                  "gender",
                  "dob",
                  "national_id",
                  "phone_number",
                  "email",
                  "next_of_kin_name", // ✅ NEW
                  "next_of_kin_phone",
                  "location",
                ].map((field) => (
                  <div key={field} className={styles.formGroup}>
                    <label>{field.replaceAll("_", " ")}</label>
                    {field === "gender" ? (
                      <select
                        name="gender"
                        defaultValue={selectedPatient.gender}
                        className={styles.input}
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    ) : (
                      <input
                        name={field}
                        type={field === "dob" ? "date" : "text"}
                        defaultValue={selectedPatient[field] || ""}
                        className={styles.input}
                      />
                    )}
                  </div>
                ))}
              </div>

              {serverError && (
                <div className={styles.error} style={{ marginBottom: "1rem" }}>
                  {serverError}
                </div>
              )}

              <div className={styles.modalActions}>
                <div className={styles.buttonGroup}>
                  <button
                    type="submit"
                    className={`${styles.btn} ${styles.registerBtn}`}
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.cancelBtn}`}
                    onClick={() => {
                      setShowModal(false);
                      setSelectedPatient(null);
                      setServerError("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
