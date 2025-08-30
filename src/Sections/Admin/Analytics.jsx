// src/components/Admin/AdminAnalytics.jsx
import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";
import styles from "./AnalyticStyles.module.css";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF6384"];

function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("https://server.tripletsmediclinic.co.ke/analytics");
        if (!res.ok) throw new Error("Failed to fetch analytics");
        const data = await res.json();
        setAnalytics(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <div className={styles.loader}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!analytics) return null;

  const {
    metrics,
    top_medicines_this_month,
    top_lab_tests_this_month,
    top_imaging_tests_this_month,
  } = analytics;

  return (
    <div className={styles.analyticsWrapper}>
      {/* --- 1. Metrics Cards --- */}
      <div className={styles.cardsContainer}>
        {[
          "all_revenue",
          "total_revenue_past_month",
          "total_patients",
          "patients_this_month",  
          "lab_tests_done_this_month",
          "imaging_tests_done_this_month",
        ].map((key) => (
          <div key={key} className={styles.card}>
            <h4>{key.replace(/_/g, " ").toUpperCase()}</h4>
            <p>{metrics[key]}</p>
          </div>
        ))}
      </div>


      {/* --- 4. Top 10 Medicines --- */}
      <div className={styles.chartBox}>
        <h3>Top 10 Ordered Medicines</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={top_medicines_this_month}>
            <XAxis dataKey="medicine" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total_units" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* --- 5. Top Lab Tests --- */}
      <div className={styles.chartBox}>
        <h3>Top 10 Lab Tests</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={top_lab_tests_this_month}>
            <XAxis dataKey="test" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#0088FE" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* --- 6. Top Imaging Tests --- */}
      <div className={styles.chartBox}>
        <h3>Top 10 Imaging Tests</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={top_imaging_tests_this_month}>
            <XAxis dataKey="test" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#FF8042" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AdminAnalytics;
