import * as i18n from "i18next"
import { initReactI18next } from "react-i18next"

import EnSubmissionMetadata from "./translations/en/submission_metadata_en.json"
import EnTranslation from "./translations/en/translation_en.json"
import EnWorkflowSteps from "./translations/en/workflow_steps_en"
import FiSubmissionMetadata from "./translations/fi/submission_metadata_fi.json"
import FiTranslation from "./translations/fi/translation_fi.json"
import FiWorkflowSteps from "./translations/fi/workflow_steps_fi"

import { Namespaces } from "constants/translation"

/*
 * Later we could add here different translation files for
  various objects and forms
 */
const resources = {
  en: {
    [Namespaces.translation]: EnTranslation,
    [Namespaces.workflowSteps]: EnWorkflowSteps,
    [Namespaces.submissionMetadata]: EnSubmissionMetadata,
  },
  fi: {
    [Namespaces.translation]: FiTranslation,
    [Namespaces.workflowSteps]: FiWorkflowSteps,
    [Namespaces.submissionMetadata]: FiSubmissionMetadata,
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
    ns: [Namespaces.translation, Namespaces.workflowSteps, Namespaces.submissionMetadata],
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  })

export default i18n
