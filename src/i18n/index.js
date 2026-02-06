import * as Localization from "expo-localization";
import { I18n } from "i18n-js";
import en from "./en";
import ti from "./ti";

const i18n = new I18n({
    ti,
    en,
});

const locales = Localization.getLocales();
i18n.locale = locales[0]?.languageCode ?? "ti";

i18n.enableFallback = true;
i18n.defaultLocale = "ti";

export default i18n;
