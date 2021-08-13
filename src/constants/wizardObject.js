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

export const ObjectStatus = {
  draft: "Draft",
  submitted: "Submitted",
}

export const ObjectSubmissionTypes = {
  form: "Form",
  xml: "XML",
}

export const ObjectSubmissionsArray = [ObjectSubmissionTypes.form, ObjectSubmissionTypes.xml]

export const OmitObjectValues = ["accessionId", "dateCreated", "dateModified", "publishDate"]
