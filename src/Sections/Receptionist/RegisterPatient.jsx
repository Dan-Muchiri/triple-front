import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import styles from "./ReceptionistStyles.module.css";

export default function RegisterPatient({ fetchPatients, setActiveView }) {
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false); 

  useEffect(() => {
    if (serverError) {
      const timeout = setTimeout(() => setServerError(""), 5000);
      return () => clearTimeout(timeout);
    }
  }, [serverError]);

  const formik = useFormik({
    initialValues: {
      first_name: "",
      last_name: "",
      gender: "",
      dob: "",
      national_id: "",
      phone_number: "",
      email: "",
      next_of_kin_name: "", // ✅ new
      next_of_kin_phone: "",
      location: "",
      subcounty: "", 
    },

    validationSchema: Yup.object({
      first_name: Yup.string().required("Required"),
      last_name: Yup.string().required("Required"),
      gender: Yup.string().oneOf(["male", "female"]).required("Required"),
      dob: Yup.date().required("Required"),
      national_id: Yup.string(),
      phone_number: Yup.string(),
      email: Yup.string().email("Invalid email"),
      next_of_kin_name: Yup.string(), // ✅ new
      next_of_kin_phone: Yup.string(),
      location: Yup.string(),
      subcounty: Yup.string(),
    }),

    onSubmit: async (values, { resetForm }) => {
      try {
         setSubmitting(true);
        setServerError("");
        const res = await fetch("https://server.tripletsmediclinic.co.ke/patients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.error || data.message || "Unknown error occurred"
          );
        }

        resetForm();
        fetchPatients();
        setActiveView("search");
      } catch (error) {
        console.error("Registration error:", error);
        setServerError(error.message || "Unexpected error");
      } finally {
        setSubmitting(false); // ✅ stop loading
      }
    },
  });

  return (
    <form
      onSubmit={formik.handleSubmit}
      className={`${styles.sectionBox} ${styles.flexOne}`}
    >
      <h2 className={styles.sectionTitle}>Register New Patient</h2>

      {[
        "first_name",
        "last_name",
        "gender",
        "dob",
        "national_id",
        "phone_number",
        "email",
        "next_of_kin_name", // ✅ new
        "next_of_kin_phone",
        "location",
        "subcounty",
      ].map((field) => (
        <div className={styles.formGroup} key={field}>
          {/* ✅ Show Village for location */}
          <label>
            {field === "location"
              ? "Village"
              : field.replace(/_/g, " ")}
          </label>

          {field === "gender" ? (
            <select
              name="gender"
              value={formik.values.gender}
              onChange={formik.handleChange}
              className={styles.input}
              onBlur={formik.handleBlur}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          ) : (
            <input
              type={field === "dob" ? "date" : "text"}
              name={field}
              value={formik.values[field]}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={styles.input}
            />
          )}
          {formik.errors[field] && formik.touched[field] && (
            <div className={styles.error}>{formik.errors[field]}</div>
          )}
        </div>
      ))}

      {serverError && (
        <div className={styles.error} style={{ marginBottom: "1rem" }}>
          {serverError}
        </div>
      )}

      <div className={styles.buttonGroup}>
        <button
          type="submit"
          className={`${styles.btn} ${styles.registerBtn}`}
          disabled={submitting} // ✅ prevent duplicate
        >
          {submitting ? "Registering..." : "Register"} {/* ✅ loading text */}
        </button>
        <button
          type="button"
          className={`${styles.btn} ${styles.cancelBtn}`}
          onClick={() => {
            formik.resetForm();
            setServerError("");
            setActiveView("search");
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
