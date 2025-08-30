import React, { useState } from "react";
import styles from "./DoctorStyles.module.css";

function ConsultedPatients({ consultedVisits, onViewPatientInfo }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5; // patients per page

  // Sort visits by consultation.created_at (newest first)
  const sortedVisits = [...consultedVisits].sort((a, b) => {
    const dateA = new Date(a.consultation?.created_at || 0);
    const dateB = new Date(b.consultation?.created_at || 0);
    return dateB - dateA;
  });

  // Filter by patient name
  const filteredVisits = sortedVisits.filter((visit) => {
    const fullName =
      `${visit.patient.first_name} ${visit.patient.last_name}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredVisits.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentVisits = filteredVisits.slice(startIndex, startIndex + pageSize);

  return (
    <div className={styles.sectionBox}>
      <h2 className={styles.sectionTitle}>Past Patients</h2>

      {/* Search bar */}
      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // reset to first page when searching
          }}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.visitsList}>
        {currentVisits.length === 0 ? (
          <div className={styles.emptyMsg}>No patients match your search.</div>
        ) : (
          currentVisits.map((visit) => (
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
                  Consulted on:{" "}
                  {visit.consultation?.created_at
                    ? new Date(visit.consultation.created_at).toLocaleString()
                    : "N/A"}
                </p>
              </div>
              <div className={styles.buttonGroup}>
                <button
                  className={styles.btn}
                  onClick={() => onViewPatientInfo(visit)}
                >
                  Patient Info
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          {/* Prev button */}
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className={`${styles.pageBtn} ${
              currentPage === 1 ? styles.disabledBtn : ""
            }`}
          >
            Prev
          </button>

          {/* Page numbers */}
          {(() => {
            const maxVisible = 5; // how many numbers to show
            let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
            let end = Math.min(totalPages, start + maxVisible - 1);

            if (end - start + 1 < maxVisible) {
              start = Math.max(1, end - maxVisible + 1);
            }

            const pages = [];
            if (start > 1) pages.push(1, "..."); // show first page + ellipsis
            for (let i = start; i <= end; i++) {
              pages.push(i);
            }
            if (end < totalPages) pages.push("...", totalPages); // show last page + ellipsis

            return pages.map((p, idx) =>
              p === "..." ? (
                <span key={`dots-${idx}`} className={styles.ellipsis}>
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`${styles.pageNumber} ${styles.btn} ${
                    currentPage === p ? styles.activePage : ""
                  }`}
                >
                  {p}
                </button>
              )
            );
          })()}

          {/* Next button */}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className={`${styles.pageBtn} ${styles.btn} ${
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

export default ConsultedPatients;
