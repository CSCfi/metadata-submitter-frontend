import JSONSchemaParser from "./JSONSchemaParser"

const schema = {
  title: "Study",
  definitions: {
    xrefLink: {
      $id: "#/definitions/xrefLink",
      type: "array",
      title: "XRef Link",
      items: {
        type: "object",
        required: ["db", "id"],
        properties: {
          db: {
            type: "string",
            title: "DataBase",
          },
          id: {
            type: "string",
            title: "Associated accession ID",
          },
        },
      },
    },
    urlLink: {
      $id: "#/definitions/urlLink",
      type: "array",
      title: "URL Links",
      items: {
        type: "object",
        required: ["label", "url"],
        properties: {
          label: {
            description: "Text label to display for the link.",
            title: "Label",
            type: "string",
          },
          url: {
            description: "The internet service link (http(s), ftp) etc.",
            type: "string",
            title: "URL",
            pattern: "^(https?|ftp)://",
          },
        },
      },
    },
    entrezLink: {
      $id: "#/definitions/entrezLink",
      type: "array",
      title: "Entrez Link",
      items: {
        type: "object",
        required: ["db"],
        properties: {
          db: {
            description:
              "NCBI controlled vocabulary of permitted cross references. Please see http://www.ncbi.nlm.nih.gov/entrez/eutils/einfo.fcgi? .",
            title: "DataBase",
            type: "string",
          },
          label: {
            description: "How to label the link.",
            title: "Label",
            type: "string",
          },
        },
      },
    },
    studyAttribute: {
      $id: "#/definitions/studyAttribute",
      type: "object",
      title: "Add study attribute",
      description: "tag title and its associated value (description)",
      required: ["tag", "value"],
      properties: {
        tag: {
          type: "string",
          title: "Tag title",
        },
        value: {
          type: "string",
          title: "Description",
        },
      },
    },
    studyType: {
      $id: "#/definitions/studyType",
      title: "Study Type",
      description:
        "The Study type presents a controlled vocabulary for expressing the overall purpose of the study.",
      type: "string",
      enum: [
        "Whole Genome Sequencing",
        "Metagenomics",
        "Transcriptome Analysis",
        "Resequencing",
        "Epigenetics",
        "Synthetic Genomics",
        "Forensic or Paleo-genomics",
        "Gene Regulation Study",
        "Cancer Genomics",
        "Population Genomics",
        "RNASeq",
        "Exome Sequencing",
        "Pooled Clone Sequencing",
        "Transcriptome Sequencing",
        "Other",
      ],
    },
  },
  type: "object",
  required: ["descriptor"],
  properties: {
    descriptor: {
      type: "object",
      title: "Study Description",
      required: ["studyTitle", "studyType"],
      properties: {
        studyTitle: {
          title: "Study Title",
          description: "Title of the study as would be used in a publication.",
          type: "string",
        },
        studyType: {
          $ref: "#/definitions/studyType",
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
    studyLinks: {
      type: "object",
      title: "Study Links",
      properties: {
        xrefLinks: {
          $ref: "#/definitions/xrefLink",
        },
        entrezLinks: {
          $ref: "#/definitions/entrezLink",
        },
        urlLinks: {
          $ref: "#/definitions/urlLink",
        },
      },
    },
    studyAttributes: {
      type: "array",
      title: "Study Attributes",
      items: {
        $ref: "#/definitions/studyAttribute",
      },
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
            " Submitter defined project name.  This field is intended for backward tracking of the study record to the submitter's LIMS.",
          type: "string",
        },
      },
    },
  },
}

const studyExample = {
  centerName: "GEO",
  descriptor: {
    studyTitle:
      "Highly integrated epigenome maps in Arabidopsis - whole genome shotgun bisulfite sequencing",
    studyType: "Other",
    studyAbstract:
      "Part of a set of highly integrated epigenome maps for Arabidopsis thaliana. Keywords: Illumina high-throughput bisulfite sequencing Overall design: Whole genome shotgun bisulfite sequencing of wildtype Arabidopsis plants (Columbia-0), and met1, drm1 drm2 cmt3, and ros1 dml2 dml3 null mutants using the Illumina Genetic Analyzer.",
    centerProjectName: "GSE10966",
  },
  studyLinks: {
    xrefLinks: [
      {
        db: "pubmed",
        id: "18423832",
      },
    ],
  },
  studyAttributes: [
    {
      tag: "parent_bioproject",
      value: "PRJNA107265",
    },
  ],
}

describe("SchemaParser", () => {
  test("returns yup schema that fails for invalid study", async () => {
    const yupSchema = await JSONSchemaParser.parse_schema(schema)
    const invalid = await yupSchema.isValid({
      name: "jimmy",
      age: 24,
    })
    expect(invalid).toBe(false)
  })
  test("returns yup schema that matches valid study", async () => {
    const yupSchema = await JSONSchemaParser.parse_schema(schema)
    const valid = await yupSchema.isValid(studyExample)
    expect(valid).toBe(true)
  })
})
