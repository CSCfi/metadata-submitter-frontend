import { useEffect, useState } from "react"

import schemaAPIService from "services/schemaAPI"

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

export const fetchSchemas = async () => {
  const response = await schemaAPIService.getAllSchemas()
  if (response.ok) {
    const schemas = response.data
      .filter(schema => schema.title !== "Project" && schema.title !== "Submission")
      .map(schema => schema.title.toLowerCase())
    return schemas
  } else {
    return [
      ObjectTypes.study,
      ObjectTypes.sample,
      ObjectTypes.experiment,
      ObjectTypes.run,
      ObjectTypes.analysis,
      ObjectTypes.dac,
      ObjectTypes.policy,
      ObjectTypes.dataset,
    ]
  }
}

export const getObjectsArray = () => {
  const [objectsArray, setObjectsArray] = useState([])

  useEffect(() => {
    const getSchemas = async () => {
      const schemas = await fetchSchemas()
      setObjectsArray(schemas)
    }
    getSchemas()
  }, [objectsArray.length])

  return objectsArray
}

export const ObjectStatus = {
  draft: "Draft",
  submitted: "Submitted",
}

export const ObjectSubmissionTypes = {
  form: "Form",
  xml: "XML",
  existing: "Existing",
}

export const ObjectSubmissionsArray = [
  ObjectSubmissionTypes.form,
  ObjectSubmissionTypes.xml,
  ObjectSubmissionTypes.existing,
]
