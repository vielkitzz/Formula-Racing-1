import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { translations } from './translations';

export type Language = 'pt-BR' | 'en-US';
// FIX: Export TranslationKey to be used in other modules for type safety.
export type TranslationKey = keyof typeof translations;

interface I18nContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: TranslationKey, replacements?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// FIX: Changed component signature to use React.FC to resolve a cascading type issue.
export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('pt-BR');

    const t = useCallback((key: TranslationKey, replacements?: Record<string, string | number>): string => {
        const entry = translations[key];
        let text = String(key);

        if (entry && entry[language]) {
            text = entry[language];
        } else if (entry && entry['pt-BR']) {
            text = entry['pt-BR']; // Fallback to Portuguese
        }
        
        if (replacements) {
            Object.keys(replacements).forEach(rKey => {
                text = text.replace(`{{${rKey}}}`, String(replacements[rKey]));
            });
        }

        return text;
    }, [language]);

    // This was replaced from JSX to be compatible with a .ts file extension, which may have caused the type issue.
    return React.createElement(I18nContext.Provider, { value: { language, setLanguage, t } }, children);
};

export const useI18n = () => {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
};