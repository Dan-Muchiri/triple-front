import React, { useState, useEffect } from "react";
import styles from "./ReceptionistStyles.module.css";
import useAuthStore from "../AuthStore/Authstore";

export default function AddPayment({ visit, setActiveView, paymentTarget }) {
  const receptionistId = useAuthStore((state) => state.userId);

  const [form, setForm] = useState({
    service_type: "",
    amount: "",
    payment_method: "cash",
    mpesa_receipt: "",
  });

  useEffect(() => {
  if (paymentTarget && visit) {
    let serviceName = "";
    let amount = "";

    if (paymentTarget.type === "test" && visit.test_requests) {
      const test = visit.test_requests.find((t) => t.id === paymentTarget.id);
      serviceName = test?.test_type || "Lab Test";
      amount = test?.price || 0;
    } else if (paymentTarget.type === "prescription" && visit.prescriptions) {
      const prescription = visit.prescriptions.find(
        (p) => p.id === paymentTarget.id
      );
      serviceName = prescription?.medication_name || "Prescription";
      amount = prescription?.price || 0; // ✅ optional, if prescriptions have price
    } else if (paymentTarget.type === "consultation") {
      serviceName = "Consultation Fee";
      amount = 200;
    }

    setForm((prev) => ({
      ...prev,
      service_type: serviceName,
      amount: amount,
    }));
  }
}, [paymentTarget, visit]);


  const [paymentId, setPaymentId] = useState(null);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (serverError) {
      const timeout = setTimeout(() => setServerError(""), 5000);
      return () => clearTimeout(timeout);
    }
  }, [serverError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const payload = {
      ...form,
      amount: parseFloat(form.amount),
      visit_id: visit.id,
      receptionist_id: receptionistId,
      test_request_id: paymentTarget?.type === "test" ? paymentTarget.id : null,
      prescription_id:
        paymentTarget?.type === "prescription" ? paymentTarget.id : null,
    };

    try {
      const res = await fetch("https://tripletsmediclinic.onrender.com/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(
          data.error || data.message || "Failed to record payment"
        );
        return;
      }

      setPaymentId(data.id);
    } catch (err) {
      console.error("❌ Network or parsing error:", err);
      setServerError("Unexpected error occurred");
    }
  };

  if (!visit || !visit.id) return <div>Loading visit details...</div>;

  if (paymentId) {
    return (
      <div className={styles.sectionBox}>
        <h2 className={styles.sectionTitle}>Payment Recorded Successfully!</h2>
        <div className={ `${styles.modalActions} ${styles.buttonGroup}`}>
          <a
            href={`https://tripletsmediclinic.onrender.com/receipt/${paymentId}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btn}
          >
            Print Receipt
          </a>
          <button
            onClick={() => setActiveView("visits")}
            className={`${styles.btn} ${styles.closeBtn}`}
          >
            Back to Visits
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.sectionBox} ${styles.flexOne}`}>
      <h2 className={styles.sectionTitle}>Add Payment for Visit #{visit.id}</h2>

      {serverError && (
        <div className={styles.error} style={{ marginBottom: "1rem" }}>
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Service Type</label>
          <input
            type="text"
            value={form.service_type}
            onChange={(e) => setForm({ ...form, service_type: e.target.value })}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Amount (KES)</label>
          <input
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Payment Method</label>
          <select
            value={form.payment_method}
            onChange={(e) =>
              setForm({ ...form, payment_method: e.target.value })
            }
            className={styles.input}
          >
            <option value="cash">Cash</option>
            <option value="mpesa">Mpesa</option>
          </select>
        </div>

        {form.payment_method === "mpesa" && (
          <div className={styles.formGroup}>
            <label>Mpesa Receipt Number</label>
            <input
              type="text"
              value={form.mpesa_receipt}
              onChange={(e) =>
                setForm({ ...form, mpesa_receipt: e.target.value })
              }
              className={styles.input}
              required
            />
          </div>
        )}

        <div className={styles.modalActions}>
          <div className={`${styles.buttonGroup}`}>
            <button
              type="submit"
              className={`${styles.btn}`}
            >
              Record Payment
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.closeBtn}`}
              onClick={() => {
                setServerError("");
                setActiveView("visits");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
