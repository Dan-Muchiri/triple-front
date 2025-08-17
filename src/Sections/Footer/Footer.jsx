import React from 'react';
import styles from './FooterStyles.module.css'; // Assuming you have a separate CSS file for styles

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerBottom}>
                <p>&copy; {new Date().getFullYear()} Triple TS Mediclinic. All rights reserved.</p>
            </div>
        </footer>
    );
}

export default Footer;