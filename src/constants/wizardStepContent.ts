import WizardAddObjectStep from "components/SubmissionWizard/WizardSteps/WizardAddObjectStep"
import WizardCreateSubmissionStep from "components/SubmissionWizard/WizardSteps/WizardCreateSubmissionStep"
import WizardDataBucketStep from "components/SubmissionWizard/WizardSteps/WizardDataBucketStep"
import WizardPublishStep from "components/SubmissionWizard/WizardSteps/WizardPublishStep"
import WizardShowSummaryStep from "components/SubmissionWizard/WizardSteps/WizardShowSummaryStep"

/* Current STEP_CONTENT_KEYS are made based on SD workflow.
 * In the future, we could have other STEP_CONTENT_KEYS,
 * we can add them here or make them separate based on the workflows.
 */
export const STEP_CONTENT_KEYS = {
  createSubmissionStep: "createSubmissionStep",
  dataBucketStep: "dataBucketStep",
  addObjectStep: "addObjectStep",
  showSummaryStep: "showSummaryStep",
  publishSubmissionStep: "publishSubmissionStep",
}

// Render different components based on STEP_CONTENT_KEYS
export const WizardStepContent = {
  [STEP_CONTENT_KEYS.createSubmissionStep]: WizardCreateSubmissionStep,
  [STEP_CONTENT_KEYS.dataBucketStep]: WizardDataBucketStep,
  [STEP_CONTENT_KEYS.addObjectStep]: WizardAddObjectStep,
  [STEP_CONTENT_KEYS.showSummaryStep]: WizardShowSummaryStep,
  [STEP_CONTENT_KEYS.publishSubmissionStep]: WizardPublishStep,
}
