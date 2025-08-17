import React, { useEffect, useRef } from 'react';
import { LanguageProvider, FocusProvider, useFocus } from './utils/contexts'; // We will create this file
import { useResponsiveFontSize } from './utils/hooks'; // And this one
import SubtractionScreen from './components/SubtractionScreen';

// The MainApp component contains the core logic
function MainApp() {
  const containerRef = useRef(null);
  useResponsiveFontSize(containerRef);

  const { moveFocus, focusedId } = useFocus();
  useEffect(() => {
    // ... (keep the handleKeyDown logic here) ...
    const handleKeyDown = (e) => {
      let direction = null;
      if (e.key === 'ArrowUp') direction = 'up';
      if (e.key === 'ArrowDown') direction = 'down';
      if (e.key === 'ArrowLeft') direction = 'left';
      if (e.key === 'ArrowRight') direction = 'right';
      
      if (direction) { moveFocus(direction); e.preventDefault(); }

      if (e.key === 'Enter' && focusedId) {
        const focusedElement = document.querySelector(`[data-focusable-id='${focusedId}']`);
        if (focusedElement) { focusedElement.click(); }
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveFocus, focusedId]);

  return (
    <div className="scaling-container" ref={containerRef}>
      <SubtractionScreen />
    </div>
  );
}

// The default export wraps the app in its providers
export default function App() {
  return (
    <LanguageProvider>
      <FocusProvider>
        <MainApp />
      </FocusProvider>
    </LanguageProvider>
  );
}