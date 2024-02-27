import React, { createContext, useContext, useState, useEffect } from "react";
import { IntlProvider } from "react-intl";
import { configService } from "@pages/background/services/config";
import { defaultLocale, messages } from "@src/_locales";

interface ILocaleContext {
  currentLocale: string;
  changeLocale: (newLocale: string) => void;
}

const LocaleContext = createContext<ILocaleContext | null>(null);

interface ILocaleProvider {
  children?: React.ReactNode;
}

export const LocaleProvider = ({ children }: ILocaleProvider): JSX.Element => {
  const [currentLocale, setCurrentLocale] = useState<string>(defaultLocale);

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

  const selectedMessages = messages[currentLocale as keyof typeof messages];
  return (
    <LocaleContext.Provider value={{ currentLocale, changeLocale }}>
      <IntlProvider locale={currentLocale} messages={selectedMessages}>
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
