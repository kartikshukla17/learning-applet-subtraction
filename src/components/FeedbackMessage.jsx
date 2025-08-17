
export const FeedbackMessage = ({ text }) => {
  if (!text) return null;
  return (
    <div style={{
      position: 'absolute', top: '12rem', left: '50%', transform: 'translateX(-50%)',
      fontSize: '3rem', color: 'rgba(255,255,255,0.9)',
      textShadow: '0.1rem 0.1rem 0.3rem rgba(0,0,0,0.3)',
    }}>
      {text}
    </div>
  );
};