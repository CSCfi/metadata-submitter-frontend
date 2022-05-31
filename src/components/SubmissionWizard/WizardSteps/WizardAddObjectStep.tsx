import React from "react"

import CircularProgress from "@mui/material/CircularProgress"
import Grid from "@mui/material/Grid"
import { makeStyles } from "@mui/styles"

import WizardAddObjectCard from "../WizardComponents/WizardAddObjectCard"

import { useAppSelector } from "hooks"
import type { FormRef } from "types"

const useStyles = makeStyles(() => ({
  gridContainer: {
    margin: 0,
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
const WizardAddObjectStep = ({ formRef }: { formRef?: FormRef }) => {
  const classes = useStyles()
  const objectType = useAppSelector(state => state.objectType)
  const loading = useAppSelector(state => state.loading)
  const openedXMLModal = useAppSelector(state => state.openedXMLModal)

  return (
    <>
      <Grid container spacing={2} className={classes.gridContainer}>
        <Grid item xs={12}>
          {objectType === "" ? (
            <div className={classes.objectInfo}>
              <p>Add objects by clicking the name, then fill form or upload XML File.</p>
              <p>You can also add objects and edit them after saving your draft.</p>
            </div>
          ) : (
            <WizardAddObjectCard formRef={formRef} />
          )}
        </Grid>

        <Grid item xs>
          {!openedXMLModal && loading && (
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
