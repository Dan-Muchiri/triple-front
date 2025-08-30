import React, { useState, useEffect } from "react";
import styles from "./ReceptionistStyles.module.css";
import useAuthStore from "../AuthStore/Authstore";

export default function AddPayment({ visit, setActiveView }) {
  const receptionistId = useAuthStore((state) => state.userId);

  const [form, setForm] = useState({
    amount: "",
    payment_method: "cash",
    mpesa_receipt: "",
  });

  const [paymentId, setPaymentId] = useState(null);
  const [serverError, setServerError] = useState("");

  // Auto-fill amount with backend balance
  useEffect(() => {
    if (visit) {
      if (visit.presetService === "consultation_fee") {
        setForm((prev) => ({
          ...prev,
          amount: 200,
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          amount: visit.balance || 0,
        }));
      }
    }
  }, [visit]);

  useEffect(() => {
    if (serverError) {
      const timeout = setTimeout(() => setServerError(""), 5000);
      return () => clearTimeout(timeout);
    }
  }, [serverError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    // Build service description dynamically
    let servicesList = [];

    if (visit.isOtc) {
      visit.sales?.forEach((s) => {
        servicesList.push(
          `${s.medication_name} × ${s.dispensed_units} — KES ${s.total_price}`
        );
      });
    } else {
      if (visit.consultation) {
        servicesList.push(`Consultation Fee — KES ${visit.consultation.fee}`);
      }
      visit.direct_test_requests?.forEach((t) => {
        servicesList.push(`${t.test_type} — KES ${t.price}`);
      });
      visit.test_requests?.forEach((t) => {
        servicesList.push(`${t.test_type} — KES ${t.price}`);
      });
      visit.prescriptions?.forEach((p) => {
        servicesList.push(
          `${p.medication_name} × ${p.dispensed_units} — KES ${p.total_price}`
        );
      });
    }

    const payload = {
      amount: parseFloat(form.amount),
      receptionist_id: receptionistId,
      payment_method: form.payment_method,
      mpesa_receipt:
        form.payment_method === "mpesa" ? form.mpesa_receipt : null,
      service_type: servicesList.join("\n"), // ✅ full breakdown as text
    };

    // 🔗 Correct FK
    if (visit.isOtc) {
      payload.otc_sale_id = visit.id;
    } else {
      payload.visit_id = visit.id;
    }

    try {
      const res = await fetch("https://server.tripletsmediclinic.co.ke/payments", {
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
        <div className={`${styles.modalActions} ${styles.buttonGroup}`}>
          <a
            href={`https://server.tripletsmediclinic.co.ke/receipt/${paymentId}`}
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

      {/* Services Breakdown */}
      {/* Services Breakdown */}
      <div className={styles.formGroup}>
        <label>Services</label>
        <ul>
          {visit.isOtc ? (
            <>
              {visit.sales?.map((s) => (
                <li key={`sale-${s.id}`}>
                  {s.medication_name} × {s.dispensed_units} — KES{" "}
                  {s.total_price}
                </li>
              ))}
            </>
          ) : (
            <>
              {visit.consultation && (
                <li key={`consult-fee-${visit.consultation.id}`}>
                  Consultation Fee — KES {visit.consultation.fee}
                </li>
              )}
              {visit.direct_test_requests?.map((t) => (
                <li key={`direct-test-${t.id}`}>
                  {t.test_type} — KES {t.price}
                </li>
              ))}
              {visit.test_requests?.map((t) => (
                <li key={`consult-test-${t.id}`}>
                  {t.test_type} — KES {t.price}
                </li>
              ))}
              {visit.prescriptions?.map((p) => (
                <li key={`pres-${p.id}`}>
                  {p.medication_name} × {p.dispensed_units} — KES{" "}
                  {p.total_price}
                </li>
              ))}
            </>
          )}
        </ul>
      </div>

      <p>
        <strong>Total Charges:</strong> KES {visit.total_charges}
      </p>
      <p>
        <strong>Total Payments:</strong> KES {visit.total_payments || 0}
      </p>
      <p>
        <strong>Balance:</strong> KES {visit.balance}
      </p>

      {serverError && (
        <div className={styles.error} style={{ marginBottom: "1rem" }}>
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
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
            <button type="submit" className={`${styles.btn}`}>
              Record Payment
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.closeBtn}`}
              onClick={() => setActiveView("visits")}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
