import React, { useRef, useState } from "react";
import "./ClinicGallery.css";

const ClinicGallery = () => {
  const photos = [
    "/reception.avif",
    "/banner.avif",
    "/mission.avif",
    "/memory.avif",
  ];

  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleVideoToggle = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <section id="gallery" className="clinic-gallery">
      <h2 className="gallery-title">Our Clinic</h2>
      <div className="gallery-grid">
        {photos.map((photo, index) => (
          <div key={index} className="gallery-item">
            <img src={photo} alt={`Clinic ${index + 1}`} />
          </div>
        ))}

        {/* 🎥 Custom play button video */}
        <div className="gallery-item video-container" onClick={handleVideoToggle}>
          <video
            ref={videoRef}
            src="/zawadi.mp4"
            loop
            playsInline
            className="gallery-video"
          />
          {!isPlaying && <div className="play-button">▶</div>}
        </div>
      </div>
    </section>
  );
};

export default ClinicGallery;
