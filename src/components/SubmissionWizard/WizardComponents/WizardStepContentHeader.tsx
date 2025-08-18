import CardHeader from "@mui/material/CardHeader"
import { styled } from "@mui/material/styles"

const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  ...theme.wizard.cardHeader,
  "& .MuiCardHeader-action": {
    margin: "0 !important",
  },
}))

/*
 * Render the heading part of a form with customizable component, 
  such as a form's Save button
 */
const WizardStepContentHeader = ({ action }: { action?: React.ReactNode }) => (
  <StyledCardHeader action={action} />
)

export default WizardStepContentHeader
