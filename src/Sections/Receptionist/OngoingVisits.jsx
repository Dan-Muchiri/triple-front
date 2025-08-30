// src/components/OngoingVisits.jsx
import React, { useState } from "react";
import styles from "./ReceptionistStyles.module.css";
import TestRequestModal from "./TestRequestModal";

const STAGES = [
  "reception",
  "waiting_triage",
  "waiting_consultation",
  "waiting_lab",
  "waiting_imaging",
  "waiting_pharmacy",
  "complete",
];

export default function OngoingVisits({
  visits,
  otcSales,
  fetchVisits,
  handlePay,
}) {
  const [updatingId, setUpdatingId] = useState(null);
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedVisitId, setSelectedVisitId] = useState(null);

  // ✅ Merge visits & OTC sales into one unified list
  const allActive = [...(visits || []), ...(otcSales || [])];

  // ✅ Only show those in active stage
  const activeVisits = allActive.filter(
    (item) => item.stage?.toLowerCase() === "reception"
  );

  const handleStageChange = async (item, newStage) => {
    setUpdatingId(item.id);

    try {
      const endpoint = "patient" in item ? "visits" : "otc_sales";
      const res = await fetch(`https://server.tripletsmediclinic.co.ke/${endpoint}/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });

      if (!res.ok) throw new Error("Failed to update stage");

      await res.json();
      await fetchVisits();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleTestRequest = (visitId) => {
    setSelectedVisitId(visitId);
    setShowTestModal(true);
  };

  return (
    <div className={`${styles.sectionBox} ${styles.flexOne}`}>
      <h2 className={styles.sectionTitle}>Ongoing Visits</h2>

      {/* ✅ Show Test Request Modal */}
      {showTestModal && selectedVisitId && (
        <TestRequestModal
          visitId={selectedVisitId}
          onClose={() => {
            setShowTestModal(false);
            setSelectedVisitId(null);
          }}
        />
      )}

      <ul className={styles.visitList}>
        {activeVisits.length === 0 ? (
          <li className={styles.emptyMsg}>No ongoing visits.</li>
        ) : (
          activeVisits.map((item) => (
            <li
              key={`${"patient" in item ? "visit" : "otc"}-${item.id}`}
              className={styles.visitCard}
            >
              <div className={styles.visitCardHeader}>
                <span>
                  {"patient" in item
                    ? `${item.patient?.first_name} ${item.patient?.last_name}`
                    : item.patient_name}{" "}
                  ({item.patient?.age} yrs) - OP No: {item.patient?.id}
                </span>
                <span className={`${styles.visitStage} ${item.stage}`}>
                  {item.stage.replace("_", " ")}
                </span>
              </div>

              <div className={styles.visitCardBody}>
                <div>
                  <strong>Created:</strong>{" "}
                  {new Date(item.created_at).toLocaleString()}
                </div>

                {/* ✅ Normal visits */}
                {"patient" in item && (
                  <>
                    <div>
                      <strong>Age:</strong> {item.patient?.age}
                    </div>
                    <button
                      onClick={() =>
                        handlePay({
                          ...item,
                          presetService: "consultation_fee",
                        })
                      }
                      className={styles.btn}
                    >
                      Add Consultation Fee
                    </button>

                    {/* Tests */}
                    {(item.test_requests?.length > 0 ||
                      item.direct_test_requests?.length > 0) && (
                      <div>
                        <strong>Test Requests:</strong>
                        <ul>
                          {item.test_requests?.map((tr) => (
                            <li
                              key={`tr-${tr.id}`}
                              className={styles.nestedListItem}
                            >
                              {tr.test_type} ({tr.category}) - {tr.status}
                            </li>
                          ))}
                          {item.direct_test_requests?.map((tr) => (
                            <li
                              key={`dtr-${tr.id}`}
                              className={styles.nestedListItem}
                            >
                              {tr.test_type} ({tr.category}) - {tr.status}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <button
                      onClick={() => handleTestRequest(item.id)}
                      className={`${styles.btn} ${styles.testBtn}`}
                    >
                      Add Test Request
                    </button>

                    {/* Prescriptions */}
                    {item.prescriptions?.length > 0 && (
                      <div>
                        <strong>Prescriptions:</strong>
                        <ul>
                          {item.prescriptions.map((p) => (
                            <li key={p.id} className={styles.nestedListItem}>
                              {p.medication_name} - {p.dosage} - {p.status}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}

                {/* ✅ OTC sales */}
                {"sales" in item && (
                  <div>
                    <strong>OTC Medicines:</strong>
                    <ul>
                      {item.sales.map((s) => (
                        <li key={s.id} className={styles.nestedListItem}>
                          {s.medication_name} – {s.dispensed_units} × KES{" "}
                          {s.selling_price} = KES {s.total_price}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Payments */}
                {item.payments?.length > 0 && (
                  <div>
                    <strong>Payments:</strong>
                    <ul>
                      {item.payments.map((pay) => (
                        <li key={pay.id}>
                          KES {pay.amount} via {pay.payment_method}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Balance + Pay */}
                {"balance" in item && (
                  <div className={styles.paymentSection}>
                    <strong>Total Charges:</strong> KES {item.total_charges}{" "}
                    <br />
                    <strong>Total Paid:</strong> KES {item.total_payments}{" "}
                    <br />
                    <strong>Balance:</strong> KES {item.balance} <br />
                    {item.balance > 0 && (
                      <button onClick={() => handlePay(item)}>
                        Pay Balance
                      </button>
                    )}
                  </div>
                )}

                {/* ✅ Stage Selector */}
                <label htmlFor={`stage-${item.id}`}>
                  <strong>Edit Stage:</strong>
                </label>
                <select
                  id={`stage-${item.id}`}
                  value={item.stage}
                  onChange={(e) => handleStageChange(item, e.target.value)}
                  disabled={updatingId === item.id}
                  className={styles.stageSelect}
                >
                  {("patient" in item
                    ? STAGES
                    : ["waiting_pharmacy", "reception"]
                  ).map((stage) => (
                    <option key={stage} value={stage}>
                      {stage.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
