import React, { useState, useEffect } from "react";
import styles from "../Labtech/LabtechStyles.module.css";

function AllSales() {
  const [sales, setSales] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const fetchSales = async () => {
    try {
      const res = await fetch("https://server.tripletsmediclinic.co.ke/pharmacy_all_sales");
      const data = await res.json();
      setSales(data);
    } catch (err) {
      console.error("Failed to fetch sales:", err);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  // Pagination
  const totalPages = Math.ceil(sales.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentSales = sales.slice(startIndex, startIndex + pageSize);

  return (
    <div className={styles.sectionBox}>
      <h2 className={styles.sectionTitle}>All Pharmacy Sales</h2>

      {currentSales.length === 0 ? (
        <p>No sales found.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Buying Price</th>
              <th>Quantity</th>
              <th>Total</th>
              <th>Prescription/OTC</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {currentSales.map((s) => (
              <tr key={s.id}>
                <td>{s.medicine}</td>
                <td>{s.buying_price}</td>
                <td>{s.quantity}</td>
                <td>{s.total}</td>
                <td>{s.type}</td>
                <td>{new Date(s.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
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

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (p) =>
                p === 1 ||
                p === totalPages ||
                (p >= currentPage - 1 && p <= currentPage + 1)
            )
            .map((p, idx, arr) => {
              if (idx > 0 && arr[idx] !== arr[idx - 1] + 1) {
                return (
                  <React.Fragment key={`ellipsis-${p}`}>
                    <span className={styles.pageEllipsis}>…</span>
                    <button
                      onClick={() => setCurrentPage(p)}
                      className={`${styles.pageNumber} ${styles.btn} ${
                        currentPage === p ? styles.activePage : ""
                      }`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                );
              }
              return (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`${styles.pageNumber} ${styles.btn} ${
                    currentPage === p ? styles.activePage : ""
                  }`}
                >
                  {p}
                </button>
              );
            })}

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

export default AllSales;
