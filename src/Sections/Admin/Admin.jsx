// src/components/Admin/Admin.jsx
import React, { useState, useEffect, useCallback } from "react";
import styles from "../Labtech/LabtechStyles.module.css";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import useAuthStore from "../AuthStore/Authstore";
import { FaBars } from "react-icons/fa";

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
  const [activeView, setActiveView] = useState("userList");
  const [selectedUser, setSelectedUser] = useState(null);
  const [serverError, setServerError] = useState("");

  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const userRole = useAuthStore((state) => state.userRole);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!isLoggedIn || userRole !== "admin") {
      navigate("/");
    }
  }, [isLoggedIn, userRole, navigate]);

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("https://tripletsmediclinic.onrender.com//users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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
        const method = selectedUser ? "PATCH" : "POST";
        const url = selectedUser
          ? `https://tripletsmediclinic.onrender.com//users/${selectedUser.id}`
          : "https://tripletsmediclinic.onrender.com//users";

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
      await fetch(`https://tripletsmediclinic.onrender.com/${userId}`, {
        method: "DELETE",
      });
      await fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const renderView = () => {
    switch (activeView) {
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
              <button type="submit" className={styles.btn}>
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

      case "userList":
      default:
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
              + Add User
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
                    <div className={styles.buttonGroup}>
                      <button
                        className={styles.btn}
                        onClick={() => handleEditUser(user)}
                      >
                        Edit
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
              activeView === "userList" ? styles.active : ""
            }`}
            onClick={() => {
              setActiveView("userList");
              setSelectedUser(null);
              setServerError("");
              setIsMenuOpen(false);
            }}
          >
            Manage Users
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
