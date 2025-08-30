import React, { useState } from "react";
import styles from "./LabtechStyles.module.css";

function LabPastVisits({ pastLabVisits, onViewPatientInfo }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5; // patients per page

  // Sort latest first
  const sorted = [...pastLabVisits].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  // Filter by patient name
  const filtered = sorted.filter((visit) => {
    const fullName =
      `${visit.patient.first_name} ${visit.patient.last_name}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentVisits = filtered.slice(startIndex, startIndex + pageSize);

  return (
    <div className={styles.sectionBox}>
      <h2 className={styles.sectionTitle}>Past Lab Patients</h2>

      {/* Search bar */}
      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // reset page when searching
          }}
          className={styles.searchInput}
        />
      </div>

      {/* Visits list */}
      <div className={styles.visitsList}>
        {currentVisits.length === 0 ? (
          <div className={styles.emptyMsg}>No patients match your search.</div>
        ) : (
          currentVisits.map((visit) => (
            <div key={visit.id} className={styles.patientCard}>
              <div className={styles.patientCardHeader}>
                <strong>
                  {visit.patient.first_name} {visit.patient.last_name} (
                  {visit.patient.age} yrs)
                  (OP No: {visit.patient.id})
                </strong>
                {!visit.consultation ? (
                  <span className={styles.directBadge}>Direct Visit</span>
                ) : (
                  <span className={styles.consultBadge}>Consultation</span>
                )}
              </div>

              <div className={styles.patientCardBody}>
                <p>Visit: {new Date(visit.created_at).toLocaleString()}</p>
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
          {/* Prev */}
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className={`${styles.pageBtn} ${
              currentPage === 1 ? styles.disabledBtn : ""
            }`}
          >
            Prev
          </button>

          {/* Page numbers with ellipsis */}
          {(() => {
            const maxVisible = 5;
            let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
            let end = Math.min(totalPages, start + maxVisible - 1);

            if (end - start + 1 < maxVisible) {
              start = Math.max(1, end - maxVisible + 1);
            }

            const pages = [];
            if (start > 1) pages.push(1, "…");
            for (let i = start; i <= end; i++) pages.push(i);
            if (end < totalPages) pages.push("…", totalPages);

            return pages.map((p, idx) =>
              p === "…" ? (
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

          {/* Next */}
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

export default LabPastVisits;
