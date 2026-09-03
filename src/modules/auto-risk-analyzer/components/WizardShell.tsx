import { Link } from 'react-router-dom';
import { useRiskStore } from '../store/useRiskStore';
import AIAssistant from './AIAssistant';
import { Home, Save } from 'lucide-react';
import Toast from './ui/Toast';

interface WizardShellProps {
  children: React.ReactNode;
}

export default function WizardShell({ children }: WizardShellProps) {
  const { currentStep, reset, setToast } = useRiskStore();

  const handleSave = () => {
    setToast({ message: 'Report saved to local storage. Cloud sync coming soon!', type: 'info' });
  };

  return (
    <div className="wizard-shell" style={{ position: 'relative', minHeight: '100vh', width: '100%', overflow: 'hidden', background: 'var(--color-black)' }}>
      {/* Background Elements */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, width: '100%', height: '100%',
        background: 'radial-gradient(circle at 50% 50%, #111111 0%, #000000 100%)',
        zIndex: -1
      }} />
      
      {/* Navigation Header */}
      <header style={{ 
        position: 'fixed', 
        top: 0, 
        width: '100%', 
        padding: '1rem 2rem', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #222'
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--color-gold)', fontWeight: 'bold' }}>
          <Home size={18} />
          <span>MRTECHSYS</span>
        </Link>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {currentStep >= 6 && (
            <button onClick={handleSave} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Save size={14} /> Save Report
            </button>
          )}
          <button 
            onClick={() => { if(confirm('Exit analysis? Progress will be lost.')) reset(); }}
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            Restart
          </button>
        </div>
      </header>

      {/* Progress Indicator */}
      <div style={{ position: 'fixed', top: '70px', left: 0, width: '100%', height: '2px', background: '#222', zIndex: 101 }}>
        <div style={{ width: `${(currentStep / 7) * 100}%`, height: '100%', background: 'var(--color-gold)', transition: 'width 0.3s ease' }} />
      </div>

      {/* Main Content */}
      <main style={{ paddingTop: '80px', position: 'relative', zIndex: 1 }}>
        {children}
      </main>

      {/* AI Assistant */}
      <AIAssistant />
      <Toast />
    </div>
  );
}
