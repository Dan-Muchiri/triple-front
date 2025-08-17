import React from "react";
import styles from "./DoctorStyles.module.css";

function PatientInfo({ visit, onBack }) {
  if (!visit) return null;

  const patient = visit.patient;
  const triage = visit.triage;

  // Assuming visit.patient.visits contains past visits including consultations, tests, and prescriptions
  const pastVisits = patient.visits?.filter(v => v.id !== visit.id) || [];

  return (
    <div className={styles.sectionBox}>
         <button onClick={onBack}>Back</button>
      <h2>Patient Information</h2>
      <div>
        <strong>Name:</strong> {patient.first_name} {patient.last_name}
      </div>
      <div><strong>Gender:</strong> {patient.gender}</div>
      <div><strong>Age:</strong> {patient.age}</div>
      <div><strong>Phone:</strong> {patient.phone_number}</div>
      <div><strong>Email:</strong> {patient.email}</div>

      <h3>Triage Record</h3>
      {triage ? (
        <>
          <div><strong>Temperature:</strong> {triage.temperature}°C</div>
          <div><strong>Weight:</strong> {triage.weight} kg</div>
          <div><strong>Height:</strong> {triage.height} cm</div>
          <div><strong>BMI:</strong> {triage.bmi}</div>
          <div><strong>Blood Pressure:</strong> {triage.blood_pressure}</div>
          <div><strong>Pulse Rate:</strong> {triage.pulse_rate}</div>
          <div><strong>Respiration Rate:</strong> {triage.respiration_rate}</div>
          <div><strong>SpO₂:</strong> {triage.spo2}%</div>
          <div><strong>Notes:</strong> {triage.notes}</div>
        </>
      ) : (
        <p>No triage record found.</p>
      )}

      {pastVisits.length > 0 && (
        <>
          <h3>Past Visits</h3>
          <div className={styles.cardGrid}>
            {pastVisits.map((pv) => (
              <div key={pv.id} className={styles.card}>
                <p><strong>Date:</strong> {new Date(pv.created_at).toLocaleDateString()}</p>
                {pv.consultation ? (
                  <>
                    <p><strong>Chief Complaint:</strong> {pv.consultation.chief_complain || "N/A"}</p>
                    <p><strong>Diagnosis:</strong> {pv.consultation.diagnosis || "N/A"}</p>
                    {pv.test_requests?.length > 0 && (
                      <div>
                        <strong>Tests:</strong>
                        <ul>
                          {pv.test_requests.map((t) => (
                            <li key={t.id}>{t.test_type} - {t.results}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {pv.prescriptions?.length > 0 && (
                      <div>
                        <strong>Prescriptions:</strong>
                        <ul>
                          {pv.prescriptions.map((p) => (
                            <li key={p.id}>
                              {p.medication_name} - {p.dosage}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <p>No consultation record.</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
}

export default PatientInfo;
