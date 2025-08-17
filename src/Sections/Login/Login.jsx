import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../AuthStore/Authstore';
import styles from "./LoginStyles.module.css";
import Header from '../Header/Header';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false); // added state

  const initialValues = {
    email: '',
    password: '',
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().required('Password is required'),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await login(values, navigate);
    } catch (error) {
      console.error('Error occurred:', error);
    }
    setSubmitting(false);
    resetForm();
  };

  return (
    <>
      <Header />
      <div className={styles.loginContainer}>
        <h2 className={styles.loginTitle}>Login</h2>
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ isSubmitting }) => (
            <Form className={styles.loginForm}>
              <div className={styles.formField}>
                <label htmlFor="email">Email</label>
                <Field type="email" name="email" className={styles.formInput} />
                <ErrorMessage name="email" component="div" className={styles.errorMessage} />
              </div>
              <div className={styles.formField}>
                <label htmlFor="password">Password</label>
                <Field
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className={styles.formInput}
                />
                <label
                  style={{
                    fontSize: "0.85rem",
                    marginTop: "8px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={() => setShowPassword(prev => !prev)}
                    style={{ marginRight: "4px" }}
                  />
                  Show Password
                </label>
                <ErrorMessage name="password" component="div" className={styles.errorMessage} />
              </div>
              <button type="submit" disabled={isSubmitting} className={styles.formButton}>
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </>
  );
}

export default Login;
