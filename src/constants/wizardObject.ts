export const ObjectTypes = {
  study: "study",
  sample: "sample",
  experiment: "experiment",
  run: "run",
  analysis: "analysis",
  dac: "dac",
  datacite: "datacite",
  policy: "policy",
  dataset: "dataset",
  linkedFolder: "linkedFolder",
  bpimage: "bpimage",
  bpdataset: "bpdataset",
  bpsample: "bpsample",
  bpobservation: "bpobservation",
  bpstaining: "bpstaining",
  dacPolicies: "dacPolicies",
  summary: "summary",
  publish: "publish",
  submissionDetails: "submissionDetails",
}

export const NotMetadataObjects = [
  ObjectTypes.dacPolicies,
  ObjectTypes.datacite,
  ObjectTypes.linkedFolder,
  ObjectTypes.publish,
  ObjectTypes.submissionDetails,
  ObjectTypes.summary,
]

export const ObjectStatus = {
  draft: "Draft",
  submitted: "Submitted",
  ready: "Ready",
}

export const ObjectSubmissionTypes = {
  form: "Form",
  xml: "XML",
  existing: "Existing",
}

// SDSX valid steps
export const ValidSteps = [
  "createSubmissionStep",
  "dacPoliciesStep",
  "datafolderStep",
  "idPublishStep",
]

// Used only in WizardDraftSelections.tsx, not affected by workflows?
export const ObjectSubmissionStepsList = [
  {
    stepNumber: 2,
    objectTypes: [ObjectTypes.study, ObjectTypes.dac, ObjectTypes.policy],
  },
  {
    stepNumber: 4,
    objectTypes: [
      ObjectTypes.sample,
      ObjectTypes.experiment,
      ObjectTypes.run,
      ObjectTypes.analysis,
      ObjectTypes.dataset,
    ],
  },
]

export const ObjectSubmissionsArray = [ObjectSubmissionTypes.form, ObjectSubmissionTypes.xml]

export const OmitObjectValues = [
  "accessionId",
  "dateCreated",
  "dateModified",
  "publishDate",
  "metaxIdentifier",
  "doi",
]
