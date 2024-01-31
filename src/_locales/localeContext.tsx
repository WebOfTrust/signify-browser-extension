import React, { createContext, useContext, useState, useEffect } from "react";
import { IntlProvider } from "react-intl";
import { configService } from "@pages/background/services/config";
import { defaultLocale, messages } from "@src/_locales";

interface ILocaleContext {
  currentLocale: string;
  changeLocale: (newLocale: string) => void;
}

const LocaleContext = createContext<ILocaleContext | null>(null);

export const LocaleProvider = ({ children }) => {
  const [currentLocale, setCurrentLocale] = useState(defaultLocale);

  const handleChangeLocale = async () => {
    const lang = await configService.getLanguage();
    setCurrentLocale(lang ?? defaultLocale);
  };

  useEffect(() => {
    handleChangeLocale();
  }, []);

  const changeLocale = async (newLocale: string) => {
    await configService.setLanguage(newLocale);
    setCurrentLocale(newLocale);
  };

  return (
    <LocaleContext.Provider value={{ currentLocale, changeLocale }}>
      <IntlProvider locale={currentLocale} messages={messages[currentLocale]}>
        {children}
      </IntlProvider>
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
};
