import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './index.css';
import LandingPage from './pages/LandingPage';
import WizardPage from './pages/WizardPage';

function RiskAnalyzerModule() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app" element={<WizardPage />} />
    </Routes>
  );
}

export default RiskAnalyzerModule;
