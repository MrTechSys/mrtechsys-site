import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function Tooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block', marginLeft: '6px', verticalAlign: 'middle' }}>
      <HelpCircle 
        size={14} 
        className="text-gold" 
        style={{ cursor: 'pointer', opacity: 0.6 }}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      />
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginBottom: '8px',
              width: '200px',
              padding: '10px',
              background: '#222',
              color: 'white',
              fontSize: '0.75rem',
              borderRadius: '6px',
              border: '1px solid #333',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              zIndex: 1000,
              pointerEvents: 'none',
              textAlign: 'center'
            }}
          >
            {text}
            {/* Arrow */}
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              marginLeft: '-5px',
              borderWidth: '5px',
              borderStyle: 'solid',
              borderColor: '#222 transparent transparent transparent'
            }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
