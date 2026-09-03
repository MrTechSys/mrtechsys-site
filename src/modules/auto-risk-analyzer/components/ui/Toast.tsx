import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useRiskStore } from '../../store/useRiskStore';
import { useEffect } from 'react';

export default function Toast() {
  const { toast, setToast } = useRiskStore();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast, setToast]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 size={20} color="var(--color-success)" />,
    error: <AlertCircle size={20} color="var(--color-error)" />,
    info: <Info size={20} color="var(--color-gold)" />,
  };

  const bgColors = {
    success: 'rgba(34, 197, 94, 0.1)',
    error: 'rgba(239, 68, 68, 0.1)',
    info: 'rgba(212, 175, 55, 0.1)',
  };

  const borderColors = {
    success: 'rgba(34, 197, 94, 0.2)',
    error: 'rgba(239, 68, 68, 0.2)',
    info: 'rgba(212, 175, 55, 0.2)',
  };

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 20, x: '-50%' }}
          style={{
            position: 'fixed',
            bottom: '40px',
            left: '50%',
            zIndex: 1000,
            background: '#0a0a0a',
            backgroundColor: bgColors[toast.type],
            border: `1px solid ${borderColors[toast.type]}`,
            padding: '12px 24px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(10px)',
            minWidth: '300px',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {icons[toast.type]}
            <span style={{ fontSize: '0.9rem', color: '#eee', fontWeight: '500' }}>{toast.message}</span>
          </div>
          <button 
            onClick={() => setToast(null)}
            style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', padding: '4px' }}
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
