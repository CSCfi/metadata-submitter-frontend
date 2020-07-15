const studySchema = {
  title: "Study",
  definitions: {
    xrefLink: {
      $id: "#/definitions/xrefLink",
      type: "object",
      title: "Add xrefLink",
      required: ["db", "id"],
      properties: {
        db: {
          type: "string",
          title: "Add DB",
        },
        id: {
          type: "string",
          title: "Associated accession ID",
        },
      },
    },
    urlLink: {
      $id: "#/definitions/urlLink",
      type: "object",
      title: "Add URL Link ",
      required: ["label", "url"],
      properties: {
        label: {
          description: "Text label to display for the link.",
          type: "string",
        },
        url: {
          description: "The internet service link (file:, http:, ftp: etc.",
          type: "string",
          pattern: "^(https?|ftp)://",
        },
      },
    },
    entrezlink: {
      $id: "#/definitions/entrezlink",
      type: "object",
      title: "Add Entrez Link",
      required: ["db"],
      properties: {
        db: {
          description:
            "NCBI controlled vocabulary of permitted cross references. Please see http://www.ncbi.nlm.nih.gov/entrez/eutils/einfo.fcgi? .",
          type: "string",
        },
        label: {
          description: "How to label the link.",
          type: "string",
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
          title: "tag title",
        },
        value: {
          type: "string",
          title: "description",
        },
      },
    },
  },
  type: "object",
  required: ["studyTitle", "studyTitle"],
  properties: {
    studyTitle: {
      title: "Study title",
      description: "Title of the study as would be used in a publication.",
      type: "string",
    },
    studyType: {
      title: "Study type",
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
      ],
    },
    studyAbstract: {
      title: "Study abstract",
      description:
        "Briefly describes the goals, purpose, and scope of the Study. This need not be listed if it can be inherited from a referenced publication.",
      type: "string",
      minLength: 10,
      maxLength: 100,
    },
    studyDescription: {
      title: "Study description",
      description: "More extensive free-form description of the study.",
      type: "string",
    },
    studyLinks: {
      type: "object",
      title: "The studyLinks schema",
      required: ["studyLink"],
      properties: {
        studyLink: {
          type: "array",
          title: "The studyLink schema",
          items: {
            anyOf: [
              {
                $ref: "#/definitions/xrefLink",
              },
              {
                $ref: "#/definitions/entrezLink",
              },
              {
                $ref: "#/definitions/urlLink",
              },
            ],
          },
        },
      },
    },
    studyAttributes: {
      type: "array",
      title: "The studyAttributes schema",
      items: {
        $ref: "#/definitions/studyAttribute",
      },
    },
    center: {
      title: "Description for Center",
      description: "More for backwards compatibility, we might not need it.",
      type: "object",
      properties: {
        centerName: {
          title: "Center name",
          description: "The center name of the submitter.",
          type: "string",
        },
        centerProjectName: {
          title: "Study abstract",
          description:
            " Submitter defined project name.  This field is intended for backward tracking of the study record to the submitter's LIMS.",
          type: "string",
        },
      },
    },
  },
}

export default studySchema
