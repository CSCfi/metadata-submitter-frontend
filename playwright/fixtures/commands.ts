/* Workflows are disabled for MVP */
import { test as base, expect } from "@playwright/test"
import { MongoClient } from "mongodb"

import {
  dratfResponse30,
  dratfResponse5,
  publishedResponse10,
  publishedResponse5,
} from "../fixtures/submission_response"

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

import { FEGAObjectTypes, ObjectStatus } from "constants/wizardObject"

type CommandFixtures = {
  mockAuthUrl: string
  mockUser: { sub: string; family: string; given: string }
  adminUser: { sub: string; family: string; given: string }
  submissionName: string
  resetDB: () => Promise<void>
  setMockUser: (isAdmin: boolean) => Promise<void>
  login: () => Promise<void>
  newSubmission: (workflowType?: string) => Promise<void>
  formActions: (buttonName: string) => Promise<void>
  optionsActions: (optionName: string) => Promise<void>
  clickAddObject: (objectType: string) => Promise<void>
  clickAccordionPanel: (label: string) => Promise<void>
  generateSubmissionAndObjects: (stopToObjectType: string) => Promise<void>
  checkWorkflowRadios: (checked: string) => Promise<void>
  continueLatestForm: (objectType: string, status: string) => Promise<void>
  checkItemsPerPage: (perPage: number, numberOfItems: number) => Promise<void>
  mockGetSubmissions: (itemsPerPage: number, isPublished: boolean) => Promise<void>
}

// Extend base test with our fixtures.
const test = base.extend<CommandFixtures>({
  mockAuthUrl: process.env.MOCK_AUTH_URL,
  mockUser: {
    sub: process.env.SUB_USER ?? "",
    family: process.env.FAMILY_NAME ?? "",
    given: process.env.GIVEN_NAME ?? "",
  },
  adminUser: {
    sub: process.env.ADMIN_USER ?? "",
    family: process.env.ADMIN_FAMILY ?? "",
    given: process.env.ADMIN_GIVEN ?? "",
  },
  submissionName: "",
  /* Playwright "use" has the name overlapped with React Hooks "use" and
   * eslint-plugin-react-hooks v5 complains, hence we change to the alias "baseUse" instead.
   */
  resetDB: async ({}, baseUse) => {
    const resetDB = async () => {
      const database = await MongoClient.connect("mongodb://admin:admin@localhost:27017")
      const db = database.db("default")
      db.dropDatabase()
    }
    await baseUse(resetDB)
  },
  setMockUser: async ({ request, mockAuthUrl, mockUser, adminUser }, baseUse) => {
    const setMockUser = async isAdmin => {
      const user = isAdmin ? adminUser : mockUser
      await request.get(mockAuthUrl, {
        params: {
          sub: user.sub,
          family: user.family,
          given: user.given,
        },
      })
    }
    await baseUse(isAdmin => setMockUser(isAdmin))
  },
  login: async ({ page }, baseUse) => {
    const login = async () => {
      await page.goto("/")
      await page.getByTestId("login-button").click()
      await page.waitForLoadState("load")
    }
    await baseUse(login)
  },
  newSubmission: async ({ page, submissionName }, baseUse) => {
    const newSubmission = async workflowType => {
      await page.getByTestId("link-create-submission").click()
      const submissions = page.waitForResponse("/v1/submissions*")
      await page
        .getByTestId("submissionName")
        .fill(submissionName ? submissionName : "Test submission name")
      await page.getByTestId("datasetTitle").fill("Test title")
      await page.getByTestId("submissionDescription").fill("Test submission description")
      await page.getByTestId(workflowType ? workflowType : "FEGA").isHidden() // For temporary hiding
      await page.getByTestId("create-submission").click()
      await submissions
    }
    await baseUse(workflowType => newSubmission(workflowType))
  },
  formActions: async ({ page }, baseUse) => {
    const formActions = async buttonName => {
      await page.getByTestId(buttonName).click()
      await page.waitForLoadState("load")
    }
    await baseUse(buttonName => formActions(buttonName))
  },
  optionsActions: async ({ page }, baseUse) => {
    const optionsActions = async optionName => {
      await page.getByTestId("MoreHorizIcon").click()
      await page.getByText(optionName).click()
      await page.waitForLoadState()
    }
    await baseUse(optionName => optionsActions(optionName))
  },
  clickAddObject: async ({ page }, baseUse) => {
    const clickAddObject = async objectType => {
      await page.getByTestId(`Add ${objectType}`).click()
      await page.waitForLoadState()
    }
    await baseUse(objectType => clickAddObject(objectType))
  },
  clickAccordionPanel: async ({ page }, baseUse) => {
    const clickAccordionPanel = async label => {
      await page.getByRole("button", { name: label }).click({ force: true })
      await page.waitForLoadState()
    }
    await baseUse(label => clickAccordionPanel(label))
  },
  generateSubmissionAndObjects: [
    async ({ page, login }, baseUse) => {
      const generateSubmissionAndObjects = async stopToObjectType => {
        // List of object types in particular order
        // This list is used to choose into what point of object generation is stopped
        let objectTypesArray: string[] = [
          FEGAObjectTypes.study,
          FEGAObjectTypes.dac,
          FEGAObjectTypes.policy,
          FEGAObjectTypes.sample,
          FEGAObjectTypes.experiment,
          FEGAObjectTypes.run,
          FEGAObjectTypes.analysis,
          FEGAObjectTypes.dataset,
        ]

        // Modify object type list if stop point is defined
        if (stopToObjectType.length > 0) {
          objectTypesArray = objectTypesArray.slice(
            0,
            objectTypesArray.indexOf(stopToObjectType) + 1
          )
        }

        const userResponse = await page.request.get("/v1/users")

        if (userResponse.ok()) {
          const userResponseData = await userResponse.json()
          const selectedProject = userResponseData.projects[0]

          // Generate submission
          const submissionResponse = await page.request.post("v1/submissions", {
            data: {
              name: "Test generated submission",
              description: "Description for generated submission",
              projectId: selectedProject["project_id"],
              published: false,
              metadataObjects: [],
              drafts: [],
              workflow: "FEGA",
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

          generateObject(FEGAObjectTypes.study, TestStudyObject)?.then(() => {
            generateObject(FEGAObjectTypes.dac, TestDACObject)?.then(DACResponse => {
              generateObject(FEGAObjectTypes.policy, {
                ...TestPolicyObject,
                dacRef: { accessionId: DACResponse.accessionId },
              })?.then(() => {
                /* TODO: To be continued after the workflow is defined */
                //generateObject(FEGAObjectTypes.sample, TestSampleObject)?.then(sampleResponse => {
                //  generateObject(FEGAObjectTypes.experiment, {
                //    ...TestExperimentObject,
                //    studyRef: { accessionId: studyResponse.accessionId },
                //    design: {
                //      ...TestExperimentObject.design,
                //      sampleDescriptor: { accessionId: sampleResponse.accessionId },
                //    },
                //})?.then(experimentResponse => {
                //  generateObject(FEGAObjectTypes.run, {
                //    ...TestRunObject,
                //    experimentRef: [{ accessionId: experimentResponse.accessionId }],
                //})?.then(() => {
                //  generateObject(FEGAObjectTypes.analysis, TestAnalysisObject)?.then(() => {
                //    generateObject(FEGAObjectTypes.dataset, TestDatasetObject)?.then(() => {
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
      await baseUse(stopToObjectType => generateSubmissionAndObjects(stopToObjectType))
    },
    { timeout: 60000 },
  ],
  continueLatestForm: async ({ page }, baseUse) => {
    const continueLatestForm = async (objectType, status) => {
      await page
        .getByTestId(`${objectType}-objects-list`)
        .getByTestId(
          status === ObjectStatus.draft
            ? `draft-${objectType}-list-item`
            : `submitted-${objectType}-list-item`
        )
        .first()
        .click()
      await expect(page.getByTestId("form-ready")).toBeVisible()
    }
    await baseUse((objectType, status) => continueLatestForm(objectType, status))
  },
  checkWorkflowRadios: async ({ page }, baseUse) => {
    const checkWorkflowRadio = async checked => {
      await expect(page.getByRole("radiogroup")).toBeVisible()
      await expect(page.getByTestId("SD")).toBeDisabled()
      await expect(page.getByTestId("Bigpicture")).toBeDisabled()
      await expect(page.getByTestId("FEGA")).toBeDisabled()
      await expect(page.getByTestId(checked)).toBeChecked()
    }
    await baseUse(checked => checkWorkflowRadio(checked))
  },
  checkItemsPerPage: async ({ page }, baseUse) => {
    const checkItemsPerPage = async (perPage, numberOfItems) => {
      await page.locator("div[aria-haspopup='listbox']").getByText(/5/).first().click()
      await page.locator(`li[data-value='${perPage}']`).click()
      // Assert that there are correct number of submissions on the table
      await expect(page.getByText(`1-${numberOfItems} / ${numberOfItems} items`)).toBeVisible()
      await expect(page.locator("[role='rowgroup'] > [role='row']")).toHaveCount(numberOfItems)
    }
    await baseUse((perPage, numberOfItems) => checkItemsPerPage(perPage, numberOfItems))
  },
  mockGetSubmissions: async ({ page }, baseUse) => {
    const mockGetSubmissions = async (itemsPerPage, isPublished) => {
      let json = {}

      switch (itemsPerPage) {
        case 5:
          json = isPublished ? publishedResponse5 : dratfResponse5
          break
        case 10:
          json = isPublished ? publishedResponse10 : {}
          break
        case 30:
          json = isPublished ? {} : dratfResponse30
          break
        default:
          break
      }

      await page.route(
        `/v1/submissions?page=1&per_page=${itemsPerPage}&published=${isPublished}*`,
        async route => await route.fulfill({ json })
      )
    }
    await baseUse((itemsPerPage, isPublished) => mockGetSubmissions(itemsPerPage, isPublished))
  },
})

export default test
