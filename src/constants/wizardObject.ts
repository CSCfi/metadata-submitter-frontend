export const ObjectTypes = {
  study: "study",
  sample: "sample",
  experiment: "experiment",
  run: "run",
  analysis: "analysis",
  dac: "dac",
  policy: "policy",
  dataset: "dataset",
  file: "file",
  bpimage: "bpimage",
  bpdataset: "bpdataset",
  bpsample: "bpsample",
  bpobservation: "bpobservation",
  bpstaining: "bpstaining",
}

export const DisplayObjectTypes = {
  study: "Study",
  sample: "Sample",
  experiment: "Experiment",
  run: "Run",
  analysis: "Analysis",
  dac: "DAC",
  policy: "Policy",
  dataset: "Dataset",
  file: "Datafolder",
}

export const ObjectStatus = {
  draft: "Draft",
  submitted: "Submitted",
  template: "Template",
}

export const ObjectSubmissionTypes = {
  form: "Form",
  xml: "XML",
  existing: "Existing",
}

export const ValidSteps = [1, 2, 3, 4, 5, 6]

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
