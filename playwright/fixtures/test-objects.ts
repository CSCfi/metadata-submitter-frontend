export const TestStudyObject = {
  index: 0,
  descriptor: {
    studyTitle: "Test study title",
    studyType: "Metagenomics",
    studyAbstract: "New abstract",
  },
}

export const TestDACObject = {
  title: "Test DAC title",
  index: 0,
  contacts: [
    {
      name: "Test Person",
      email: "test.person@testdomain.com",
      telephoneNumber: "+358123456789",
      mainContact: true,
    },
  ],
}

export const TestPolicyObject = {
  title: "Test policy title",
  index: 0,
  policy: { policyText: "Test policy text" },
}

export const TestSampleObject = {
  title: "Test sample title",
  index: 0,
  sampleName: { taxonId: 123456 },
}

export const TestExperimentObject = {
  title: "Test experiment title",
  index: 0,
  platform: "454 GS 20",
  design: {
    designDescription: "Experiment design description",
    libraryDescriptor: {
      libraryStrategy: "AMPLICON",
      librarySource: "GENOMIC SINGLE CELL",
      librarySelection: "5-methylcytidine antibody",
    },
  },
}

export const TestRunObject = {
  title: "Test run title",
  index: 0,
  experimentRef: [
    {
      accessionId: "c88969977ad14ecca53cfee63f784477",
      identifiers: { externalId: {}, submitterId: {} },
    },
  ],
}

export const TestAnalysisObject = {
  title: "Test analysis title",
  index: 0,
  analysisType: { referenceAlignment: { assembly: { accession: "a123" } } },
}

export const TestDatasetObject = {
  title: "Test Dataset title",
  index: 0,
  description: "Dataset description",
  datasetType: ["Amplicon sequencing"],
}
