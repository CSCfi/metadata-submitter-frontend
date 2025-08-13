# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- (users) Removed Options menu with Clear button (#1036)
- (users) Removed clearing upon save functionality (#1036)
- (users) Removed draft functionality (#1035)
- Replaced hardcoded strings with translatable strings (#1064)
- (users) Disable XML upload related functionality and tests for MVP (#1061)
- (users) Hide prefilled affiliationIdentifier field in DOI form (#1005)
- Replaced mui/lab with mui/x-date-pickers package. Updated date selection component in DOI form (#1021)
- Adapt to backend changes to use JWT token in secure cookie (#1032)
- Replace endpoint /users/userID with /users to GET the user_id, user_name, and projects (#1032)
- (users) Placed the accordion steps "Identifier", "Summary" and "Publish" under the step 5 (https://gitlab.ci.csc.fi/sds-dev/sd-submit/metadata-submitter-frontend/-/issues/979)
- Removed name of object from accordion buttons "view" and "add"
- Moved Summary step along with datacite step to a schema substeps (https://gitlab.ci.csc.fi/sds-dev/sd-submit/metadata-submitter-frontend/-/issues/979)
- Removed the text "Identifier and Publish" from translation files (https://gitlab.ci.csc.fi/sds-dev/sd-submit/metadata-submitter-frontend/-/issues/979)
- Migrate React related packages and codes to version 19 (#1026)
- Updated PUT request to PATCH request for /submissions endpoints as a reflection of backend's changes
- Changed all Big picture related words to "Bigpicture"
- (users) Replaced "Read more/expand" with "Show more" in tooltips
- Adjusted the test WizardFillObjectDetailsForm.test.tsx
- Modified ARCHITECTURE.md to STRUCTURE.md
- Updated instructions in the README, CONTRIBUTING, LICENSE files
- Modify `pnpm test` script to run the unit tests sequentially
- (users) moved asterisk to the left column
- pagination of DataTable.tsx
- (admins) dependency packet versions update
- dependency packet versions update
- updated react router to version 7
- (users) Removed possibility to "Mark as ready" multiple studies
- removed `openedDoiFormSlice`from Redux root reducer.
- in `WizardJSONSchemaParser.tsx` replaced the Redux state variable `openedDoiForm` with a variable `isDOIForm`, that uses `objectType` from Redux state.
- (users) change text inside save success toast
- (users) Added pagination to the tables of all summary steps
- (users) Fixed narrow page summary table pagination
- Own condition for datacite to enable only "Clear form" option for Datacite
- Moved saving of DOI from WizardDoiForm.tsx component to WizardFillObjectDetailsForm component
- Catching error 400 when validating XML file
- Update UI design for Wizard Alert ( #954)

### Fixed

- (users) Fixed licenses not being reset in DAC and policies form (#1073)
- (users) Fixed required field validation in DOI form not working (#1055)
- Fix a number of failing e2e tests
- Fix error page 401 loop when entering protected routes (#1059)
- (users) Fixed keyword field value missing from DOI form (#1042)
- (users) Fixed empty summary view due to undefined items (#1041)
- (users) The link to identifier form (https://gitlab.ci.csc.fi/sds-dev/sd-submit/metadata-submitter-frontend/-/issues/979)
- Fixed formatting scripts and formatted files (#1033)
- (users) Pagination menu overlap and style fixes (#1031)
- Modified the way we check for missing fields when submitting a form in relation to changes in react-hook-form v7.55.0
- Fix for unit test failure in FormAutocompleteField
- (users) Fix Wizard Steps to direct to correct steps and objects
- a condition
- (users) Sorting with pagination to happen through all the rows, not only inside a page.
- (users) Data table in Home view not showing all the columns
- Schemas that allow multiple objects can have multiple drafts and ready objects
- Schemas that allow only one object can only have one draft or ready object at a time.
- (users) Directing to the correct step in WizardSteps for different workflows.
- get `objectTypesArray` even for error pages.
- XML File should be validated and uploaded properly

### Added

- (users) added Identifier step to summary view (#1052)
- (users) Added date validation for DOI form (#1058)
- (users) Added a warning alert when not DOI form has validation errors (#1045)
- (users) The accordion to contain "5. Identifier and Publish" step instead of "Datacite" (https://gitlab.ci.csc.fi/sds-dev/sd-submit/metadata-submitter-frontend/-/issues/979)
- (users) Icons for support and language buttons
- a constant for datacite
- (users) New form for selecting and saving DAC and Policies from REMS/SD Apply to submission
- add summary step test
- Condition to disable "Mark as ready" when there already exist a study.
- A new button group for DOI
- Save the linked folder for a submission to backend service
- File table and table's breadcrumbs in Datafolder step
- Datafolder view and Folder table view inside Datafolder step
- summary table

### Removed

- (users) removed subjectScheme from frontend (#1070)
- (users) Remove schemeUri, affiliationIdentifierScheme, fullName fields from prefilled DOI form text fields (#1008)
- Removed Cypress tests, relevant configuration and Github workflow (#1039)
- Removed template-related functionality (#1034)
- (users) "Sensitive Data Services" phrase from navigation bar.
- (users) removed unnecessary toast
- tsc from package build script
- deprecated react-router-dom and @types/react-router-dom
- files `WizardDOIForm.tsx` and `openedDoiFormSlice.tsx`
- (users) all fields in Dataset form except Title and Description
- (users) At Datacite step "Delete form" and "Upload XML file" from the "Options ..."

## [2024.7.0] - 2024-07-25

### Fixed

- Coveralls' failure in Github
- Fix creating a submission without workflow type leading to page 400 by making it required #955
- Disable workflow type changes after initial selection #923

### Changed

- Redesign file upload error ( #959)
- message toast design for info and error alerts in StatusMessageHandler ( #957)
- Centralize CSCtheme and translation configuration for Vitest test files
- Refactor error message layout to adhere CSC Design #944
- Update status message toast design #943
- Reword button to `Save progress and exit` #940
- Refactor error message to adhere SD style with i18n support #932
- Changed: The location of "options ..." selection
- Modify Patch submission with only "name" and "description" #816
- Modified Form layout, Tooltip and Upload XML according to new UI design #811
- Change the way to add DOI form to submission with new endpoint "/doi"
- Change url of ROR from http to https #813
- Refactor **folder** -> **submission** #807
- Renamed "NewDraft" to "Submission" to all existing components and routes and related tests.
- Refactor API urls to have "/v1" , to adapt backend change https://github.com/CSCfi/metadata-submitter/pull/476 fixes , #826
- Update major and non-major depencies
- New way for having Redux store and mock data to be used in Jest tests without using an external library #922
- Update json-schema-ref-parser to latest stable version 11.5.4
- Use Vite as the new bundle tool to replace CRA and Webpack
- Use Vitest for unit tests instead of Jest
- github action updates as well as dependabot watched branch
- Migrate from npm to pnpm
- Migrate e2e tests from Cypress to Playwright, modified relevant fixtures and tests #936
- Refactor Home view with new Tab, Search and SubmissionTable components #939

### Added

- Reintroduced summary page with new bar and publish(set release date) button at top with localization.
- Add e2e test for Home view and SubmissionTable #948
- Added cancel function to `Save progress and exit` dialog #952
- Adding Delete option for deleting form #812
- New summary page layout #791
- New accordion stepper for submission #538
- Update datacite's affiliation fields in cypress tests #770
- Added changes for diffrent types of workflow when creating a submission #921
- Added UI text to translation files for English and Finnish
- Add secondary navigation bar #946
- Add updated footer #817

### Fixed

- Fix for Typescript not working correctly in local machine and Gitlab pipeline #950

### Removed

- Removed WizardFooter #952
- Removed unused library eslint-config-prettier, follow up of #974
- Removed `redux-mock-store` library which was used to mock Redux store and data for Jest tests #922
- Remove the use CRA boilderplate and webpack from the codebase.

## [0.13.0] - 2021-04-7

### Added

- Field Keywords in DOI form #715
- New UI for wizard stepper #763
- Option to filter by submission's name in Home page #685
- New navigation bar and new home page #669

  #### Added

  - Moved Log out button to be under User profile in navigation bar
  - Rendered draft submissions and published submissions as tables with pagination in Home page
  - Added functionality to sort the dateCreated
  - Added breakpoints for fontSizes and responsive pagination
  - Removed components and test files for deprecated features
  - Update unit tests and integration tests for current UI state

- Drag & drop file upload #653
- Disallow use of "any" type #624
- Date picker #559
- New login page #573
- Wizard stepper as accordion #538
- Autocomplete name field in DOI form #529
- Enable draft template update #528
- Auto-add subject scheme to all subjects #522
- Enable deletion of draft templates #499
- Support for `ajv-i18n` #496
- Display helper text on invalid form array fields #495
- Centralized status message handling in app root #493

  #### Added

  - Moved component to components root folder
  - Render messages only in one place with use of reducer
  - Updated tests

- Handle uploaded XML filename as display title #457
- DOI form #455

  #### Added

  - Autocomplete field optimization

  #### Fixed

  - Autocomplete field invalid characters
  - FormArray component when removing certain field

- Test form render with custom schema (Jest) #453
- Preview object details #452
- Require title on all forms #449

### Changed

- Updated projectId in GET and POST requests for folders and templates #696

  ### Added

  - ProjectId is a mandatory query parameter in GET requests for folders and templates
  - ProjectId is a mandatory propperty in POST requests for folders and templates
  - Templates has a separate API endpoint and is no longer a propety under User
  - Template's index is a mandatory property in PATCH request for a template

- Folder's Id is needed when creating a new object or draft object #672

  ### Added

  - Added folderId as query parameter for object's and draft object's Post request
  - Patching folder is no longer needed when patching object or draft object

- Updated Node.js version in GitHub workflows and Dockerfile #655
- Disallow use of any-type #624

  #### Added

  - Changelog

- Update Cypress tests to match JSON schema changes #627
- Refactor Cypress tests by following best practices #623

  #### Changed

  - Documentation for MUI

- Use React Hooks by ESLint hooks rule #621
- Flow to TypeScript conversion #560
- Test DAC form title and sychronize with new backend build #544
- Migrate to MUI v5 #543
- Navigate wizard with folder id as URL parameter #533
- Dependency updates

### Fixed

- Update text field value with `setValue` method #666
- Cast integer fields as numbers #661
- Remove form array items in saved / submitted objects #659
- Disallow object update with invalid form #656
- Handle required form array fields #484
- Prevent user deleting object in published folder #486
- Display error when replacing XML file with file with same name #483
- Disallow draft delete if form is not valid #458
- Update object display titles when object gets updated #456
- Display correct confirmation text when publishing folder #447

## [0.11.0] - 2021-08-31

### Added

- Use official coveralls github actions for reporting #430
- Retry Cypress tests to give more consistent results #426
- Render draft objects on right sidebar in object add step #425
- Edit & publish draft folders #421

  #### Added

  - Edit button for draft folders view
  - Disable publish for draft folder
  - Display tooltip with icon if no submitted objects
  - Enable publish if submitted objects
  - Handle folder action buttons according to draft folder logic
  - Redux state reset for object type and submission folder on submit

- Form section tooltips with icons #419

### Changed

- Dependency updates
- Improved pagination component #424

### Fixed

- Submitting updated form with undefined object tags #435

## [0.10.0] - 2021-08-12

### Added

- Get options from ROR API and use data for organizations in autocomplete field #416
- Reusable pagination component for draft & published submissions #400
- Display field descriptions as tooltips. Tooltips are triggered with icons #356
- Enable linking of accessionIds between object types #330
- List user draft templates in home route #257

  #### Added

  - Fetch all schema types in home
  - Draft template E2E tests

  #### Fixed

  - Navigation for folder creation

- Enable user to save drafts when publishing folder #234
  #### Added
  - Option to view draft
  - Cancel button to publish dialog
  - E2E tests for draft saving
  #### Fixed
  - E2E test for 401 error

### Changed

- Dependency updates #401, #402, #403,
- E2E tests GitHub workflow structure update #375
- Update packages and package-lock.json #311
- React Hook Form V7 migration #281
- Dependabot to update monthly #268
- Updated Analysis test #246

  #### Changed

  - Form field default value handling
  - AJV format for date

### Fixed

- Fix for Sample object when overwriting form #417
- Error page for 400-error #386
- Parse DAC form `telephonenumber` as string before submitting form #352
- Hightlight DAC form `Main contact` since it's required field #333
- Populate all fields on editing saved / submitted form #323
- Get correct object name in `FormArray` method #322

  #### Added

  - E2E test for Experiment form

- Correct formatting of sha-256 in E2E test #320
- Redux state current object reset when submitting object #319
- Highlight all required form fields #296
- API call orded when deleting folders #285
- Fetch object types in application start #283
- New form & clear form problems with emptying form fields #258
- Handle "DAC" object type as acronym #233

## [0.9.2] - 2021-04-08

### Added

- Test error pages #223
- Tests for validation on field blur #222
- Wizard routing with URL query parameters instead of Redux state #204

### Fixed

- AJV V8 migration issue #219
- Enable edit of attributes and and links for saved object #205

## [0.9.1] - 2021-03-24

### Changed

- Dependency updates

### Fixed

- Dependabot base branch #202

## [0.9.0] - 2021-03-22

### Added

- Custom hook for draft saving #185
- Design improvements #184

  #### Changed

  - Create New Folder > Create submission
  - Main grid spacing
  - Consistent card and grid object headers
  - Subtitle colors
  - Checkbox positions
  - Nested form section width control
  - Highlight required form fields
  - Global theme enhancements
  - Saved and draft object badges
  - List draft and published folders via router
  - Navigation link targets for "Open submissions" and "Submissions"
  - Removed icons before object type labels in object index
  - Display submitted object count with icon and tooltip
  - Display draft count next to submission label in object index
  - Wrapped Reach Testing Library tests with theme provider
  - Submission action button background color

- Support for Links rendering on objects with `oneOf` key #182
- Constant variables for hard coded values #168

  #### Added

  - Folder and files for constants
  - Enums for predefined values

  #### Fixed

  - Display "Dataset" object in summary

### Changed

- Updated documentation for contanst #180
- Updated flow-bin #171

  #### Changed

  - Strict return types

- Dependency updates #166

### Fixed

- E2E test for filling required Analysis title #183
- General bugfixes #179

  #### Changed

  - Don't require `husky` in production build
  - Fix CodeQL workflow
  - Cypress update
  - Prettier should ignore build directory
  - Cypress & prettier eslint configuration
  - NPM version to 7.6.0
  - Moved ESLint to dev dependency
  - Updated `react-scripts` to 4.0.3
  - Test production build with Cypress in GitHub actions

- Form re-renders #178

## [0.8.0] - 2021-02-11

### Added

- Test XML upload snackbar notification #163
- Enable submitted form edit & XML replace #161

  #### Added

  - Display submitted object title in saved objects list
  - Render buttons in group for objects in saved objects list
  - Conditional submit button type on forms based on draft status
  - Success messages by user action
  - Dialog content and functionality for edited form with submitted status

- Handle objects with tags #153

  #### Added

  - Grouping objects by object type

- Added "New form" button to form actions #149
- Accessible skip links for object adding #148
- Improved draft & published submissions listing on home route #136

  #### Added

  - Enable listing of all submissions
  - List all objects inside folder
  - Enable deletion of objects

### Changed

- Skip link focus on XML upload form #154

### Fixed

- Saving multiple drafts when navigating stepper #156
- Reduced API calls when fetching folders #152
- Clear form button problem when editing draft #146
- Prevent empty folder publish #140
- Consistent network name in docker-compose #137

## [0.7.0] - 2021-01-19

### Added

- List for saved drafts in "Add objects" step #136

  #### Added

  - Edit & delete functionality
  - Draft overwriting
  - Folder name & description patch

  #### Changed

  - Schema storage from local to session storage

- Analysis form & summary E2E tests #125

#### Fixed

- Folder details error handling #132
- General bugfixes & improvements #123, #124

## [0.6.0] - 2021-01-06

### Added

- Notify draft save status #121
- Response error handling with corresponding pages and redirects (401, 403, 404, 500) #114, #119
- Render user information #118
- Feature for draft auto-save #112
- E2E testing with Cypress #108, #109, #111

  #### Added

  - CodeQL workflow to GitHub Actions

### Changed

- Render all notifications in snackbar #106

## [0.5.0] - 2020-11-23

### Added

- XML upload accessibility for keyboard users #99
- Added error checks for folder related operations #97
- List submitted objects in "Add objects" step #92
- Folder details (name & description) update functionality #89

### Changed

- XML upload form from Formik to React Hook Form #87

  #### Added

  - React Testing Library tests

- Improved folder actions in wizard footer #86

### Removed

- `jest-localstorage-mock` #90

### Fixed

- Incorrect draft -alert rendering #95

## [0.4.0] - 2020-10-20

### Added

- Centralized status message handler #83
- Alert dialog component #81

### Changed

- Improved current naming conventions #82
- Login flow with new routes for Home & Login #76, #79, #80

## [0.3.0] - 2020-08-14

### Added

- Redesigned wizard and layout #32, #51, #64

  #### Added

  - Wizard stepper
  - Handle store state with Redux
  - Form for folder creation
  - Persistent footer
  - Backend folder support
  - Support for adding objects to folders
  - Summary for metadata objects
  - Object adding layout
  - Clear form functionality
  - Unsaved draft alert

- Login page #63
- Support for caching JSON schema #62
- Support for OneOf form fields #57
- List submissions in home route #49
- Navigation bar #48
- GitHub Actions for code style, format, type checks and tests #23, #24, #25, #27
- Improvements to XML upload (file handling, error messages, notifications) #19

### Changed

- Migrate from Formik to React Hook Form (JSON schema based forms) #52
- Prettier column width #50

### Fixed

- Various form problems #60
- Development and Docker related proxies #15

## [0.1.0] - 2020-06-26

### Added

- React SPA initialization with URL routing
- XML upload form for metadata object types with validation and notifications about upload status

[unreleased]: https://gitlab.ci.csc.fi/sds-dev/sd-submit/metadata-submitter-frontend/compare/2024.7.0...HEAD
[2024.7.0]: https://github.com/CSCfi/metadata-submitter-frontend/compare/v0.13.0...2024.7.0
[0.13.0]: https://github.com/CSCfi/metadata-submitter-frontend/compare/v0.11.0...v0.13.0
[0.11.0]: https://github.com/CSCfi/metadata-submitter-frontend/compare/v0.10.0...v0.11.0
[0.10.0]: https://github.com/CSCfi/metadata-submitter-frontend/compare/v0.9.2...v0.10.0
[0.9.2]: https://github.com/CSCfi/metadata-submitter-frontend/compare/v0.9.1...v0.9.2
[0.9.1]: https://github.com/CSCfi/metadata-submitter-frontend/compare/v0.9.0...v0.9.1
[0.9.0]: https://github.com/CSCfi/metadata-submitter-frontend/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/CSCfi/metadata-submitter-frontend/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/CSCfi/metadata-submitter-frontend/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/CSCfi/metadata-submitter-frontend/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/CSCfi/metadata-submitter-frontend/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/CSCfi/metadata-submitter-frontend/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/CSCfi/metadata-submitter-frontend/compare/v0.1.0...v0.3.0
[0.1.0]: https://github.com/CSCfi/metadata-submitter-frontend/releases/tag/v0.1.0
