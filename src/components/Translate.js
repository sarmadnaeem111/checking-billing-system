import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import translations from '../utils/translations';

function Translate({ textKey, fallback }) {
  const { language } = useLanguage();
  
  // Get translation for current language, or use fallback if translation is missing
  const translated = translations[language]?.[textKey] || fallback || textKey;
  
  return <>{translated}</>;
}

export default Translate; 