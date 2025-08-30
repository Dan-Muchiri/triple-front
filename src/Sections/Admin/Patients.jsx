// src/components/Admin/Patients.jsx
import React, { useState } from "react";
import styles from "../Receptionist/ReceptionistStyles.module.css";

export default function Patients({
  patients,
  setSelectedVisit,
  setActiveView,
}) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

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

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentPatients = filteredPatients.slice(
    startIndex,
    startIndex + pageSize
  );

  return (
    <div className={`${styles.sectionBox} ${styles.flexOne}`}>
      <h2 className={styles.sectionTitle}>Patients</h2>
      <input
        type="text"
        placeholder="Search by name, email, National ID, or phone"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
        className={styles.searchInput}
      />

      <ul className={styles.patientListGrid}>
        {currentPatients.length === 0 ? (
          <li className={styles.emptyMsg}>No patients found.</li>
        ) : (
          currentPatients.map((patient) => (
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
                {/* ✅ Admin: ONLY Past Visits */}
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
    </div>
  );
}
