import React, { useState, useEffect } from "react";
import styles from "./ReceptionistStyles.module.css";

export default function SearchPatients({
  fetchPatients,
  patients,
  visits,
  setSelectedVisit,
  setActiveView,
  startVisit,
}) {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (serverError) {
      const timeout = setTimeout(() => setServerError(""), 5000);
      return () => clearTimeout(timeout);
    }
  }, [serverError]);

  const filteredPatients = search
    ? patients.filter(
        (p) =>
          (p.national_id && p.national_id.includes(search)) ||
          (p.phone_number && p.phone_number.includes(search)) ||
          (p.email && p.email.toLowerCase().includes(search.toLowerCase())) ||
          (p.first_name &&
            p.first_name.toLowerCase().includes(search.toLowerCase())) ||
          (p.last_name &&
            p.last_name.toLowerCase().includes(search.toLowerCase()))
      )
    : [];

  return (
    <div className={`${styles.sectionBox} ${styles.flexOne}`}>
      <h2 className={styles.sectionTitle}>Search Patients</h2>
      <input
        type="text"
        placeholder="Search by name, email, National ID, or phone"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={styles.searchInput}
      />
      <ul className={styles.patientListGrid}>
        {filteredPatients.length === 0 && search ? (
          <li className={styles.emptyMsg}>No patients found.</li>
        ) : (
          filteredPatients.map((patient) => (
            <li key={patient.id} className={styles.patientCardGrid}>
              <div>
                <strong>
                  {patient.first_name} {patient.last_name}
                </strong>{" "}
                ({patient.age} yrs)
              </div>
              <div className={styles.patientCardActions}>
                <button
                  className={`${styles.btn} ${styles.visitBtn}`}
                  onClick={() => {
                    setSelectedPatient(patient);
                    setServerError("");
                    setShowModal(true);
                  }}
                >
                  Info
                </button>
                <button
                  onClick={() => startVisit(patient.id)}
                  className={`${styles.btn} ${styles.visitBtn}`}
                >
                  Start Visit
                </button>
              </div>
            </li>
          ))
        )}
      </ul>

      {showModal && selectedPatient && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Edit Patient Info</h2>

            <form
              className={styles.editForm}
              onSubmit={async (e) => {
                e.preventDefault();
                setServerError("");

                const updatedPatient = {
                  first_name: e.target.first_name.value,
                  last_name: e.target.last_name.value,
                  gender: e.target.gender.value,
                  dob: e.target.dob.value,
                  national_id: e.target.national_id.value,
                  phone_number: e.target.phone_number.value,
                  email: e.target.email.value,
                };

                try {
                  const res = await fetch(
                    `https://tripletsmediclinic.onrender.com/patients/${selectedPatient.id}`,
                    {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(updatedPatient),
                    }
                  );

                  const data = await res.json();

                  if (!res.ok) {
                    let message = "Error updating patient.";
                    if (typeof data === "string") message = data;
                    else if (data.error) message = data.error;
                    else if (data.message) message = data.message;

                    setServerError(message);
                    return;
                  }

                  setShowModal(false);
                  setSelectedPatient(null);
                  fetchPatients();
                } catch (error) {
                  setServerError(error.message || "Unexpected error occurred");
                }
              }}
            >
              <div className={styles.formGrid}>
                {[
                  "first_name",
                  "last_name",
                  "gender",
                  "dob",
                  "national_id",
                  "phone_number",
                  "email",
                ].map((field) => (
                  <div key={field} className={styles.formGroup}>
                    <label>{field.replace("_", " ")}</label>
                    {field === "gender" ? (
                      <select
                        name="gender"
                        defaultValue={selectedPatient.gender}
                        className={styles.input}
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    ) : (
                      <input
                        name={field}
                        type={field === "dob" ? "date" : "text"}
                        defaultValue={selectedPatient[field] || ""}
                        className={styles.input}
                      />
                    )}
                  </div>
                ))}
              </div>

              {serverError && (
                <div className={styles.error} style={{ marginBottom: "1rem" }}>
                  {serverError}
                </div>
              )}

              <div className={styles.modalActions}>
                <div className={styles.buttonGroup}>
                  <button
                    type="submit"
                    className={`${styles.btn} ${styles.registerBtn}`}
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.cancelBtn}`}
                    onClick={() => {
                      setShowModal(false);
                      setSelectedPatient(null);
                      setServerError("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
