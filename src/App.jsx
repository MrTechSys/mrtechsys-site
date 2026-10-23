import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BackgroundAnimation from './components/BackgroundAnimation';
import TexasBot from './components/TexasBot';
import BackToTop from './components/BackToTop';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import SmartBookingModal from './components/SmartBookingModal';

// Route-level Code Splitting for AAA Mobile & Lighthouse 95+ Performance
const AboutPage = lazy(() => import('./pages/About'));
const DiagnosticPage = lazy(() => import('./pages/DiagnosticPage'));
const AssessmentPage = lazy(() => import('./pages/AssessmentPage'));
const CloudProvisionerPage = lazy(() => import('./pages/CloudProvisionerPage'));
const FoundryPage = lazy(() => import('./pages/FoundryPage'));
const KeynoteDemo = lazy(() => import('./pages/KeynoteDemo'));
const RiskAnalyzerModule = lazy(() => import('./modules/auto-risk-analyzer/App.tsx'));

const RouteLoadingFallback = () => (
  <div className="min-h-[70vh] flex items-center justify-center">
    <div className="flex items-center gap-2 text-xs font-mono text-[#D4AF37]">
      <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping"></span>
      <span className="tracking-widest uppercase font-semibold">Initializing Subsystem...</span>
    </div>
  </div>
);

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
    <div className="bg-[#05070A] min-h-screen text-slate-100 font-sans selection:bg-[#D4AF37]/30 selection:text-white relative flex flex-col justify-between">
      <ScrollToTop />
      <BackgroundAnimation />
      <Navbar />
      
      <div className="relative z-10 flex-grow">
        <Suspense fallback={<RouteLoadingFallback />}>
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
        </Suspense>
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
