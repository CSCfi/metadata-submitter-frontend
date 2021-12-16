export const ObjectTypes = {
  study: "study",
  sample: "sample",
  experiment: "experiment",
  run: "run",
  analysis: "analysis",
  dac: "dac",
  policy: "policy",
  dataset: "dataset",
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

export const ObjectSubmissionsArray = [ObjectSubmissionTypes.form, ObjectSubmissionTypes.xml]

export const OmitObjectValues = ["accessionId", "dateCreated", "dateModified", "publishDate"]
