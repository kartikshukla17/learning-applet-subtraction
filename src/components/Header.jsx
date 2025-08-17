import { useTranslation } from 'react-i18next';


export const Header = () => {
const { t } = useTranslation();
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100%',
      backgroundColor: 'var(--color-header)',
      padding: '1.5rem 0',
      textAlign: 'center',
      fontSize: '4rem', 
      textShadow: '0.2rem 0.2rem 0.5rem rgba(0,0,0,0.3)',
      boxShadow: '0 0.5rem 1.5rem rgba(0,0,0,0.2)',
      zIndex: 10,
    }}>
      {t('title')}
    </div>
  );
};