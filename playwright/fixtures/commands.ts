import { test as base, expect } from "@playwright/test"
import { MongoClient } from "mongodb"

import {
  TestStudyObject,
  TestDACObject,
  TestPolicyObject,
  //TestSampleObject,
  //TestExperimentObject,
  //TestRunObject,
  //TestAnalysisObject,
  //TestDatasetObject,
} from "./test-objects"

import { ObjectTypes } from "constants/wizardObject"

type CommandFixtures = {
  mockAuthUrl: string
  subUser: string
  familyName: string
  givenName: string
  submissionName: string
  resetDB: () => Promise<void>
  setMockUser: () => Promise<void>
  login: () => Promise<void>
  newSubmission: () => Promise<void>
  formActions: (buttonName: string) => Promise<void>
  optionsActions: (optionName: string) => Promise<void>
  clickAddObject: (objectType: string) => Promise<void>
  clickAccordionPanel: (label: string) => Promise<void>
  generateSubmissionAndObjects: (stopToObjectType: string) => Promise<void>
  continueLatestDraft: (objectType: string) => Promise<void>
}

// Extend base test with our fixtures.
const test = base.extend<CommandFixtures>({
  mockAuthUrl: process.env.MOCK_AUTH_URL,
  subUser: process.env.SUB_USER,
  familyName: process.env.FAMILY_NAME,
  givenName: process.env.GIVEN_NAME,
  submissionName: "",
   
  resetDB: async ({}, use) => {
    const resetDB = async () => {
      const database = await MongoClient.connect("mongodb://admin:admin@localhost:27017")
      const db = database.db("default")
      db.dropDatabase()
    }
    await use(resetDB)
  },
  setMockUser: async ({ request, mockAuthUrl, subUser, familyName, givenName }, use) => {
    const setMockUser = async () => {
      await request.get(mockAuthUrl, {
        params: {
          sub: subUser,
          family: familyName,
          given: givenName,
        },
      })
    }
    await use(setMockUser)
  },
  login: async ({ page }, use) => {
    const login = async () => {
      await page.goto("/")
      await page.getByTestId("login-button").click()
      await page.waitForLoadState("load", { timeout: 30000 })
    }
    await use(login)
  },
  newSubmission: async ({ page, submissionName }, use) => {
    const newSubmission = async () => {
      const submissions = page.waitForResponse("/v1/submissions*")
      await page.getByTestId("submissionName").fill(submissionName ? submissionName : "Test submission name")
      await page.getByTestId("submissionDescription").fill("Test submission description")
      await page.getByTestId("SDSX").click()
      await page.getByTestId("create-submission").click()
      await submissions
    }
    await use(newSubmission)
  },
  formActions: async ({ page }, use) => {
    const formActions = async buttonName => {
      await page.getByTestId(buttonName).click()
      await page.waitForLoadState("load", { timeout: 30000 })
    }
    await use(buttonName => formActions(buttonName))
  },
  optionsActions: async ({ page }, use) => {
    const optionsActions = async optionName => {
      await page.getByTestId("MoreHorizIcon").click()
      await page.getByText(optionName).click()
      await page.waitForLoadState()
    }
    await use(optionName => optionsActions(optionName))
  },
  clickAddObject: async ({ page }, use) => {
    const clickAddObject = async objectType => {
      await page.getByTestId(`Add ${objectType}`).click()
      await page.waitForLoadState()
    }
    await use(objectType => clickAddObject(objectType))
  },
  clickAccordionPanel: async ({ page }, use) => {
    const clickAccordionPanel = async label => {
      await page.getByRole("button", { name: label }).click()
      await page.waitForLoadState()
    }
    await use(label => clickAccordionPanel(label))
  },
  generateSubmissionAndObjects: [
    async ({ page, login }, use) => {
      const generateSubmissionAndObjects = async stopToObjectType => {
        // List of object types in particular order
        // This list is used to choose into what point of object generation is stopped
        let objectTypesArray: string[] = [
          ObjectTypes.study,
          ObjectTypes.dac,
          ObjectTypes.policy,
          ObjectTypes.sample,
          ObjectTypes.experiment,
          ObjectTypes.run,
          ObjectTypes.analysis,
          ObjectTypes.dataset,
        ]

        // Modify object type list if stop point is defined
        if (stopToObjectType.length > 0) {
          objectTypesArray = objectTypesArray.slice(0, objectTypesArray.indexOf(stopToObjectType) + 1)
        }

        const userResponse = await page.request.get("/v1/users/current")

        if (userResponse.ok()) {
          const userResponseData = await userResponse.json()
          const selectedProject = userResponseData.projects[0]

          // Generate submission
          const submissionResponse = await page.request.post("v1/submissions", {
            data: {
              name: "Test generated submission",
              description: "Description for generated submission",
              projectId: selectedProject.projectId,
              published: false,
              metadataObjects: [],
              drafts: [],
              workflow: "SDSX",
            },
          })
          const submissionResponseData = await submissionResponse.json()
          const generatedSubmissionId = submissionResponseData.submissionId
          // Reloading the view doesn't work in GitHub CI and results in failing test since generated submission isn't rendered
          // Changing routes seems to work in this case
          await login()

          await expect(page.getByRole("gridcell").first()).toHaveText("Test generated submission")
          await expect(page.getByTestId("edit-draft-submission").first()).toBeVisible()

          // Generate objects from templates
          const generateObject = async (objectType, template) => {
            const objectPath = `/v1/objects/${objectType}?submission=${generatedSubmissionId}`
            if (objectTypesArray.includes(objectType)) {
              const objectResponse = await page.request.post(objectPath, {
                data: template,
              })
              const objectResponseData = await objectResponse.json()
              return objectResponseData
            }
          }

          generateObject(ObjectTypes.study, TestStudyObject)?.then(() => {
            generateObject(ObjectTypes.dac, TestDACObject)?.then(DACResponse => {
              generateObject(ObjectTypes.policy, {
                ...TestPolicyObject,
                dacRef: { accessionId: DACResponse.accessionId },
              })?.then(() => {
                /* TODO: To be continued after the workflow is defined */
                //generateObject(ObjectTypes.sample, TestSampleObject)?.then(sampleResponse => {
                //  generateObject(ObjectTypes.experiment, {
                //    ...TestExperimentObject,
                //    studyRef: { accessionId: studyResponse.accessionId },
                //    design: {
                //      ...TestExperimentObject.design,
                //      sampleDescriptor: { accessionId: sampleResponse.accessionId },
                //    },
                //})?.then(experimentResponse => {
                //  generateObject(ObjectTypes.run, {
                //    ...TestRunObject,
                //    experimentRef: [{ accessionId: experimentResponse.accessionId }],
                //})?.then(() => {
                //  generateObject(ObjectTypes.analysis, TestAnalysisObject)?.then(() => {
                //    generateObject(ObjectTypes.dataset, TestDatasetObject)?.then(() => {
                //      cy.log("All objects generated")
                //    })
                //  })
                //})
                //  })
                //})
              })
            })
          })
        }
      }
      await use(stopToObjectType => generateSubmissionAndObjects(stopToObjectType))
    },
    { timeout: 60000 },
  ],
  continueLatestDraft: async ({ page }, use) => {
    const continueLatestDraft = async objectType => {
      await page.getByTestId(`${objectType}-objects-list`).getByTestId(`draft-${objectType}-list-item`).first().click()
      await expect(page.getByTestId("form-ready")).toBeVisible()
    }
    await use(objectType => continueLatestDraft(objectType))
  },
})

export default test
