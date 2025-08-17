import { IoStar, IoStarOutline } from 'react-icons/io5';
import React from 'react';
import styles from "./TestimonialsStyles.module.css";
import { IoArrowForward } from 'react-icons/io5';

const Testimonials = () => {
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(i <= rating ? <IoStar key={i} /> : <IoStarOutline key={i} />);
        }
        return stars;
    };
   const testimonialsData = [
    {
        id: 1,
        name: "Grace Muthoni",
        title: "Client",
        feedback: `"The staff were kind and professional. I felt well cared for and appreciated how smoothly everything went."`,
        rating: 5,
    },
    {
        id: 2,
        name: "David Kariuki",
        title: "Visitor",
        feedback: `"Excellent service and a welcoming environment. I would definitely recommend this clinic to others."`,
        rating: 5,
    },
    {
        id: 3,
        name: "Lilian Njeri",
        title: "Returning Client",
        feedback: `"Consistent care and helpful support every time. I’m always confident I’ll receive the attention I need."`,
        rating: 4,
    },
];

    

    return (
        <section className={styles.testimonials}>
            <h2 className={styles.heading}>Why Clients Trust Us</h2>
            <div className={styles.testimonialGrid}>
                {testimonialsData.map((testimonial) => (
                    <div key={testimonial.id} className={styles.testimonialCard}>
                        <p className={styles.feedback}>{testimonial.feedback}</p>
                        <h4 className={styles.name}>{testimonial.name}</h4>
                        <p className={styles.title}>{testimonial.title}</p>
                        <div className={styles.rating}>
                            {renderStars(testimonial.rating)}
                        </div>
                        <div className={styles.ctaGroup}>
                            <a href="#contact" className={styles.cta}>
                                Get in Touch <IoArrowForward />
                            </a>
                            <a href="#services" className={styles.cta}>
                                Explore Services <IoArrowForward />
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Testimonials;