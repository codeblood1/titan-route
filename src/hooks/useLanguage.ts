import { useState, useCallback, useEffect } from "react";
import { getStoredLanguage, storeLanguage, TRANSLATIONS, type LanguageCode, isRTL } from "@/lib/i18n";

export function useLanguage() {
  const [lang, setLangState] = useState<LanguageCode>(getStoredLanguage());

  // Apply RTL on initial mount
  useEffect(() => {
    const stored = getStoredLanguage();
    if (isRTL(stored)) {
      document.documentElement.dir = "rtl";
    } else {
      document.documentElement.dir = "ltr";
    }
  }, []);

  const setLang = useCallback((code: LanguageCode) => {
    setLangState(code);
    storeLanguage(code);
    if (isRTL(code)) {
      document.documentElement.dir = "rtl";
    } else {
      document.documentElement.dir = "ltr";
    }
  }, []);

  const t = useCallback(
    (key: string): string => {
      const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
      return dict[key] || TRANSLATIONS.en[key] || key;
    },
    [lang]
  );

  return { lang, setLang, t, isRTL: isRTL(lang) };
}
