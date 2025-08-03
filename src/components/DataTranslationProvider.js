import React, { createContext, useContext, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

// Create context to hold translated data
const DataTranslationContext = createContext({});

/**
 * Hook to access translated data
 */
export const useTranslatedPageData = () => {
  return useContext(DataTranslationContext);
};

/**
 * Provider component that automatically translates data for a page
 * @param {Object} props
 * @param {Object} props.data - The data to be translated
 * @param {React.ReactNode} props.children - Child components
 */
function DataTranslationProvider({ data, children }) {
  const { translateData } = useLanguage();
  
  // Memoize the translated data to prevent unnecessary recalculations
  const translatedData = useMemo(() => {
    return translateData(data);
  }, [data, translateData]);
  
  return (
    <DataTranslationContext.Provider value={translatedData}>
      {children}
    </DataTranslationContext.Provider>
  );
}

export default DataTranslationProvider; 