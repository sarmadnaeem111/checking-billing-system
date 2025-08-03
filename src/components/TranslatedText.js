import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslatedText } from '../utils/translations';

/**
 * Component to get translated text directly
 * @param {Object} props
 * @param {string} props.textKey - The key for translation
 * @param {string} props.fallback - Optional fallback text if key is not found
 */
function TranslatedText({ textKey, fallback }) {
  const { language } = useLanguage();
  const translatedText = getTranslatedText(textKey, language) || fallback || textKey;
  
  return translatedText;
}

export default TranslatedText; 