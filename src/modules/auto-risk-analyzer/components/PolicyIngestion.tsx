import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Loader2, CheckCircle2, Cpu } from 'lucide-react';
import { useRiskStore } from '../store/useRiskStore';

export default function PolicyIngestion() {
  const { updatePolicy, setIsExtracting } = useRiskStore();
  const [status, setStatus] = useState<'idle' | 'uploading' | 'scanning' | 'complete'>('idle');
  const [fileName, setFileName] = useState<string | null>(null);

  const simulateExtraction = useCallback(() => {
    setStatus('uploading');
    setIsExtracting(true);

    // Timeline of cinematic simulation
    setTimeout(() => setStatus('scanning'), 1500);
    
    setTimeout(() => {
      // Mock Extracted Data (Typically a competitor's low-limit policy)
      updatePolicy({
        policyNumber: 'TX-9928341-B',
        stateCode: 'TX',
        effectiveDate: '2024-01-15',
        coverages: {
          bodilyInjuryPerPerson: 30000,
          bodilyInjuryPerAccident: 60000,
          propertyDamage: 25000,
          pip: 2500,
          uninsuredMotoristBodilyInjuryPerPerson: 0,
          uninsuredMotoristBodilyInjuryPerAccident: 0
        },
        drivers: [
          { id: '1', firstName: 'John', lastName: 'Doe', age: 34, gender: 'M', licenseState: 'TX' }
        ],
        vehicles: [
          { id: '1', make: 'Tesla', model: 'Model 3', year: 2022, vin: '5YJ3E1EAXP...' }
        ]
      });
      setStatus('complete');
    }, 4500);

    setTimeout(() => {
      setIsExtracting(false);
      setStatus('idle');
      setFileName(null);
    }, 6000);
  }, [updatePolicy, setIsExtracting]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFileName(e.target.files[0].name);
      simulateExtraction();
    }
  };

  return (
    <div style={{ width: '100%', marginBottom: '3rem' }}>
      <div 
        style={{ 
          border: '1px dashed #333', 
          borderRadius: '24px', 
          padding: '3rem', 
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.02)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <input 
          type="file" 
          onChange={handleFile}
          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 10 }}
          accept=".pdf,.jpg,.png"
          disabled={status !== 'idle'}
        />

        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div style={{ color: 'var(--color-gold)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                <Upload size={40} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Drop Competitor Policy</h3>
              <p className="text-grey" style={{ fontSize: '0.9rem' }}>Upload PDF or Image of your Declaration Page for AI Extraction</p>
            </motion.div>
          )}

          {status !== 'idle' && (
            <motion.div
              key="active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                {status === 'complete' ? (
                  <CheckCircle2 size={48} color="var(--color-success)" />
                ) : (
                  <Loader2 size={48} className="animate-spin" color="var(--color-gold)" />
                )}
                
                {status === 'scanning' && (
                  <motion.div 
                    initial={{ top: '0%' }}
                    animate={{ top: '100%' }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    style={{ position: 'absolute', left: '-10px', right: '-10px', height: '2px', background: 'var(--color-gold)', boxShadow: '0 0 15px var(--color-gold)', zIndex: 5 }}
                  />
                )}
              </div>

              <div style={{ color: 'var(--color-gold)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.7rem', marginBottom: '0.5rem' }}>
                {status === 'uploading' && 'Ingesting Document...'}
                {status === 'scanning' && 'AI Extraction in Progress...'}
                {status === 'complete' && 'Extraction Successful'}
              </div>
              
              <div style={{ fontSize: '0.9rem', color: '#666' }}>{fileName}</div>

              {status === 'scanning' && (
                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                  <ScanningTag label="Neural OCR" />
                  <ScanningTag label="Coverage Normalization" />
                  <ScanningTag label="Risk DNA" />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '1.5rem', justifyContent: 'center' }}>
        <Cpu size={14} className="text-gold" />
        <span style={{ fontSize: '0.75rem', color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Powered by MrTechSys Intelligence Ingestion Engine v4.0
        </span>
      </div>
    </div>
  );
}

function ScanningTag({ label }: { label: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ 
        padding: '4px 12px', 
        borderRadius: '20px', 
        border: '1px solid #222', 
        fontSize: '0.65rem', 
        color: '#555',
        textTransform: 'uppercase',
        background: '#050505'
      }}
    >
      {label}
    </motion.div>
  );
}
