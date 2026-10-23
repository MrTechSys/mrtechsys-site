import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // If a hash anchor exists (e.g. #why, #proof, #disciplines, #cloudflip)
    if (hash) {
      const targetId = hash.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        // Offset scroll for the fixed top navigation bar (approx 80px)
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: Math.max(0, elementPosition - 80),
          behavior: 'smooth'
        });
        return;
      }
    }

    // Default: Reset viewport to absolute top on route navigation
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
