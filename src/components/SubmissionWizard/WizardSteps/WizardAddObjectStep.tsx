import React from "react"

import CircularProgress from "@mui/material/CircularProgress"
import Grid from "@mui/material/Grid"
import { makeStyles } from "@mui/styles"

import WizardAddObjectCard from "../WizardComponents/WizardAddObjectCard"
import WizardSavedObjectsList from "../WizardComponents/WizardSavedObjectsList"

import { useAppSelector } from "hooks"

const useStyles = makeStyles(() => ({
  gridContainer: {
    width: "100%",
    "& > :first-child": {
      paddingLeft: 0,
    },
    "& > :last-child": {
      paddingRight: 0,
    },
    "& .MuiGrid-item": {
      paddingTop: 0,
    },
  },
  formBox: {
    display: "flex",
    justifyContent: "center",
  },
  objectList: {
    width: "40%",
  },
  objectInfo: {
    margin: 2,
  },
}))

/**
 * Show selection for object and submission types and correct form based on users choice.
 */
const WizardAddObjectStep: React.FC = () => {
  const classes = useStyles()
  const objectType = useAppSelector(state => state.objectType)
  const submission = useAppSelector(state => state.submission)
  const submissions = submission?.metadataObjects?.filter((obj: { schema: string }) => obj.schema === objectType)
  const draftObjects = submission?.drafts?.filter((obj: { schema: string }) => obj.schema === `draft-${objectType}`)
  const loading = useAppSelector(state => state.loading)

  return (
    <>
      <Grid container spacing={2} className={classes.gridContainer}>
        <Grid item xs={12}>
          <div className={classes.formBox}>
            {objectType === "" ? (
              <div className={classes.objectInfo}>
                <p>Add objects by clicking the name, then fill form or upload XML File.</p>
                <p>You can also add objects and edit them after saving your draft.</p>
              </div>
            ) : (
              <WizardAddObjectCard />
            )}
          </div>
        </Grid>

        <Grid item xs>
          <Grid container spacing={0}>
            <Grid item xs={12}>
              {submissions?.length > 0 && <WizardSavedObjectsList objects={submissions} />}
            </Grid>
            <Grid item xs={12}>
              {draftObjects?.length > 0 && <WizardSavedObjectsList objects={draftObjects} />}
            </Grid>
          </Grid>
          {loading && (
            <Grid container justifyContent="center">
              <CircularProgress />
            </Grid>
          )}
        </Grid>
      </Grid>
    </>
  )
}

export default WizardAddObjectStep
