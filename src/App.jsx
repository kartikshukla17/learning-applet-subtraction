import React, { useState, useEffect, useRef, createContext, useContext, useLayoutEffect } from 'react';
import characterExcited from './assets/character_excited.png';
// ===================================================================================
// 1. CORE ARCHITECTURE & GLOBAL STYLES
// ===================================================================================
const GlobalStyles = () => (
  <style>{`
    :root {
      --font-primary: 'Baloo', Arial, sans-serif;
      --color-header: #2c4a7d;
      --color-panel-dark: #2c4a7d;
      --color-text: #ffffff;
      --color-primary: #ff9900;
      /* FIX: valid hex */
      --color-secondary: #4a9e2b;
      --color-correct: #68b030;
      --color-incorrect: #d9534f;
      --border-radius: 1.5rem;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body, html, #root { width: 100%; height: 100%; overflow: hidden; background-color: #000; font-family: var(--font-primary); color: var(--color-text); }
    #root { display: flex; justify-content: center; align-items: center; }
    /* NEW: TV overscan guard + centering */
    .tv-safe-area {
      width: 100%;
      height: 100%;
             /* tiny guard so TVs that crop edges don't eat UI */
      display: grid;
      place-items: center;
      background: #000;
    }
    /* UPDATED: 16:9 without aspect-ratio (better TV support) */
    .scaling-container {
      position: relative;
      width: min(100vw, calc(100vh * 16 / 9));
      height: min(calc(100vw * 9 / 16), 100vh);
      overflow: hidden;
      
      /* For fully offline, replace the URL with an imported asset if desired. */
      /* background-image: url('../assets/background.png'); */
      background-color: var(--color-bg);
      background-size: cover;
      background-position: center;
      transform-origin: center center;
    }
    button { font-family: inherit; border: none; cursor: pointer; color: var(--color-text); outline: none; }
    .focused {
      box-shadow: 0 0 0 0.4rem #ffffff, 0 0 0 0.8rem var(--color-primary);
      transform: scale(1.05);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    @keyframes dash {
      to {
        stroke-dashoffset: 0;
      }
    }
      /* White-line transition overlay */
.white-line-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000; /* above everything in the panel */
  pointer-events: none;
}

  /* Bubble above the character */
.character-wrap.top {
  /* make the wrapper as wide as whichever is larger */
  width: max(var(--char-w), var(--bubble-w));
}

.character-wrap.top .character-img {
  left: 50%;
  transform: translateX(-50%);  /* center the character */
}

.character-wrap.top .speech-bubble {
  top: auto;
  bottom: calc(var(--char-h) + var(--gap)); /* sit above the head */
  left: 50%;
  transform: translateX(-50%);              /* center over character */
  z-index: 2;
}

/* Tail points downward toward the head */
.character-wrap.top .speech-bubble .tail {
  position: absolute;
  top: auto;
  bottom: -1.2rem;                 /* hang below bubble */
  left: 50%;
  width: 0; height: 0;
  transform: translateX(-50%);
  border: 1.5rem solid transparent;
  border-bottom-color: #ffffff;     /* triangle points down */
  border-right-color: transparent;
}


.white-line-bar {
  height: 0.8rem;
  width: 0;
  background: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 0 1.5rem rgba(255,255,255,0.9);
  animation: line-sweep 600ms ease-out forwards;
}

@keyframes line-sweep {
  from { width: 0; }
  to { width: 80%; }
}
/* Character + bubble layout driven by CSS variables */
.character-wrap {
  position: absolute;
  left: 5%;
  bottom: 0%;
  z-index: 20;
  /* Tunables (rem): */
  --char-w: 20rem;     /* character width */
  --char-h: 25rem;     /* character height */
  --gap:  1.5rem;      /* space between character and bubble */
  --bubble-w: 25rem;   /* bubble width */

  width: calc(var(--char-w) + var(--gap) + var(--bubble-w));
  min-height: var(--char-h);
}

.character-img {
  position: absolute;
  bottom: 0;
  left: 0;
  width: var(--char-w);
  height: var(--char-h);
  background-size: contain;
  background-repeat: no-repeat;
  background-position: bottom left;
}

.speech-bubble {
  position: absolute;
  top: 0;
  left: calc(var(--char-w) + var(--gap));
  width: var(--bubble-w);
  background-color: #ffffff;
  color: #000000;
  border-radius: var(--border-radius);
  padding: 2rem;
  font-size: 2.5rem;
  line-height: 1.3;
  box-shadow: 0 0.5rem 1.5rem rgba(0,0,0,0.2);
}

/* Triangle tail pointing back toward the character */
.speech-bubble .tail {
  position: absolute;
  left: -1.5rem;     /* negative to poke out toward the character */
  top: 3.5rem;       /* adjust if you want the tail higher/lower */
  width: 0;
  height: 0;
  border: 1.5rem solid transparent;
  border-right-color: #ffffff;
}


  `}</style>
);
// ===================================================================================
// 2. CONTEXT PROVIDERS & HOOKS
// ===================================================================================
const useResponsiveFontSize = (containerRef) => {
  useLayoutEffect(() => {
    const updateFontSize = () => {
      if (containerRef.current) {
        const newSize = (containerRef.current.offsetWidth / 1920) * 10;
        document.documentElement.style.fontSize = `${newSize}px`;
      }
    };
    updateFontSize();
    // Fallbacks for environments without ResizeObserver (older WebViews/TV browsers)
    let ro;
    if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
      ro = new ResizeObserver(updateFontSize);
      if (containerRef.current) ro.observe(containerRef.current);
    } else {
      window.addEventListener('resize', updateFontSize);
      window.addEventListener('orientationchange', updateFontSize);
    }
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', updateFontSize);
      window.removeEventListener('orientationchange', updateFontSize);
    };
  }, [containerRef]);
};
const lang = {
  en: {
    title: "Short Stacking Method",
    next: "Next",
    initial_bubble: "We have a subtraction challenge! Let's solve it!",
    initial_feedback: "Click on Next to proceed.",
    step1_bubble: "We have 3 places to subtract. Recall that we always start subtracting from right to left.",
    step2_bubble: "We always start subtracting from right to left.",
    step2_question: "Which place do we subtract first?",
    answer_hundreds: "Hundreds",
    answer_tens: "Tens",
    answer_units: "Units",
    feedback_incorrect: "No, that's not right! Try again.",
    feedback_correct_units: "You are right - we go from right to left!",
    step3_bubble: "Tap on the 'minus' sign to subtract the numbers in the units place!",
    step4_bubble: "Tap on the 'minus' sign to subtract the numbers in the units place!",
    step4_question: "We can't take 9 away from 3. What should we do next?",
    answer_zero: "Write zero and move on",
    answer_borrow: "Borrow from the tens place",
    answer_swap: "Swap 3 and 9",
    feedback_incorrect_zero: "No, that's not right, 3 - 9 is not 0! Try again.",
    feedback_incorrect_swap: "No, if we swap, the original numbers will change. Try again.",
    feedback_correct_borrow: "Yes, we borrow from the next place.",
  },
};
const LanguageContext = createContext();
const LanguageProvider = ({ children }) => {
  const [currentLang, setCurrentLang] = useState('en');
  const t = (key, fallback) => {
   const dict = lang[currentLang] || {};
   return (key in dict) ? dict[key] : (fallback ?? key);
 };
  const value = { setLanguage: setCurrentLang, t, currentLang };
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
const useTranslation = () => useContext(LanguageContext);
const FocusContext = createContext();
const FocusProvider = ({ children }) => {
  const [focusedId, setFocusedId] = useState(null);
  const focusMap = {
    'next-btn': {},
    'minus-btn': {},
    'answer-hundreds': { down: 'answer-tens' },
    'answer-tens': { up: 'answer-hundreds', down: 'answer-units' },
    'answer-units': { up: 'answer-tens' },
    'answer-zero': { down: 'answer-borrow' },
    'answer-borrow': { up: 'answer-zero', down: 'answer-swap' },
    'answer-swap': { up: 'answer-borrow' },
  };
  const moveFocus = (direction) => {
    if (focusedId && focusMap[focusedId] && focusMap[focusedId][direction]) {
      setFocusedId(focusMap[focusedId][direction]);
    }
  };
  const value = { focusedId, setFocusedId, moveFocus };
  return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>;
};
const useFocus = () => useContext(FocusContext);
const useFocusable = (id) => {
  const { focusedId, setFocusedId } = useFocus();
  const isFocused = focusedId === id;
  const ref = useRef(null);
  useEffect(() => { if (isFocused && ref.current) ref.current.focus(); }, [isFocused]);
  return { ref, isFocused, className: isFocused ? 'focused' : '', onFocus: () => setFocusedId(id), 'data-focusable-id': id, tabIndex: -1 };
};
const audioManager = { playFoley: (sound) => console.log(`Playing foley sound: ${sound}`) };
const speak = (text, lang) => console.log(`Speaking [${lang}]: ${text}`);
// ===================================================================================
// 3. UI COMPONENTS
// ===================================================================================
const Header = () => {
  const { t } = useTranslation();
  return <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', backgroundColor: 'var(--color-header)', padding: '1.5rem 0', textAlign: 'center', fontSize: '4rem', textShadow: '0.2rem 0.2rem 0.5rem rgba(0,0,0,0.3)', boxShadow: '0 0.5rem 1.5rem rgba(0,0,0,0.2)', zIndex: 10, }}>{t('title')}</div>;
};
const CharacterBubble = ({
  text,
  characterUrl = '/assets/character_excited.png',
  charWidthRem = 20,
  charHeightRem = 25,
  gapRem = 1.5,
  bubbleWidthRem = 25,
  bubblePosition = 'right', // 'right' | 'top'
}) => {
  const { currentLang } = useTranslation();
  useEffect(() => { speak(text, currentLang); }, [text, currentLang]);

  const wrapStyle = {
    '--char-w': `${charWidthRem}rem`,
    '--char-h': `${charHeightRem}rem`,
    '--gap': `${gapRem}rem`,
    '--bubble-w': `${bubbleWidthRem}rem`,
  };

  return (
    <div className={`character-wrap ${bubblePosition === 'top' ? 'top' : ''}`} style={wrapStyle}>
      <div className="character-img" style={{ backgroundImage: `url(${characterUrl})` }} />
      <div className="speech-bubble">
        {text}
        <div className="tail" />
      </div>
    </div>
  );
};



const AnimatedLine = ({ type }) => {
  const solidPath = "M 110 10 V 270 A 10 10 0 0 1 100 280 H 20 A 10 10 0 0 1 10 270 V 10 Z";
  const dashedPath = "M 110 30 V 270 A 10 10 0 0 1 100 280 H 20 A 10 10 0 0 1 10 270 V 30 C 10 0 110 0 110 30 Z";
  const path = type === 'solid' ? solidPath : dashedPath;
  // Use rem so it scales with the container's responsive font-size
  const style = {
    stroke: 'white', strokeWidth: 4, fill: 'none',
    strokeDasharray: 1000, strokeDashoffset: 1000,
    animation: 'dash 1.5s linear forwards',
  };
  if (type === 'dashed') {
    style.strokeDasharray = '15 10';
    style.stroke = 'red';
  }
  return (
    <svg width="12rem" height="29rem" viewBox="0 0 120 290" style={{ position: 'absolute', top: '-1rem', right: '-2.5rem' }}>
      <path d={path} style={style} />
    </svg>
  );
};
const ProblemDisplay = ({ showHTU, animation }) => (
    <div style={{ fontSize: '12rem', fontFamily: 'monospace', lineHeight: '1.1', textAlign: 'right', width: '50rem', letterSpacing: '1rem', color: 'var(--color-text)', position: 'relative', top: showHTU ? '2rem' : '0' }}>
      {showHTU && (
        <div style={{
          position: 'absolute', top: '-10rem', right: '0', width: '100%',
          fontSize: '8rem', 
          textAlign: 'right',
          letterSpacing: '3.4rem', 
          paddingRight: '1.2rem', 
        }}>
          <span style={{color: '#f9ca24'}}>H</span>
          <span style={{color: '#e84393'}}>T</span>
          <span style={{color: '#00cec9'}}>U</span>
        </div>
      )}
      <div>
        <span style={{color: '#f9ca24'}}>5</span>
        <span style={{color: '#e84393'}}>0</span>
        <span style={{color: '#00cec9'}}>3</span>
      </div>
      <div>
        - <span style={{color: '#f9ca24'}}>2</span>
        <span style={{color: '#e84393'}}>8</span>
        <span style={{color: '#00cec9'}}>9</span>
      </div>
      <div style={{ height: '0.5rem', backgroundColor: 'var(--color-text)', marginTop: '1.5rem' }}></div>
      {animation && <AnimatedLine type={animation} />}
    </div>
);
const Controls = ({ onNext, visible }) => {
  const { t } = useTranslation();
  const nextFocusable = useFocusable('next-btn');
  if (!visible) return null;
  return (
    <div style={{ position: 'absolute', bottom: '5rem', right: '5rem' }}>
      <button {...nextFocusable} onClick={onNext} style={{ backgroundColor: 'var(--color-primary)', padding: '1.5rem 4rem', borderRadius: '5rem', fontSize: '3.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', boxShadow: '0 0.5rem 1rem rgba(0,0,0,0.3)' }}>
        {t('next')}
      </button>
    </div>
  );
};
const FeedbackMessage = ({ text, type }) => {
  if (!text) return null;
  const color = type === 'correct' ? 'var(--color-correct)' : type === 'incorrect' ? 'var(--color-incorrect)' : 'rgba(255,255,255,0.9)';
  return <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', width: '100%', textAlign: 'center', fontSize: '3rem', color, textShadow: '0.1rem 0.1rem 0.3rem rgba(0,0,0,0.3)' }}>{text}</div>;
};

// New component to handle individual answer options
const AnswerOption = ({ id, label, onClick, isSelected, isCorrect }) => {
  const focusable = useFocusable(`answer-${id}`);
  
  let bgColor = 'transparent';
  let textColor = 'white';
  
  if (isSelected) {
    bgColor = isCorrect ? 'var(--color-correct)' : 'var(--color-incorrect)';
  }
  
  return (
    <button 
      {...focusable} 
      onClick={() => onClick(id)}
      style={{
        border: '0.3rem solid white', 
        borderRadius: '1rem', 
        padding: '1.5rem 3rem',
        fontSize: '2.5rem', 
        backgroundColor: bgColor, 
        color: textColor,
        transition: 'background-color 0.3s ease',
      }}
    >
      {label}
    </button>
  );
};

const AnswerOptions = ({ onAnswer, answerStatus, options }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {options.map(opt => (
        <AnswerOption
          key={opt.id}
          id={opt.id}
          label={opt.label}
          onClick={onAnswer}
          isSelected={answerStatus.choice === opt.id}
          isCorrect={answerStatus.status === 'correct'}
        />
      ))}
    </div>
  );
};

const MinusButton = ({ onClick }) => {
  const focusable = useFocusable('minus-btn');
  return (
    <button {...focusable} onClick={onClick} style={{ position: 'absolute', top: '1rem', right: '11rem', width: '6rem', height: '6rem', borderRadius: '50%', backgroundColor: 'var(--color-incorrect)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '4rem' }}>
      -
    </button>
  );
};
// ===================================================================================
// 4. MAIN SCREEN COMPONENT
// ===================================================================================
const SubtractionScreen = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [feedback, setFeedback] = useState({ text: '', type: 'info' });
  const [answerStatus, setAnswerStatus] = useState({ choice: null, status: 'neutral' });
  const [animation, setAnimation] = useState(null);
  const { setFocusedId } = useFocus();

  // NEW: overlay flag
  const [showWhiteOverlay, setShowWhiteOverlay] = useState(false);

  useEffect(() => {
    setAnswerStatus({ choice: null, status: 'neutral' });
    setAnimation(null);
    switch (step) {
      case 0: setFeedback({ text: t('initial_feedback'), type: 'info' }); setFocusedId('next-btn'); break;
      case 1: setFeedback({ text: t('initial_feedback'), type: 'info' }); setFocusedId('next-btn'); break;
      case 2: setFeedback({ text: '', type: 'info' }); setFocusedId('answer-hundreds'); break;
      case 3: setFeedback({ text: '', type: 'info' }); setAnimation('solid'); setFocusedId('minus-btn'); break;
      case 4: setFeedback({ text: '', type: 'info' }); setAnimation('dashed'); setFocusedId('answer-zero'); break;
      default: setFeedback({ text: '', type: 'info' });
    }
  }, [step, t, setFocusedId]);

  const handleNext = () => { audioManager.playFoley('click'); setStep(s => s + 1); };

  // NEW: minus-click shows overlay, then advances
  const handleMinus = () => {
    audioManager.playFoley('click');
    setShowWhiteOverlay(true);
    // After the short animation, hide overlay and go to next step
    setTimeout(() => {
      setShowWhiteOverlay(false);
      handleNext(); // moves from step 3 -> step 4
    }, 3000); // tweak duration to taste (matches CSS ~600ms + buffer)
  };

  const handleAnswer = (choice, correctAnswer, incorrectFeedbackKey) => {
    if (answerStatus.status === 'correct') return;
    const isCorrect = choice === correctAnswer;
    audioManager.playFoley(isCorrect ? 'correct' : 'incorrect');
    setAnswerStatus({ choice, status: isCorrect ? 'correct' : 'incorrect' });

    let feedbackText = '';
    if (isCorrect) {
      feedbackText = t(`feedback_correct_${correctAnswer}`);
    } else {
      feedbackText = incorrectFeedbackKey ? t(incorrectFeedbackKey) : t('feedback_incorrect');
    }
    setFeedback({ text: feedbackText, type: isCorrect ? 'correct' : 'incorrect' });
    if (isCorrect) {
      setTimeout(() => handleNext(), 2000);
    }
  };

  const getBubbleText = () => {
    if (step <= 1) return t(`step${step}_bubble`, t('initial_bubble'));
    if (step === 2) return t('step2_bubble');
    if (step === 3) return t('step3_bubble');
    if (step >= 4) return t('step4_bubble');
    return '';
  };

  const step2Options = [
    { id: 'hundreds', label: t('answer_hundreds') },
    { id: 'tens', label: t('answer_tens') },
    { id: 'units', label: t('answer_units') },
  ];
  const step4Options = [
    { id: 'zero', label: t('answer_zero') },
    { id: 'borrow', label: t('answer_borrow') },
    { id: 'swap', label: t('answer_swap') },
  ];

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Header />
      // Example: a smaller character with a slightly larger bubble
<CharacterBubble
  text={getBubbleText()}
  characterUrl={characterExcited}
  charWidthRem={30}     // ← change this to resize the character
  charHeightRem={50}
  gapRem={0}
  bubbleWidthRem={28}
  bubblePosition="top"
/>


      <div style={{
        position: 'absolute', top: '22%', left: '30%', right: '5%', bottom: '22%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 'var(--border-radius)', padding: '2rem',
        boxShadow: 'inset 0 0 1rem rgba(0,0,0,0.2)'
      }}>
        <div style={{
          width: '100%', height: '100%', backgroundColor: 'var(--color-panel-dark)',
          borderRadius: 'var(--border-radius)', display: 'flex',
          justifyContent: 'center', alignItems: 'center',
          boxShadow: '0 0.5rem 2rem rgba(0,0,0,0.3)',
          position: 'relative', padding: '0 5rem'
        }}>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <ProblemDisplay showHTU={step >= 1} animation={animation} />

            {/* Show minus only on step 3; wire our new handler */}
            {step === 3 && <MinusButton onClick={handleMinus} />}
          </div>

          {step === 2 && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', textAlign: 'center' }}>{t('step2_question')}</div>
              <AnswerOptions onAnswer={(choice) => handleAnswer(choice, 'units')} answerStatus={answerStatus} options={step2Options} />
            </div>
          )}

          {step === 4 && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', textAlign: 'center' }}>{t('step4_question')}</div>
              <AnswerOptions
                onAnswer={(choice) => {
                  let incorrectKey = '';
                  if (choice === 'zero') incorrectKey = 'feedback_incorrect_zero';
                  if (choice === 'swap') incorrectKey = 'feedback_incorrect_swap';
                  handleAnswer(choice, 'borrow', incorrectKey);
                }}
                answerStatus={answerStatus}
                options={step4Options}
              />
            </div>
          )}

          <FeedbackMessage text={feedback.text} type={feedback.type} />

          {/* NEW: overlay lives inside the panel, above all children */}
          {showWhiteOverlay && (
            <div className="white-line-overlay">
              <div className="white-line-bar" />
            </div>
          )}
        </div>
      </div>

      <Controls
        onNext={handleNext}
        visible={step < 2 || (answerStatus.status === 'correct' && (step === 2 || step === 4))}
      />
    </div>
  );
};


// ===================================================================================
// 5. APP CONTAINER & ENTRY POINT
// ===================================================================================
function MainApp() {
  const containerRef = useRef(null);
  useResponsiveFontSize(containerRef);
  const { moveFocus, focusedId } = useFocus();
  useEffect(() => {
    const handleKeyDown = (e) => {
      let direction = null;
      // Arrow / D-Pad aliases (some TVs send "Up","Down", keyCodes 37-40)
      if (e.key === 'ArrowUp' || e.key === 'Up' || e.keyCode === 38) direction = 'up';
      if (e.key === 'ArrowDown' || e.key === 'Down' || e.keyCode === 40) direction = 'down';
      if (e.key === 'ArrowLeft' || e.key === 'Left' || e.keyCode === 37) direction = 'left';
      if (e.key === 'ArrowRight' || e.key === 'Right' || e.keyCode === 39) direction = 'right';
      if (direction) { moveFocus(direction); e.preventDefault(); }
      // OK/Select/Enter (some remotes send "OK" or "Select")
      if (['Enter', 'NumpadEnter', 'OK', 'Select'].includes(e.key) || e.keyCode === 13) {
        if (focusedId) {
          const focusedElement = document.querySelector(`[data-focusable-id='${focusedId}']`);
          if (focusedElement) { focusedElement.click(); }
          e.preventDefault();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    // No need for keyup here but harmless
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveFocus, focusedId]);
  return (
    <>
      <GlobalStyles />
      <div className="tv-safe-area">
        <div className="scaling-container" ref={containerRef}>
          <SubtractionScreen />
        </div>
      </div>
    </>
  );
}
export default function App() {
  return (
    <LanguageProvider>
      <FocusProvider>
        <MainApp />
      </FocusProvider>
    </LanguageProvider>
  );
}