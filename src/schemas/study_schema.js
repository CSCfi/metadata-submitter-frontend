const studySchema = {
  title: "Study",
  description:
    "A Study is a container for a sequencing investigation that may comprise multiple experiments. The Study has an overall goal, but is otherwise minimally defined in the SRA. A Study is composed of a descriptor, zero or more experiments, and zero or more analyses. The submitter may decorate the Study with web links and properties. This Study JSON schema is based on ENA Study XSD 1.5.61",
  type: "object",
  required: ["descriptor"],
  properties: {
    centerName: {
      title: "Center name",
      description: "The center name of the submitter.",
      default: "",
      type: "string",
    },
    descriptor: {
      title: "Description for Study",
      description: "Descriptive attributes for Study",
      type: "object",
      required: ["studyTitle", "studyType"],
      properties: {
        studyTitle: {
          title: "Study title",
          description: "Title of the study as would be used in a publication.",
          default: "",
          type: "string",
        },
        studyType: {
          title: "Study type",
          description:
            "The Study type presents a controlled vocabulary for expressing the overall purpose of the study.",
          default: "",
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
          default: "",
          type: "string",
        },
      },
    },
  },
}

export default studySchema
