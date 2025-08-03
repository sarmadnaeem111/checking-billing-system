// Export all translation utilities from a single file
import translations, { translateData, getTranslatedText } from './translations';
import Translate from '../components/Translate';
import TranslateData from '../components/TranslateData';
import TranslatedText from '../components/TranslatedText';
import DataTranslationProvider, { useTranslatedPageData } from '../components/DataTranslationProvider';
import useTranslatedData from '../hooks/useTranslatedData';
import useTranslatedAttribute from '../hooks/useTranslatedAttribute';

export {
  translations,
  translateData,
  getTranslatedText,
  Translate,
  TranslateData,
  TranslatedText,
  DataTranslationProvider,
  useTranslatedPageData,
  useTranslatedData,
  useTranslatedAttribute
}; 