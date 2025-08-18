/* XML upload is disabled for MVP */
import CircularProgress from "@mui/material/CircularProgress"
import Grid from "@mui/material/Grid"
import { styled } from "@mui/system"

import WizardAddObjectCard from "../WizardComponents/WizardAddObjectCard"

import WizardDacPoliciesStep from "components/SubmissionWizard/WizardSteps/WizardDacPoliciesStep"
import { ObjectTypes } from "constants/wizardObject"
import { useAppSelector } from "hooks"
import type { HandlerRef } from "types"

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

/*
 * Show the correct content of the form based on selected object or step (in the Accordion)
 */
const WizardAddObjectStep = ({ formRef }: { formRef?: HandlerRef }) => {
  const objectType = useAppSelector(state => state.objectType)
  const loading = useAppSelector(state => state.loading)
  const openedXMLModal = useAppSelector(state => state.openedXMLModal)

  return (
    <GridContainer container spacing={2}>
      <Grid size={{ xs: 12 }}>
        {objectType === ObjectTypes.dacPolicies ? (
          <WizardDacPoliciesStep />
        ) : (
          <WizardAddObjectCard formRef={formRef} />
        )}
      </Grid>

      <Grid>
        {!openedXMLModal && loading && (
          <Grid container justifyContent="center">
            <CircularProgress />
          </Grid>
        )}
      </Grid>
    </GridContainer>
  )
}

export default WizardAddObjectStep
