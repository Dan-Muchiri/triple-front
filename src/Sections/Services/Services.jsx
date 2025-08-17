import React from 'react'
import styles from "./ServicesStyles.module.css"
import { Link } from 'react-router-dom';
import { IoArrowForward } from 'react-icons/io5'; // Import the arrow icon

function Services() {
  return (
    <>
        <div className={styles.rightWords}>
                        <p className={styles.firstP} >Triple TS Mediclinic</p>
                        <p className={styles.firstP}>[/ˈtrɪpl tiː ɛs ˈmɛdɪklɪnɪk/] noun</p>
                        <p className={styles.firstP}>Trusted care, tailored just for you.</p>
                        <p className={styles.lastP}>
                            At Triple TS Mediclinic, we combine compassionate service with modern medical expertise to provide top-tier care for individuals and families. Whether you need a routine check-up, specialist consultation, or urgent care, we’re here to support your wellness journey—every step of the way.
                        </p>
        </div>
        <section id='services' className={styles.container}>
            <div className={styles.serviceGrid}>
                <div className={styles.left}>
                    <div className={styles.caption}>Our Services</div>
                    <p >Expert clinical care tailored to your health needs</p>
                    <div className={styles.buttons}>
                        <a href="#contact" className={styles.requestButton}>
                            Book an Appointment
                        </a>
                    </div>
                </div>
                <div className={styles.right}>
                    <h1 className={styles.heading}>How can we help you?</h1>
                    <div className={styles.serviceContainer}>
                        <div className={styles.serviceSet1}>
                            <div className={styles.serviceBox}>
                                <div className={styles.boxMain}>
                                    <div className={styles.title}>
                                        <div className={styles.indicator}></div>
                                        <Link to="/" className={styles.link}>
                                            General Consultation
                                        </Link>
                                    </div>
                                    <div className={styles.para}>
                                        <p>Receive personalized attention from our experienced general practitioners who assess your health, diagnose conditions, and guide your wellness journey with care and compassion.</p>
                                    </div>
                                </div>
                                <div className={styles.serviceTags}>
                                    <Link to="/" >Primary Care</Link>
                                    <Link to="/" >Check-ups</Link>
                                    <Link to="/" >Diagnosis</Link>
                                </div>
                                <div className={styles.separator}></div>
                                <div className={styles.cta}>
                                    <a href="#contact" className={styles.webLink}>
                                        Book Now <IoArrowForward />
                                    </a>
                                </div>
                            </div>

                            <div className={styles.serviceBox}>
                                <div className={styles.boxMain}>
                                    <div className={styles.title}>
                                        <div className={styles.indicator5}></div>
                                        <Link to="/" className={styles.link}>
                                            Laboratory Services
                                        </Link>
                                    </div>
                                    <div className={styles.para}>
                                        <p>We provide accurate and timely diagnostic tests including blood tests, urinalysis, and other essential investigations to support your treatment plan.</p>
                                    </div>
                                </div>
                                <div className={styles.serviceTags}>
                                    <Link to="/" >Blood Work</Link>
                                    <Link to="/" >Diagnostics</Link>
                                    <Link to="/" >Health Screening</Link>
                                </div>
                                <div className={styles.separator}></div>
                                <div className={styles.cta}>
                                    <a href="#contact" className={styles.webLink}>
                                        Book a Lab Test <IoArrowForward />
                                    </a>
                                </div>
                            </div>

                            <div className={styles.serviceBox}>
                            <div className={styles.boxMain}>
                                <div className={styles.title2}>
                                <div className={styles.indicator4}></div>
                                <Link to="/" className={styles.link}>
                                    Imaging Services
                                </Link>
                                </div>
                                <div className={styles.para}>
                                <p>
                                    Our imaging department provides fast, accurate diagnostic services to support your health journey. We offer ultrasound, X-ray, and other imaging technologies operated by skilled technicians and interpreted by experienced radiologists.
                                </p>
                                </div>
                            </div>
                            <div className={styles.serviceTags}>
                                <Link to="/">Ultrasound</Link>
                                <Link to="/">X-ray</Link>
                                <Link to="/">Diagnostic Support</Link>
                                <Link to="/">Radiology Consultations</Link>
                                <Link to="/">Image Reporting</Link>
                            </div>
                            <div className={styles.separator}></div>
                            <div className={styles.cta}>
                                <a href="#contact" className={styles.webLink}>
                                Book Imaging Service <IoArrowForward />
                                </a>
                            </div>
                            </div>


                            <div className={styles.serviceBox}>
                                <div className={styles.boxMain}>
                                    <div className={styles.title}>
                                        <div className={styles.indicator}></div>
                                        <Link to="/" className={styles.link}>
                                            Maternal & Child Health
                                        </Link>
                                    </div>
                                    <div className={styles.para}>
                                        <p>Specialized care for mothers and children, including prenatal visits, immunizations, nutrition counseling, and pediatric services to promote lifelong health.</p>
                                    </div>
                                </div>
                                <div className={styles.serviceTags}>
                                    <Link to="/" >Prenatal</Link>
                                    <Link to="/" >Immunization</Link>
                                    <Link to="/" >Pediatrics</Link>
                                </div>
                                <div className={styles.separator}></div>
                                <div className={styles.cta}>
                                    <a href="#contact" className={styles.webLink}>
                                        Visit MCH Clinic <IoArrowForward />
                                    </a>
                                </div>
                            </div>

                            <div className={styles.serviceBox}>
                                <div className={styles.boxMain}>
                                    <div className={styles.title2}>
                                        <div className={styles.indicator2}></div>
                                        <Link to="/" className={styles.link}>
                                            Pharmacy
                                        </Link>
                                    </div>
                                    <div className={styles.para}>
                                        <p>Access a wide range of prescription and over-the-counter medications dispensed by licensed professionals who offer guidance on proper usage.</p>
                                    </div>
                                    <div className={styles.separator}></div>
                                    <div className={styles.cta}>
                                        <a href="#contact" className={styles.webLink}>
                                            Order Medication <IoArrowForward />
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.serviceBox}>
                                <div className={styles.boxMain}>
                                    <div className={styles.title2}>
                                        <div className={styles.indicator3}></div>
                                        <Link to="/" className={styles.link}>
                                            Minor Procedures
                                        </Link>
                                    </div>
                                    <div className={styles.para}>
                                        <p>We perform minor surgical procedures such as wound suturing, abscess drainage, and dressing changes in a clean and controlled environment.</p>
                                    </div>
                                </div>
                                <div className={styles.serviceTags}>
                                    <Link to="/" >Wound Care</Link>
                                    <Link to="/" >Injections</Link>
                                    <Link to="/" >Suturing</Link>
                                </div>
                                <div className={styles.separator}></div>
                                <div className={styles.cta}>
                                    <a href="#contact" className={styles.webLink}>
                                        View All Services <IoArrowForward />
                                    </a>
                                </div>
                            </div>

                            <div className={styles.serviceBox}>
                                <div className={styles.boxMain}>
                                    <div className={styles.title2}>
                                        <div className={styles.indicator4}></div>
                                        <Link to="/" className={styles.link}>
                                            Counseling Services
                                        </Link>
                                    </div>
                                    <div className={styles.para}>
                                        <p>Our professional counselors provide mental health support, including stress management, grief counseling, and wellness therapy to promote emotional well-being.</p>
                                    </div>
                                </div>
                                <div className={styles.serviceTags}>
                                    <Link to="/" >Mental Health</Link>
                                    <Link to="/" >Therapy</Link>
                                    <Link to="/" >Emotional Support</Link>
                                </div>
                                <div className={styles.separator}></div>
                                <div className={styles.cta}>
                                    <a href="#contact" className={styles.webLink}>
                                        Speak to a Counselor <IoArrowForward />
                                    </a>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </section>
    </>
  )
}

export default Services
