// src/components/TestRequestModal.jsx
import React, { useState, useEffect } from "react";
import styles from "./ReceptionistStyles.module.css";

export default function TestRequestModal({ visitId, onClose }) {
  const [testTypes, setTestTypes] = useState([]);
  const [testRequests, setTestRequests] = useState([]);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    const fetchTestTypes = async () => {
      try {
        const res = await fetch("https://tripletsmediclinic.onrender.com/test_types");
        const data = await res.json();
        setTestTypes(data);
      } catch (err) {
        console.error("Failed to load test types:", err);
        setServerError("Failed to load test types");
      }
    };
    fetchTestTypes();
  }, []);

  const api = (path, opts = {}) =>
    fetch(`https://tripletsmediclinic.onrender.com${path}`, {
      headers: { "Content-Type": "application/json" },
      ...opts,
    });

  const addTestRequest = () => {
    const tempId = `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setTestRequests((s) => [
      ...s,
      {
        _tempId: tempId,
        category: "lab",
        test_type_id: "",
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

  const selectedTestType = (test_type_id) =>
    testTypes.find((tt) => tt.id === Number(test_type_id));

  const saveTestRequest = async (index) => {
    const item = testRequests[index];
    if (!item) return;

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
        data = await res.json();
      } else {
        res = await api("/test_requests", {
          method: "POST",
          body: JSON.stringify({
            // 🔸 Backend should support creating a test request directly under a visit
            visit_id: visitId,
            category: item.category,
            test_type_id: item.test_type_id,
            notes: item.notes,
            // If your API expects price from client, also send:
            // price: selectedTestType(item.test_type_id)?.price
          }),
        });
        data = await res.json();
      }

      if (!res.ok) throw new Error(data.error || data.message || "Failed to save test request");

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

    if (item.id) {
      try {
        const res = await api(`/test_requests/${item.id}`, { method: "DELETE" });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || data.message || "Failed to delete test request");
        }
      } catch (err) {
        console.error("delete test:", err);
        setServerError(err.message || "Failed to delete test request");
        return;
      }
    }

    setTestRequests((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Test Requests</h2>

        {serverError && (
          <div className={styles.error} style={{ marginBottom: "1rem" }}>
            {serverError}
          </div>
        )}

        {testRequests.map((test, index) => {
          const tt = selectedTestType(test.test_type_id);
          return (
            <div key={test.id || test._tempId} className={styles.formGroup}>
              <select
                value={test.category}
                onChange={(e) => handleTestChange(index, "category", e.target.value)}
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
                  .filter((x) => x.category === test.category)
                  .map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name} (KES {x.price})
                    </option>
                  ))}
              </select>

              {/* Auto-filled amount (read-only, like doctor.jsx) */}
              <input
                type="number"
                value={tt ? tt.price : ""}
                placeholder="Amount"
                readOnly
                className={styles.input}
              />

              <input
                type="text"
                placeholder="Notes"
                value={test.notes}
                onChange={(e) => handleTestChange(index, "notes", e.target.value)}
                disabled={test.saving}
              />

              <div className={styles.buttonGroup}>
                {!test.saved ? (
                  <>
                    <button
                      className={styles.btn}
                      onClick={() => saveTestRequest(index)}
                      disabled={test.saving || !test.test_type_id}
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
          );
        })}

        <div className={styles.addButtonContainer}>
          <button className={styles.btn} onClick={addTestRequest}>
            + Add Test Request
          </button>
        </div>

        <div className={styles.modalActions}>
          <button className={`${styles.btn} ${styles.cancelBtn}`} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
