import React, { useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translateData } from '../utils/translations';

/**
 * Component for translating dynamic data content
 * @param {Object} props
 * @param {any} props.data - The data to be translated (string, object, or array)
 * @param {string} props.field - Optional field name to identify specific translations
 * @param {React.ReactNode} props.children - Optional render prop function that receives translated data
 */
function TranslateData({ data, field, children }) {
  const { language } = useLanguage();
  
  // Memoize the translated data to prevent unnecessary recalculations
  const translatedData = useMemo(() => {
    return translateData(data, language);
  }, [data, language]);
  
  // If children is a function, call it with the translated data
  if (typeof children === 'function') {
    return children(translatedData);
  }
  
  // For simple string data
  if (typeof translatedData === 'string' || typeof translatedData === 'number') {
    return <>{translatedData}</>;
  }
  
  // For field extraction from an object
  if (field && typeof translatedData === 'object' && !Array.isArray(translatedData)) {
    return <>{translatedData[field] || ''}</>;
  }
  
  // For arrays and objects without specific rendering, convert to string
  if (typeof translatedData === 'object') {
    return <>{JSON.stringify(translatedData)}</>;
  }
  
  // Fallback
  return null;
}

export default TranslateData; 