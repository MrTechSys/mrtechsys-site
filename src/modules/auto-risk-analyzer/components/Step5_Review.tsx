import { useRiskStore } from '../store/useRiskStore';
import { motion } from 'framer-motion';

export default function Step5_Review() {
  const { policy, generateReport, nextStep, prevStep } = useRiskStore();

  const handleAnalyze = () => {
    generateReport();
    nextStep();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="container full-screen flex-center"
      style={{ flexDirection: 'column', maxWidth: '800px' }}
    >
      <h2 style={{ marginBottom: '2rem' }}>Review <span className="text-gold">Details</span></h2>

      <div style={{ background: 'var(--color-grey-dark)', padding: '2rem', borderRadius: '8px', width: '100%', marginBottom: '2rem' }}>
        <h3 className="text-gold">Policy Info</h3>
        <p>State: {policy.stateCode}</p>
        <p>Effective: {policy.effectiveDate}</p>

        <h3 className="text-gold" style={{ marginTop: '1.5rem' }}>Drivers & Vehicles</h3>
        <p>{policy.drivers.length} Driver(s): {policy.drivers.map(d => d.firstName).join(', ')}</p>
        <p>{policy.vehicles.length} Vehicle(s): {policy.vehicles.map(v => `${v.year} ${v.make} ${v.model}`).join(', ')}</p>

        <h3 className="text-gold" style={{ marginTop: '1.5rem' }}>Coverage Limits</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>BI Per Person: ${policy.coverages.bodilyInjuryPerPerson?.toLocaleString()}</div>
          <div>BI Per Accident: ${policy.coverages.bodilyInjuryPerAccident?.toLocaleString()}</div>
          <div>Property Damage: ${policy.coverages.propertyDamage?.toLocaleString()}</div>
          <div>PIP/MedPay: ${policy.coverages.pip?.toLocaleString() || 'None'}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button onClick={prevStep} className="btn-secondary">Back</button>
        <button onClick={handleAnalyze} className="btn-primary" style={{ padding: '16px 40px', fontSize: '1.2rem' }}>
          Analyze Risk
        </button>
      </div>
    </motion.div>
  );
}
