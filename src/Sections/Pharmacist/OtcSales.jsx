import React, { useState, useEffect } from "react";
import styles from "../Labtech/LabtechStyles.module.css";

function OtcSales({ setActiveView }) {
  const [allMedicines, setAllMedicines] = useState([]);
  const [otcSale, setOtcSale] = useState(null);
  const [newSale, setNewSale] = useState({
    patient_name: "",
    medicine_id: null,
    medication_name: "",
    price: 0,
    quantity: "",
    suggestions: [],
  });
  const [sales, setSales] = useState([]);

  const api = (path, opts = {}) =>
    fetch(`https://tripletsmediclinic.onrender.com${path}`, {
      headers: { "Content-Type": "application/json" },
      ...opts,
    });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const medRes = await api("/medicines");
        if (medRes.ok) setAllMedicines(await medRes.json());
      } catch (err) {
        console.error("fetch data:", err);
      }
    };
    fetchData();
  }, []);

  // Medicine input with autofill
  const handleMedicationInput = (value) => {
    setNewSale((prev) => ({
      ...prev,
      medication_name: value,
      medicine_id: null,
    }));

    if (value.length < 1) {
      setNewSale((prev) => ({ ...prev, suggestions: [] }));
      return;
    }

    const filtered = allMedicines
      .filter((m) => m.name.toLowerCase().includes(value.toLowerCase()))
      .slice(0, 5); // limit suggestions
    setNewSale((prev) => ({ ...prev, suggestions: filtered }));
  };

  const selectMedication = (med) => {
    setNewSale((prev) => ({
      ...prev,
      medicine_id: med.id,
      medication_name: med.name,
      price: med.selling_price,
      suggestions: [],
    }));
  };

  const handlePatientChange = (val) =>
    setNewSale((prev) => ({ ...prev, patient_name: val }));
  const handlePriceChange = (price) =>
    setNewSale((prev) => ({ ...prev, price: +price }));
  const handleQuantityChange = (qty) =>
    setNewSale((prev) => ({ ...prev, quantity: qty }));

  const handleCreateOtc = async () => {
    if (!newSale.patient_name) {
      alert("Enter patient name first");
      return;
    }
    try {
      const res = await api("/otc_sales", {
        method: "POST",
        body: JSON.stringify({ patient_name: newSale.patient_name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create OTC sale");
      setOtcSale(data);
    } catch (err) {
      console.log("Error: " + err.message);
    }
  };

  const handleAddSale = async () => {
    if (!otcSale || !newSale.medicine_id || !newSale.quantity) {
      alert("Please select medicine and quantity");
      return;
    }
    try {
      const res = await api("/pharmacy_sales", {
        method: "POST",
        body: JSON.stringify({
          otc_sale_id: otcSale.id,
          pharmacist_id: 1,
          medicine_id: newSale.medicine_id,
          dispensed_units: +newSale.quantity,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save sale");

      setSales((prev) => [...prev, data]);
      setNewSale((prev) => ({
        ...prev,
        medicine_id: null,
        medication_name: "",
        price: 0,
        quantity: "",
        suggestions: [],
      }));
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const total = sales.reduce((acc, s) => acc + (s.total_price || 0), 0);
  const lineTotal = newSale.price * (newSale.quantity || 0);

  return (
    <div className={styles.sectionBox}>
      <h2 className={styles.sectionTitle}>New OTC Sale</h2>

      {!otcSale && (
        <div className={styles.formGroup}>
          <label className={styles.label}>Patient Name</label>
          <input
            type="text"
            value={newSale.patient_name}
            onChange={(e) => handlePatientChange(e.target.value)}
            className={styles.input}
          />
          <button onClick={handleCreateOtc} className={styles.btn}>
            Create OTC Sale
          </button>
        </div>
      )}

      {otcSale && (
        <div className={styles.formGroup}>
          <h3 className={styles.sectionTitle}>
            Patient: {otcSale.patient_name}
          </h3>

          <label className={styles.label}>Medicine Name</label>
          <input
            type="text"
            value={newSale.medication_name}
            onChange={(e) => handleMedicationInput(e.target.value)}
            className={styles.input}
            autoComplete="off"
          />
          {newSale.suggestions?.length > 0 && (
            <ul className={styles.suggestions}>
              {newSale.suggestions.map((med) => (
                <li key={med.id} onClick={() => selectMedication(med)}>
                  {med.name} ({med.unit}) — Ksh {med.selling_price}
                </li>
              ))}
            </ul>
          )}

          <label className={styles.label}>Price</label>
          <input
            type="number"
            value={newSale.price}
            onChange={(e) => handlePriceChange(e.target.value)}
            className={styles.input}
          />

          <label className={styles.label}>Quantity</label>
          <input
            type="number"
            value={newSale.quantity}
            onChange={(e) => handleQuantityChange(e.target.value)}
            className={styles.input}
          />

          <label className={styles.label}>Line Total</label>
          <input
            type="text"
            value={`KES ${lineTotal}`}
            disabled
            className={styles.input}
          />

          <button onClick={handleAddSale} className={styles.btn}>
            Add Sale
          </button>

          {sales.length > 0 && (
            <>
              <h3 className={styles.sectionTitle}>Sales for this OTC</h3>
              <ul className={styles.testList}>
                {sales.map((s) => (
                  <li key={s.id} className={styles.testCard}>
                    <span>
                      {s.medication_name} (x{s.dispensed_units})
                    </span>
                    <span>KES {s.total_price}</span>
                  </li>
                ))}
              </ul>
              <div className={styles.sectionTitle}>Total: KES {total}</div>

              <button
                onClick={async () => {
                  try {
                    const res = await api(`/otc_sales/${otcSale.id}`, {
                      method: "PATCH",
                      body: JSON.stringify({ stage: "reception" }),
                    });
                    const data = await res.json();
                    if (!res.ok)
                      throw new Error(data.error || "Failed to submit OTC");
                    alert("OTC sent to reception!");
                    setOtcSale(data);
                    setActiveView("waitingPharmacy");
                  } catch (err) {
                    alert("Error: " + err.message);
                  }
                }}
                className={styles.btn}
              >
                Submit to Reception
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default OtcSales;
