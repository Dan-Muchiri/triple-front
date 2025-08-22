import React, { useState, useEffect } from "react";
import styles from "../Labtech/LabtechStyles.module.css";
import { useFormik } from "formik";
import * as Yup from "yup";

function PharmacyExpenses() {
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [serverError, setServerError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch medicines for autocomplete
  useEffect(() => {
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
    fetchMedicines();
  }, []);

  // Filter medicines for autofill
  useEffect(() => {
    setFilteredMedicines(
      medicines.filter((m) =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, medicines]);

  const formik = useFormik({
  initialValues: {
    medicine_id: "",
    quantity_added: 0,
    discount: 0, // new field
  },
  validationSchema: Yup.object({
    medicine_id: Yup.string().required("Medicine is required"),
    quantity_added: Yup.number()
      .min(1, "Quantity must be at least 1")
      .required("Quantity is required"),
    discount: Yup.number()
      .min(0, "Discount must be positive")
      .required("Discount is required"),
  }),
  onSubmit: async (values, { resetForm }) => {
    try {
      const res = await fetch("https://tripletsmediclinic.onrender.com/pharmacy_expenses", {
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
  const totalCost =
  selectedMedicine && formik.values.quantity_added
    ? Math.max(
        selectedMedicine.buying_price * formik.values.quantity_added - formik.values.discount,
        0
      )
    : 0;

  const handleSelectMedicine = (medicine) => {
    formik.setFieldValue("medicine_id", medicine.id);
    setSearchTerm(medicine.name);
    setFilteredMedicines([]);
  };

  return (
    <div className={styles.sectionBox}>
      <h2 className={styles.sectionTitle}>New Pharmacy Expense</h2>

      <form onSubmit={formik.handleSubmit}>
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

        <div className={styles.formGroup}>
        <label>Discount (Ksh)</label>
        <input
          type="number"
          name="discount"
          value={formik.values.discount}
          onChange={formik.handleChange}
          className={styles.input}
        />
        {formik.errors.discount && (
          <div className={styles.error}>{formik.errors.discount}</div>
        )}
      </div>


        <div className={styles.formGroup}>
          <label>Total Cost (Ksh)</label>
          <input type="number" value={totalCost} disabled className={styles.input} />
        </div>

        {serverError && <div className={styles.error}>{serverError}</div>}

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.btn}>
            Add Expense
          </button>
        </div>
      </form>
    </div>
  );
}

export default PharmacyExpenses;
