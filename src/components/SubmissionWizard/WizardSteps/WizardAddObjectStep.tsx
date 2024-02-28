import React from "react"

import CircularProgress from "@mui/material/CircularProgress"
import Grid from "@mui/material/Grid"
import { styled } from "@mui/system"

import WizardAddObjectCard from "../WizardComponents/WizardAddObjectCard"

import { useAppSelector } from "hooks"
import type { FormRef } from "types"

const GridContainer = styled(Grid)({
  margin: 0,
  width: "100%",
  "& > :first-of-type": {
    paddingLeft: 0,
  },
  "& > :last-child": {
    paddingRight: 0,
  },
  "& .MuiGrid-item": {
    paddingTop: 0,
  },
})

const ObjectInfo = styled("div")({
  margin: 2,
})

/**
 * Show selection for object and submission types and correct form based on users choice.
 */
const WizardAddObjectStep = ({ formRef }: { formRef?: FormRef }) => {
  const objectType = useAppSelector(state => state.objectType)
  const loading = useAppSelector(state => state.loading)
  const openedXMLModal = useAppSelector(state => state.openedXMLModal)

  return (
    <>
      <GridContainer container spacing={2}>
        <Grid item xs={12}>
          {objectType === "" ? (
            <ObjectInfo>
              <p>Add objects by clicking the name, then fill form or upload XML File.</p>
              <p>You can also add objects and edit them after saving your draft.</p>
            </ObjectInfo>
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
      </GridContainer>
    </>
  )
}

export default WizardAddObjectStep
