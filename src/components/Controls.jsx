  import { useTranslation } from 'react-i18next';


export const Controls = ({ onNext }) => {
  const { t } = useTranslation();
  const nextFocusable = { id: 'next-btn', tabIndex: 0 };

  return (
    <div style={{ position: 'absolute', bottom: '5rem', right: '5rem' }}>
      <button {...nextFocusable} onClick={onNext}
        style={{
          backgroundColor: 'var(--color-primary)', padding: '1.5rem 4rem',
          borderRadius: '5rem', fontSize: '3.5rem', display: 'flex',
          alignItems: 'center', gap: '1.5rem',
          boxShadow: '0 0.5rem 1rem rgba(0,0,0,0.3)',
        }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
            <path d="M14.59 18.59L16 20l8-8-8-8-1.41 1.41L20.17 12l-5.58 6.59zM1.25 20.75l5.4-5.4-1.5-1.5-5.4 5.4c-.78.78-.78 2.05 0 2.83.78.78 2.05.78 2.83 0zM18.07 5.93L12.5 11.5l1.5 1.5 5.57-5.57C21.35 5.65 19.85 4.15 18.07 5.93zM10 12.5l-1.5-1.5-2.12 2.12 1.5 1.5L10 12.5zM3.37 8.37L2 7l4-4 1.37 1.37-4 4z"/>
        </svg>
        {t('next')}
      </button>
    </div>
  );
};