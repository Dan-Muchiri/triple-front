import React from "react";
import "./ClinicGallery.css";

const ClinicGallery = () => {
  // replace with your actual photo file paths in /public/images
  const photos = [
    "/reception.avif",
    "/banner.avif",
    "/mission.avif",
    "/memory.avif",
  ];

  return (
    <section id="gallery" className="clinic-gallery">
      <h2 className="gallery-title">Our Clinic</h2>
      <div className="gallery-grid">
        {photos.map((photo, index) => (
          <div key={index} className="gallery-item">
            <img src={photo} alt={`Clinic ${index + 1}`} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ClinicGallery;
