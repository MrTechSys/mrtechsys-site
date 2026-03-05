import { useEffect } from 'react';
import { toast } from 'sonner';

export default function GlobalErrorHandler() {
  useEffect(() => {
    const handleError = (event) => {
      console.error('Global error:', event.error);
      toast.error('An unexpected error occurred. Please try again.');
    };

    const handleRejection = (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      toast.error('A network or data error occurred. Please check your connection.');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return null;
}