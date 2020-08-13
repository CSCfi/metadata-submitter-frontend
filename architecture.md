## Internal structure

Reusable components are stored in `src/components` and views in `src/views`. View-components reflect page structure, such as `/`, `/newdraft`, `/login` etc. One should not define and export any components to be used in different views.

React Router is used to render different views in App-component. All components are wrapped with `Nav` which provider app menu and navigation.

### Form components

Form components are crucial part of the application. Forms for XML upload and folder creation are made with `Formik` and customized fields for material-UI.
Form for json schema based forms are created with custom json schema parser, which builds `react-hook-form` based forms from given json schema. Json schema-based forms are validated against json schema with `Ajv`. React-hook-form is used for performance reasons: it uses uncontrolled components so adding a lot of fields to array doesn't slow rendering of the application.

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
import { createNewDraftFolder } from "features/submissionFolderSlice"

// Create base folder (normally from form)
const folder = {
  name: "Test",
  description: "Test description for very best folder."
}

// Initialize dispatch with hook
const dispatch = useDispatch()

// Dispatch the action with folder
dispatch(createNewDraftFolder(folder))

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

Global styles are defined with `style.css` and Material UI theme, customized for CSC. Material UI theme is set in `index.js` file.

Styles are also used inside components, either with `withStyles` (modifies Material UI components) or `makeStyles` (creates css for component and its children). See [customizing components](https://material-ui.com/customization/components/) for more info.
