import JSONSchemaParser from "./JSONSchemaParser"

const studySchema = {
  title: "Study",
  type: "object",
  required: ["descriptor"],
  properties: {
    descriptor: {
      type: "object",
      title: "Study Description",
      required: ["studyTitle"],
      properties: {
        studyTitle: {
          title: "Study Title",
          description: "Title of the study as would be used in a publication.",
          type: "string",
        },
        studyAbstract: {
          title: "Study Abstract",
          description:
            "Briefly describes the goals, purpose, and scope of the Study. This need not be listed if it can be inherited from a referenced publication.",
          type: "string",
          minLength: 10,
          maxLength: 500,
        },
        centerName: {
          title: "Center Name",
          description: "The center name of the submitter.",
          type: "string",
        },
      },
    },
    studyDescription: {
      title: "Study Description",
      description: "More extensive free-form description of the study.",
      type: "string",
    },
    pubMedID: {
      type: "string",
      title: "pubMedID identifier",
      description: " PubMed ID (8 digits) or the PMC ID (PMC + 7 digits)",
      pattern: "^[0-9]{8}|PMC[0-9]{7}",
    },
    center: {
      title: "Description for Center",
      description: "More for backwards compatibility, we might not need it.",
      type: "object",
      properties: {
        centerProjectName: {
          title: "Center Project Name",
          description:
            "Submitter defined project name.  This field is intended for backward tracking of the study record to the submitter's LIMS.",
          type: "string",
        },
      },
    },
  },
}

const studyExample = {
  descriptor: {
    studyTitle:
      "Highly integrated epigenome maps in Arabidopsis - whole genome shotgun bisulfite sequencing",
    studyAbstract:
      "Part of a set of highly integrated epigenome maps for Arabidopsis thaliana. Keywords: Illumina high-throughput bisulfite sequencing Overall design: Whole genome shotgun bisulfite sequencing of wildtype Arabidopsis plants (Columbia-0), and met1, drm1 drm2 cmt3, and ros1 dml2 dml3 null mutants using the Illumina Genetic Analyzer.",
    centerName: "GEO",
  },
  studyDescription:
    "Part of a set of highly integrated epigenome maps for Arabidopsis thaliana. Keywords: Illumina high-throughput bisulfite sequencing Overall design: Whole genome shotgun bisulfite sequencing of wildtype Arabidopsis plants (Columbia-0), and met1, drm1 drm2 cmt3, and ros1 dml2 dml3 null mutants using the Illumina Genetic Analyzer.",
  pubMedID: "PMC1234567",
  center: {
    centerProjectName: "GEO project",
  },
}

describe("SchemaParser", () => {
  test("returns yup studySchema that fails for invalid study", async () => {
    const yupSchema = await JSONSchemaParser.buildYupSchema(studySchema)
    const invalid = await yupSchema.isValid({
      name: "jimmy",
      age: 24,
    })
    expect(invalid).toBe(false)
  })
  test("returns yup studySchema that matches valid study", async () => {
    const yupSchema = await JSONSchemaParser.buildYupSchema(studySchema)
    const valid = await yupSchema.isValid(studyExample)
    expect(valid).toBe(true)
  })
  test("returns correct amount of form fields with given study", async () => {
    const fields = await JSONSchemaParser.buildFieldsAndInitialValues(
      studySchema
    )
    expect(fields.length).toBe(6)
  })
})
