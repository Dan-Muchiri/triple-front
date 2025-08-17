import React, { useState } from "react";
import styles from "./ReceptionistStyles.module.css";

const STAGES = [
  "reception",
  "waiting_triage",
  "waiting_consultation",
  "waiting_lab",
  "waiting_imaging",
  "waiting_pharmacy",
  "complete",
];

export default function OngoingVisits({ visits, fetchVisits, handlePay }) {
  const [updatingId, setUpdatingId] = useState(null);

  const activeVisits = visits.filter(
    (visit) => visit.stage.toLowerCase() !== "complete"
  );

  // Sort active visits: reception first, then others
const sortedVisits = [...activeVisits].sort((a, b) => {
  if (a.stage === "reception" && b.stage !== "reception") return -1;
  if (b.stage === "reception" && a.stage !== "reception") return 1;
  // Optional: sort the remaining by stage order in STAGES
  return STAGES.indexOf(a.stage) - STAGES.indexOf(b.stage);
});


  const handleStageChange = async (id, newStage) => {
    setUpdatingId(id);

    try {
      const res = await fetch(`https://tripletsmediclinic.onrender.com/visits/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stage: newStage }),
      });

      if (!res.ok) throw new Error("Failed to update stage");

      await res.json(); // can log it if needed
      await fetchVisits(); // ✅ refetch visits to reflect new data
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className={`${styles.sectionBox} ${styles.flexOne}`}>
      <h2 className={styles.sectionTitle}>Ongoing Visits</h2>
      <ul className={styles.visitList}>
        {activeVisits.length === 0 ? (
          <li className={styles.emptyMsg}>No ongoing visits.</li>
        ) : (
          sortedVisits.map((visit) => (
            <li key={visit.id} className={styles.visitCard}>
              <div className={styles.visitCardHeader}>
                <span>
                  {visit.patient?.first_name} {visit.patient?.last_name}
                </span>
                <span className={`${styles.visitStage} ${visit.stage}`}>
                  {visit.stage.replace("_", " ")}
                </span>
              </div>

              <div className={styles.visitCardBody}>
                <div>
                  <strong>Age:</strong> {visit.patient?.age}
                </div>
                <div>
                  <strong>Created:</strong>{" "}
                  {new Date(visit.created_at).toLocaleString()}
                </div>

                {visit.test_requests?.length > 0 && (
                  <div>
                    <strong>Test Requests:</strong>
                    <ul>
                      {visit.test_requests.map((tr) => (
                        <li key={tr.id} className={styles.nestedListItem}>
                          {tr.test_type} ({tr.category}) - {tr.status}{" "}
                          {!tr.payment && (
                            <button
                              onClick={() => handlePay("test", tr.id, visit)}
                            >
                              Pay
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {visit.prescriptions?.length > 0 && (
                  <div>
                    <strong>Prescriptions:</strong>
                    <ul>
                      {visit.prescriptions.map((p) => (
                        <li key={p.id} className={styles.nestedListItem}>
                          {p.medication_name} - {p.dosage} - {p.status}{" "}
                          {!p.payment && (
                            <button
                              onClick={() =>
                                handlePay("prescription", p.id, visit)
                              }
                            >
                              Pay
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {visit.payments?.length > 0 && (
                  <div>
                    <strong>Payments:</strong>
                    <ul>
                      {visit.payments.map((pay) => (
                        <li key={pay.id}>
                          KES {pay.amount} - {pay.service_type} via{" "}
                          {pay.payment_method}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <label htmlFor={`stage-${visit.id}`}>
                  <strong>Edit Stage:</strong>
                </label>
                <select
                  id={`stage-${visit.id}`}
                  value={visit.stage}
                  onChange={(e) => handleStageChange(visit.id, e.target.value)}
                  disabled={updatingId === visit.id}
                  className={styles.stageSelect}
                >
                  {STAGES.map((stage) => (
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
