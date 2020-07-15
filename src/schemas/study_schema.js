const studySchema = {
  title: "Study",
  definitions: {
    xrefLink: {
      $id: "#/definitions/xrefLink",
      type: "object",
      title: "XRef Link",
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
    urlLink: {
      $id: "#/definitions/urlLink",
      type: "object",
      title: "URL Link",
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
    entrezLink: {
      $id: "#/definitions/entrezLink",
      type: "object",
      title: "Entrez Link",
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
  },
  type: "object",
  required: ["studyTitle", "studyType"],
  properties: {
    studyTitle: {
      title: "Study Title",
      description: "Title of the study as would be used in a publication.",
      type: "string",
    },
    studyType: {
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
      ],
    },
    studyAbstract: {
      title: "Study Abstract",
      description:
        "Briefly describes the goals, purpose, and scope of the Study. This need not be listed if it can be inherited from a referenced publication.",
      type: "string",
      minLength: 10,
      maxLength: 100,
    },
    studyDescription: {
      title: "Study Description",
      description: "More extensive free-form description of the study.",
      type: "string",
    },
    studyLinks: {
      type: "array",
      title: "Study Links",
      items: {
        anyOf: [
          { title: "XRef Link", $ref: "#/definitions/xrefLink" },
          { title: "Entrez Link", $ref: "#/definitions/entrezLink" },
          { title: "URL Link", $ref: "#/definitions/urlLink" },
        ],
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
        centerName: {
          title: "Center Name",
          description: "The center name of the submitter.",
          type: "string",
        },
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

export default studySchema
