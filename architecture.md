## Internal structure

Reusable components are stored in `src/components` and views in `src/views`. View-components reflect page structure, such as `/`, `/submission`, `/login` etc. One should not define and export views to be rendered inside other views, but rather always build views using components.

React Router is used to render different views in App-component. All components are wrapped with `Nav` which provider app menu and navigation.

### Form components

Form components are crucial part of the application:

- All submissions and folder creation are made with `react-hook-form`. Latter uses form as a reference so submission can be triggered outside the form.
- Form for json schema based forms are created with custom json schema parser, which builds `react-hook-form` based forms from given json schema. Json schema-based forms are validated against json schema with `Ajv`. React-hook-form is used for performance reasons: it uses uncontrolled components so adding a lot of fields to array doesn't slow rendering of the application.

### Constants

Folder `src/constants` holds all the constants used in the application. The constants are uniquely defined and separated into different files according to its related context. For example, the file `constants/wizardObject.js` contains unique constants regarding to `wizardObject` such as: `ObjectTypes, ObjectStatus, etc.`

The purposes of using these `constants` are:

- to avoid hard coding the values of variables repeatedly
- to keep the consistency when defining the values of variables
- to reuse those predefined values across the application

Example of defining and using a constant:

- First, define the constant object `ObjectSubmissionTypes` in `constants/wizardObject.js`

```
export const ObjectSubmissionTypes = {
  form: "Form",
  xml: "XML",
  existing: "Existing",
}
```

- Then, use this constant in `WizardComponents/WizardObjectIndex`:

```
import { ObjectSubmissionTypes } from "constants/wizardObject"

  switch (currentSubmissionType) {
    case ObjectSubmissionTypes.form: {
      target = "form"
      break
    }
    case ObjectSubmissionTypes.xml: {
      target = "XML upload"
      break
    }
    case ObjectSubmissionTypes.existing: {
      target = "drafts"
      break
    }
  }
```

### Commonly used data types

All commonly used data types of variables are defined in the file `index.js` in folder `src/types`. The purposes are:

- to avoid hard coding the same data types frequently in different files
- to keep track and consistency of the data types across different files

For example:

- declare and export these data types in `src/types/index.js`

```
export type ObjectInsideFolder = {
  accessionId: string,
  schema: string,
}

export type ObjectTags = {
  submissionType: string,
  fileName?: string,
}

export type ObjectInsideFolderWithTags = ObjectInsideFolder & { tags: ObjectTags }
```

- import and reuse the data types in different files:

  - Reuse type `ObjectInsideFolderWithTags` consequently in both `WizardComponents/WizardSavedObjectsList.js` and `WizardSteps/WizardShowSummaryStep.js`:

  ```
  import type { ObjectInsideFolderWithTags } from "types"

  type WizardSavedObjectsListProps = { submissions: Array<ObjectInsideFolderWithTags> }
  ```

  ```
  import type { ObjectInsideFolderWithTags } from "types"

  type GroupedBySchema = { [K in Schema]: Array<ObjectInsideFolderWithTags> }
  ```

## Redux store

Redux is handled with [Redux Toolkit](https://redux-toolkit.js.org/) and app is using following redux toolkit features:

- Store, global app state, configured in `store.js`
- Root reducer, combining all reducers to one, configured in `rootReducer.js`
- Slices with `createSlice`-api, defining all reducer functions, state values and actions without extra boilerplate.
  - Slices are configured for different features in `features/` -folder.
  - Async reducer functions are also configured inside slices.

Examples for storing and dispatching with async folder function:

```
import { useSelector, useDispatch } from "react-redux"
import { createSubmissionFolder } from "features/submissionFolderSlice"

// Create base folder (normally from form)
const folder = {
  name: "Test",
  description: "Test description for very best folder."
}

// Initialize dispatch with hook
const dispatch = useDispatch()

// Dispatch the action with folder
dispatch(createSubmissionFolder(projectId: string, folderDetails: FolderDataFromForm, drafts?: ObjectInsideFolderWithTags[] ))

// Folder is now submitted to backend and added to redux store

// Take folder from redux state, destructure and log values
const folder = useSelector(state => state.submissionFolder)
const { id, name, description, metadataObjects } = folder
console.log(id) // Should be id generated in backend
console.log(name) // Should be name we set earlier
console.log(description) // Should be description we set earlier
console.log(metadataObjects) // Should be an empty array
```

## API

API/backend modules are defined in `services/` -folder with help from `apisauce` library. Modules should be only responsible for API-related things, so one shouldn't modify data inside them.

Example:

```
const objectType = "study"
const response = await schemaAPIService.getSchemaByObjectType(objectType)
if (!response.ok) console.log("Error when fetching from api)
console.log(response.data)
```

## Styles

App uses [Material UI](https://material-ui.com/) components.

Global styles are defined with `style.css` and Material UI theme, customized for CSC. Material UI theme is set in `theme.ts` file. Since we are using Typescript, we also need to make a declaration in `theme.d.ts` in order to use the theme. See [example](https://mui.com/customization/theming/#custom-variables).

Material UI has been updated to [version 5](https://mui.com/guides/migration-v4/). `withStyles` or `makeStyles` may be deprecated sooner or later. To style the components, we can use [sx property](https://mui.com/system/the-sx-prop/#main-content) for defining custom style that has access to the theme, and [styled() utility](https://mui.com/system/styled/#how-can-i-use-the-sx-syntax-with-the-styled-utility) for creating styled components.

It is also worth to know about their [Performances](https://mui.com/system/basics/#performance-tradeoff) when using the two. See [customizing components](https://material-ui.com/customization/components/) for more info.
