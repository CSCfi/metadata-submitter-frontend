// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

export {} // this file needs to be a module

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      setMockUser(eppnUser: string, familyName: string, givenName: string): Chainable<Element>
      login(): Chainable<Element>
      newSubmission(folderName?: string): Chainable<Element>
      clickFillForm(objectType: string): Chainable<Element>
      clickAccordionPanel(label: string): Chainable<Element>
      clickAddObject(objectType: string): Chainable<Element>
      editLatestSubmittedObject(objectType: string): Chainable<Element>
      continueLatestDraft(objectType: string): Chainable<Element>
      openDOIForm(): Chainable<Element>
      formActions(buttonName: string): Chainable<Element>
      saveDoiForm(): Chainable<Element>
      generateFolderAndObjects(stopToObjectType?: string): Chainable<Element>
      generateObject(objectType: string): Chainable<Element>
    }
  }
}

// File upload
import "cypress-file-upload"

// Object templates
import {
  TestStudyObject,
  TestDACObject,
  TestPolicyObject,
  TestSampleObject,
  TestExperimentObject,
  TestRunObject,
  TestAnalysisObject,
  TestDatasetObject,
} from "../fixtures/test-objects"

import { ObjectTypes, DisplayObjectTypes } from "constants/wizardObject"

// Reusable commands
const baseUrl = "http://localhost:" + Cypress.env("port") + "/"

Cypress.Commands.add("setMockUser", (subUser, familyName, givenName) => {
  const mockAuthUrl = "http://" + Cypress.env("mockAuthHost") + ":" + Cypress.env("mockAuthPort") + "/setmock"

  cy.request({
    method: "GET",
    url: mockAuthUrl,
    qs: { sub: subUser + "@test.fi", family: familyName, given: givenName },
  })
})

// Turn off all uncaught exception handling
Cypress.on("uncaught:exception", () => {
  return false
})

Cypress.Commands.add("login", () => {
  cy.visit(baseUrl)
  cy.intercept("/folders*").as("getFolders")
  cy.get('a[data-testid="login-button"]').should("be.visible")
  cy.get('a[data-testid="login-button"]').click()
  cy.wait("@getFolders")
})

Cypress.Commands.add("newSubmission", folderName => {
  cy.intercept("/folders*").as("newSubmission")
  cy.get("[data-testid='folderName']").type(folderName ? folderName : "Test name")
  cy.get("[data-testid='folderDescription']").type("Test description")
  cy.get("button[type=submit]")
    .contains("Save")
    .should("be.visible")
    .then($el => $el.click())

  cy.wait("@newSubmission", { timeout: 10000 })
})

Cypress.Commands.add("clickFillForm", objectType => {
  cy.get("[data-testid='wizard-objects']", { timeout: 10000 }).should("be.visible")
  cy.get("div[role=button]", { timeout: 10000 }).contains(objectType).click()
  cy.get("div[aria-expanded='true']")
    .siblings()
    .within(() =>
      cy
        .get("div[role=button]")
        .contains("Fill Form", { timeout: 10000 })
        .should("be.visible")
        .then($btn => $btn.click())
    )
  cy.get("form", { timeout: 30000 }).should("be.visible")
})

Cypress.Commands.add("clickAccordionPanel", label => {
  cy.get("[data-testid='wizard-stepper']", { timeout: 10000 }).should("be.visible")
  cy.get("div[role=button]", { timeout: 10000 }).contains(label).click()
})

Cypress.Commands.add("clickAddObject", objectType => {
  cy.get("[data-testid='wizard-stepper']", { timeout: 10000 }).should("be.visible")
  cy.get("button[role=button]", { timeout: 10000 }).contains(`Add ${objectType}`).click()
})

Cypress.Commands.add("continueLatestDraft", objectType => {
  cy.wait(0)
  cy.get(`[data-testid='${objectType}-objects-list']`).within(() => {
    cy.get(`[data-testid='draft-${objectType}-list-item']`).last().click()
  })
  cy.scrollTo("top")
  cy.contains("Update draft", { timeout: 10000 }).should("be.visible")
})

Cypress.Commands.add("editLatestSubmittedObject", objectType => {
  cy.wait(0)
  cy.get(`[data-testid='${objectType}-objects-list']`).within(() => {
    cy.get(`[data-testid='submitted-${objectType}-list-item']`).last().click()
  })
  cy.scrollTo("top")
  cy.contains(`Update ${DisplayObjectTypes[objectType]}`, { timeout: 10000 }).should("be.visible")
})

// Go to DOI form
Cypress.Commands.add("openDOIForm", () => {
  cy.clickAccordionPanel("publish")
  cy.get("button[role=button]", { timeout: 10000 }).contains("Publish").click()
  cy.get("button").contains("Add DOI information (optional)", { timeout: 10000 }).click()
  cy.get("div[role='dialog']").should("be.visible")
})

// Click Form's buttons to edit, clear or submit the form
Cypress.Commands.add("formActions", buttonName => {
  cy.scrollTo("top")
  cy.get("button").contains(buttonName, { timeout: 10000 }).should("be.visible")
  cy.get("button").contains(buttonName, { timeout: 10000 }).click({ force: true })
})

// Fill required fields to submit DOI form
Cypress.Commands.add("saveDoiForm", () => {
  cy.get("button").contains("Add DOI information (optional)").click()
  // Fill in required Creators field
  cy.get("[data-testid='creators']").parent().children("button").click()
  cy.get("[data-testid='creators.0.givenName']", { timeout: 10000 }).type("Test given name")
  cy.get("[data-testid='creators.0.familyName']", { timeout: 10000 }).type("Test given name")
  cy.get("[data-testid='creators.0.affiliation']", { timeout: 10000 }).parent().children("button").click()
  cy.intercept("/organizations*").as("searchOrganization")
  cy.get("[data-testid='creators.0.affiliation.0.name-inputField']").type("csc")
  cy.wait("@searchOrganization")
  cy.get(".MuiAutocomplete-option")
    .should("be.visible")
    .then($el => $el.first().click())
  cy.get("[data-testid='creators.0.affiliation.0.schemeUri']").should("have.value", "https://ror.org")
  // Fill in required Subjects field
  cy.get("[data-testid='subjects']").parent().children("button").click()
  cy.get("select[data-testid='subjects.0.subject']", { timeout: 10000 }).select("FOS: Mathematics")

  // Fill in required Keywords
  cy.get("input[data-testid='keywords']", { timeout: 10000 }).type("keyword-1,")

  cy.get("button[type='submit']").click()
  cy.contains(".MuiAlert-message", "DOI form has been saved successfully")
})

// Method for hanlding request path when generating objects
const addObjectPath = (objectType: string, folderId: string) => `${baseUrl}objects/${objectType}?folder=${folderId}`

// Create objects from predefined templates
// Possible to stop into specific object type. Add object type as argument
Cypress.Commands.add("generateFolderAndObjects", (stopToObjectType = "") => {
  cy.intercept("/folders*").as("fetchFolders")

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

  cy.request("GET", "/users/current").then(userResponse => {
    if (userResponse.statusText === "OK") {
      // Select a project
      const selectedProject = userResponse.body.projects[0]

      // Generate folder
      cy.request("POST", baseUrl + "folders", {
        name: "Test generated folder",
        description: "Description for generated folder",
        projectId: selectedProject.projectId,
        published: false,
        metadataObjects: [],
        drafts: [],
      }).then(folderResponse => {
        // Share context from generated folder
        cy.wrap(folderResponse.body.folderId).as("generatedFolderId")

        // Reloading the view doesn't work in GitHub CI and results in failing test since generated folder isn't rendered
        // Changing routes seems to work in this case
        cy.login()
        cy.get("[data-field='name']", { timeout: 10000 }).eq(1).should("have.text", "Test generated folder")
        cy.get("[data-testid='edit-draft-submission']").scrollIntoView().should("be.visible")

        // Generate objects from templates
        // Requests need to be chained so Cypress will wait before doing next task
        // Doing async request as Promises doesn't work with GitHub CI
        const generateObject = (objectType, template) => {
          if (objectTypesArray.includes(objectType)) {
            return cy.request("POST", addObjectPath(objectType, folderResponse.body.folderId), template)
          }
        }

        generateObject(ObjectTypes.study, TestStudyObject)?.then(studyResponse => {
          generateObject(ObjectTypes.dac, TestDACObject)?.then(DACResponse => {
            generateObject(ObjectTypes.policy, {
              ...TestPolicyObject,
              dacRef: { accessionId: DACResponse.body.accessionId },
            })?.then(() => {
              generateObject(ObjectTypes.sample, TestSampleObject)?.then(sampleResponse => {
                generateObject(ObjectTypes.experiment, {
                  ...TestExperimentObject,
                  studyRef: { accessionId: studyResponse.body.accessionId },
                  design: {
                    ...TestExperimentObject.design,
                    sampleDescriptor: { accessionId: sampleResponse.body.accessionId },
                  },
                })?.then(experimentResponse => {
                  generateObject(ObjectTypes.run, {
                    ...TestRunObject,
                    experimentRef: [{ accessionId: experimentResponse.body.accessionId }],
                  })?.then(() => {
                    generateObject(ObjectTypes.analysis, TestAnalysisObject)?.then(() => {
                      generateObject(ObjectTypes.dataset, TestDatasetObject)?.then(() => {
                        cy.log("All objects generated")
                      })
                    })
                  })
                })
              })
            })
          })
        })
      })
    } else {
      cy.log("Error in fetching user")
    }
  })
})

// Generate single object for given object type
// Note: This doesn't automatically refresh view
// Manually reload route or do a folder action in UI (eg. add new object) to render generated object
Cypress.Commands.add("generateObject", (objectType: string) => {
  let template: Record<string, unknown>

  switch (objectType) {
    case ObjectTypes.study: {
      template = TestStudyObject
      break
    }
    case ObjectTypes.dac: {
      template = TestDACObject
      break
    }
    case ObjectTypes.policy: {
      template = TestPolicyObject
      break
    }
    case ObjectTypes.sample: {
      template = TestSampleObject
      break
    }
    case ObjectTypes.experiment: {
      template = TestExperimentObject
      break
    }
    case ObjectTypes.run: {
      template = TestRunObject
      break
    }
    case ObjectTypes.analysis: {
      template = TestAnalysisObject
      break
    }
    case ObjectTypes.dataset: {
      template = TestDatasetObject
      break
    }
  }

  cy.get("@generatedFolderId").then(folderId => {
    cy.request("POST", addObjectPath(objectType, folderId.toString()), template).then(response => {
      if (response.isOkStatusCode) {
        cy.log(`${DisplayObjectTypes[objectType]} object generated`)
      } else {
        cy.log(`Error generating ${DisplayObjectTypes[objectType]} object`)
      }
    })
  })
})
