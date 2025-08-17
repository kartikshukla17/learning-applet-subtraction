import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';




export const CharacterBubble = ({ text }) => {
const { currentLang } = useTranslation();
useEffect(() => {
  // Create speech synthesis utterance
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = currentLang;
  
  // Use Web Speech API to speak the text
  window.speechSynthesis.speak(utterance);
}, [text, currentLang]);
  
  return (
    <div style={{ position: 'absolute', left: '5%', bottom: '5%', width: '30rem', height: '35rem' }}>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, width: '20rem', height: '25rem',
        backgroundImage: "url('placeholder-for-your-character.png')",
        backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'bottom center',
      }}></div>
      <div style={{
        position: 'absolute', top: 0, right: 0, width: '25rem',
        backgroundColor: '#ffffff', color: '#000000', borderRadius: 'var(--border-radius)',
        padding: '2rem', fontSize: '2.5rem', lineHeight: '1.3',
        boxShadow: '0 0.5rem 1.5rem rgba(0,0,0,0.2)',
      }}>
        {text}
        <div style={{
          content: '""', position: 'absolute',
          bottom: '-2rem', left: '3rem',
          width: 0, height: 0,
          border: '1.5rem solid transparent',
          borderTopColor: '#ffffff',
        }}></div>
      </div>
    </div>
  );
};