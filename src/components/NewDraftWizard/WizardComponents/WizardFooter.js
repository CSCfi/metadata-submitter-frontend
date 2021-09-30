//@flow
import React, { useState } from "react"

import Button from "@material-ui/core/Button"
import Link from "@material-ui/core/Link"
import { makeStyles } from "@material-ui/core/styles"
import { omit } from "lodash"
import { useDispatch, useSelector } from "react-redux"
import { useHistory, Link as RouterLink } from "react-router-dom"

import WizardAlert from "./WizardAlert"

import { OmitObjectValues } from "constants/wizardObject"
import { WizardStatus } from "constants/wizardStatus"
import { resetObjectType } from "features/wizardObjectTypeSlice"
import { updateStatus } from "features/wizardStatusMessageSlice"
import { publishFolderContent, deleteFolderAndContent, resetFolder } from "features/wizardSubmissionFolderSlice"
import draftAPIService from "services/draftAPI"
import templateAPIService from "services/templateAPI"
import type { ObjectInsideFolderWithTags } from "types"
import { useQuery, getOrigObjectType } from "utils"

const useStyles = makeStyles(theme => ({
  footerRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    flexShrink: 0,
    borderTop: "solid 1px #ccc",
    backgroundColor: theme.palette.background.default,
    position: "fixed",
    zIndex: 1,
    left: 0,
    bottom: 0,
    padding: "10px",
    height: "60px",
    width: "100%",
  },
  footerButton: {
    margin: theme.spacing(0, 2),
  },
  phantom: {
    display: "block",
    padding: "20px",
    height: "60px",
    width: "100%",
  },
}))

/**
 * Define wizard footer with changing button actions.
 */
const WizardFooter = (): React$Element<any> => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const folder = useSelector(state => state.submissionFolder)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [alertType, setAlertType] = useState("")

  let history = useHistory()

  const queryParams = useQuery()
  const step = Number(queryParams.get("step"))
  const wizardStep = Number(step.toString().slice(-1))

  const resetDispatch = () => {
    history.push("/home")
    dispatch(resetObjectType())
    dispatch(resetFolder())
  }

  const handleAlert = async (alertWizard: boolean, formData?: Array<ObjectInsideFolderWithTags>) => {
    if (alertWizard && alertType === "cancel") {
      dispatch(deleteFolderAndContent(folder))
        .then(() => resetDispatch())
        .catch(error => {
          dispatch(
            updateStatus({
              successStatus: WizardStatus.error,
              response: error,
              errorPrefix: "",
            })
          )
        })
    } else if (alertWizard && alertType === "save") {
      resetDispatch()
    } else if (alertWizard && alertType === "publish") {
      if (formData && formData?.length > 0) {
        // Filter unique draft-schemas existing in formData
        const draftSchemas = formData.map(item => item.schema).filter((val, ind, arr) => arr.indexOf(val) === ind)

        // Group the data according to their schemas aka objectTypes
        const groupedData = draftSchemas.map(draftSchema => {
          const schema = getOrigObjectType(draftSchema)
          return {
            [schema]: formData.filter(el => el.schema === draftSchema),
          }
        })

        // Fetch drafts' values and add to draft templates based on their objectTypes
        for (let i = 0; i < groupedData.length; i += 1) {
          const objectType = Object.keys(groupedData[i])[0]
          const draftsByObjectType = groupedData[i][objectType]

          const draftsArr = []
          for (let j = 0; j < draftsByObjectType.length; j += 1) {
            // Fetch drafts' values
            const draftResponse = await draftAPIService.getObjectByAccessionId(
              objectType,
              draftsByObjectType[j].accessionId
            )
            if (draftResponse.ok) {
              // Remove unnecessary values such as "date"
              // Add drafts' values of the same objectType to an array
              draftsArr.push(omit(draftResponse.data, OmitObjectValues))
            } else {
              dispatch(
                updateStatus({
                  successStatus: WizardStatus.error,
                  response: draftResponse,
                  errorPrefix: "Error when getting the drafts' details",
                })
              )
            }
          }

          if (draftsArr.length > 0) {
            // POST selected drafts to save as templates based on the same objectType
            const templateResponse = await templateAPIService.createTemplatesFromJSON(objectType, draftsArr)
            if (!templateResponse.ok)
              dispatch(
                updateStatus({
                  successStatus: WizardStatus.error,
                  response: templateResponse,
                  errorPrefix: "Cannot save selected draft(s) as template(s)",
                })
              )
          }
        }
      }
      // Publish the folder
      dispatch(publishFolderContent(folder))
        .then(() => resetDispatch())
        .catch(error => {
          dispatch(
            updateStatus({
              successStatus: WizardStatus.error,
              response: error,
              errorPrefix: `Couldn't publish folder with id ${folder.folderId}`,
            })
          )
        })
    } else {
      setDialogOpen(false)
    }
    setDialogOpen(false)
  }

  const disablePublishButton = () => {
    if (wizardStep !== 2) {
      return true
    }
    if (folder && wizardStep === 2) {
      const { metadataObjects } = folder
      if (metadataObjects.length === 0) {
        return true
      }
    }
  }

  return (
    <div>
      <div className={classes.phantom} />
      <div className={classes.footerRow}>
        <div>
          {wizardStep < 0 && (
            <Link component={RouterLink} aria-label="Cancel at the pre-step and move to frontpage" to="/home">
              <Button variant="contained" color="secondary" className={classes.footerButton}>
                Cancel
              </Button>
            </Link>
          )}
          {wizardStep >= 0 && (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                setDialogOpen(true)
                setAlertType("cancel")
              }}
              className={classes.footerButton}
            >
              Cancel
            </Button>
          )}
        </div>
        {wizardStep >= 0 && (
          <div>
            <Button
              variant="contained"
              color="primary"
              disabled={wizardStep < 1}
              className={classes.footerButton}
              onClick={() => {
                setDialogOpen(true)
                setAlertType("save")
              }}
            >
              Save and Exit
            </Button>
            <Button
              variant="contained"
              color="primary"
              disabled={disablePublishButton()}
              onClick={() => {
                setDialogOpen(true)
                setAlertType("publish")
              }}
            >
              Publish
            </Button>
          </div>
        )}
      </div>
      {dialogOpen && <WizardAlert onAlert={handleAlert} parentLocation="footer" alertType={alertType}></WizardAlert>}
    </div>
  )
}

export default WizardFooter
