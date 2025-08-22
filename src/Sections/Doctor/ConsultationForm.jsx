import React, { useState, useEffect } from "react";
import styles from "./DoctorStyles.module.css";

export default function ConsultationForm({
  visit,
  consultationId,
  setConsultationId,
  setActiveView,
  doctorId,
}) {
  const [diagnosis, setDiagnosis] = useState("");
  const [chiefComplain, setChiefComplain] = useState("");
  const [physicalExam, setPhysicalExam] = useState("");
  const [systemicExam, setSystemicExam] = useState("");
  const [notes, setNotes] = useState("");

  // testRequests / prescriptions items have shape:
  // { _tempId?, id?, category, test_type, notes, saved?, saving? }
  const [testTypes, setTestTypes] = useState([]);
  const [testRequests, setTestRequests] = useState([]);

  const [serverError, setServerError] = useState("");

  const [medicines, setMedicines] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const res = await api("/medicines"); // fetch all medicines
        const data = await res.json();
        setMedicines(data);
      } catch (err) {
        console.error("Failed to fetch medicines:", err);
      }
    };
    fetchMedicines();
  }, []);

  const handleMedicationInput = (index, value) => {
    setPrescriptions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], medication_name: value };
      return copy;
    });

    // Filter suggestions locally
    if (value.length < 1) {
      setPrescriptions((prev) => {
        const copy = [...prev];
        copy[index] = { ...copy[index], suggestions: [] };
        return copy;
      });
      return;
    }

    const filtered = medicines.filter((med) =>
      med.name.toLowerCase().includes(value.toLowerCase())
    );

    setPrescriptions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], suggestions: filtered.slice(0, 10) }; // top 10
      return copy;
    });
  };

  const selectMedication = (index, med) => {
    setPrescriptions((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        medication_name: med.name,
        medicine_id: med.id,
        selling_price: med.selling_price,
        suggestions: [],
      };
      return copy;
    });
  };

  useEffect(() => {
    if (!consultationId) return;

    const fetchConsultation = async () => {
      try {
        const res = await api(`/consultations/${consultationId}`);
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || "Failed to load consultation");

        // Populate form fields
        setDiagnosis(data.diagnosis || "");
        setChiefComplain(data.chief_complain || "");
        setPhysicalExam(data.physical_exam || "");
        setSystemicExam(data.systemic_exam || "");
        setNotes(data.notes || "");

        // Populate related lists
        setTestRequests(data.test_requests || []);
        setPrescriptions(data.prescriptions || []);
      } catch (err) {
        console.error("Fetch consultation error:", err);
        setServerError(err.message || "Failed to fetch consultation");
      }
    };

    fetchConsultation();
  }, [consultationId]);

  useEffect(() => {
    if (!serverError) return;
    const t = setTimeout(() => setServerError(""), 5000);
    return () => clearTimeout(t);
  }, [serverError]);

  useEffect(() => {
    const fetchTestTypes = async () => {
      try {
        const res = await fetch("https://tripletsmediclinic.onrender.com/test_types");
        const data = await res.json();
        setTestTypes(data);
      } catch (err) {
        console.error("Failed to load test types:", err);
      }
    };
    fetchTestTypes();
  }, []);

  // ---- Helpers ----
  const api = (path, opts = {}) =>
    fetch(`https://tripletsmediclinic.onrender.com${path}`, {
      headers: { "Content-Type": "application/json" },
      ...opts,
    });

  // Start consultation if none exists (called by parent OR from here)
  const startConsultation = async () => {
    try {
      setServerError("");
      const res = await api("/consultations", {
        method: "POST",
        body: JSON.stringify({
          visit_id: visit.id,
          patient_id: visit.patient_id,
          doctor_id: doctorId,
        }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data.error || data.message || "Failed to start consultation"
        );
      setConsultationId(data.id);
    } catch (err) {
      console.error("Start consultation error:", err);
      setServerError(err.message || "Failed to start consultation");
    }
  };

  // ---- Test requests ----
  const addTestRequest = () => {
    const tempId = `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setTestRequests((s) => [
      ...s,
      {
        _tempId: tempId,
        category: "lab",
        test_type: "",
        notes: "",
        saved: false,
        saving: false,
      },
    ]);
  };

  const handleTestChange = (index, field, value) => {
    setTestRequests((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const saveTestRequest = async (index) => {
    const item = testRequests[index];
    if (!item) return;
    if (!consultationId) {
      setServerError(
        "Consultation not started — press 'Start Consultation' first."
      );
      return;
    }

    try {
      setTestRequests((s) => {
        const copy = [...s];
        copy[index] = { ...copy[index], saving: true };
        return copy;
      });

      let res, data;
      if (item.id) {
        res = await api(`/test_requests/${item.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            category: item.category,
            test_type_id: item.test_type_id,
            notes: item.notes,
          }),
        });
      } else {
        res = await api("/test_requests", {
          method: "POST",
          body: JSON.stringify({
            consultation_id: consultationId,
            category: item.category,
            test_type_id: item.test_type_id,
            notes: item.notes,
          }),
        });
      }

      // update local item with server response (id etc)
      setTestRequests((prev) => {
        const copy = [...prev];
        copy[index] = {
          ...copy[index],
          ...data,
          saved: true,
          saving: false,
          _tempId: undefined,
        };
        return copy;
      });
    } catch (err) {
      console.error("saveTestRequest:", err);
      setServerError(err.message || "Failed to save test request");
      setTestRequests((s) => {
        const copy = [...s];
        if (copy[index]) copy[index].saving = false;
        return copy;
      });
    }
  };

  const removeTestRequest = async (index) => {
    const item = testRequests[index];
    if (!item) return;

    // if saved on server, delete; otherwise just remove locally
    if (item.id) {
      try {
        const res = await api(`/test_requests/${item.id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(
            data.error || data.message || "Failed to delete test request"
          );
        }
      } catch (err) {
        console.error("delete test:", err);
        setServerError(err.message || "Failed to delete test request");
        return;
      }
    }

    setTestRequests((prev) => prev.filter((_, i) => i !== index));
  };

  // ---- Prescriptions ----
  const addPrescription = () => {
    const tempId = `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setPrescriptions((s) => [
      ...s,
      {
        _tempId: tempId,
        medication_name: "",
        dosage: "",
        instructions: "",
        saved: false,
        saving: false,
      },
    ]);
  };

  const handlePrescriptionChange = (index, field, value) => {
    setPrescriptions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const savePrescription = async (index) => {
    const item = prescriptions[index];
    if (!item) return;

    if (!consultationId) {
      setServerError(
        "Consultation not started — press 'Start Consultation' first."
      );
      return;
    }

    if (!item.medicine_id) {
      setServerError("Please select a medicine from the list.");
      return;
    }

    try {
      setPrescriptions((s) => {
        const copy = [...s];
        copy[index] = { ...copy[index], saving: true };
        return copy;
      });

      let res, data;
      const body = {
        consultation_id: consultationId,
        medicine_id: item.medicine_id,
        dosage: item.dosage,
        instructions: item.instructions,
      };

      if (item.id) {
        // UPDATE existing prescription
        res = await api(`/prescriptions/${item.id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
      } else {
        // CREATE new prescription
        res = await api("/prescriptions", {
          method: "POST",
          body: JSON.stringify(body),
        });
      }

      data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Failed");

      setPrescriptions((prev) => {
        const copy = [...prev];
        copy[index] = {
          ...copy[index],
          ...data,
          saved: true,
          saving: false,
          _tempId: undefined,
        };
        return copy;
      });
    } catch (err) {
      console.error("savePrescription:", err);
      setServerError(err.message || "Failed to save prescription");
      setPrescriptions((s) => {
        const copy = [...s];
        if (copy[index]) copy[index].saving = false;
        return copy;
      });
    }
  };

  const removePrescription = async (index) => {
    const item = prescriptions[index];
    if (!item) return;

    if (item.id) {
      try {
        const res = await api(`/prescriptions/${item.id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(
            data.error || data.message || "Failed to delete prescription"
          );
        }
      } catch (err) {
        console.error("delete prescription:", err);
        setServerError(err.message || "Failed to delete prescription");
        return;
      }
    }

    setPrescriptions((prev) => prev.filter((_, i) => i !== index));
  };

  // ---- Finalize consultation (PATCH) ----
  const handleSubmit = async () => {
    if (!consultationId) {
      setServerError(
        "Consultation not started — press 'Start Consultation' first."
      );
      return;
    }

    try {
      setServerError("");

      // ✅ Only update the consultation, don’t touch the visit
      const res = await api(`/consultations/${consultationId}`, {
        method: "PATCH",
        body: JSON.stringify({
          diagnosis,
          chief_complain: chiefComplain,
          physical_exam: physicalExam,
          systemic_exam: systemicExam,
          notes,
          stage: "completed",
        }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data.error || data.message || "Failed to complete consultation"
        );

      alert("Consultation updated");
      setActiveView("waitingConsultation");
    } catch (err) {
      console.error("complete consultation:", err);
      setServerError(err.message || "Failed to complete consultation");
    }
  };

  // ---- Render ----
  return (
    <div className={styles.consultForm}>
      <h2>Consultation Form</h2>

      {!consultationId && (
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ marginBottom: 6 }}>
            Consultation hasn't been started yet. Press start to create a
            consultation record.
          </div>
          <button className={styles.btn} onClick={startConsultation}>
            Start Consultation
          </button>
        </div>
      )}

      {serverError && (
        <div className={styles.error} style={{ marginBottom: "1rem" }}>
          {serverError}
        </div>
      )}

      <div className={styles.formGroup}>
        <label>Chief Complaint</label>
        <textarea
          value={chiefComplain}
          onChange={(e) => setChiefComplain(e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Physical Exam</label>
        <textarea
          value={physicalExam}
          onChange={(e) => setPhysicalExam(e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Systemic Exam</label>
        <textarea
          value={systemicExam}
          onChange={(e) => setSystemicExam(e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Diagnosis</label>
        <textarea
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <hr />

      <h3>Test Requests</h3>
      {testRequests.map((test, index) => (
        <div key={test.id || test._tempId} className={styles.formGroup}>
          <select
            value={test.category}
            onChange={(e) =>
              handleTestChange(index, "category", e.target.value)
            }
            disabled={test.saving}
          >
            <option value="lab">Lab</option>
            <option value="imaging">Imaging</option>
          </select>

          <select
            value={test.test_type_id || ""}
            onChange={(e) =>
              handleTestChange(index, "test_type_id", parseInt(e.target.value))
            }
            disabled={test.saving}
          >
            <option value="">-- Select Test Type --</option>
            {testTypes
              .filter((tt) => tt.category === test.category) // optional: filter by chosen category
              .map((tt) => (
                <option key={tt.id} value={tt.id}>
                  {tt.name} (KES {tt.price})
                </option>
              ))}
          </select>

          <input
            type="text"
            placeholder="Notes"
            value={test.notes}
            onChange={(e) => handleTestChange(index, "notes", e.target.value)}
            disabled={test.saving}
          />

          {/* ✅ Show Results field if results exist */}
          {test.results && (
            <div className={styles.resultsField}>
              <label>Results:</label>
              <textarea value={test.results} readOnly />
            </div>
          )}

          <div className={styles.buttonGroup}>
            {!test.saved ? (
              <>
                <button
                  className={styles.btn}
                  onClick={() => saveTestRequest(index)}
                  disabled={test.saving}
                >
                  {test.saving ? "Saving..." : "Save"}
                </button>
                <button
                  className={styles.btn}
                  onClick={() => removeTestRequest(index)}
                  disabled={test.saving}
                >
                  Remove
                </button>
              </>
            ) : (
              <>
                <span className={styles.savedLabel}>Saved</span>
                <button
                  className={styles.btn}
                  onClick={() => saveTestRequest(index)}
                >
                  Update
                </button>
                <button
                  className={styles.btn}
                  onClick={() => removeTestRequest(index)}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      ))}

      <div className={styles.addButtonContainer}>
        <button className={styles.btn} onClick={addTestRequest}>
          + Add Test Request
        </button>
      </div>

      <hr />

      <h3>Prescriptions</h3>
      {/* ---- Prescriptions ---- */}
      {prescriptions.map((pres, index) => (
        <div key={pres.id || pres._tempId} className={styles.formGroup}>
          <input
            type="text"
            placeholder="Medication Name"
            value={pres.medication_name}
            onChange={(e) => handleMedicationInput(index, e.target.value)}
            disabled={pres.saving}
          />
          {pres.suggestions?.length > 0 && (
            <ul className={styles.suggestions}>
              {pres.suggestions.map((med) => (
                <li key={med.id} onClick={() => selectMedication(index, med)}>
                  {med.name} ({med.unit}) — Ksh {med.selling_price}
                </li>
              ))}
            </ul>
          )}

          <input
            type="text"
            placeholder="Dosage"
            value={pres.dosage}
            onChange={(e) =>
              handlePrescriptionChange(index, "dosage", e.target.value)
            }
            disabled={pres.saving}
          />
          <input
            type="text"
            placeholder="Instructions"
            value={pres.instructions}
            onChange={(e) =>
              handlePrescriptionChange(index, "instructions", e.target.value)
            }
            disabled={pres.saving}
          />
          <div className={styles.buttonGroup}>
            {!pres.saved ? (
              <>
                <button
                  className={styles.btn}
                  onClick={() => savePrescription(index)}
                  disabled={pres.saving}
                >
                  {pres.saving ? "Saving..." : "Save"}
                </button>
                <button
                  className={styles.btn}
                  onClick={() => removePrescription(index)}
                  disabled={pres.saving}
                >
                  Remove
                </button>
              </>
            ) : (
              <>
                <span className={styles.savedLabel}>Saved</span>
                <button
                  className={styles.btn}
                  onClick={() => savePrescription(index)}
                >
                  Update
                </button>
                <button
                  className={styles.btn}
                  onClick={() => removePrescription(index)}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      ))}

      {/* Add button right below the list */}
      <div className={styles.addButtonContainer}>
        <button className={styles.btn} onClick={addPrescription}>
          + Add Prescription
        </button>
      </div>

      <hr />
      <div style={{ display: "flex", gap: "1rem" }}>
        <button
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={!consultationId}
        >
          Submit Consultation
        </button>
        <button
          className={styles.cancelBtn}
          onClick={() => setActiveView("waitingConsultation")}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
