import React from 'react';
import { Button } from 'react-bootstrap';
import { useLanguage } from '../contexts/LanguageContext';
import translations from '../utils/translations';

function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();
  
  return (
    <Button 
      variant="outline-light" 
      className="ms-2" 
      onClick={toggleLanguage}
      size="sm"
    >
      {language === 'en' ? translations.en.switchToUrdu : translations.ur.switchToEnglish}
    </Button>
  );
}

export default LanguageToggle; 