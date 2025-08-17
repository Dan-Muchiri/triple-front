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

  // Fetch all medicines
  const fetchMedicines = async () => {
    try {
      const res = await fetch("https://tripletsmediclinic.onrender.com/medicines");
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

  // Filter medicines by search term
  useEffect(() => {
    setFilteredMedicines(
      medicines.filter((m) =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, medicines]);

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
      sold_units: Yup.number().min(0, "Cannot be negative").required("Required"),
      buying_price: Yup.number().min(0, "Cannot be negative").required("Required"),
      selling_price: Yup.number().min(0, "Cannot be negative").required("Required"),
      unit: Yup.string().required("Required"),
    }),
    onSubmit: async (values) => {
      try {
        const res = await fetch(
          `https://tripletsmediclinic.onrender.com/medicines/${selectedMedicine.id}`,
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
        await fetchMedicines();
        setSelectedMedicine(null);
      } catch (err) {
        console.error("Error updating medicine:", err);
        setServerError(err.message);
      }
    },
  });

  return (
    <div className={styles.sectionBox}>
      <h2 className={styles.sectionTitle}>Medicines</h2>

      {!selectedMedicine ? (
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

          <ul className={styles.testList}>
            {filteredMedicines.length === 0 ? (
              <li>No medicines found.</li>
            ) : (
              filteredMedicines.map((m) => (
                <li key={m.id} className={styles.testCard}>
                  <div><strong>Name:</strong> {m.name}</div>
                  <div><strong>Stock:</strong> {m.stock}</div>
                  <div><strong>Sold Units:</strong> {m.sold_units}</div>
                  <div><strong>Buying Price:</strong> {m.buying_price}</div>
                  <div><strong>Selling Price:</strong> {m.selling_price}</div>
                  <div><strong>Unit:</strong> {m.unit}</div>
                  <button className={styles.btn} onClick={() => handleEdit(m)}>
                    Edit
                  </button>
                </li>
              ))
            )}
          </ul>
        </>
      ) : (
        <form onSubmit={formik.handleSubmit} className={styles.sectionBox}>
          <h3>Edit Medicine</h3>

          <div className={styles.formGroup}>
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              className={styles.input}
            />
            {formik.errors.name && <div className={styles.error}>{formik.errors.name}</div>}
          </div>

          <div className={styles.formGroup}>
            <label>Stock</label>
            <input
              type="number"
              name="stock"
              value={formik.values.stock}
              onChange={formik.handleChange}
              className={styles.input}
            />
            {formik.errors.stock && <div className={styles.error}>{formik.errors.stock}</div>}
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
            {formik.errors.sold_units && <div className={styles.error}>{formik.errors.sold_units}</div>}
          </div>

          <div className={styles.formGroup}>
            <label>Buying Price</label>
            <input
              type="number"
              name="buying_price"
              value={formik.values.buying_price}
              onChange={formik.handleChange}
              className={styles.input}
            />
            {formik.errors.buying_price && <div className={styles.error}>{formik.errors.buying_price}</div>}
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
            {formik.errors.selling_price && <div className={styles.error}>{formik.errors.selling_price}</div>}
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
            {formik.errors.unit && <div className={styles.error}>{formik.errors.unit}</div>}
          </div>

          {serverError && <div className={styles.error}>{serverError}</div>}

          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.btn}>Save</button>
            <button
              type="button"
              className={`${styles.btn} ${styles.cancelBtn}`}
              onClick={() => setSelectedMedicine(null)}
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
