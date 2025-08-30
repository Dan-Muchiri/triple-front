import React, { useState, useEffect } from "react";
import styles from "../Labtech/LabtechStyles.module.css";
import { useFormik } from "formik";
import * as Yup from "yup";

function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [serverError, setServerError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewModal, setShowNewModal] = useState(false); // ✅ new state

  // 🔹 Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

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

  useEffect(() => {
    fetchMedicines();
  }, []);

  useEffect(() => {
    const filtered = medicines.filter((m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMedicines(filtered);
    setCurrentPage(1); // reset to page 1 on new search
  }, [searchTerm, medicines]);

  // 🔹 Pagination calculations
  const totalPages = Math.ceil(filteredMedicines.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentMedicines = [...filteredMedicines]
    .sort((a, b) => (a.stock <= 5 && b.stock > 5 ? -1 : 1)) // low stock first
    .slice(startIndex, startIndex + pageSize);

  const handleEdit = (medicine) => {
    setSelectedMedicine(medicine);
    formik.setValues({
      name: medicine.name || "",
      stock: medicine.stock || 0,
      sold_units: medicine.sold_units || 0,
      buying_price: medicine.buying_price || 0,
      selling_price: medicine.selling_price || 0,
      unit: medicine.unit || "tablet",
    });
  };

  const handleDelete = async (medicineId) => {
  if (!window.confirm("Are you sure you want to delete this medicine?"))
    return;

  try {
    const res = await fetch(`https://server.tripletsmediclinic.co.ke/medicines/${medicineId}`, {
      method: "DELETE",
    });

    const data = await res.json(); // ✅ always parse JSON

    if (!res.ok) {
      alert(data.message || data.error || "Failed to delete medicine"); // ✅ show alert
      return;
    }

    alert(data.message || "Medicine deleted successfully"); // ✅ success alert
    fetchMedicines();
  } catch (err) {
    console.error("Error deleting medicine:", err);
    alert(err.message); // ✅ show network error
  }
};


  // ✅ Formik for editing and new medicine
  const formik = useFormik({
    initialValues: {
      name: "",
      stock: 0,
      sold_units: 0,
      buying_price: 0,
      selling_price: 0,
      unit: "tablet",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Required"),
      stock: Yup.number().min(0, "Cannot be negative").required("Required"),
      sold_units: Yup.number()
        .min(0, "Cannot be negative")
        .required("Required"),
      buying_price: Yup.number()
        .min(0, "Cannot be negative")
        .required("Required"),
      selling_price: Yup.number()
        .min(0, "Cannot be negative")
        .required("Required"),
      unit: Yup.string().required("Required"),
    }),
    onSubmit: async (values) => {
      try {
        if (selectedMedicine) {
          // ✅ Edit existing
          const res = await fetch(
            `https://server.tripletsmediclinic.co.ke/medicines/${selectedMedicine.id}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(values),
            }
          );
          if (!res.ok) {
            const errData = await res.json();
            setServerError(errData.error || "Failed to update medicine");
            return;
          }
        } else {
          // ✅ Add new medicine (stock and sold_units are default 0)
          const { name, buying_price, selling_price, unit } = values;
          const res = await fetch("https://server.tripletsmediclinic.co.ke/medicines", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, buying_price, selling_price, unit }),
          });
          if (!res.ok) {
            const errData = await res.json();
            setServerError(errData.error || "Failed to create medicine");
            return;
          }
          setShowNewModal(false);
        }
        await fetchMedicines();
        setSelectedMedicine(null);
      } catch (err) {
        console.error("Error:", err);
        setServerError(err.message);
      }
    },
  });

  return (
    <div className={styles.sectionBox}>
      <h2 className={styles.sectionTitle}>Medicines</h2>

      {/* ✅ New Medicine Button */}
      {!selectedMedicine && !showNewModal && (
        <button
          className={styles.btn}
          style={{ marginTop: 0, marginBottom: "1rem" }}
          onClick={() => {
            setShowNewModal(true);
            setSelectedMedicine(null); // clear any selected medicine
            formik.resetForm(); // reset form fields to initial values
          }}
        >
          + Add New Medicine
        </button>
      )}

      {!selectedMedicine && !showNewModal && (
        <>
          <div className={styles.formGroup}>
            <label>Search Medicine</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type medicine name..."
              className={styles.input}
            />
          </div>

          {/* Medicine List */}
          <ul className={styles.testList}>
            {currentMedicines.length === 0 ? (
              <li>No medicines found.</li>
            ) : (
              currentMedicines.map((m) => (
                <li
                  key={m.id}
                  className={`${styles.testCard} ${
                    m.stock <= 5 ? styles.lowStockCard : ""
                  }`}
                >
                  <div>
                    <strong>Name:</strong> {m.name}{" "}
                    {m.stock <= 5 && (
                      <span className={styles.lowStockBadge}>
                        ⚠ Almost Out of Stock
                      </span>
                    )}
                  </div>
                  <div>
                    <strong>Stock:</strong> {m.stock}
                  </div>
                  <div>
                    <strong>Sold Units:</strong> {m.sold_units}
                  </div>
                  <div>
                    <strong>Buying Price:</strong> {m.buying_price}
                  </div>
                  <div>
                    <strong>Selling Price:</strong> {m.selling_price}
                  </div>
                  <div>
                    <strong>Unit:</strong> {m.unit}
                  </div>
                  <div className={styles.buttonGroup}>
                    <button
                      className={styles.btn}
                      onClick={() => handleEdit(m)}
                    >
                      Edit
                    </button>
                    <button
                      className={`${styles.btn} ${styles.deleteBtn}`}
                      onClick={() => handleDelete(m.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>

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

              {(() => {
                const maxVisible = 5;
                let start = Math.max(
                  1,
                  currentPage - Math.floor(maxVisible / 2)
                );
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
        </>
      )}

      {/* ✅ Modal / Form for Adding or Editing */}
      {(selectedMedicine || showNewModal) && (
        <form onSubmit={formik.handleSubmit} className={styles.sectionBox}>
          <h3>{selectedMedicine ? "Edit Medicine" : "Add New Medicine"}</h3>

          <div className={styles.formGroup}>
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              className={styles.input}
            />
            {formik.errors.name && (
              <div className={styles.error}>{formik.errors.name}</div>
            )}
          </div>

          {selectedMedicine && (
            <>
              <div className={styles.formGroup}>
                <label>Stock</label>
                <input
                  type="number"
                  name="stock"
                  value={formik.values.stock}
                  onChange={formik.handleChange}
                  className={styles.input}
                />
                {formik.errors.stock && (
                  <div className={styles.error}>{formik.errors.stock}</div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>Sold Units</label>
                <input
                  type="number"
                  name="sold_units"
                  value={formik.values.sold_units}
                  onChange={formik.handleChange}
                  className={styles.input}
                />
                {formik.errors.sold_units && (
                  <div className={styles.error}>{formik.errors.sold_units}</div>
                )}
              </div>
            </>
          )}

          <div className={styles.formGroup}>
            <label>Buying Price</label>
            <input
              type="number"
              name="buying_price"
              value={formik.values.buying_price}
              onChange={formik.handleChange}
              className={styles.input}
            />
            {formik.errors.buying_price && (
              <div className={styles.error}>{formik.errors.buying_price}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Selling Price</label>
            <input
              type="number"
              name="selling_price"
              value={formik.values.selling_price}
              onChange={formik.handleChange}
              className={styles.input}
            />
            {formik.errors.selling_price && (
              <div className={styles.error}>{formik.errors.selling_price}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Unit</label>
            <input
              type="text"
              name="unit"
              value={formik.values.unit}
              onChange={formik.handleChange}
              className={styles.input}
            />
            {formik.errors.unit && (
              <div className={styles.error}>{formik.errors.unit}</div>
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
              onClick={() => {
                setSelectedMedicine(null);
                setShowNewModal(false);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default Medicines;
