import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = 'ka' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (data: any) => string;
}

const LanguageContext = createContext<LanguageContextType>(
  {} as LanguageContextType,
);

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [language, setLanguageState] = useState<Language>('ka');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    const saved = await AsyncStorage.getItem('user-language');
    if (saved === 'en') {
      setLanguageState('en');
    }
  };

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    await AsyncStorage.setItem('user-language', lang);
  };

  const t = (data: any) => {
    if (!data) return '';
    return data[language] || data['ka'] || data['en'] || '';
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
