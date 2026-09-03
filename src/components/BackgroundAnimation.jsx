import React from 'react';

const BackgroundAnimation = () => {
  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, #0F172A 0%, #07090E 75%, #05070A 100%)',
      }}
    />
  );
};

export default BackgroundAnimation;
