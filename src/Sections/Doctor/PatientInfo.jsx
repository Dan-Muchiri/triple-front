import React from "react";
import styles from "./DoctorStyles.module.css";

function PatientInfo({ visitData, onBack }) {
  if (!visitData) return null;

  // normalize input
  let visit, patient;

  if (visitData.currentVisit && visitData.patient) {
    // visitData is the object with currentVisit + patient
    visit = visitData.currentVisit;
    patient = visitData.patient;
  } else {
    // visitData is just a single visit
    visit = visitData;
    patient = visit.patient;
  }

  const triage = visit.triage; // ✅ define triage

  // Past visits (excluding current one)
  const pastVisits = patient.visits?.filter((v) => v.id !== visit.id) || [];

  // Combine current + past visits
  const allVisits = [visit, ...pastVisits];

  return (
    <div className={styles.sectionBox}>
      <button onClick={onBack}>Back</button>
      <h2>Patient Information</h2>
      <div>
        <strong>Name:</strong> {patient.first_name} {patient.last_name}
      </div>
      <div>
        <strong>OP No:</strong> {patient.id}
      </div>
      <div>
        <strong>Gender:</strong> {patient.gender}
      </div>
      <div>
        <strong>Age:</strong> {patient.age}
      </div>
      <div>
        <strong>Phone:</strong> {patient.phone_number}
      </div>
      <div>
        <strong>Email:</strong> {patient.email}
      </div>
      <div>
        <strong>Sub County:</strong> {patient.subcounty || "N/A"}
      </div>
      {/* ✅ Add Location */}
      <div>
        <strong>Village:</strong> {patient.location || "N/A"}
      </div>

      {/* ✅ Add Next of Kin */}
      <div>
        <strong>Next of Kin Name:</strong> {patient.next_of_kin_name || "N/A"}
      </div>
      <div>
        <strong>Next of Kin Phone:</strong> {patient.next_of_kin_phone || "N/A"}
      </div>

      <h3>Triage Record</h3>
      {triage ? (
        <>
          <div>
            <strong>Temperature:</strong> {triage.temperature}°C
          </div>
          <div>
            <strong>Weight:</strong> {triage.weight} kg
          </div>
          <div>
            <strong>Height:</strong> {triage.height} cm
          </div>
          <div>
            <strong>BMI:</strong> {triage.bmi}
          </div>
          <div>
            <strong>Blood Pressure:</strong> {triage.blood_pressure}
          </div>
          <div>
            <strong>Pulse Rate:</strong> {triage.pulse_rate}
          </div>
          <div>
            <strong>Respiration Rate:</strong> {triage.respiration_rate}
          </div>
          <div>
            <strong>SpO₂:</strong> {triage.spo2}%
          </div>
          <div>
            <strong>Notes:</strong> {triage.notes}
          </div>
        </>
      ) : (
        <p>No triage record found.</p>
      )}

      {allVisits.length > 0 && (
        <>
          <h3>Visits</h3>
          <div className={styles.cardGrid}>
            {allVisits.map((v) => {
              const isEmptyVisit =
                !v.consultation &&
                !v.triage_id &&
                (!v.direct_test_requests ||
                  v.direct_test_requests.length === 0) &&
                (!v.test_requests || v.test_requests.length === 0) &&
                (!v.prescriptions || v.prescriptions.length === 0);

              return (
                <div key={v.id} className={styles.card}>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(v.created_at).toLocaleDateString()}
                    {v.id === visit.id && " (Current)"}
                  </p>

                  {isEmptyVisit ? (
                    <p>No medical records were added for this visit.</p>
                  ) : (
                    <>
                      {/* Direct Test Requests */}
                      {v.direct_test_requests?.length > 0 && (
                        <div>
                          <p>
                            <em>Direct Tests</em>
                          </p>
                          <ul>
                            {v.direct_test_requests.map((t) => (
                              <li key={t.id}>
                                {t.test_type} ({t.category}){" "}
                                {t.notes && ` - ${t.notes}`} -{" "}
                                {t.results || "Pending"}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Consultation Info */}
                      {v.consultation && (
                        <>
                          <p>
                            <strong>Chief Complaint:</strong>{" "}
                            {v.consultation.chief_complain || "N/A"}
                          </p>
                          <p>
                            <strong>Diagnosis:</strong>{" "}
                            {v.consultation.diagnosis || "N/A"}
                          </p>

                          {v.test_requests?.length > 0 && (
                            <div>
                              <strong>Consultation Tests:</strong>
                              <ul>
                                {v.test_requests.map((t) => (
                                  <li key={t.id}>
                                    {t.test_type} - {t.results || "Pending"}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {v.prescriptions?.length > 0 && (
                            <div>
                              <strong>Prescriptions:</strong>
                              <ul>
                                {v.prescriptions.map((p) => (
                                  <li key={p.id}>
                                    {p.medication_name} - {p.dosage}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default PatientInfo;
