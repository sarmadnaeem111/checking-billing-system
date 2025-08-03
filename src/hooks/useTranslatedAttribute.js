import { useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslatedText } from '../utils/translations';

/**
 * Hook to get translated text for attributes like data-label
 * @returns {Function} - Function that returns translated text for a key
 */
function useTranslatedAttribute() {
  const { language } = useLanguage();
  
  const getAttributeText = useCallback((key, fallback) => {
    return getTranslatedText(key, language) || fallback || key;
  }, [language]);
  
  return getAttributeText;
}

export default useTranslatedAttribute;

 