import { type ReactNode, createContext, useContext } from "react";

const I18N_CONFIG_KEY =
  import.meta.env.VITE_APP_I18N_CONFIG_KEY || "i18nConfig";

const LANGUAGE_OPTIONS = ["en", "zh", "zh-TW"] as const;
type LanguageOptions = (typeof LANGUAGE_OPTIONS)[number];

type Props = {
  selectedLang: LanguageOptions;
};

const getInitialLang = (lang: string) => {
  if (LANGUAGE_OPTIONS.find((e) => e.toLowerCase() === lang.toLowerCase()))
    return lang as LanguageOptions;
  return (LANGUAGE_OPTIONS.find(
    (e) => e.toLowerCase() === lang.split("-")[0].toLowerCase(),
  ) || "en") as LanguageOptions;
};

const initialState: Props = {
  selectedLang: getInitialLang(window.navigator.language),
};

function getConfig(): Props {
  const ls = localStorage.getItem(I18N_CONFIG_KEY);
  // console.log("lang", ls);
  if (ls) {
    try {
      return JSON.parse(ls) as Props;
    } catch (er) {
      console.error(er);
    }
  } else {
    localStorage.setItem(I18N_CONFIG_KEY, JSON.stringify(initialState));
  }
  return initialState;
}

// Side effect
export function setLanguage(lang: string) {
  localStorage.setItem(I18N_CONFIG_KEY, JSON.stringify({ selectedLang: lang }));
  window.location.reload();
}

const I18nContext = createContext<Props>(initialState);

export const useLang = () => {
  return useContext(I18nContext).selectedLang;
};

export default function ADPI18nProvider({ children }: { children: ReactNode }) {
  const lang = getConfig();
  console.log("lang: ", lang);
  // moment.locale(lang.selectedLang);
  return <I18nContext.Provider value={lang}>{children}</I18nContext.Provider>;
}
