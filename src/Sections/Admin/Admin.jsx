// src/components/Admin/Admin.jsx
import React, { useState, useEffect, useCallback } from "react";
import styles from "../Labtech/LabtechStyles.module.css";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import useAuthStore from "../AuthStore/Authstore";
import { FaBars } from "react-icons/fa";
import AdminAnalytics from "./Analytics";
import Medicines from "./Medicines";
import Patients from "./Patients";
import PatientInfo from "../Doctor/PatientInfo";
import PharmacyExpenses from "./Expenses";
import OtherExpenses from "./OtherExpenses";
import AllSales from "./AllSales";

const roles = [
  "receptionist",
  "nurse",
  "doctor",
  "lab_tech",
  "imaging_tech",
  "pharmacist",
  "admin",
];

function Admin() {
  const [users, setUsers] = useState([]);
  const [activeView, setActiveView] = useState("analytics");
  const [selectedUser, setSelectedUser] = useState(null);
  const [serverError, setServerError] = useState("");
  const [patients, setPatients] = useState([]); // ✅ add patients state
  const [selectedVisit, setSelectedVisit] = useState(null);

  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const userRole = useAuthStore((state) => state.userRole);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveUser, setLeaveUser] = useState(null);
  const [leaveStart, setLeaveStart] = useState("");
  const [leaveEnd, setLeaveEnd] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!isLoggedIn || userRole !== "admin") {
      navigate("/");
    }
  }, [isLoggedIn, userRole, navigate]);

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("https://server.tripletsmediclinic.co.ke/users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  }, []);

  // ✅ fetch patients
  const fetchPatients = useCallback(async () => {
    try {
      const res = await fetch("https://server.tripletsmediclinic.co.ke/patients");
      const data = await res.json();
      setPatients(data);
    } catch (err) {
      console.error("Failed to fetch patients:", err);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchPatients(); // ✅ load patients when admin mounts
  }, [fetchUsers, fetchPatients]);


  // Formik for add/edit
  const formik = useFormik({
    initialValues: {
      first_name: "",
      last_name: "",
      email: "",
      national_id: "",
      phone_number: "",
      password: "",
      role: "",
    },
    validationSchema: Yup.object({
      first_name: Yup.string().required("Required"),
      last_name: Yup.string().required("Required"),
      email: Yup.string().email("Invalid email").required("Required"),
      national_id: Yup.string().required("Required"),
      phone_number: Yup.string().required("Required"),
      password: Yup.string().when("isEdit", {
        is: false,
        then: (schema) => schema.required("Required"),
      }),
      role: Yup.string().oneOf(roles).required("Required"),
    }),
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        const method = selectedUser ? "PATCH" : "POST";
        const url = selectedUser
          ? `https://server.tripletsmediclinic.co.ke/users/${selectedUser.id}`
          : "https://server.tripletsmediclinic.co.ke/users";

        const payload = selectedUser
          ? {
              first_name: values.first_name,
              last_name: values.last_name,
              email: values.email,
              national_id: values.national_id,
              phone_number: values.phone_number,
              role: values.role,
              ...(values.password ? { password: values.password } : {}), // only include if entered
            }
          : values;

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json();
          setServerError(errData.error || "Request failed");
          return;
        }

        await fetchUsers();
        setActiveView("userList");
        setSelectedUser(null);
        formik.resetForm();
        setServerError("");
      } catch (err) {
        console.error("Error saving user:", err);
        setServerError(err.message);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleEditUser = (user) => {
    setSelectedUser(user);
    formik.setValues({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      national_id: user.national_id || "",
      phone_number: user.phone_number || "",
      password: "",
      role: user.role,
    });

    setActiveView("editUser");
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await fetch(`https://server.tripletsmediclinic.co.ke/users/${userId}`, {
        method: "DELETE",
      });
      await fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const handleAddLeave = (user) => {
    setLeaveUser(user);
    setLeaveStart("");
    setLeaveEnd("");
    setActiveView("addLeave"); // 🔥 go to the new view
  };

  const submitLeave = async () => {
    if (!leaveStart || !leaveEnd) {
      alert("Please select both start and end dates");
      return;
    }
    try {
      const res = await fetch("https://server.tripletsmediclinic.co.ke/leaveoffs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: leaveUser.id,
          start_datetime: new Date(leaveStart).toISOString(),
          end_datetime: new Date(leaveEnd).toISOString(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert("Failed: " + err.error);
        return; // ❌ stop here, don’t leave modal
      }

      // ✅ success
      await fetchUsers();
      const updatedUser = await fetch(
        `https://server.tripletsmediclinic.co.ke/users/${leaveUser.id}`
      ).then((r) => r.json());

      setLeaveUser(updatedUser); // refresh this user’s leaves
      setActiveView("viewLeaves"); // go back to leaves
      alert("Leave added successfully!");
    } catch (err) {
      console.error("Error adding leave:", err);
      alert("Error adding leave");
    }
  };

  const handleMenuClick = (view) => {
    setActiveView(view);
    setSelectedUser(null);
    setServerError("");
    setIsMenuOpen(false); // close menu on small screens
  };

  const handleViewLeaves = (user) => {
    setLeaveUser(user);
    setActiveView("viewLeaves");
  };
  const now = new Date();

  const renderView = () => {
    switch (activeView) {
      case "viewLeaves":
        return (
          <div className={styles.sectionBox}>
            <h2 className={styles.sectionTitle}>
              Leave History for {leaveUser?.first_name} {leaveUser?.last_name}
            </h2>
            <button
              className={styles.btn}
              onClick={() => handleAddLeave(leaveUser)}
              style={{ marginBottom: "1rem" }}
            >
              Add Leave
            </button>

            {leaveUser?.leave_offs?.length > 0 ? (
              <ul className={styles.patientList}>
                {leaveUser.leave_offs.map((leave) => (
                  <li key={leave.id} className={styles.patientCard}>
                    <div>
                      <strong>Type:</strong> {leave.type}
                    </div>
                    <div>
                      <strong>Start:</strong>{" "}
                      {new Date(leave.start_datetime).toLocaleString()}
                    </div>
                    <div>
                      <strong>End:</strong>{" "}
                      {new Date(leave.end_datetime).toLocaleString()}
                    </div>
                    <div>
                      <strong>Status:</strong>{" "}
                      {new Date(leave.start_datetime) > now ? (
                        <span style={{ color: "blue" }}>Upcoming</span>
                      ) : leave.is_active ? (
                        <span style={{ color: "red" }}>Active</span>
                      ) : (
                        "Completed"
                      )}
                    </div>
                    <div className={styles.buttonGroup}>
                      <button
                        className={styles.btn}
                        onClick={() => {
                          setLeaveStart(
                            new Date(leave.start_datetime)
                              .toISOString()
                              .slice(0, 16)
                          );
                          setLeaveEnd(
                            new Date(leave.end_datetime)
                              .toISOString()
                              .slice(0, 16)
                          );
                          setLeaveUser({ ...leaveUser, editingLeave: leave });
                          setActiveView("editLeave");
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className={`${styles.btn} ${styles.cancelBtn}`}
                        disabled={isSubmitting}
                        onClick={async () => {
                          if (!window.confirm("Delete this leave?")) return;
                          setIsSubmitting(true);
                          try {
                            await fetch(
                              `https://server.tripletsmediclinic.co.ke/leaveoffs/${leave.id}`,
                              {
                                method: "DELETE",
                              }
                            );
                            const updatedUser = await fetch(
                              `https://server.tripletsmediclinic.co.ke/users/${leaveUser.id}`
                            ).then((r) => r.json());
                            setLeaveUser(updatedUser);
                            await fetchUsers();
                          } finally {
                            setIsSubmitting(false);
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No leave records found.</p>
            )}

            <div className={styles.buttonGroup}>
              <button
                className={`${styles.btn} ${styles.cancelBtn}`}
                onClick={() => setActiveView("userList")}
              >
                Back
              </button>
            </div>
          </div>
        );

      case "editLeave":
        return (
          <form className={styles.sectionBox}>
            <h2 className={styles.sectionTitle}>
              Edit Leave for {leaveUser?.first_name} {leaveUser?.last_name}
            </h2>

            <div className={styles.formGroup}>
              <label>Start Date/Time</label>
              <input
                type="datetime-local"
                value={leaveStart}
                onChange={(e) => setLeaveStart(e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>End Date/Time</label>
              <input
                type="datetime-local"
                value={leaveEnd}
                onChange={(e) => setLeaveEnd(e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.buttonGroup}>
              <button
                type="button"
                className={styles.btn}
                disabled={isSubmitting} // ✅ disable while submitting
                onClick={async () => {
                  setIsSubmitting(true); // ✅ start
                  try {
                    const res = await fetch(
                      `https://server.tripletsmediclinic.co.ke/leaveoffs/${leaveUser.editingLeave.id}`,
                      {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          start_datetime: new Date(leaveStart).toISOString(),
                          end_datetime: new Date(leaveEnd).toISOString(),
                        }),
                      }
                    );

                    if (!res.ok) {
                      const err = await res.json();
                      alert("Failed: " + err.error);
                      return;
                    }

                    const updatedUser = await fetch(
                      `https://server.tripletsmediclinic.co.ke/users/${leaveUser.id}`
                    ).then((r) => r.json());

                    await fetchUsers();

                    setLeaveUser(updatedUser);
                    setActiveView("viewLeaves");
                  } catch (err) {
                    console.error("Error updating leave:", err);
                    alert("Error updating leave");
                  } finally {
                    setIsSubmitting(false); // ✅ end
                  }
                }}
              >
                {isSubmitting ? "Saving..." : "Save"} {/* ✅ feedback */}
              </button>

              <button
                type="button"
                className={`${styles.btn} ${styles.cancelBtn}`}
                onClick={() => setActiveView("viewLeaves")}
                disabled={isSubmitting} // ✅ block cancel while saving
              >
                Cancel
              </button>
            </div>
          </form>
        );

      case "addLeave":
        return (
          <form className={styles.sectionBox}>
            <h2 className={styles.sectionTitle}>
              Add Leave for {leaveUser?.first_name} {leaveUser?.last_name}
            </h2>

            <div className={styles.formGroup}>
              <label>Start Date/Time</label>
              <input
                type="datetime-local"
                value={leaveStart}
                onChange={(e) => setLeaveStart(e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>End Date/Time</label>
              <input
                type="datetime-local"
                value={leaveEnd}
                onChange={(e) => setLeaveEnd(e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.buttonGroup}>
              <button
                type="button"
                className={styles.btn}
                disabled={isSubmitting}
                onClick={async () => {
                  await submitLeave();
                }}
              >
                Save
              </button>

              <button
                type="button"
                className={`${styles.btn} ${styles.cancelBtn}`}
                onClick={() => setActiveView("viewLeaves")}
              >
                Cancel
              </button>
            </div>
          </form>
        );

      case "addUser":
      case "editUser":
        return (
          <form onSubmit={formik.handleSubmit} className={styles.sectionBox}>
            <h2 className={styles.sectionTitle}>
              {selectedUser ? "Edit User" : "Add User"}
            </h2>

            {[
              "first_name",
              "last_name",
              "email",
              "national_id",
              "phone_number",
              "password",
              "role",
            ].map((field) => (
              <div key={field} className={styles.formGroup}>
                <label>{field.replace("_", " ")}</label>
                {field === "role" ? (
                  <select
                    name="role"
                    value={formik.values.role}
                    onChange={formik.handleChange}
                    className={styles.input}
                  >
                    <option value="">Select role</option>
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                ) : field === "password" ? (
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      alignItems: "center",
                    }}
                  >
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      className={styles.input}
                      placeholder={
                        selectedUser
                          ? "Leave blank to keep current password"
                          : ""
                      }
                    />
                    <label
                      style={{
                        fontSize: "0.85rem",
                        marginLeft: "8px",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={showPassword}
                        onChange={() => setShowPassword((prev) => !prev)}
                        style={{ marginRight: "4px" }}
                      />
                      Show
                    </label>
                  </div>
                ) : (
                  <input
                    type="text"
                    name={field}
                    value={formik.values[field]}
                    onChange={formik.handleChange}
                    className={styles.input}
                  />
                )}
                {formik.errors[field] && (
                  <div className={styles.error}>{formik.errors[field]}</div>
                )}
              </div>
            ))}

            {serverError && <div className={styles.error}>{serverError}</div>}

            <div className={styles.buttonGroup}>
              <button
                disabled={isSubmitting}
                type="submit"
                className={styles.btn}
              >
                Save
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.cancelBtn}`}
                onClick={() => {
                  setActiveView("userList");
                  setSelectedUser(null);
                  formik.resetForm();
                  setServerError("");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        );
      case "allSales":
        return <AllSales />;
      case "patientInfo":
        return (
          <PatientInfo
            visitData={selectedVisit}
            onBack={() => setActiveView("search")}
          />
        );
      case "expenses":
        return <PharmacyExpenses />;
      case "otherexpenses":
        return <OtherExpenses />;
      case "patients":
        return (
          <Patients
            patients={patients}
            setSelectedVisit={setSelectedVisit}
            setActiveView={setActiveView}
          />
        );

      case "analytics":
      default:
        return <AdminAnalytics />;
      case "medicines":
        return <Medicines />;
      case "userList":
        return (
          <div className={styles.sectionBox}>
            <h2 className={styles.sectionTitle}>All Users</h2>
            <button
              className={styles.btn}
              style={{ marginBottom: "1rem" }}
              onClick={() => {
                setActiveView("addUser");
                setSelectedUser(null);
              }}
            >
              + Add Employee
            </button>

            <ul className={styles.patientList}>
              {users.length === 0 ? (
                <li className={styles.emptyMsg}>No users found.</li>
              ) : (
                users.map((user) => (
                  <li key={user.id} className={styles.patientCard}>
                    <div>
                      {user.first_name} {user.last_name} ({user.role})
                    </div>
                    <div>Email: {user.email}</div>
                    <div>National ID: {user.national_id}</div>
                    <div>Phone: {user.phone_number}</div>
                    <div>
                      Created: {new Date(user.created_at).toLocaleString()}
                    </div>

                    <div>
                      Working Status:{" "}
                      {user.active_leave ? (
                        <span style={{ color: "red" }}>On Leave</span>
                      ) : (
                        <span style={{ color: "green" }}>Active</span>
                      )}
                    </div>

                    {/* Optional: button to add leave */}
                    <div className={styles.buttonGroup}>
                      <button
                        className={styles.btn}
                        onClick={() => handleEditUser(user)}
                      >
                        Edit
                      </button>
                      <button
                        className={styles.btn}
                        onClick={() => handleViewLeaves(user)}
                      >
                        View Leaves
                      </button>

                      <button
                        className={`${styles.btn} ${styles.cancelBtn}`}
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        );
    }
  };

  return (
    <div className={styles.dashboardWrapper}>
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>Admin</h2>
        <nav
          className={`${styles.navMenu} ${isMenuOpen ? styles.showMenu : ""}`}
        >
          <button
            className={`${styles.navBtn} ${
              activeView === "analytics" ? styles.active : ""
            }`}
            onClick={() => handleMenuClick("analytics")}
          >
            Analytics
          </button>

          <button
            className={`${styles.navBtn} ${
              activeView === "userList" ? styles.active : ""
            }`}
            onClick={() => handleMenuClick("userList")}
          >
            Manage Employees
          </button>

          <button
            className={`${styles.navBtn} ${
              activeView === "medicines" ? styles.active : ""
            }`}
            onClick={() => handleMenuClick("medicines")}
          >
            Manage Medicines
          </button>
          <button
            className={`${styles.navBtn} ${
              activeView === "allSales" ? styles.active : ""
            }`}
            onClick={() => {
              setActiveView("allSales");
              setSelectedVisit(null);
              setServerError("");
              setIsMenuOpen(false);
            }}
          >
            Pharmacy Sales
          </button>
          <button
            className={`${styles.navBtn} ${
              activeView === "expenses" ? styles.active : ""
            }`}
            onClick={() => handleMenuClick("expenses")}
          >
            Pharmacy Expenses
          </button>
          <button
            className={`${styles.navBtn} ${
              activeView === "otherexpenses" ? styles.active : ""
            }`}
            onClick={() => handleMenuClick("otherexpenses")}
          >
            Other Expenses
          </button>

          <button
            className={`${styles.navBtn} ${
              activeView === "patients" ? styles.active : ""
            }`}
            onClick={() => handleMenuClick("patients")}
          >
            All Patients
          </button>

          {/* Mobile Logout */}
          <button
            className={`${styles.logoutBtn} ${styles.mobileLogout}`}
            onClick={() => {
              logout(navigate);
              setIsMenuOpen(false);
            }}
          >
            Logout
          </button>
        </nav>
        <button
          className={`${styles.logoutBtn} ${styles.desktopLogout}`}
          onClick={() => logout(navigate)}
        >
          Logout
        </button>

        {/* Hamburger icon for mobile */}
        <button
          className={styles.hamburgerBtn}
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          <FaBars />
        </button>
      </aside>

      <main className={styles.mainContent}>{renderView()}</main>
    </div>
  );
}

export default Admin;
