import { useState, useRef, useEffect } from "react";
import { SUPPORTED_LANGUAGES, getStoredLanguage, storeLanguage, type LanguageCode, isRTL } from "@/lib/i18n";
import { Globe, Check } from "lucide-react";

interface LanguageSelectorProps {
  currentLang: LanguageCode;
  onChange: (code: LanguageCode) => void;
}

export default function LanguageSelector({ currentLang, onChange }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-colors"
      >
        <Globe className="h-4 w-4" />
        <span className="font-medium">{current.flag}</span>
        <span className="hidden sm:inline text-xs">{current.name}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
          <div className="py-1 max-h-72 overflow-y-auto">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  onChange(lang.code);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-slate-50 transition-colors ${
                  currentLang === lang.code ? "bg-teal-50 text-teal-700 font-medium" : "text-slate-700"
                }`}
              >
                <span className="text-base">{lang.flag}</span>
                <span className="flex-1 text-left">{lang.name}</span>
                {currentLang === lang.code && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
