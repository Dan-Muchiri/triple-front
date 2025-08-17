import React, { useState } from 'react';
import styles from "./ContactStyles.module.css";
import { Link } from 'react-router-dom';
import { IoArrowForward } from 'react-icons/io5'; // Import the arrow icon

function Contact() {
    const [touchedFields, setTouchedFields] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [formValid, setFormValid] = useState(true); // State to track form validity

    const handleFocus = (field) => {
        setTouchedFields((prev) => ({ ...prev, [field]: true }));
    };

    const handleBlur = (field) => {
        setTouchedFields((prev) => ({ ...prev, [field]: false }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const form = e.target;
        const isFormValid = form.checkValidity(); // Check form validity

        if (isFormValid) {
            // Submit the form
            setFormValid(true);
            setSubmitted(true); // Set submitted to true
            form.submit();
        } else {
            setFormValid(false); // Set formValid to false if not valid
        }
    };

    return (
        <section id='contact' className={styles.container}>
            <div className={styles.titleBlock}>
                        <p className={styles.leftP1}>Contact Us</p>
                    </div>
            <div className={styles.wrapper}>
                <div className={styles.right}>
                    <form action="" method="post" className={styles.formContainer} onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label htmlFor="name">Name<span className={styles.required}>*</span></label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                required
                                onFocus={() => handleFocus('name')}
                                onBlur={() => handleBlur('name')}
                                className={touchedFields.firstName && !document.getElementById('name').value ? styles.invalid : ''}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="email">Email<span className={styles.required}>*</span></label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                required
                                onFocus={() => handleFocus('email')}
                                onBlur={() => handleBlur('email')}
                                className={touchedFields.email && !document.getElementById('email').value ? styles.invalid : ''}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="phone">Phone Number<span className={styles.required}>*</span></label>
                            <input
                                type="tel"
                                name="phone"
                                id="phone"
                                required
                                onFocus={() => handleFocus('phone')}
                                onBlur={() => handleBlur('phone')}
                                className={touchedFields.phone && !document.getElementById('phone').value ? styles.invalid : ''}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="projectDetails">How may we help?<span className={styles.required}>*</span></label>
                            <textarea
                                name="projectDetails"
                                id="projectDetails"
                                required
                                onFocus={() => handleFocus('projectDetails')}
                                onBlur={() => handleBlur('projectDetails')}
                                className={touchedFields.projectDetails && !document.getElementById('projectDetails').value ? styles.invalid : ''}
                            ></textarea>
                        </div>
                        <input className={styles.subButton} type="submit" value="Submit" />
                        {/* Display message if the form is invalid */}
                        {!formValid && <p className={styles.errorMessage}>Please fill out the required fields.</p>}
                    </form>
                </div>
                <div className={styles.left}>
                    <div className={styles.contactDetails}>
                        <div className={styles.contactItem}>
                            <strong>Phone:</strong>
                            <p>+0112782133</p>
                            <span>Monday to Friday, 8am to 6pm</span>
                        </div>

                        <div className={styles.contactItem}>
                            <strong>Email:</strong>
                            <p>triple-ts-mediclinic@gmail.com</p>
                            <span>We'll respond within 24 hours</span>
                        </div>

                        <div className={styles.contactItem}>
                            <strong>Hours:</strong>
                            <p>Monday - Friday: 8:00 AM - 8:00 PM</p>
                            <p>Saturday: 9:00 AM - 5:00 PM</p>
                            <p>Sunday: Closed</p>
                        </div>

                        <div className={styles.contactItem}>
                            <strong>Location:</strong>
                            <p>P.O Box 302-60400, CHUKA PLOT 834</p>
                            <p>Mitheru, Tharaka Nithi County</p>
                        </div>
                    </div>
                    
                </div>
            </div>
        </section>
    ); 
}

export default Contact;