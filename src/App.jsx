import './App.css'
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './Sections/Header/Header';
import Hero from './Sections/Hero/Hero';
import Services from './Sections/Services/Services';
import Testimonials from './Sections/Testimonials/Testimonials';
import Contact from './Sections/Contact/Contact';
import Footer from './Sections/Footer/Footer';
import Login from './Sections/Login/Login';
import Receptionist from './Sections/Receptionist/Receptionist';
import Nurse from './Sections/Nurse/Nurse';
import Doctor from './Sections/Doctor/Doctor';
import LabTech from './Sections/Labtech/Labtech';
import Imaging from './Sections/Imaging/Imaging';
import Pharmacist from './Sections/Pharmacist/Pharmacist';
import Admin from './Sections/Admin/Admin';


function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
      window.scrollTo(0, 0); 
    
  }, [location]);

  return null;
}

function Home() {
  return (
    <>
      <Header />
      <Hero/>
      <Services/>
      <Testimonials/>
      <Contact/>
      <Footer />
    </>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop /> {/* Add this component to scroll to top */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login/>} />
        <Route path="/receptionist" element={<Receptionist/>} />
        <Route path='/nurse' element={<Nurse/>} />
        <Route path='/doctor' element={<Doctor/>} />
        <Route path='/lab' element={<LabTech/>} />
        <Route path='/imaging' element={<Imaging/>} />
        <Route path='/pharmacy' element={<Pharmacist/>} />
        <Route path='/admin' element={<Admin/>} />
      </Routes>
    </Router>
  );
}

export default App
