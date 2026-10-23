"use client";

import { createContext, useContext, type ReactNode } from "react";
import { UI, type Dictionary, type Locale } from "@/lib/i18n";

const LocaleContext = createContext<Locale>("en");

/** Set once per root layout, so client components know which language the page is in. */
export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

/** The interface strings for the page's language. */
export function useUI(): Dictionary {
  return UI[useContext(LocaleContext)];
}
