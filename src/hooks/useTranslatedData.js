import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Custom hook for translating and using data based on the current language
 * @param {any} initialData - The data to be translated
 * @returns {any} The translated data according to current language
 */
function useTranslatedData(initialData) {
  const { language, translateData } = useLanguage();
  const [translatedData, setTranslatedData] = useState(() => translateData(initialData));
  
  useEffect(() => {
    // Update translated data when language or initialData changes
    setTranslatedData(translateData(initialData));
  }, [language, initialData, translateData]);
  
  return translatedData;
}

export default useTranslatedData; 