import React from 'react';
import styles from "./HeroStyles.module.css";
import backimage from "../../../public/back.avif";
import { Link } from 'react-router-dom';
import { IoArrowForward } from 'react-icons/io5'; // Import the arrow icon

function Hero() {
  return (
    <div className={styles.container}>
      <section id='hero' className={styles.sect}>
        <div className={styles.back}>
          <div className={styles.backImage}>
            <img src={backimage} className={styles.image} alt="Background" />
          </div>
          <div className={styles.overlay} />
        </div>
        <div className={styles.heroContent}>
          <div className={styles.contentWrapper}>
            <div className={styles.leftWords}>
                <h1>Your Health, Our Passion</h1>
                <div className={styles.separator}></div>
                <div className={styles.buttons}>
                    <a href="#contact" className={styles.requestButton}>
                    Book an Appointment
                    </a>
                    <a href="#contact" className={styles.link}>
                    Let's Discuss <IoArrowForward />
                    </a>
                </div>
                </div>
                <div className={styles.rightWords}>
                <p>Triple TS Mediclinic</p>
                <p className={styles.firstP}>[/ˈtrɪpl tiː ɛs ˈmɛdɪklɪnɪk/] noun</p>
                <p>Trusted care, tailored just for you.</p>
                <p className={styles.lastP}>
                    At Triple TS Mediclinic, we combine compassionate service with modern medical expertise to provide top-tier care for individuals and families. Whether you need a routine check-up, specialist consultation, or urgent care, we’re here to support your wellness journey—every step of the way.
                </p>
                </div>

          </div>
        </div>
      </section>
    </div>
  );
}

export default Hero;