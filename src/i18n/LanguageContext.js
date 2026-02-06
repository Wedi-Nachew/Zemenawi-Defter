import * as Localization from "expo-localization";
import AsyncStorage from "expo-sqlite/kv-store";
import { createContext, useContext, useEffect, useState } from "react";
import i18n from "./index";

const LanguageContex = createContext(null);

const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState("ti");
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const initLanguage = async () => {
            const saved = await AsyncStorage.getItem("language");

            if (saved) {
                i18n.locale = saved;
                setLanguage(saved);
            } else {
                const deviceLang =
                    Localization.getLocales()[0]?.languageCode || "ti";
                i18n.locale = deviceLang;
                setLanguage(deviceLang);
            }

            setReady(true);
        };

        initLanguage();
    }, []);

    const changeLanguage = async (lang) => {
        i18n.locale = lang;
        setLanguage(lang);
        await AsyncStorage.setItem("language", lang);
    };

    if (!ready) return null;

    return (
        <LanguageContex.Provider value={{ language, changeLanguage }}>
            {children}
        </LanguageContex.Provider>
    );
};

const useLanguage = () => useContext(LanguageContex);

export { LanguageProvider, useLanguage };
