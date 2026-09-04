import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BackgroundAnimation from './components/BackgroundAnimation';
import TexasBot from './components/TexasBot';
import BackToTop from './components/BackToTop';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import AboutPage from './pages/About';
import DiagnosticPage from './pages/DiagnosticPage';
import AssessmentPage from './pages/AssessmentPage';
import CloudProvisionerPage from './pages/CloudProvisionerPage';
import FoundryPage from './pages/FoundryPage';
import KeynoteDemo from './pages/KeynoteDemo';
import RiskAnalyzerModule from './modules/auto-risk-analyzer/App.tsx';
import SmartBookingModal from './components/SmartBookingModal';

function App() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingPrefill, setBookingPrefill] = useState({ service: null, context: null });

  // Global event bus: any component can open booking modal via:
  // window.dispatchEvent(new CustomEvent('mrtechsys-open-booking', { detail: { service: 'CloudFlip Setup', context: { name, email, businessName, question } } }))
  useEffect(() => {
    const handler = (e) => {
      const { service = null, context = null } = e.detail || {};
      setBookingPrefill({ service, context });
      setBookingOpen(true);
    };
    window.addEventListener('mrtechsys-open-booking', handler);
    return () => window.removeEventListener('mrtechsys-open-booking', handler);
  }, []);

  return (
    <div className="bg-[#07090E] min-h-screen text-slate-100 font-sans selection:bg-[#D4AF37]/30 selection:text-white relative flex flex-col justify-between">
      <ScrollToTop />
      <BackgroundAnimation />
      <Navbar />
      
      <div className="relative z-10 flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/assessment" element={<AssessmentPage />} />
          <Route path="/diagnostic" element={<DiagnosticPage />} />
          <Route path="/cloud-provisioner" element={<CloudProvisionerPage />} />
          <Route path="/foundry" element={<FoundryPage />} />
          <Route path="/about/mrtechsys" element={<AboutPage />} />
          <Route path="/demo/keynote" element={<KeynoteDemo />} />
          <Route path="/risk/*" element={<RiskAnalyzerModule />} />
        </Routes>
      </div>

      <BackToTop />
      <TexasBot />
      <Footer />

      {/* Global Smart Booking Modal */}
      <SmartBookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        prefillService={bookingPrefill.service}
        prefillContext={bookingPrefill.context}
      />
    </div>
  );
}

export default App;
