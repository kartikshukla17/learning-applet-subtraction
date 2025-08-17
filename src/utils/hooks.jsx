import { useEffect, useLayoutEffect, useRef } from 'react';
import { useFocus } from './contexts'; 

// --- Responsive Font Size Hook ---
export const useResponsiveFontSize = (containerRef) => {
  useLayoutEffect(() => {
    const updateFontSize = () => {
      if (containerRef.current) {
        const currentWidth = containerRef.current.offsetWidth;
        const newSize = (currentWidth / 1920) * 10;
        document.documentElement.style.fontSize = `${newSize}px`;
      }
    };
    const resizeObserver = new ResizeObserver(updateFontSize);
    if (containerRef.current) { resizeObserver.observe(containerRef.current); }
    updateFontSize();
    return () => resizeObserver.disconnect();
  }, [containerRef]);
};



// --- Focusable Element Hook ---
export const useFocusable = (id) => {
  const { focusedId, setFocusedId } = useFocus();
  const isFocused = focusedId === id;
  const ref = useRef(null);

  useEffect(() => {
    if (isFocused && ref.current) {
      ref.current.focus();
    }
  }, [isFocused]);
  
  return { 
    ref, isFocused, className: isFocused ? 'focused' : '',
    onFocus: () => setFocusedId(id), 'data-focusable-id': id, tabIndex: -1
  };
};