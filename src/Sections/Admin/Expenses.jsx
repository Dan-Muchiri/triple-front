import React, { useState, useEffect } from "react";
import styles from "../Labtech/LabtechStyles.module.css";
import { useFormik } from "formik";
import * as Yup from "yup";

function PharmacyExpenses() {
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [serverError, setServerError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);

  // 🔹 Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Fetch medicines
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const res = await fetch("https://server.tripletsmediclinic.co.ke/medicines");
        const data = await res.json();
        setMedicines(data);
        setFilteredMedicines(data);
      } catch (err) {
        console.error("Failed to fetch medicines:", err);
      }
    };
    fetchMedicines();
  }, []);

  // Fetch expenses
  const fetchExpenses = async () => {
    try {
      const res = await fetch("https://server.tripletsmediclinic.co.ke/pharmacy_expenses");
      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      console.error("Failed to fetch expenses:", err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Filter medicines for autocomplete
  useEffect(() => {
    setFilteredMedicines(
      medicines.filter((m) =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, medicines]);

  // ✅ Formik for adding expense
  const formik = useFormik({
    initialValues: {
      medicine_id: "",
      quantity_added: 0,
      total_cost: 0,
    },
    validationSchema: Yup.object({
      medicine_id: Yup.string().required("Medicine is required"),
      quantity_added: Yup.number()
        .min(1, "Quantity must be at least 1")
        .required("Quantity is required"),
      total_cost: Yup.number()
        .min(0, "Total cost must be non-negative")
        .required("Total cost is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const res = await fetch("https://server.tripletsmediclinic.co.ke/pharmacy_expenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!res.ok) {
          const errData = await res.json();
          setServerError(errData.error || "Failed to add expense");
          return;
        }
        resetForm();
        setSearchTerm("");
        setServerError("");
        setShowNewModal(false);
        await fetchExpenses();
        alert("Pharmacy expense added successfully!");
      } catch (err) {
        console.error(err);
        setServerError(err.message);
      }
    },
  });

  const selectedMedicine = medicines.find(
    (m) => m.id === parseInt(formik.values.medicine_id)
  );

  const handleSelectMedicine = (medicine) => {
    formik.setFieldValue("medicine_id", medicine.id);
    setSearchTerm(medicine.name);
    setFilteredMedicines([]);
  };

  // 🔹 Pagination for expenses
  const totalPages = Math.ceil(expenses.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentExpenses = expenses
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // latest first
    .slice(startIndex, startIndex + pageSize);

  return (
    <div className={styles.sectionBox}>
      <h2 className={styles.sectionTitle}>Pharmacy Expenses</h2>

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
          + Add New Expense
        </button>
      )}

      {/* ✅ Expenses Table */}
      {!showNewModal && (
        <>
          {currentExpenses.length === 0 ? (
            <p>No expenses found.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Buying Price</th>
                  <th>Quantity Added</th>
                  <th>Total Cost</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {currentExpenses.map((e) => (
                  <tr key={e.id}>
                    <td>{e.medicine_name}</td>
                    <td>{e.buying_price}</td>
                    <td>{e.quantity_added}</td>
                    <td>{e.total_cost}</td>
                    <td>{new Date(e.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
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
                    p === 1 || // always show first
                    p === totalPages || // always show last
                    (p >= currentPage - 1 && p <= currentPage + 1) // around current page
                )
                .map((p, idx, arr) => {
                  // insert ellipsis between non-contiguous pages
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
          <h3>Add New Expense</h3>

          {/* Medicine autocomplete */}
          <div className={styles.formGroup}>
            <label>Medicine</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                formik.setFieldValue("medicine_id", "");
              }}
              placeholder="Type medicine name..."
              className={styles.input}
              autoComplete="off"
            />
            {filteredMedicines.length > 0 && searchTerm && (
              <ul className={styles.autocompleteList}>
                {filteredMedicines.slice(0, 5).map((med) => (
                  <li
                    key={med.id}
                    onClick={() => handleSelectMedicine(med)}
                    className={styles.autocompleteItem}
                  >
                    {med.name} (Stock: {med.stock}, Price: {med.buying_price})
                  </li>
                ))}
              </ul>
            )}
            {formik.errors.medicine_id && (
              <div className={styles.error}>{formik.errors.medicine_id}</div>
            )}
          </div>

          {/* Buying Price (readonly) */}
          {selectedMedicine && (
            <div className={styles.formGroup}>
              <label>Buying Price (Ksh)</label>
              <input
                type="number"
                value={selectedMedicine.buying_price}
                readOnly
                className={styles.input}
              />
            </div>
          )}

          {/* Quantity */}
          <div className={styles.formGroup}>
            <label>Quantity Added</label>
            <input
              type="number"
              name="quantity_added"
              value={formik.values.quantity_added}
              onChange={formik.handleChange}
              className={styles.input}
            />
            {formik.errors.quantity_added && (
              <div className={styles.error}>{formik.errors.quantity_added}</div>
            )}
          </div>

          {/* Total Cost */}
          <div className={styles.formGroup}>
            <label>Total Cost (Ksh)</label>
            <input
              type="number"
              name="total_cost"
              value={formik.values.total_cost}
              onChange={formik.handleChange}
              className={styles.input}
            />
            {formik.errors.total_cost && (
              <div className={styles.error}>{formik.errors.total_cost}</div>
            )}
          </div>

          {serverError && <div className={styles.error}>{serverError}</div>}

          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.btn}>
              Save
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

export default PharmacyExpenses;
