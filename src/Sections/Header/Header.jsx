import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from "./HeaderStyles.module.css";
import { FaBars, FaTimes, FaChevronDown } from 'react-icons/fa';

function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const [scrollToSection, setScrollToSection] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    const handleScroll = (id) => {
        if (location.pathname !== "/") {
            setScrollToSection(id);  // Store the section to scroll to
            navigate("/");           // Navigate to the homepage
        } else {
            scrollToElement(id);     // Scroll directly if already on the homepage
        }
        setIsMenuOpen(false); // Close menu on mobile after click
    };

    const scrollToElement = (id) => {
        setTimeout(() => { // Delay to ensure the page is fully loaded
            const element = document.getElementById(id);
            if (element) {
                const headerOffset = 110;
                const elementPosition = element.getBoundingClientRect().top + window.scrollY;
                const offsetPosition = elementPosition - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth",
                });
            }
        }, 200); // Small delay to allow rendering
    };

    // Scroll to the section after navigation completes
    useEffect(() => {
        if (scrollToSection) {
            scrollToElement(scrollToSection);
            setScrollToSection(null); // Reset after scrolling
        }
    }, [location, scrollToSection]);


    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <section id='header' className={styles.container}>
            <div className={styles.sub}>
                <div className={styles.logo}>
                    <p className={styles.logoName}>Triple TS Mediclinic</p>
                </div>
                <div className={`${styles.navBlock} ${isMenuOpen ? styles.showMenu : ''}`}>
                    <nav className={styles.nav}>
                         <Link to="/" onClick={() => handleScroll("hero")}>Home</Link>
                         <Link to="/" onClick={() => handleScroll("services")}>Services</Link>
                         <Link to="/" onClick={() => handleScroll("contact")}>Contact</Link>

                         {/* Staff Dropdown */}
                        <div className={styles.dropdown}>
                            <a className={styles.dropdownLink}>
                                Staff <FaChevronDown size={12} />
                            </a>
                            <div className={styles.dropdownMenu}>
                                <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
                            </div>
                        </div>

        
                    </nav>
                </div>

                <div className={`${styles.separator} ${isMenuOpen ? styles.showMenu : ''}`}></div>
                {/* Book Appointment button */}
                <Link to="/" onClick={() => handleScroll("contact")}className={`${styles.requestButton} ${isMenuOpen ? styles.showMenu : ''}`}>
                    Book Appointment</Link>

                <div className={styles.menuIcon} onClick={toggleMenu}>
                    {isMenuOpen ? <div className={styles.menu}>Close<FaTimes size={18} /></div> : <div className={styles.menu}>Menu<FaBars size={18} /></div>}
                </div>
            </div>
        </section>
    );
}

export default Header;