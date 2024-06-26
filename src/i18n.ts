import * as i18n from "i18next"
import { initReactI18next } from "react-i18next"

import EnTranslation from "./translations/en/translation_en.json"
import FiTranslation from "./translations/fi/translation_fi.json"
/*
 * Later we could add here different translation files for
  various objects and forms
 */
const resources = {
  en: {
    translation: EnTranslation,
  },
  fi: {
    translation: FiTranslation,
  },
}

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "en", // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
    // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
    // if you're using a language detector, do not define the lng option
    fallbackLng: ["en", "fi"],
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  })

export default i18n
