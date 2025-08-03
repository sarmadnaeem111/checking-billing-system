import React, { createContext, useContext, useState, useEffect } from 'react';
import { translateData as translate } from '../utils/translations';

const LanguageContext = createContext();

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');
  
  // Load language preference from localStorage on initial load
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);
  
  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);
  
  const toggleLanguage = () => {
    setLanguage(prevLanguage => prevLanguage === 'en' ? 'ur' : 'en');
  };

  // Function to translate data
  const translateData = (data) => {
    return translate(data, language);
  };
  
  const value = {
    language,
    toggleLanguage,
    isEnglish: language === 'en',
    isUrdu: language === 'ur',
    translateData
  };
  
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
} 