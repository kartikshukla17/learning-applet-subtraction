import React, { useState, createContext } from 'react';

// --- Internationalization (i18n) Context ---
const lang = {
  en: {
    title: "Short Stacking Method",
    next: "Next",
    initial_bubble: "We have a subtraction challenge! Let's solve it!",
    initial_feedback: "Click on Next to proceed.",
    q1_bubble: "Which place do we start subtracting from?",
    q1_option_left: "Left",
    q1_option_right: "Right",
    q1_correct_feedback: "You are right - we go from right to left!",
    q1_incorrect_feedback: "No, that's not right! Try again.",
  },
};

const LanguageContext = createContext();
export const LanguageProvider = ({ children }) => {
  const [currentLang, setCurrentLang] = useState('en');
  const translations = lang[currentLang];
  const t = (key) => translations[key] || key;
  const value = { setLanguage: setCurrentLang, t, currentLang };
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
// Import useTranslation from hooks/useTranslation.js instead
// Move this hook to a separate file like hooks/useTranslation.js

// --- Focus Management Context ---
const FocusContext = createContext();
export const FocusProvider = ({ children }) => {
  const [focusedId, setFocusedId] = useState(null);
  const focusMap = {
    'next-btn': {},
    'answer-left': { right: 'answer-right' },
    'answer-right': { left: 'answer-left' },
  };

  const moveFocus = (direction) => {
    if (focusedId && focusMap[focusedId] && focusMap[focusedId][direction]) {
      setFocusedId(focusMap[focusedId][direction]);
    }
  };

  const value = { focusedId, setFocusedId, moveFocus };
  return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>;
};
// Move hook to separate file
// Move hook to hooks/useFocus.js
