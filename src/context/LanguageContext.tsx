import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { AppLanguage, LANGUAGE_STORAGE_KEY, getLanguageLocale, t as translateKey } from "../lib/i18n";
import { ensureTamilTtsInstalled, resetTamilTtsPrompt } from "../lib/ttsSupport";

interface LanguageContextType {
  language: AppLanguage;
  locale: string;
  setLanguage: (language: AppLanguage) => Promise<void>;
  t: typeof translateKey;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getStoredLanguage = (): AppLanguage => {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return stored === "ta" ? "ta" : "en";
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, updateProfile } = useAuth();
  const [language, setLanguageState] = useState<AppLanguage>(getStoredLanguage);

  useEffect(() => {
    if (profile?.language && profile.language !== language) {
      setLanguageState(profile.language);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(LANGUAGE_STORAGE_KEY, profile.language);
      }
    }
  }, [profile?.language]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (language === "ta") {
      void ensureTamilTtsInstalled();
    } else {
      resetTamilTtsPrompt();
    }
  }, [language]);

  const setLanguage = async (nextLanguage: AppLanguage) => {
    setLanguageState(nextLanguage);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    }
    if (user && profile?.language !== nextLanguage) {
      await updateProfile({ language: nextLanguage });
    }
  };

  const value = useMemo(
    () => ({
      language,
      locale: getLanguageLocale(language),
      setLanguage,
      t: translateKey,
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
