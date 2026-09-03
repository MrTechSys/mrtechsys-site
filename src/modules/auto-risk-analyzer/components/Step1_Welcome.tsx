import { useRef, useState } from 'react';
import { useRiskStore } from '../store/useRiskStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ChevronRight, Loader2, ShieldCheck, FileText } from 'lucide-react';
import { extractPolicyData } from '../utils/extraction';

export default function Step1_Welcome() {
  const { nextStep, setIsExtracting, isExtracting, importOCRData, policy, setToast } = useRiskStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(policy.redactedImageUrl || null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // MIME & Size Checks
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) {
      setToast({ message: "Invalid file type. Please upload a PDF, PNG, or JPG.", type: 'error' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB Limit
      setToast({ message: "File too large. Maximum size is 5MB.", type: 'error' });
      return;
    }

    setIsExtracting(true);
    try {
      const extractedData = await extractPolicyData(file);
      setPreviewUrl(extractedData.redactedImageUrl);
      
      // Use the unified mapping pipeline
      importOCRData({
        ...extractedData,
        policyInfo: {
          ...extractedData.policyInfo,
          redactedImageUrl: extractedData.redactedImageUrl
        }
      });
      
    } catch (error) {
      setToast({ message: "AI Extraction failed: " + (error as Error).message, type: 'error' });
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="container full-screen flex-center"
      style={{ flexDirection: 'column', textAlign: 'center', position: 'relative', paddingTop: '5vh' }}
    >
      <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '1rem' }}>
        Auto Risk <span className="text-gold">Analyzer</span>
      </h1>
      <p style={{ maxWidth: '600px', fontSize: '1.2rem', marginBottom: '3rem' }} className="text-grey">
        See if you're dangerously underinsured in 60 seconds.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: previewUrl ? '1fr 1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', width: '100%', maxWidth: previewUrl ? '1000px' : '700px' }}>
        
        {previewUrl ? (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ 
              background: '#050505', 
              borderRadius: '24px', 
              padding: '1rem', 
              border: '1px solid #222',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ 
              position: 'absolute', top: '20px', left: '20px', 
              background: 'var(--color-success)', color: 'black', 
              fontSize: '0.6rem', padding: '4px 12px', borderRadius: '20px', 
              fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px',
              zIndex: 10
            }}>
              <ShieldCheck size={12} /> PII REDACTED FOR PRIVACY
            </div>
            <img 
              src={previewUrl} 
              alt="Policy Preview" 
              style={{ width: '100%', borderRadius: '16px', opacity: 0.8, filter: 'grayscale(0.5)' }} 
            />
            <div style={{ marginTop: '1.5rem', textAlign: 'left', padding: '0 1rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>Intelligence Extracted</div>
              <h4 style={{ margin: 0 }}>{policy.carrier || 'Carrier Detected'}</h4>
              <p className="text-grey" style={{ fontSize: '0.8rem' }}>Policy: {policy.policyNumber || '••••••••'}</p>
            </div>
          </motion.div>
        ) : (
          <div 
            onClick={nextStep}
            style={{ 
              background: 'var(--color-grey-dark)', 
              padding: '2.5rem', 
              borderRadius: '16px', 
              cursor: 'pointer',
              border: '1px solid #222',
              transition: 'all 0.3s ease'
            }}
            className="hover-gold"
          >
            <div className="flex-center" style={{ width: '60px', height: '60px', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '50%', margin: '0 auto 1.5rem' }}>
              <ChevronRight color="var(--color-gold)" size={28} />
            </div>
            <h3 className="text-white">Manual Entry</h3>
            <p className="text-grey" style={{ fontSize: '0.9rem' }}>Enter details step-by-step for a professional grade report.</p>
          </div>
        )}

        <div 
          onClick={() => fileInputRef.current?.click()}
          style={{ 
            background: 'var(--color-grey-dark)', 
            padding: '2.5rem', 
            borderRadius: '16px', 
            cursor: 'pointer',
            border: previewUrl ? '1px dashed var(--color-gold)' : '1px solid #222',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            height: previewUrl ? '100%' : 'auto'
          }}
          className="hover-gold"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleFileUpload}
            accept=".pdf,.png,.jpg,.jpeg"
          />
          {!previewUrl && <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'var(--color-gold)', color: 'black', fontSize: '0.7rem', padding: '3px 10px', borderRadius: '12px', fontWeight: 'bold' }}>AI EXTRACTION</div>}
          
          <div className="flex-center" style={{ width: '60px', height: '60px', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '50%', margin: '0 auto 1.5rem' }}>
            <Upload color="var(--color-gold)" size={28} />
          </div>
          <h3 className="text-white">{previewUrl ? 'Re-upload Document' : 'Upload ID Card'}</h3>
          <p className="text-grey" style={{ fontSize: '0.9rem' }}>
            {previewUrl 
              ? 'Replace the current document with a clearer image.' 
              : 'Upload your ID card or DEC page. AI will redact PII and extract info.'}
          </p>
          
          {previewUrl && (
            <button 
              onClick={(e) => { e.stopPropagation(); nextStep(); }} 
              className="btn-primary" 
              style={{ marginTop: '2rem', width: '100%' }}
            >
              Verify Extracted Data <ChevronRight size={18} />
            </button>
          )}
        </div>

      </div>

      <AnimatePresence>
        {isExtracting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
              background: 'rgba(0,0,0,0.9)', zIndex: 2000,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <Loader2 className="animate-spin text-gold" size={60} />
            <h2 className="text-gold" style={{ marginTop: '2rem', letterSpacing: '0.2em' }}>SECURE AI EXTRACTION</h2>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <div className="flex-center text-grey" style={{ fontSize: '0.8rem', gap: '8px' }}><ShieldCheck size={16} /> REDACTING PII</div>
              <div className="flex-center text-grey" style={{ fontSize: '0.8rem', gap: '8px' }}><FileText size={16} /> AUDITING DOCS</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div style={{ marginTop: '4rem', opacity: 0.5, fontSize: '0.9rem' }}>
        Educational Tool — Powered by MrTechSysGPT • Launching in Texas
      </div>
    </motion.div>
  );
}
