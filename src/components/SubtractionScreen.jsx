import React, { useState, useEffect } from 'react';
import Header from './Header';
import CharacterBubble from './CharacterBubble';
import FeedbackMessage from './FeedbackMessage';
import ProblemDisplay from './ProblemDisplay';
import Controls from './Controls';
import { useTranslation } from '../utils/contexts';
import { useFocus } from '../utils/contexts';

const audioManager = { playFoley: (sound) => console.log(`Playing foley sound: ${sound}`) };

export const SubtractionScreen = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const { setFocusedId } = useFocus();

  useEffect(() => {
    if (step === 0) {
      setFocusedId('next-btn');
    }
  }, [step, setFocusedId]);

  const handleNext = () => { audioManager.playFoley('click'); setStep(s => s + 1); };

  const getBubbleText = () => (step === 0 ? t('initial_bubble') : '');
  const getFeedbackText = () => (step === 0 ? t('initial_feedback') : '');

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Header />
      <CharacterBubble text={getBubbleText()} />
      <FeedbackMessage text={getFeedbackText()} />
      
      {/* New Content Panel Structure */}
      <div style={{
          position: 'absolute',
          top: '22%', 
          left: '30%',
          right: '5%',
          bottom: '22%',
          backgroundColor: 'rgba(255, 255, 255, 0.1)', // This is the "light colored box"
          borderRadius: 'var(--border-radius)',
          padding: '2rem',
          boxShadow: 'inset 0 0 1rem rgba(0,0,0,0.2)',
      }}>
          <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: 'var(--color-panel-dark)', // This is the "dark color box"
              borderRadius: 'var(--border-radius)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 0.5rem 2rem rgba(0,0,0,0.3)',
          }}>
              <ProblemDisplay />
          </div>
      </div>
      
      {step === 0 && <Controls onNext={handleNext} />}
    </div>
  );
};