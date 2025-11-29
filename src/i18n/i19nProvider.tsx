import { IntlProvider } from "react-intl";
// import "@formatjs/intl-relativetimeformat/polyfill";
// import "@formatjs/intl-relativetimeformat/locale-data/en";
// import "@formatjs/intl-relativetimeformat/locale-data/de";
// import "@formatjs/intl-relativetimeformat/locale-data/es";
// import "@formatjs/intl-relativetimeformat/locale-data/fr";
// import "@formatjs/intl-relativetimeformat/locale-data/ja";
// import "@formatjs/intl-relativetimeformat/locale-data/zh";
// import "@formatjs/intl-relativetimeformat/locale-data/zh-Hant";

import enMessages from "./messages/en.json";
import zhMessages from "./messages/zh.json";
import zhTwMessages from "./messages/zh_TW.json";
import { useLang } from "./ADPI18nProvider";
import { type ReactNode } from "react";

const allMessages = {
  en: enMessages,
  zh: zhMessages,
  "zh-TW": zhTwMessages,
};

function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useLang();
  const messages = allMessages[locale];
  return (
    <IntlProvider locale={locale} messages={messages}>
      {children}
    </IntlProvider>
  );
}

export { I18nProvider };
