import React, { useState, useEffect } from "react";
import styles from "../Labtech/LabtechStyles.module.css";
import { useFormik } from "formik";
import * as Yup from "yup";

function OtherExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [serverError, setServerError] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔹 Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Fetch other expenses
  const fetchExpenses = async () => {
    try {
      const res = await fetch("https://server.tripletsmediclinic.co.ke/other_expenses");
      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      console.error("Failed to fetch other expenses:", err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // ✅ Formik for adding new other expense
  const formik = useFormik({
    initialValues: {
      expense_type: "",
      quantity: "",
      amount: 0,
    },
    validationSchema: Yup.object({
      expense_type: Yup.string().required("Expense type is required"),
      quantity: Yup.string().nullable(),
      amount: Yup.number()
        .min(0, "Amount must be non-negative")
        .required("Amount is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      setIsSubmitting(true);
      try {
        const res = await fetch("https://server.tripletsmediclinic.co.ke/other_expenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!res.ok) {
          const errData = await res.json();
          setServerError(errData.error || "Failed to add other expense");
          return;
        }
        resetForm();
        setServerError("");
        setShowNewModal(false);
        await fetchExpenses();
        alert("Other expense added successfully!");
      } catch (err) {
        console.error(err);
        setServerError(err.message);
      } finally {
        setIsSubmitting(false); // ✅ re-enable
      }
    },
  });

  // 🔹 Pagination for expenses
  const totalPages = Math.ceil(expenses.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentExpenses = expenses
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // latest first
    .slice(startIndex, startIndex + pageSize);

  return (
    <div className={styles.sectionBox}>
      <h2 className={styles.sectionTitle}>Other Expenses</h2>

      {/* ✅ New Expense Button */}
      {!showNewModal && (
        <button
          className={styles.btn}
          style={{ marginTop: 0, marginBottom: "1rem" }}
          onClick={() => {
            setShowNewModal(true);
            formik.resetForm();
          }}
        >
          + Add New Other Expense
        </button>
      )}

      {/* ✅ Expenses Table */}
      {!showNewModal && (
        <>
          {currentExpenses.length === 0 ? (
            <p>No other expenses found.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Expense Type</th>
                  <th>Quantity</th>
                  <th>Amount (Ksh)</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {currentExpenses.map((e) => (
                  <tr key={e.id}>
                    <td>{e.expense_type}</td>
                    <td>{e.quantity || "-"}</td>
                    <td>{e.amount}</td>
                    <td>{new Date(e.created_at).toLocaleString()}</td>
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
        </>
      )}

      {/* ✅ Expense Form Modal */}
      {showNewModal && (
        <form onSubmit={formik.handleSubmit} className={styles.sectionBox}>
          <h3>Add New Other Expense</h3>

          {/* Expense Type */}
          <div className={styles.formGroup}>
            <label>Expense Type</label>
            <input
              type="text"
              name="expense_type"
              value={formik.values.expense_type}
              onChange={formik.handleChange}
              className={styles.input}
            />
            {formik.errors.expense_type && (
              <div className={styles.error}>{formik.errors.expense_type}</div>
            )}
          </div>

          {/* Quantity */}
          <div className={styles.formGroup}>
            <label>Quantity</label>
            <input
              type="text"
              name="quantity"
              value={formik.values.quantity}
              onChange={formik.handleChange}
              className={styles.input}
              placeholder='e.g. "500 units" or "7 kilos"'
            />
          </div>

          {/* Amount */}
          <div className={styles.formGroup}>
            <label>Amount (Ksh)</label>
            <input
              type="number"
              name="amount"
              value={formik.values.amount}
              onChange={formik.handleChange}
              className={styles.input}
            />
            {formik.errors.amount && (
              <div className={styles.error}>{formik.errors.amount}</div>
            )}
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
              onClick={() => setShowNewModal(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default OtherExpenses;
