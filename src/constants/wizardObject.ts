export enum SDObjectTypes {
  dacPolicies = "dacPolicies",
  linkBucket = "linkBucket",
  publicMetadata = "publicMetadata",
  summary = "summary",
  publishSubmission = "publishSubmission",
}

export enum FEGAObjectTypes {
  study = "study",
  sample = "sample",
  experiment = "experiment",
  run = "run",
  analysis = "analysis",
  dac = "dac",
  policy = "policy",
  dataset = "dataset",
}

export enum BPObjectTypes {
  bpimage = "bpimage",
  bpdataset = "bpdataset",
  bpsample = "bpsample",
  bpobservation = "bpobservation",
  bpstaining = "bpstaining",
  bpannotation = "bpannotation",
  bppolicy = "bppolicy",
  bprems = "bprems",
}

export const ExtraObjectTypes = {
  submissionDetails: "submissionDetails",
}

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

export const ObjectSubmissionsArray = [ObjectSubmissionTypes.form, ObjectSubmissionTypes.xml]

export const OmitObjectValues = [
  "accessionId",
  "dateCreated",
  "dateModified",
  "publishDate",
  "metaxIdentifier",
  "doi",
]
